//! 安全运行状态与 Zeroize 生命周期管理 (SecurityAppState)
//!
//! 职责：
//! 1. 持有当前设备授权派生的 AES 密钥与资产包解密引擎；
//! 2. 管理当前正处于展示状态的单算法明文切片缓存；
//! 3. 在收到 `release_algorithm_chunk` 指令或切换算法时，
//!    立即调用 Zeroize 清空堆内存，防范全量内存 Dump 爬取。

use std::collections::HashMap;
use std::sync::RwLock;
use zeroize::{Zeroize, Zeroizing};

use super::hkdf_deriver::DerivedAssetKey;
use super::stream_decrypt::{AssetPackError, StreamDecryptEngine};

#[derive(Default)]
pub struct SecurityAppState {
    /// 资产包流式解密引擎（包含轻量索引）
    pub engine: RwLock<Option<StreamDecryptEngine>>,
    /// 当前授权派生的 AES 主密钥（使用 Zeroize 保护）
    pub master_key: RwLock<Option<DerivedAssetKey>>,
    /// 当前活跃算法明文切片（即用即焚）
    pub active_chunks: RwLock<HashMap<String, Zeroizing<Vec<u8>>>>,
}

impl SecurityAppState {
    pub fn new() -> Self {
        Self::default()
    }

    /// 设置资产包引擎
    pub fn set_engine(&self, engine: StreamDecryptEngine) {
        let mut lock = self.engine.write().unwrap();
        *lock = Some(engine);
    }

    /// 设置当前派生密钥
    pub fn set_master_key(&self, key: DerivedAssetKey) {
        let mut lock = self.master_key.write().unwrap();
        *lock = Some(key);
    }

    /// 清除主密钥
    pub fn clear_master_key(&self) {
        let mut lock = self.master_key.write().unwrap();
        if let Some(mut k) = lock.take() {
            k.zeroize();
        }
    }

    /// 按需获取并解密单道算法切片
    pub fn fetch_chunk(&self, algorithm_id: &str) -> Result<String, String> {
        let engine_guard = self.engine.read().unwrap();
        let engine = engine_guard
            .as_ref()
            .ok_or_else(|| "资产包解密引擎尚未初始化".to_string())?;

        let key_guard = self.master_key.read().unwrap();
        let key = key_guard
            .as_ref()
            .ok_or_else(|| "软件尚未激活，缺少解密密钥".to_string())?;

        // 解密切片
        let decrypted_bytes = engine
            .decrypt_chunk(algorithm_id, key)
            .map_err(|e| format!("解密算法切片 [{}] 失败: {}", algorithm_id, e))?;

        let text = String::from_utf8(decrypted_bytes.to_vec())
            .map_err(|e| format!("明文编码异常: {}", e))?;

        // 存入当前活跃切片缓存（由 Zeroizing 保护）
        let mut chunks_guard = self.active_chunks.write().unwrap();
        chunks_guard.insert(algorithm_id.to_string(), decrypted_bytes);

        Ok(text)
    }

    /// 释放并彻底清空特定算法切片的内存
    pub fn release_chunk(&self, algorithm_id: &str) -> bool {
        let mut chunks_guard = self.active_chunks.write().unwrap();
        if let Some(mut chunk) = chunks_guard.remove(algorithm_id) {
            chunk.zeroize();
            true
        } else {
            false
        }
    }

    /// 清空所有活跃切片内存
    pub fn release_all_chunks(&self) {
        let mut chunks_guard = self.active_chunks.write().unwrap();
        for (_, mut chunk) in chunks_guard.drain() {
            chunk.zeroize();
        }
    }
}

#[cfg(test)]
mod tests {
    use super::*;
    use crate::security::stream_decrypt::AssetPackCompiler;

    #[test]
    fn test_app_security_state_lifecycle() {
        let key_bytes = [0x77u8; 32];
        let master_key = DerivedAssetKey::new(key_bytes);

        // 编译测试资产包
        let mut compiler = AssetPackCompiler::new(key_bytes);
        compiler.add_algorithm("dijkstra", b"{\"name\":\"Dijkstra Algorithm\"}");
        compiler.add_algorithm("kruskal", b"{\"name\":\"Kruskal MST\"}");
        let pack_bytes = compiler.compile_to_bytes().unwrap();

        let engine = StreamDecryptEngine::from_bytes(pack_bytes).unwrap();
        let state = SecurityAppState::new();

        state.set_engine(engine);
        state.set_master_key(master_key);

        // 1. 获取 dijkstra 切片
        let text1 = state.fetch_chunk("dijkstra").unwrap();
        assert_eq!(text1, "{\"name\":\"Dijkstra Algorithm\"}");

        {
            let guard = state.active_chunks.read().unwrap();
            assert_eq!(guard.len(), 1);
            assert!(guard.contains_key("dijkstra"));
        }

        // 2. 释放 dijkstra 切片，断言清零并移出缓存
        let released = state.release_chunk("dijkstra");
        assert!(released);

        {
            let guard = state.active_chunks.read().unwrap();
            assert_eq!(guard.len(), 0);
        }

        // 3. 再次释放返回 false
        assert!(!state.release_chunk("dijkstra"));
    }

    #[test]
    fn test_fetch_unactivated_fails() {
        let state = SecurityAppState::new();
        let res = state.fetch_chunk("any");
        assert!(res.is_err());
    }
}
