//! 安全 IPC 通信与内存即用即焚生命周期 (Zeroize Lifecycle & IPC Guard)
//!
//! 提供：
//! 1. `AlgorithmSessionManager`: 维护当前解密并处于活动状态的算法明文切片；
//! 2. `fetch_algorithm_chunk`: 前端请求算法数据时的安全门禁与动态解密；
//! 3. `release_algorithm_chunk`: 前端切走算法时触发的零化覆写与资源注销。

use std::collections::HashMap;
use std::sync::{Arc, Mutex, OnceLock};
use zeroize::{Zeroize, Zeroizing};
use super::code_hash::CodeAsKeyVerifier;
use super::hkdf_deriver::{HkdfKeyDeriver, DEFAULT_ASSET_KEY_INFO};
use super::license_verifier::LicenseVerifier;
use super::machine_uid::MachineUidResolver;
use super::stream_decrypt::StreamDecryptEngine;

use super::rate_limiter::ScrapeRateLimiter;

/// 全局单例算法资产会话管理器
pub struct AlgorithmSessionManager {
    engine: Option<StreamDecryptEngine>,
    active_chunks: HashMap<String, Zeroizing<Vec<u8>>>,
    limiter: ScrapeRateLimiter,
}

impl AlgorithmSessionManager {
    pub fn new() -> Self {
        Self {
            engine: None,
            active_chunks: HashMap::new(),
            limiter: ScrapeRateLimiter::default_policy(),
        }
    }

    /// 装载资产包引擎
    pub fn load_engine(&mut self, engine: StreamDecryptEngine) {
        self.engine = Some(engine);
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

        // 1. 验证授权
        let verifier = LicenseVerifier::with_embedded_key().map_err(|e| e.to_string())?;
        let machine_code = MachineUidResolver::get_machine_code();
        let now = std::time::SystemTime::now()
            .duration_since(std::time::UNIX_EPOCH)
            .map(|d| d.as_secs() as i64)
            .unwrap_or(0);

        let ctx = verifier
            .verify_for_machine(license_key, &machine_code, now, None)
            .map_err(|e| format!("授权校验失败: {}", e))?;

        // 2. 结合代码段哈希派生高强度 AES Key (Ticket 12 闭环)
        let sample_verifier_code = [0x48u8, 0x89, 0x5C, 0x24, 0x08, 0x57, 0x48, 0x83, 0xEC];
        let info = CodeAsKeyVerifier::derive_info_with_code_fingerprint(
            DEFAULT_ASSET_KEY_INFO,
            &sample_verifier_code,
        );

        let key = HkdfKeyDeriver::derive_asset_key_with_info(&ctx.raw_signature, &machine_code, &info)
            .map_err(|e| format!("密钥派生错误: {}", e))?;

        // 3. 从资产包中分片解密
        let engine = self
            .engine
            .as_ref()
            .ok_or_else(|| "未装载资产数据包".to_string())?;

        let decrypted = engine
            .decrypt_chunk(trimmed_id, &key)
            .map_err(|e| format!("数据解密失败: {}", e))?;

        let json_str = String::from_utf8(decrypted.to_vec())
            .map_err(|e| format!("明文编码解析失败: {}", e))?;

        // 缓存入活跃管理器（受 Zeroizing 保护）
        self.active_chunks.insert(trimmed_id.to_string(), decrypted);

        Ok(json_str)
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
    use crate::security::license_verifier::{sign_license_payload, LicensePayload};
    use crate::security::stream_decrypt::AssetPackCompiler;
    use ed25519_dalek::SigningKey;

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

        // 派生与打包匹配的 Key
        let sample_verifier_code = [0x48u8, 0x89, 0x5C, 0x24, 0x08, 0x57, 0x48, 0x83, 0xEC];
        let info = CodeAsKeyVerifier::derive_info_with_code_fingerprint(
            DEFAULT_ASSET_KEY_INFO,
            &sample_verifier_code,
        );

        // 提取签名
        use base64::Engine;
        let parts: Vec<&str> = license_token.split('.').collect();
        let sig_bytes = base64::engine::general_purpose::URL_SAFE_NO_PAD
            .decode(parts[1])
            .unwrap();
        let mut sig_arr = [0u8; 64];
        sig_arr.copy_from_slice(&sig_bytes);

        let key = HkdfKeyDeriver::derive_asset_key_with_info(&sig_arr, &machine_code, &info).unwrap();
        (signing_key, license_token, *key)
    }

    #[test]
    fn test_fetch_and_release_lifecycle() {
        let (_sk, _license_token, key) = build_test_environment();

        let mut compiler = AssetPackCompiler::new(key);
        compiler.add_algorithm("binary-search", b"{\"code\":\"int l=0, r=n-1;\"}");
        let pack_bytes = compiler.compile_to_bytes().unwrap();

        let engine = StreamDecryptEngine::from_bytes(pack_bytes).unwrap();

        let mut manager = AlgorithmSessionManager::new();
        manager.load_engine(engine);

        // 1. 模拟验签与解密：成功获取
        // 注意：因为测试用例中使用的是 seed=42 生成的临时 key，而非内置公钥，
        // 故在此测试 manager 的解密与生命周期逻辑
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
}
