//! Code-as-Key 代码段完整性自校验与密钥耦合体系 (CodeHash Guard)
//!
//! 职责：
//! 1. 提取验签核心函数所在机器码内存段的确定性哈希指纹；
//! 2. 将代码段哈希作为扰动因子深度注入 HKDF 密钥派生流程；
//! 3. 当攻击者使用 AI 逆向补丁工具修改跳转指令 (如 NOP / JMP) 时，
//!    哈希雪崩导致派生出的 AES 密钥彻底失效，AES-GCM 解密直接崩溃。

use sha2::{Digest, Sha256};

/// 提取验签核心代码段指纹（默认提取 64 字节机器码）
pub fn compute_code_fingerprint_from_bytes(code_slice: &[u8]) -> [u8; 16] {
    let mut hasher = Sha256::new();
    hasher.update(code_slice);
    let hash = hasher.finalize();
    let mut out = [0u8; 16];
    out.copy_from_slice(&hash[..16]);
    out
}

/// 默认验签关键函数的金样代码指纹因子（作为 Code-as-Key 锚点）
pub const CODE_KEY_SALT_PREFIX: &[u8] = b"code-as-key:ed25519-verifier:v1";

pub struct CodeAsKeyVerifier;

impl CodeAsKeyVerifier {
    /// 计算包含代码指纹的派生 Info 域隔离标签
    pub fn derive_info_with_code_fingerprint(base_info: &[u8], code_bytes: &[u8]) -> Vec<u8> {
        let fp = compute_code_fingerprint_from_bytes(code_bytes);
        let mut info = Vec::with_capacity(base_info.len() + CODE_KEY_SALT_PREFIX.len() + 16);
        info.extend_from_slice(base_info);
        info.extend_from_slice(CODE_KEY_SALT_PREFIX);
        info.extend_from_slice(&fp);
        info
    }
}

#[cfg(test)]
mod tests {
    use super::*;
    use crate::security::hkdf_deriver::HkdfKeyDeriver;
    use crate::security::stream_decrypt::{AssetPackCompiler, StreamDecryptEngine};

    // 模拟一段正版验签机器码字节序列
    fn sample_verifier_bytecode() -> Vec<u8> {
        vec![
            0x48, 0x89, 0x5C, 0x24, 0x08, 0x57, 0x48, 0x83, 0xEC, 0x20, 0x48, 0x8B, 0xDA, 0x48,
            0x8B, 0xF9, 0x74, 0x1A, 0x48, 0x8D, 0x0D, 0x34, 0x12, 0x00, 0x00, 0xE8, 0xA2, 0xFE,
            0xFF, 0xFF, 0x85, 0xC0, 0x75, 0x0E, 0x33, 0xC0, 0x48, 0x83, 0xC4, 0x20, 0x5F, 0xC3,
        ]
    }

    #[test]
    fn test_code_fingerprint_determinism() {
        let code = sample_verifier_bytecode();
        let fp1 = compute_code_fingerprint_from_bytes(&code);
        let fp2 = compute_code_fingerprint_from_bytes(&code);
        assert_eq!(fp1, fp2);
    }

    #[test]
    fn test_patching_single_byte_causes_hash_avalanche() {
        let mut code_patched = sample_verifier_bytecode();
        let fp_original = compute_code_fingerprint_from_bytes(&code_patched);

        // 模拟攻击者使用 NOP (0x90) 替换条件跳转指令 (0x74 -> 0x90)
        code_patched[16] = 0x90;

        let fp_tampered = compute_code_fingerprint_from_bytes(&code_patched);
        assert_ne!(fp_original, fp_tampered);
    }

    #[test]
    fn test_code_as_key_end_to_end_defense() {
        let legitimate_code = sample_verifier_bytecode();
        let signature = [0x55u8; 64];
        let hwid = "E804-62DB-86BA-555E";

        // 1. 正常正版流程：派生出正常合法的 AES Key 并加密算法资产包
        let legit_info = CodeAsKeyVerifier::derive_info_with_code_fingerprint(
            b"alg-asset-key",
            &legitimate_code,
        );
        let legit_key = HkdfKeyDeriver::derive_with_info(&signature, hwid, &legit_info).unwrap();

        let mut compiler = AssetPackCompiler::new(*legit_key);
        compiler.add_algorithm("heap-sort", b"{\"type\":\"max-heap\"}");
        let pack_bytes = compiler.compile_to_bytes().unwrap();

        // 2. 运行时未受篡改解密：成功！
        let engine = StreamDecryptEngine::from_bytes(pack_bytes.clone()).unwrap();
        let decrypted = engine.decrypt_chunk("heap-sort", &*legit_key).unwrap();
        assert_eq!(&*decrypted, b"{\"type\":\"max-heap\"}");

        // 3. 攻击者对代码打补丁 (AI Patch：将条件跳转指令改为 NOP)
        let mut patched_code = legitimate_code.clone();
        patched_code[32] = 0x90; // 将 0x75 (JNZ) 改为 0x90 (NOP)
        patched_code[33] = 0x90;

        let tampered_info = CodeAsKeyVerifier::derive_info_with_code_fingerprint(
            b"alg-asset-key",
            &patched_code,
        );
        let tampered_key = HkdfKeyDeriver::derive_with_info(&signature, hwid, &tampered_info).unwrap();

        // 4. 断言：派生的篡改密钥与正版密钥不同
        assert_ne!(*legit_key, *tampered_key);

        // 5. 断言：使用篡改补丁后派生的密钥去解密资产包，AES-GCM Tag 校验必定失败！
        let decrypt_res = engine.decrypt_chunk("heap-sort", &*tampered_key);
        assert!(decrypt_res.is_err(), "被 Patch 的代码派生密钥必须导致解密崩溃");
    }
}
