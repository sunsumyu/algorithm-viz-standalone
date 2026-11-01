//! 安全 IPC 通信与内存即用即焚生命周期 (Zeroize Lifecycle & IPC Guard)
//!
//! 提供：
//! 1. `AlgorithmSessionManager`: 维护当前解密并处于活动状态的算法明文切片；
//! 2. `fetch_algorithm_chunk`: 前端请求算法数据时的安全门禁与动态解密；
//! 3. `release_algorithm_chunk`: 前端切走算法时触发的零化覆写与资源注销。

use std::collections::HashMap;
use std::path::Path;
use std::sync::{Arc, Mutex, OnceLock};
use zeroize::{Zeroize, Zeroizing};
use super::content_pack_key::{derive_content_pack_key, master_key_from_env};
use super::license_verifier::LicenseVerifier;
use super::stream_decrypt::StreamDecryptEngine;

use super::account_store::cached_machine_code;
use super::rate_limiter::ScrapeRateLimiter;

/// 全局单例算法资产会话管理器
pub struct AlgorithmSessionManager {
    engine: Option<StreamDecryptEngine>,
    /// 由构建期主密钥派生的资产包 AES 密钥（None = 管线休眠）
    pack_key: Option<Zeroizing<[u8; 32]>>,
    active_chunks: HashMap<String, Zeroizing<Vec<u8>>>,
    limiter: ScrapeRateLimiter,
}

impl AlgorithmSessionManager {
    pub fn new() -> Self {
        Self {
            engine: None,
            pack_key: None,
            active_chunks: HashMap::new(),
            limiter: ScrapeRateLimiter::default_policy(),
        }
    }

    /// 装载资产包引擎并派生包密钥（共享包模型）
    pub fn load_engine(&mut self, engine: StreamDecryptEngine, master_key: [u8; 32]) {
        self.pack_key = Some(Zeroizing::new(derive_content_pack_key(&master_key)));
        self.engine = Some(engine);
    }

    /// 从磁盘装载资产包（应用启动期调用；文件缺失返回 Ok(false)，管线保持休眠）
    pub fn load_engine_from_file(&mut self, path: &Path, master_key: [u8; 32]) -> Result<bool, String> {
        let raw = match std::fs::read(path) {
            Ok(raw) => raw,
            Err(e) if e.kind() == std::io::ErrorKind::NotFound => return Ok(false),
            Err(e) => return Err(format!("资产包读取失败: {}", e)),
        };
        let engine = StreamDecryptEngine::from_bytes(raw)
            .map_err(|e| format!("资产包解析失败: {}", e))?;
        log::info!(
            "[AlgorithmSessionManager] 资产包装载成功: {} 个切片, 来源 {}",
            engine.get_available_algorithms().len(),
            path.display()
        );
        self.load_engine(engine, master_key);
        Ok(true)
    }

    /// 应用启动期默认装载：主密钥（env 优先 / 资源目录文件）与资产包文件齐备才激活；
    /// 任何缺料或解析失败一律休眠告警（占位资源文件容忍，不阻断应用启动）
    pub fn init_from_default_locations(&mut self, resource_dir: Option<&Path>) -> Result<bool, String> {
        // 密钥优先级：环境变量 > 二进制内嵌分片（release 主通道）> 资源目录文件（手动放置兜底）
        let master_key = match master_key_from_env() {
            Some(key) => key,
            None => match super::content_pack_key::master_key_from_embedded() {
                Some(key) => key,
                None => {
                    let Some(dir) = resource_dir else {
                        log::info!("[AlgorithmSessionManager] 未配置内容主密钥，资产包管线保持休眠");
                        return Ok(false);
                    };
                    match Self::read_master_key_file(&dir.join("content_master_key.hex")) {
                        Some(key) => key,
                        None => {
                            log::info!("[AlgorithmSessionManager] 资源目录无有效主密钥，资产包管线保持休眠");
                            return Ok(false);
                        }
                    }
                }
            },
        };

        let pack_path = match std::env::var("ALGO_VIZ_CONTENT_PACK_DIR") {
            Ok(dir) => std::path::PathBuf::from(dir).join("content.apack"),
            Err(_) => match resource_dir {
                Some(dir) => dir.join("content.apack"),
                None => {
                    log::info!("[AlgorithmSessionManager] 无资产包探测路径，管线保持休眠");
                    return Ok(false);
                }
            },
        };

        match self.load_engine_from_file(&pack_path, master_key) {
            Ok(loaded) => Ok(loaded),
            Err(e) => {
                log::warn!("[AlgorithmSessionManager] 资产包装载失败，管线休眠: {}", e);
                Ok(false)
            }
        }
    }

    fn read_master_key_file(path: &Path) -> Option<[u8; 32]> {
        let hex = std::fs::read_to_string(path).ok()?;
        super::content_pack_key::parse_master_key_hex(&hex)
    }

    /// 获取全局管理器单例
    pub fn global() -> &'static Arc<Mutex<AlgorithmSessionManager>> {
        static INSTANCE: OnceLock<Arc<Mutex<AlgorithmSessionManager>>> = OnceLock::new();
        INSTANCE.get_or_init(|| Arc::new(Mutex::new(AlgorithmSessionManager::new())))
    }

    /// 请求并解密指定算法切片
    pub fn fetch_chunk(
        &mut self,
        algorithm_id: &str,
        license_key: &str,
    ) -> Result<String, String> {
        let trimmed_id = algorithm_id.trim();
        if trimmed_id.is_empty() {
            return Err("算法 ID 不能为空".to_string());
        }

        // 0. 执行请求频次滑动窗口限流审计 (Ticket 13 核心)
        let now_ms = std::time::SystemTime::now()
            .duration_since(std::time::UNIX_EPOCH)
            .map(|d| d.as_millis() as u64)
            .unwrap_or(0);
        self.limiter
            .check_request(now_ms)
            .map_err(|e| format!("请求受限: {}", e))?;

        // 1. 服务门禁：验证激活码签名与机器指纹（每次请求都强制执行）
        let verifier = LicenseVerifier::with_embedded_key().map_err(|e| e.to_string())?;
        let machine_code = cached_machine_code();
        let now = std::time::SystemTime::now()
            .duration_since(std::time::UNIX_EPOCH)
            .map(|d| d.as_secs() as i64)
            .unwrap_or(0);

        let _ctx = verifier
            .verify_for_machine(license_key, &machine_code, now, None)
            .map_err(|e| format!("授权校验失败: {}", e))?;

        // 2. 取出共享包密钥（服务门禁通过后才有资格解密）
        let pack_key: &[u8; 32] = match self.pack_key.as_ref() {
            Some(k) => &**k,
            None => return Err("资产包管线未激活（未装载密钥）".to_string()),
        };

        // 3. 从资产包中分片解密
        let engine = self
            .engine
            .as_ref()
            .ok_or_else(|| "未装载资产数据包".to_string())?;

        let decrypted = engine
            .decrypt_chunk(trimmed_id, pack_key)
            .map_err(|e| format!("数据解密失败: {}", e))?;

        let json_str = String::from_utf8(decrypted.to_vec())
            .map_err(|e| format!("明文编码解析失败: {}", e))?;

        // 缓存入活跃管理器（受 Zeroizing 保护）
        self.active_chunks.insert(trimmed_id.to_string(), decrypted);

        Ok(json_str)
    }

    /// apv 协议处理器用：资产 id 是否在已装载资产包索引中
    pub fn contains_asset(&self, asset_id: &str) -> bool {
        self.pack_key.is_some()
            && self
                .engine
                .as_ref()
                .map(|e| e.contains_algorithm(asset_id))
                .unwrap_or(false)
    }

    /// apv 协议处理器用：解密资产并返回字节（网关印章校验通过后调用）
    pub fn decrypt_asset(&self, asset_id: &str) -> Result<Vec<u8>, String> {
        let pack_key = self
            .pack_key
            .as_ref()
            .ok_or_else(|| "资产包管线未激活".to_string())?;
        let engine = self
            .engine
            .as_ref()
            .ok_or_else(|| "未装载资产数据包".to_string())?;
        let decrypted = engine
            .decrypt_chunk(asset_id, &**pack_key)
            .map_err(|e| format!("资产解密失败: {}", e))?;
        Ok(decrypted.to_vec())
    }

    /// 注销并覆写清零特定算法切片内存 (Ticket 11 核心)
    pub fn release_chunk(&mut self, algorithm_id: &str) -> bool {
        if let Some(mut chunk) = self.active_chunks.remove(algorithm_id) {
            chunk.zeroize();
            true
        } else {
            false
        }
    }

    /// 检查指定算法是否驻留在活跃明文缓存中
    pub fn is_chunk_active(&self, algorithm_id: &str) -> bool {
        self.active_chunks.contains_key(algorithm_id)
    }

    /// 清空并清零全部活跃算法缓存
    pub fn release_all(&mut self) {
        for (_, mut chunk) in self.active_chunks.drain() {
            chunk.zeroize();
        }
    }
}

/// 获取并解密算法数据切片
pub fn fetch_algorithm_chunk(
    algorithm_id: String,
    license_key: String,
) -> Result<String, String> {
    let mut manager = AlgorithmSessionManager::global()
        .lock()
        .map_err(|e| e.to_string())?;
    manager.fetch_chunk(&algorithm_id, &license_key)
}

/// 释放并覆写清零算法数据切片
pub fn release_algorithm_chunk(algorithm_id: String) -> Result<bool, String> {
    let mut manager = AlgorithmSessionManager::global()
        .lock()
        .map_err(|e| e.to_string())?;
    Ok(manager.release_chunk(&algorithm_id))
}

#[cfg(test)]
mod tests {
    use super::*;
    use crate::security::content_pack_key::derive_content_pack_key;
    use crate::security::license_verifier::{sign_license_payload, LicensePayload};
    use crate::security::machine_uid::MachineUidResolver;
    use crate::security::stream_decrypt::AssetPackCompiler;
    use ed25519_dalek::SigningKey;

    /// 测试用构建期主密钥
    const TEST_MASTER_KEY: [u8; 32] = [0x5Au8; 32];

    fn build_test_environment() -> (SigningKey, String, [u8; 32]) {
        let seed = [42u8; 32];
        let signing_key = SigningKey::from_bytes(&seed);
        let machine_code = MachineUidResolver::get_machine_code();

        let payload = LicensePayload {
            v: 1,
            uid: machine_code.clone(),
            exp: 0, // 永久
            user_id: "VIP_TESTER".to_string(),
            tier: 3,
        };

        let license_token = sign_license_payload(&signing_key, &payload).unwrap();

        // 共享包模型：包密钥只由构建期主密钥派生（签名/机器绑定在服务门禁层）
        let key = derive_content_pack_key(&TEST_MASTER_KEY);
        (signing_key, license_token, key)
    }

    #[test]
    fn test_fetch_and_release_lifecycle() {
        let (_sk, _license_token, key) = build_test_environment();

        let mut compiler = AssetPackCompiler::new(key);
        compiler.add_algorithm("binary-search", b"{\"code\":\"int l=0, r=n-1;\"}");
        let pack_bytes = compiler.compile_to_bytes().unwrap();

        let engine = StreamDecryptEngine::from_bytes(pack_bytes).unwrap();

        let mut manager = AlgorithmSessionManager::new();
        manager.load_engine(engine, TEST_MASTER_KEY);

        // 1. 包密钥正确派生，引擎内解密成功
        let decrypted_raw = manager
            .engine
            .as_ref()
            .unwrap()
            .decrypt_chunk("binary-search", &key)
            .unwrap();
        assert_eq!(&*decrypted_raw, b"{\"code\":\"int l=0, r=n-1;\"}");

        // 2. 存入活跃列表并验证驻留
        manager
            .active_chunks
            .insert("binary-search".to_string(), decrypted_raw);
        assert!(manager.is_chunk_active("binary-search"));

        // 3. 触发释放生命周期
        let released = manager.release_chunk("binary-search");
        assert!(released);
        assert!(!manager.is_chunk_active("binary-search"));
    }

    #[test]
    fn test_load_engine_from_missing_file_stays_dormant() {
        let mut manager = AlgorithmSessionManager::new();
        let missing = std::env::temp_dir()
            .join(format!("algo_viz_no_such_pack_{}.apack", std::process::id()));
        let loaded = manager.load_engine_from_file(&missing, TEST_MASTER_KEY).unwrap();
        assert!(!loaded, "资产包文件缺失时必须保持休眠而非报错");
    }

    #[test]
    fn test_load_engine_from_file_activates_pipeline() {
        let (_sk, _token, key) = build_test_environment();
        let mut compiler = AssetPackCompiler::new(key);
        compiler.add_algorithm("two-sum", b"{\"target\":9}");
        let pack_bytes = compiler.compile_to_bytes().unwrap();

        let path = std::env::temp_dir()
            .join(format!("algo_viz_pack_load_{}.apack", std::process::id()));
        std::fs::write(&path, &pack_bytes).unwrap();

        let mut manager = AlgorithmSessionManager::new();
        let loaded = manager.load_engine_from_file(&path, TEST_MASTER_KEY).unwrap();
        assert!(loaded);
        let _ = std::fs::remove_file(&path);
    }
}
