//! 资产包编译器与运行时分片流式解密引擎 (StreamDecryptEngine & AssetPackCompiler)
//!
//! 提供：
//! 1. `AssetPackCompiler`: 将各算法数据切片通过 AES-256-GCM 分别加密，编译为紧凑的 .pkg 二进制资产包；
//! 2. `StreamDecryptEngine`: 启动时仅加载轻量索引表，前端按需索取时单片解密，配合 Zeroize 实现即用即焚。

use aes_gcm::aead::{Aead, KeyInit};
use aes_gcm::{Aes256Gcm, Nonce};
use std::collections::HashMap;
use std::io::{Cursor, Read};
use zeroize::Zeroizing;

pub const ASSET_PACK_MAGIC: &[u8; 4] = b"ALGP";
pub const ASSET_PACK_VERSION: u32 = 1;
pub const NONCE_LEN: usize = 12;

/// 单算法切片索引项
#[derive(Debug, Clone, Copy, PartialEq, Eq)]
pub struct ChunkIndex {
    pub offset: u64,
    pub length: u64,
}

/// 资产包与解密错误类型
#[derive(Debug, Clone, PartialEq, Eq)]
pub enum AssetPackError {
    InvalidMagic,
    UnsupportedVersion(u32),
    AlgorithmNotFound(String),
    DecryptionFailed(String),
    CorruptedHeader(String),
    IoError(String),
}

impl std::fmt::Display for AssetPackError {
    fn fmt(&self, f: &mut std::fmt::Formatter<'_>) -> std::fmt::Result {
        match self {
            AssetPackError::InvalidMagic => write!(f, "资产包文件头标识 (Magic) 非法"),
            AssetPackError::UnsupportedVersion(v) => write!(f, "不支持的资产包版本: {}", v),
            AssetPackError::AlgorithmNotFound(id) => write!(f, "未在资产包中找到算法切片: {}", id),
            AssetPackError::DecryptionFailed(msg) => write!(f, "AES-GCM 解密失败 (Tag 校验不匹配或密钥错误): {}", msg),
            AssetPackError::CorruptedHeader(msg) => write!(f, "资产包头或索引损坏: {}", msg),
            AssetPackError::IoError(msg) => write!(f, "I/O 错误: {}", msg),
        }
    }
}

impl std::error::Error for AssetPackError {}

/// 离线算法数据资产包编译器
pub struct AssetPackCompiler {
    cipher_key: [u8; 32],
    entries: Vec<(String, Vec<u8>)>,
}

impl AssetPackCompiler {
    pub fn new(cipher_key: [u8; 32]) -> Self {
        Self {
            cipher_key,
            entries: Vec::new(),
        }
    }

    /// 添加待打包算法切片
    pub fn add_algorithm(&mut self, algorithm_id: &str, plaintext: &[u8]) {
        self.entries.push((algorithm_id.to_string(), plaintext.to_vec()));
    }

    /// 编译并输出到内存缓冲区
    pub fn compile_to_bytes(&self) -> Result<Vec<u8>, AssetPackError> {
        let cipher = Aes256Gcm::new_from_slice(&self.cipher_key)
            .map_err(|e| AssetPackError::DecryptionFailed(e.to_string()))?;

        // 1. 加密所有算法切片
        let mut encrypted_chunks: Vec<(String, Vec<u8>)> = Vec::with_capacity(self.entries.len());
        for (i, (id, data)) in self.entries.iter().enumerate() {
            // 生成确定性但唯一的 12 字节 Nonce (基于索引与 ID 哈希)
            let mut nonce_bytes = [0u8; NONCE_LEN];
            let id_bytes = id.as_bytes();
            for (j, b) in nonce_bytes.iter_mut().enumerate() {
                *b = (i as u8).wrapping_add(j as u8).wrapping_add(*id_bytes.get(j % id_bytes.len()).unwrap_or(&0));
            }
            let nonce = Nonce::from_slice(&nonce_bytes);

            let ciphertext = cipher
                .encrypt(nonce, data.as_ref())
                .map_err(|e| AssetPackError::DecryptionFailed(e.to_string()))?;

            // 格式：[Nonce: 12B][Ciphertext + Tag]
            let mut chunk_raw = Vec::with_capacity(NONCE_LEN + ciphertext.len());
            chunk_raw.extend_from_slice(&nonce_bytes);
            chunk_raw.extend_from_slice(&ciphertext);

            encrypted_chunks.push((id.clone(), chunk_raw));
        }

        // 2. 计算并预估文件头大小以构建准确的 Offset 索引表
        // 索引表项格式：[id_len: 2B][id_str][offset: 8B][length: 8B]
        // 先用占位偏移写入，计算出总头长
        let total_count = encrypted_chunks.len() as u32;

        let mut dummy_cursor = Vec::new();
        for (id, chunk) in &encrypted_chunks {
            let id_b = id.as_bytes();
            dummy_cursor.extend_from_slice(&(id_b.len() as u16).to_le_bytes());
            dummy_cursor.extend_from_slice(id_b);
            dummy_cursor.extend_from_slice(&0u64.to_le_bytes()); // offset 占位
            dummy_cursor.extend_from_slice(&(chunk.len() as u64).to_le_bytes());
        }

        // Header 大小 = Magic(4) + Version(4) + TotalCount(4) + IndexTableLen(4) + IndexTableBytes
        let header_total_size = 4 + 4 + 4 + 4 + dummy_cursor.len();

        let mut current_offset = header_total_size as u64;
        let mut final_index_bytes = Vec::with_capacity(dummy_cursor.len());
        for (id, chunk) in &encrypted_chunks {
            let id_b = id.as_bytes();
            final_index_bytes.extend_from_slice(&(id_b.len() as u16).to_le_bytes());
            final_index_bytes.extend_from_slice(id_b);
            final_index_bytes.extend_from_slice(&current_offset.to_le_bytes());
            final_index_bytes.extend_from_slice(&(chunk.len() as u64).to_le_bytes());
            current_offset += chunk.len() as u64;
        }

        // 3. 组装完整二进制文件
        let mut out = Vec::with_capacity(current_offset as usize);
        out.extend_from_slice(ASSET_PACK_MAGIC);
        out.extend_from_slice(&ASSET_PACK_VERSION.to_le_bytes());
        out.extend_from_slice(&total_count.to_le_bytes());
        out.extend_from_slice(&(final_index_bytes.len() as u32).to_le_bytes());
        out.extend_from_slice(&final_index_bytes);

        for (_, chunk) in encrypted_chunks {
            out.extend_from_slice(&chunk);
        }

        Ok(out)
    }
}

/// 运行时分片流式解密引擎
pub struct StreamDecryptEngine {
    index_map: HashMap<String, ChunkIndex>,
    raw_data: Vec<u8>,
}

impl StreamDecryptEngine {
    /// 从内存二进制字节解析资产包索引（不预解密任何算法数据）
    pub fn from_bytes(raw_data: Vec<u8>) -> Result<Self, AssetPackError> {
        let mut cursor = Cursor::new(&raw_data);
        if raw_data.len() < 16 {
            return Err(AssetPackError::CorruptedHeader("数据长度不足 16 字节".to_string()));
        }

        let mut magic = [0u8; 4];
        cursor.read_exact(&mut magic).map_err(|e| AssetPackError::IoError(e.to_string()))?;
        if &magic != ASSET_PACK_MAGIC {
            return Err(AssetPackError::InvalidMagic);
        }

        let mut v_bytes = [0u8; 4];
        cursor.read_exact(&mut v_bytes).map_err(|e| AssetPackError::IoError(e.to_string()))?;
        let version = u32::from_le_bytes(v_bytes);
        if version != ASSET_PACK_VERSION {
            return Err(AssetPackError::UnsupportedVersion(version));
        }

        let mut count_bytes = [0u8; 4];
        cursor.read_exact(&mut count_bytes).map_err(|e| AssetPackError::IoError(e.to_string()))?;
        let total_count = u32::from_le_bytes(count_bytes);

        let mut idx_len_bytes = [0u8; 4];
        cursor.read_exact(&mut idx_len_bytes).map_err(|e| AssetPackError::IoError(e.to_string()))?;
        let index_len = u32::from_le_bytes(idx_len_bytes) as usize;

        let mut index_bytes = vec![0u8; index_len];
        cursor.read_exact(&mut index_bytes).map_err(|e| AssetPackError::IoError(e.to_string()))?;

        // 解析索引表
        let mut idx_cursor = Cursor::new(index_bytes);
        let mut index_map = HashMap::with_capacity(total_count as usize);

        for _ in 0..total_count {
            let mut id_len_buf = [0u8; 2];
            idx_cursor.read_exact(&mut id_len_buf).map_err(|e| AssetPackError::CorruptedHeader(e.to_string()))?;
            let id_len = u16::from_le_bytes(id_len_buf) as usize;

            let mut id_buf = vec![0u8; id_len];
            idx_cursor.read_exact(&mut id_buf).map_err(|e| AssetPackError::CorruptedHeader(e.to_string()))?;
            let algo_id = String::from_utf8(id_buf).map_err(|e| AssetPackError::CorruptedHeader(e.to_string()))?;

            let mut offset_buf = [0u8; 8];
            idx_cursor.read_exact(&mut offset_buf).map_err(|e| AssetPackError::CorruptedHeader(e.to_string()))?;
            let offset = u64::from_le_bytes(offset_buf);

            let mut len_buf = [0u8; 8];
            idx_cursor.read_exact(&mut len_buf).map_err(|e| AssetPackError::CorruptedHeader(e.to_string()))?;
            let length = u64::from_le_bytes(len_buf);

            index_map.insert(algo_id, ChunkIndex { offset, length });
        }

        Ok(Self {
            index_map,
            raw_data,
        })
    }

    /// 查询索引中包含的算法列表
    pub fn get_available_algorithms(&self) -> Vec<String> {
        self.index_map.keys().cloned().collect()
    }

    /// 检查特定算法是否存在于索引中
    pub fn contains_algorithm(&self, algorithm_id: &str) -> bool {
        self.index_map.contains_key(algorithm_id)
    }

    /// 按需单片解密特定算法
    ///
    /// * `algorithm_id`: 目标算法唯一标识
    /// * `cipher_key`: 256 位 AES 密钥（通常由 HKDF 派生）
    ///
    /// 返回包装在 `Zeroizing<Vec<u8>>` 中的明文数据，脱离作用域自动覆写为 0
    pub fn decrypt_chunk(
        &self,
        algorithm_id: &str,
        cipher_key: &[u8; 32],
    ) -> Result<Zeroizing<Vec<u8>>, AssetPackError> {
        let chunk_index = self
            .index_map
            .get(algorithm_id)
            .ok_or_else(|| AssetPackError::AlgorithmNotFound(algorithm_id.to_string()))?;

        let start = chunk_index.offset as usize;
        let end = start + (chunk_index.length as usize);

        if end > self.raw_data.len() {
            return Err(AssetPackError::CorruptedHeader("切片偏移越界".to_string()));
        }

        let chunk_slice = &self.raw_data[start..end];
        if chunk_slice.len() <= NONCE_LEN {
            return Err(AssetPackError::CorruptedHeader("切片密文长度不足".to_string()));
        }

        let nonce_bytes = &chunk_slice[..NONCE_LEN];
        let ciphertext = &chunk_slice[NONCE_LEN..];

        let cipher = Aes256Gcm::new_from_slice(cipher_key)
            .map_err(|e| AssetPackError::DecryptionFailed(e.to_string()))?;
        let nonce = Nonce::from_slice(nonce_bytes);

        // AES-256-GCM 解密与完整性验签（Tag 自动校验）
        let plaintext_vec = cipher
            .decrypt(nonce, ciphertext)
            .map_err(|_| AssetPackError::DecryptionFailed("Tag 校验失败或密钥不匹配".to_string()))?;

        Ok(Zeroizing::new(plaintext_vec))
    }
}

#[cfg(test)]
mod tests {
    use super::*;
    use zeroize::Zeroize;

    fn sample_key() -> [u8; 32] {
        [
            0x2b, 0x7e, 0x15, 0x16, 0x28, 0xae, 0xd2, 0xa6,
            0xab, 0xf7, 0x15, 0x88, 0x09, 0xcf, 0x4f, 0x3c,
            0x76, 0x2e, 0x71, 0x60, 0xf3, 0x8b, 0x4d, 0xa5,
            0x6a, 0x78, 0x4d, 0x90, 0x45, 0x19, 0x0c, 0xfe,
        ]
    }

    #[test]
    fn test_pack_and_stream_decrypt_roundtrip() {
        let key = sample_key();
        let mut compiler = AssetPackCompiler::new(key);

        compiler.add_algorithm("dijkstra", b"{\"name\":\"Dijkstra\",\"nodes\":10}");
        compiler.add_algorithm("two-sum", b"{\"name\":\"Two Sum\",\"target\":9}");
        compiler.add_algorithm("lcs", b"{\"name\":\"Longest Common Subsequence\"}");

        let pack_bytes = compiler.compile_to_bytes().unwrap();
        assert!(pack_bytes.len() > 100);

        // 初始化流式引擎
        let engine = StreamDecryptEngine::from_bytes(pack_bytes).unwrap();
        assert_eq!(engine.index_map.len(), 3);
        assert!(engine.contains_algorithm("dijkstra"));
        assert!(engine.contains_algorithm("two-sum"));
        assert!(engine.contains_algorithm("lcs"));

        // 按需单片解密 dijkstra
        let decrypted = engine.decrypt_chunk("dijkstra", &key).unwrap();
        assert_eq!(&*decrypted, b"{\"name\":\"Dijkstra\",\"nodes\":10}");

        // 按需单片解密 two-sum
        let dec_two_sum = engine.decrypt_chunk("two-sum", &key).unwrap();
        assert_eq!(&*dec_two_sum, b"{\"name\":\"Two Sum\",\"target\":9}");
    }

    #[test]
    fn test_wrong_key_fails_decryption() {
        let key = sample_key();
        let mut compiler = AssetPackCompiler::new(key);
        compiler.add_algorithm("topo-sort", b"{\"steps\":[1,2,3]}");
        let pack_bytes = compiler.compile_to_bytes().unwrap();

        let engine = StreamDecryptEngine::from_bytes(pack_bytes).unwrap();

        // 使用篡改了 1 位的错误密钥解密
        let mut wrong_key = key;
        wrong_key[0] ^= 0xFF;

        let res = engine.decrypt_chunk("topo-sort", &wrong_key);
        assert!(matches!(res.unwrap_err(), AssetPackError::DecryptionFailed(_)));
    }

    #[test]
    fn test_tampered_ciphertext_fails_tag_verification() {
        let key = sample_key();
        let mut compiler = AssetPackCompiler::new(key);
        compiler.add_algorithm("quick-sort", b"{\"partition\":\"lomuto\"}");
        let mut pack_bytes = compiler.compile_to_bytes().unwrap();

        // 翻转密文末尾 Tag 的 1 个字节
        let last_idx = pack_bytes.len() - 1;
        pack_bytes[last_idx] ^= 0x01;

        let engine = StreamDecryptEngine::from_bytes(pack_bytes).unwrap();
        let res = engine.decrypt_chunk("quick-sort", &key);
        assert!(matches!(res.unwrap_err(), AssetPackError::DecryptionFailed(_)));
    }

    #[test]
    fn test_unknown_algorithm_returns_not_found() {
        let key = sample_key();
        let compiler = AssetPackCompiler::new(key);
        let pack_bytes = compiler.compile_to_bytes().unwrap();

        let engine = StreamDecryptEngine::from_bytes(pack_bytes).unwrap();
        let res = engine.decrypt_chunk("non-existent-algo", &key);
        assert!(matches!(res.unwrap_err(), AssetPackError::AlgorithmNotFound(_)));
    }

    #[test]
    fn test_zeroize_memory_erasure() {
        let key = sample_key();
        let mut compiler = AssetPackCompiler::new(key);
        compiler.add_algorithm("secret", b"SUPER_SENSITIVE_DATA_123");
        let pack_bytes = compiler.compile_to_bytes().unwrap();

        let engine = StreamDecryptEngine::from_bytes(pack_bytes).unwrap();
        let mut decrypted = engine.decrypt_chunk("secret", &key).unwrap();
        assert_eq!(&*decrypted, b"SUPER_SENSITIVE_DATA_123");

        // 显式触发清零，Vec 会清零底层缓冲区并截断长度
        decrypted.zeroize();
        assert!(decrypted.is_empty(), "Vec 在 zeroize 后长度被安全清除为 0");
    }
}
