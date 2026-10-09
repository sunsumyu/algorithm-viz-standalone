//! 凭证与机器指纹绑定的 HKDF 密钥派生器 (HkdfKeyDeriver)
//!
//! 基于 HKDF-SHA256 (RFC 5869) 密码学标准，将 Ed25519 数字签名的二进制载荷
//! 与目标宿主机的唯一物理机器指纹进行不可逆融合，
//! 派生出用于资产按需解密的 256-bit (32 字节) 高强度 AES 密钥。
//!
//! 具备严格的 Zeroize 内存自清零保障与密码学雪崩效应。

use hkdf::Hkdf;
use sha2::Sha256;
use std::ops::Deref;
use zeroize::{Zeroize, ZeroizeOnDrop};

use super::license_verifier::LicenseContext;

/// HKDF 派生上下文默认域隔离标签 (Info)
pub const DEFAULT_ASSET_KEY_INFO: &[u8] = b"alg-viz-drm-v1-asset-key";

/// 密钥派生错误
#[derive(Debug, Clone, PartialEq, Eq)]
pub enum HkdfDeriveError {
    EmptyMachineCode,
    ExpandFailed,
}

impl std::fmt::Display for HkdfDeriveError {
    fn fmt(&self, f: &mut std::fmt::Formatter<'_>) -> std::fmt::Result {
        match self {
            HkdfDeriveError::EmptyMachineCode => write!(f, "机器码不能为空"),
            HkdfDeriveError::ExpandFailed => write!(f, "HKDF Expand 阶段失败"),
        }
    }
}

impl std::error::Error for HkdfDeriveError {}

/// 派生出的 256 位 (32 字节) AES 密钥包装器
/// 离开作用域或被 drop 时自动触发 Zeroize，将内存覆写为 0，防止内存 dump 泄露。
#[derive(Zeroize, ZeroizeOnDrop, Clone, PartialEq, Eq)]
pub struct DerivedAssetKey {
    key: [u8; 32],
}

impl DerivedAssetKey {
    /// 从原生 32 字节数组创建
    pub fn new(key: [u8; 32]) -> Self {
        Self { key }
    }

    /// 获取底层密钥切片
    pub fn as_bytes(&self) -> &[u8; 32] {
        &self.key
    }
}

impl Deref for DerivedAssetKey {
    type Target = [u8; 32];

    fn deref(&self) -> &Self::Target {
        &self.key
    }
}

impl std::fmt::Debug for DerivedAssetKey {
    fn fmt(&self, f: &mut std::fmt::Formatter<'_>) -> std::fmt::Result {
        write!(f, "DerivedAssetKey([REDACTED_32_BYTES])")
    }
}

/// HKDF 密钥派生深模块
pub struct HkdfKeyDeriver;

impl HkdfKeyDeriver {
    /// 核心派生函数：
    /// * `raw_signature`: 经过验签的 64 字节 Ed25519 签名（充当高熵 IKM，输入密钥材料）
    /// * `machine_code`: 绑定的硬件指纹短码（充当 Salt）
    /// * `extra_info`: 额外的上下文分离标识（默认为 `DEFAULT_ASSET_KEY_INFO`）
    pub fn derive_with_info(
        raw_signature: &[u8; 64],
        machine_code: &str,
        extra_info: &[u8],
    ) -> Result<DerivedAssetKey, HkdfDeriveError> {
        let trimmed_code = machine_code.trim();
        if trimmed_code.is_empty() {
            return Err(HkdfDeriveError::EmptyMachineCode);
        }

        // Salt: 硬件机器码短码字节序列
        let salt = trimmed_code.as_bytes();

        // 1. HKDF-Extract: PRK = HMAC-Hash(Salt, IKM)
        let hk = Hkdf::<Sha256>::new(Some(salt), raw_signature);

        // 2. HKDF-Expand: OKM = HKDF-Expand(PRK, info, 32)
        let mut okm = [0u8; 32];
        hk.expand(extra_info, &mut okm)
            .map_err(|_| HkdfDeriveError::ExpandFailed)?;

        Ok(DerivedAssetKey::new(okm))
    }

    /// 默认派生函数（使用标准资产包 Info 标签）
    pub fn derive_asset_key(
        raw_signature: &[u8; 64],
        machine_code: &str,
    ) -> Result<DerivedAssetKey, HkdfDeriveError> {
        Self::derive_with_info(raw_signature, machine_code, DEFAULT_ASSET_KEY_INFO)
    }

    /// 显式指定 Info 上下文隔离标签派生密钥
    pub fn derive_asset_key_with_info(
        raw_signature: &[u8; 64],
        machine_code: &str,
        extra_info: &[u8],
    ) -> Result<DerivedAssetKey, HkdfDeriveError> {
        Self::derive_with_info(raw_signature, machine_code, extra_info)
    }

    /// 从已通过验签的 LicenseContext 和本机机器码直接派生
    pub fn derive_from_context(
        context: &LicenseContext,
        machine_code: &str,
    ) -> Result<DerivedAssetKey, HkdfDeriveError> {
        Self::derive_asset_key(&context.raw_signature, machine_code)
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    fn sample_signature() -> [u8; 64] {
        let mut sig = [0u8; 64];
        for i in 0..64 {
            sig[i] = (i as u8).wrapping_mul(7).wrapping_add(13);
        }
        sig
    }

    #[test]
    fn test_deterministic_key_derivation() {
        let sig = sample_signature();
        let hwid = "E804-62DB-86BA-555E";

        let key1 = HkdfKeyDeriver::derive_asset_key(&sig, hwid).unwrap();
        let key2 = HkdfKeyDeriver::derive_asset_key(&sig, hwid).unwrap();

        assert_eq!(key1, key2);
        assert_ne!(*key1, [0u8; 32], "派生密钥不能为全零");
    }

    #[test]
    fn test_avalanche_effect_on_single_char_hwid_change() {
        let sig = sample_signature();
        let hwid_a = "E804-62DB-86BA-555E";
        let hwid_b = "E804-62DB-86BA-555F"; // 仅末位单字符从 E 变为 F

        let key_a = HkdfKeyDeriver::derive_asset_key(&sig, hwid_a).unwrap();
        let key_b = HkdfKeyDeriver::derive_asset_key(&sig, hwid_b).unwrap();

        assert_ne!(key_a, key_b);

        // 计算汉明距离（不同比特数）
        let mut diff_bits = 0;
        for i in 0..32 {
            diff_bits += (key_a[i] ^ key_b[i]).count_ones();
        }

        // 256 位密钥，理想雪崩在 128 位左右，在此强断言汉明距离 >= 80 位 (>30% 比特彻底翻转)
        assert!(
            diff_bits >= 80,
            "密码学雪崩不充分：256 位中仅有 {} 位不同",
            diff_bits
        );
    }

    #[test]
    fn test_avalanche_effect_on_signature_change() {
        let sig_a = sample_signature();
        let mut sig_b = sample_signature();
        sig_b[0] ^= 0x01; // 仅翻转签名的第 1 个 bit

        let hwid = "E804-62DB-86BA-555E";
        let key_a = HkdfKeyDeriver::derive_asset_key(&sig_a, hwid).unwrap();
        let key_b = HkdfKeyDeriver::derive_asset_key(&sig_b, hwid).unwrap();

        assert_ne!(key_a, key_b);

        let mut diff_bits = 0;
        for i in 0..32 {
            diff_bits += (key_a[i] ^ key_b[i]).count_ones();
        }
        assert!(
            diff_bits >= 80,
            "签名单 bit 变动未能引起雪崩：diff_bits={}",
            diff_bits
        );
    }

    #[test]
    fn test_empty_machine_code_error() {
        let sig = sample_signature();
        let res = HkdfKeyDeriver::derive_asset_key(&sig, "");
        assert_eq!(res.unwrap_err(), HkdfDeriveError::EmptyMachineCode);

        let res_spaces = HkdfKeyDeriver::derive_asset_key(&sig, "    ");
        assert_eq!(res_spaces.unwrap_err(), HkdfDeriveError::EmptyMachineCode);
    }

    #[test]
    fn test_zeroize_on_drop() {
        let mut key = DerivedAssetKey::new([0xAA; 32]);
        assert_eq!(key[0], 0xAA);
        key.zeroize();
        assert_eq!(*key, [0u8; 32], "zeroize 后内存必须全清零");
    }
}
