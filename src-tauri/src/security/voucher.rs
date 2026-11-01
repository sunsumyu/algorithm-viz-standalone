//! 账号权益凭证离线验签器 (Entitlement Voucher Verifier)
//!
//! 职责：
//! 1. 对开发者签发的账号权益凭证（延长试用天数 / 充值按量次数 / 开通永久会员）
//!    执行与离线激活码同源的 Ed25519 数字签名验证；
//! 2. 为「手机号注册账号」体系提供无需服务端即可远程调整权益的离线通道：
//!    开发者通过 `npm run voucher:gen` 签发凭证字符串，用户在客户端内粘贴兑换；
//! 3. 凭证载荷携带防重放 nonce，由账号库记录已消费 nonce 实现一次性兑换。
//!
//! 与 `license_verifier.rs` 的关系：
//! 激活码 (LicensePayload) 绑定机器码，服务「一机一码离线授权」；
//! 权益凭证 (VoucherPayload) 绑定手机号账号，服务「账号订阅 / 试用 / 按量付费」。
//! 两者共用同一 Ed25519 内置公钥，密钥运维面保持单一。

use base64::engine::general_purpose::URL_SAFE_NO_PAD as B64_URL_SAFE;
use base64::Engine;
use ed25519_dalek::{Signature, Verifier, VerifyingKey};
use serde::{Deserialize, Serialize};

use super::license_verifier::EMBEDDED_PUBLIC_KEY;

/// 凭证类型常量：延长试用天数 (`days` 生效)
pub const VOUCHER_TYPE_TRIAL: &str = "trial";
/// 凭证类型常量：充值按量付费次数 (`credits` 生效)
pub const VOUCHER_TYPE_CREDITS: &str = "credits";
/// 凭证类型常量：升级为永久会员
pub const VOUCHER_TYPE_LIFETIME: &str = "lifetime";

/// 权益凭证载荷结构
#[derive(Serialize, Deserialize, Clone, Debug, PartialEq)]
pub struct VoucherPayload {
    /// 协议版本号 (当前固定为 2，与激活码 v1 区分)
    pub v: u8,
    /// 凭证类型: trial | credits | lifetime
    pub typ: String,
    /// 目标账号手机号；`*` 表示任意账号可兑换（补发通用凭证）
    pub target: String,
    /// 试用延长天数 (typ = trial 时生效)
    #[serde(default)]
    pub days: i64,
    /// 按量付费次数充值额 (typ = credits 时生效)
    #[serde(default)]
    pub credits: i64,
    /// 凭证本身的有效兑换截止时间 Unix epoch 秒 (0 = 长期有效)
    pub exp: i64,
    /// 防重放唯一标识，兑换后由账号库永久记录
    pub nonce: String,
}

/// 凭证验签错误类型
#[derive(Debug, Clone, PartialEq)]
pub enum VoucherError {
    InvalidFormat(String),
    DecodeError(String),
    SignatureVerificationFailed,
    MalformedPayload(String),
    UnsupportedVersion(u8),
    Expired { exp: i64, now: i64 },
    InvalidPublicKey(String),
    InvalidType(String),
}

impl std::fmt::Display for VoucherError {
    fn fmt(&self, f: &mut std::fmt::Formatter<'_>) -> std::fmt::Result {
        match self {
            VoucherError::InvalidFormat(msg) => write!(f, "权益凭证格式错误: {}", msg),
            VoucherError::DecodeError(msg) => write!(f, "权益凭证解码失败: {}", msg),
            VoucherError::SignatureVerificationFailed => {
                write!(f, "数字签名无效，权益凭证被篡改或伪造")
            }
            VoucherError::MalformedPayload(msg) => write!(f, "权益凭证数据解析失败: {}", msg),
            VoucherError::UnsupportedVersion(v) => write!(f, "不支持的凭证协议版本: {}", v),
            VoucherError::Expired { exp, now } => write!(f, "权益凭证已过兑换期限 ({} < {})", exp, now),
            VoucherError::InvalidPublicKey(msg) => write!(f, "验签公钥无效: {}", msg),
            VoucherError::InvalidType(t) => write!(f, "未知的凭证类型: {}", t),
        }
    }
}

impl std::error::Error for VoucherError {}

/// 校验凭证类型字符串是否合法
pub fn is_valid_voucher_type(typ: &str) -> bool {
    matches!(
        typ,
        VOUCHER_TYPE_TRIAL | VOUCHER_TYPE_CREDITS | VOUCHER_TYPE_LIFETIME
    )
}

/// 权益凭证 Ed25519 验签器
#[derive(Clone, Debug)]
pub struct VoucherVerifier {
    verifying_key: VerifyingKey,
}

impl VoucherVerifier {
    /// 使用指定 32 字节 Ed25519 公钥创建验签器
    pub fn new(public_key_bytes: &[u8; 32]) -> Result<Self, VoucherError> {
        let verifying_key = VerifyingKey::from_bytes(public_key_bytes)
            .map_err(|e| VoucherError::InvalidPublicKey(e.to_string()))?;
        Ok(Self { verifying_key })
    }

    /// 使用内置开发者公钥创建验签器（与激活码同一密钥对）
    pub fn with_embedded_key() -> Result<Self, VoucherError> {
        Self::new(&EMBEDDED_PUBLIC_KEY)
    }

    /// 核心验签函数：格式 -> 签名 -> 版本 -> 类型 -> 兑换期限
    ///
    /// * `voucher_key`: 格式形如 `Base64(Payload) + "." + Base64(Signature)`
    /// * `current_time`: 当前 Unix 秒级时间戳
    pub fn verify(&self, voucher_key: &str, current_time: i64) -> Result<VoucherPayload, VoucherError> {
        let trimmed = voucher_key.trim();
        let parts: Vec<&str> = trimmed.split('.').collect();
        if parts.len() != 2 {
            return Err(VoucherError::InvalidFormat(
                "缺少 '.' 分隔符或段数不为 2".to_string(),
            ));
        }

        let payload_bytes = B64_URL_SAFE
            .decode(parts[0].trim())
            .map_err(|e| VoucherError::DecodeError(e.to_string()))?;
        let signature_bytes = B64_URL_SAFE
            .decode(parts[1].trim())
            .map_err(|e| VoucherError::DecodeError(e.to_string()))?;

        if signature_bytes.len() != 64 {
            return Err(VoucherError::DecodeError(format!(
                "签名长度非法，期望 64 字节，实际 {} 字节",
                signature_bytes.len()
            )));
        }

        let mut sig_arr = [0u8; 64];
        sig_arr.copy_from_slice(&signature_bytes);
        let signature = Signature::from_bytes(&sig_arr);

        self.verifying_key
            .verify(&payload_bytes, &signature)
            .map_err(|_| VoucherError::SignatureVerificationFailed)?;

        let payload: VoucherPayload = serde_json::from_slice(&payload_bytes)
            .map_err(|e| VoucherError::MalformedPayload(e.to_string()))?;

        if payload.v != 2 {
            return Err(VoucherError::UnsupportedVersion(payload.v));
        }

        if !is_valid_voucher_type(&payload.typ) {
            return Err(VoucherError::InvalidType(payload.typ));
        }

        if payload.nonce.trim().is_empty() {
            return Err(VoucherError::MalformedPayload("nonce 不能为空".to_string()));
        }

        if payload.exp > 0 && current_time > payload.exp {
            return Err(VoucherError::Expired {
                exp: payload.exp,
                now: current_time,
            });
        }

        Ok(payload)
    }
}

/// 离线签发权益凭证（供开发者 CLI 与测试使用）
pub fn sign_voucher_payload(
    signing_key: &ed25519_dalek::SigningKey,
    payload: &VoucherPayload,
) -> Result<String, String> {
    use ed25519_dalek::Signer;

    let payload_bytes = serde_json::to_vec(payload).map_err(|e| e.to_string())?;
    let signature = signing_key.sign(&payload_bytes);

    let payload_b64 = B64_URL_SAFE.encode(&payload_bytes);
    let sig_b64 = B64_URL_SAFE.encode(signature.to_bytes());

    Ok(format!("{}.{}", payload_b64, sig_b64))
}

#[cfg(test)]
mod tests {
    use super::*;
    use ed25519_dalek::SigningKey;

    fn test_signing_key() -> SigningKey {
        SigningKey::from_bytes(&[42u8; 32])
    }

    fn sample_payload() -> VoucherPayload {
        VoucherPayload {
            v: 2,
            typ: VOUCHER_TYPE_TRIAL.to_string(),
            target: "13800138000".to_string(),
            days: 30,
            credits: 0,
            exp: 1893456000,
            nonce: "N-2026-0001".to_string(),
        }
    }

    #[test]
    fn test_valid_voucher_verification() {
        let signing_key = test_signing_key();
        let verifier = VoucherVerifier::new(signing_key.verifying_key().as_bytes()).unwrap();
        let key_str = sign_voucher_payload(&signing_key, &sample_payload()).unwrap();

        let payload = verifier.verify(&key_str, 1730000000).unwrap();
        assert_eq!(payload.target, "13800138000");
        assert_eq!(payload.days, 30);
        assert_eq!(payload.nonce, "N-2026-0001");
    }

    #[test]
    fn test_tampered_voucher_fails() {
        let signing_key = test_signing_key();
        let verifier = VoucherVerifier::new(signing_key.verifying_key().as_bytes()).unwrap();
        let key_str = sign_voucher_payload(&signing_key, &sample_payload()).unwrap();
        let parts: Vec<&str> = key_str.split('.').collect();

        // 翻转签名首字节最低位，必须验签失败
        let mut sig = B64_URL_SAFE.decode(parts[1]).unwrap();
        sig[0] ^= 1;
        let forged = format!("{}.{}", parts[0], B64_URL_SAFE.encode(&sig));

        assert_eq!(
            verifier.verify(&forged, 1730000000).unwrap_err(),
            VoucherError::SignatureVerificationFailed
        );
    }

    #[test]
    fn test_expired_voucher_fails() {
        let signing_key = test_signing_key();
        let verifier = VoucherVerifier::new(signing_key.verifying_key().as_bytes()).unwrap();
        let key_str = sign_voucher_payload(&signing_key, &sample_payload()).unwrap();

        match verifier.verify(&key_str, 1900000000).unwrap_err() {
            VoucherError::Expired { exp, now } => {
                assert_eq!(exp, 1893456000);
                assert_eq!(now, 1900000000);
            }
            other => panic!("预期 Expired 错误，实际为: {:?}", other),
        }
    }

    #[test]
    fn test_unknown_type_rejected() {
        let signing_key = test_signing_key();
        let verifier = VoucherVerifier::new(signing_key.verifying_key().as_bytes()).unwrap();
        let mut payload = sample_payload();
        payload.typ = "blackhole".to_string();
        let key_str = sign_voucher_payload(&signing_key, &payload).unwrap();

        assert!(matches!(
            verifier.verify(&key_str, 1730000000).unwrap_err(),
            VoucherError::InvalidType(_)
        ));
    }

    #[test]
    fn test_wildcard_target_is_payload_passthrough() {
        let signing_key = test_signing_key();
        let verifier = VoucherVerifier::new(signing_key.verifying_key().as_bytes()).unwrap();
        let mut payload = sample_payload();
        payload.target = "*".to_string();
        let key_str = sign_voucher_payload(&signing_key, &payload).unwrap();

        let decoded = verifier.verify(&key_str, 1730000000).unwrap();
        assert_eq!(decoded.target, "*");
    }
}
