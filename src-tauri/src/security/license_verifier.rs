//! Ed25519 离线验签与时间戳校验器 (LicenseVerifier)
//!
//! 提供基于 Ed25519 非对称数字签名的离线授权认证、
//! 载荷解析（机器码、有效期、用户 ID、授权等级）、
//! 以及本地时钟防回拨（Clock Rollback）检测。

use base64::engine::general_purpose::{STANDARD as B64_STANDARD, URL_SAFE_NO_PAD as B64_URL_SAFE};
use base64::Engine;
use ed25519_dalek::{Signature, Verifier, VerifyingKey};
use serde::{Deserialize, Serialize};

/// 允许的时钟倒流容差（秒），避免因 NTP 微调或时区微小偏差导致误判
pub const CLOCK_ROLLBACK_TOLERANCE_SECS: i64 = 300;

/// 默认内置开发者公钥（32 字节，部署时由签名私钥生成对等的公钥）
pub const EMBEDDED_PUBLIC_KEY: [u8; 32] = [
    0x13, 0xec, 0x7d, 0xb6, 0x79, 0x95, 0x07, 0x37, 0xd2, 0x7a, 0x11, 0x54, 0x6f, 0x76, 0x2f, 0xfe,
    0x42, 0x29, 0x98, 0x1b, 0xf1, 0xbd, 0x6d, 0x3b, 0x43, 0x35, 0x23, 0x36, 0x80, 0xf9, 0xff, 0xe7,
];

/// 授权凭证载荷结构
#[derive(Serialize, Deserialize, Clone, Debug, PartialEq)]
pub struct LicensePayload {
    /// 协议版本号 (当前固定为 1)
    pub v: u8,
    /// 绑定的机器指纹短码或哈希 (如 XXXX-XXXX-XXXX-XXXX)
    pub uid: String,
    /// 到期时间戳 Unix epoch seconds (0 表示永久授权)
    pub exp: i64,
    /// 购买者身份标识 (如订单号/用户ID)
    pub user_id: String,
    /// 授权等级 (1: 基础题, 2: 进阶题, 3: 全量题)
    pub tier: u8,
}

/// 验签成功后返回的授权上下文
#[derive(Debug, Clone, PartialEq)]
pub struct LicenseContext {
    pub payload: LicensePayload,
    pub raw_signature: [u8; 64],
}

/// 验签与授权错误类型
#[derive(Debug, Clone, PartialEq)]
pub enum LicenseError {
    InvalidFormat(String),
    Base64DecodeError(String),
    InvalidSignatureLength(usize),
    SignatureVerificationFailed,
    MalformedPayload(String),
    UnsupportedVersion(u8),
    Expired { exp: i64, now: i64 },
    MachineMismatch { expected: String, actual: String },
    ClockRollbackDetected { recorded: i64, current: i64 },
    InvalidPublicKey(String),
}

impl std::fmt::Display for LicenseError {
    fn fmt(&self, f: &mut std::fmt::Formatter<'_>) -> std::fmt::Result {
        match self {
            LicenseError::InvalidFormat(msg) => write!(f, "激活码格式错误: {}", msg),
            LicenseError::Base64DecodeError(msg) => write!(f, "Base64 解码失败: {}", msg),
            LicenseError::InvalidSignatureLength(len) => {
                write!(f, "签名长度非法，期望 64 字节，实际 {} 字节", len)
            }
            LicenseError::SignatureVerificationFailed => write!(f, "数字签名无效，激活码被篡改或伪造"),
            LicenseError::MalformedPayload(msg) => write!(f, "授权数据解析失败: {}", msg),
            LicenseError::UnsupportedVersion(v) => write!(f, "不支持的协议版本: {}", v),
            LicenseError::Expired { exp, now } => {
                write!(f, "授权已于 {} 过期 (当前时间: {})", exp, now)
            }
            LicenseError::MachineMismatch { expected, actual } => {
                write!(f, "机器指纹不匹配: 当前设备为 {}, 激活码绑定为 {}", actual, expected)
            }
            LicenseError::ClockRollbackDetected { recorded, current } => {
                write!(f, "系统时钟出现异常倒流 (上次记录: {}, 当前: {})", recorded, current)
            }
            LicenseError::InvalidPublicKey(msg) => write!(f, "验签公钥无效: {}", msg),
        }
    }
}

impl std::error::Error for LicenseError {}

/// Ed25519 离线验签器
#[derive(Clone, Debug)]
pub struct LicenseVerifier {
    verifying_key: VerifyingKey,
}

impl LicenseVerifier {
    /// 使用指定的 32 字节 Ed25519 公钥创建验签器
    pub fn new(public_key_bytes: &[u8; 32]) -> Result<Self, LicenseError> {
        let verifying_key = VerifyingKey::from_bytes(public_key_bytes)
            .map_err(|e| LicenseError::InvalidPublicKey(e.to_string()))?;
        Ok(Self { verifying_key })
    }

    /// 使用内置开发者公钥创建验签器
    pub fn with_embedded_key() -> Result<Self, LicenseError> {
        Self::new(&EMBEDDED_PUBLIC_KEY)
    }

    /// 辅助 Base64 解码：先尝试 URL-safe，后回退到标准 Base64
    fn decode_base64(encoded: &str) -> Result<Vec<u8>, LicenseError> {
        let trimmed = encoded.trim();
        if let Ok(bytes) = B64_URL_SAFE.decode(trimmed) {
            return Ok(bytes);
        }
        if let Ok(bytes) = B64_STANDARD.decode(trimmed) {
            return Ok(bytes);
        }
        // 尝试自动补齐 padding 后再解
        let padded = match trimmed.len() % 4 {
            2 => format!("{}==", trimmed),
            3 => format!("{}=", trimmed),
            _ => trimmed.to_string(),
        };
        B64_STANDARD
            .decode(&padded)
            .map_err(|e| LicenseError::Base64DecodeError(e.to_string()))
    }

    /// 核心验签函数：验证签名、协议版本、过期时间与时钟防回拨
    ///
    /// * `license_key`: 格式形如 `Base64(Payload) + "." + Base64(Signature)`
    /// * `current_time`: 当前 Unix 秒级时间戳
    /// * `last_recorded_time`: 本地上次记录的有效时间戳（可选，用于防回拨检测）
    pub fn verify(
        &self,
        license_key: &str,
        current_time: i64,
        last_recorded_time: Option<i64>,
    ) -> Result<LicenseContext, LicenseError> {
        let trimmed = license_key.trim();
        let parts: Vec<&str> = trimmed.split('.').collect();
        if parts.len() != 2 {
            return Err(LicenseError::InvalidFormat(
                "缺少 '.' 分隔符或段数不为 2".to_string(),
            ));
        }

        let payload_bytes = Self::decode_base64(parts[0])?;
        let signature_bytes = Self::decode_base64(parts[1])?;

        if signature_bytes.len() != 64 {
            return Err(LicenseError::InvalidSignatureLength(signature_bytes.len()));
        }

        let mut sig_arr = [0u8; 64];
        sig_arr.copy_from_slice(&signature_bytes);
        let signature = Signature::from_bytes(&sig_arr);

        // 执行 Ed25519 纯数学密码学验签
        self.verifying_key
            .verify(&payload_bytes, &signature)
            .map_err(|_| LicenseError::SignatureVerificationFailed)?;

        // 反序列化载荷
        let payload: LicensePayload = serde_json::from_slice(&payload_bytes)
            .map_err(|e| LicenseError::MalformedPayload(e.to_string()))?;

        // 版本校验
        if payload.v != 1 {
            return Err(LicenseError::UnsupportedVersion(payload.v));
        }

        // 时钟防回拨校验：当前时间较上次有效时间倒流超过容差
        if let Some(recorded) = last_recorded_time {
            if current_time < recorded - CLOCK_ROLLBACK_TOLERANCE_SECS {
                return Err(LicenseError::ClockRollbackDetected {
                    recorded,
                    current: current_time,
                });
            }
        }

        // 过期时间校验：exp > 0 且当前时间已超过 exp
        if payload.exp > 0 && current_time > payload.exp {
            return Err(LicenseError::Expired {
                exp: payload.exp,
                now: current_time,
            });
        }

        Ok(LicenseContext {
            payload,
            raw_signature: sig_arr,
        })
    }

    /// 带有机器指纹绑定的完整校验
    pub fn verify_for_machine(
        &self,
        license_key: &str,
        machine_uid: &str,
        current_time: i64,
        last_recorded_time: Option<i64>,
    ) -> Result<LicenseContext, LicenseError> {
        let context = self.verify(license_key, current_time, last_recorded_time)?;
        if context.payload.uid != machine_uid {
            return Err(LicenseError::MachineMismatch {
                expected: context.payload.uid,
                actual: machine_uid.to_string(),
            });
        }
        Ok(context)
    }
}

/// 离线签名发号辅助函数（供测试及 Ticket 06 算号器使用）
pub fn sign_license_payload(
    signing_key: &ed25519_dalek::SigningKey,
    payload: &LicensePayload,
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

    fn generate_test_keys() -> (SigningKey, LicenseVerifier) {
        let seed = [42u8; 32];
        let signing_key = SigningKey::from_bytes(&seed);
        let verifying_key = signing_key.verifying_key();
        let verifier = LicenseVerifier::new(verifying_key.as_bytes()).unwrap();
        (signing_key, verifier)
    }

    #[test]
    fn test_valid_license_verification() {
        let (signing_key, verifier) = generate_test_keys();
        let payload = LicensePayload {
            v: 1,
            uid: "E804-62DB-86BA-555E".to_string(),
            exp: 1893456000, // 2030-01-01
            user_id: "VIP-USER-8899".to_string(),
            tier: 3,
        };

        let key_str = sign_license_payload(&signing_key, &payload).unwrap();
        let now = 1728470000; // 2024 年某时
        let res = verifier.verify_for_machine(&key_str, "E804-62DB-86BA-555E", now, Some(now - 100));

        assert!(res.is_ok());
        let ctx = res.unwrap();
        assert_eq!(ctx.payload.user_id, "VIP-USER-8899");
        assert_eq!(ctx.payload.tier, 3);
        assert_eq!(ctx.payload.exp, 1893456000);
        assert_eq!(ctx.raw_signature.len(), 64);
    }

    #[test]
    fn test_embedded_public_key_verification_with_generator_token() {
        let verifier = LicenseVerifier::with_embedded_key().unwrap();
        let token = "eyJ2IjoxLCJ1aWQiOiJFODA0LTYyREItODZCQS01NTVFIiwiZXhwIjoxODIzMDU4NTY5LCJ1c2VyX2lkIjoiVEVTVC1WSVAiLCJ0aWVyIjozfQ.n-Gv3wXCSvj7N3BWI4itv1G1dXAbIvaS_-No7ZRTJ8z4YRb5Ixha40tPd8hQ_WbCT6VtPHzudp0-v_QeKzlpAw";
        let res = verifier.verify_for_machine(token, "E804-62DB-86BA-555E", 1728470000, None);
        assert!(res.is_ok());
        let ctx = res.unwrap();
        assert_eq!(ctx.payload.uid, "E804-62DB-86BA-555E");
        assert_eq!(ctx.payload.user_id, "TEST-VIP");
        assert_eq!(ctx.payload.tier, 3);
        assert_eq!(ctx.payload.exp, 1823058569);
    }

    #[test]
    fn test_tampered_payload_fails_verification() {
        let (signing_key, verifier) = generate_test_keys();
        let payload = LicensePayload {
            v: 1,
            uid: "E804-62DB-86BA-555E".to_string(),
            exp: 1893456000,
            user_id: "VIP-USER-8899".to_string(),
            tier: 1,
        };

        let key_str = sign_license_payload(&signing_key, &payload).unwrap();
        let parts: Vec<&str> = key_str.split('.').collect();

        // 攻击者篡改 payload，企图将 tier=1 改为 tier=3
        let decoded = LicenseVerifier::decode_base64(parts[0]).unwrap();
        let mut tampered_str = String::from_utf8(decoded).unwrap();
        tampered_str = tampered_str.replace("\"tier\":1", "\"tier\":3");
        let tampered_b64 = B64_URL_SAFE.encode(tampered_str.as_bytes());

        let forged_key = format!("{}.{}", tampered_b64, parts[1]);
        let res = verifier.verify(&forged_key, 1728470000, None);

        assert_eq!(res.unwrap_err(), LicenseError::SignatureVerificationFailed);
    }

    #[test]
    fn test_tampered_signature_single_bit_fails() {
        let (signing_key, verifier) = generate_test_keys();
        let payload = LicensePayload {
            v: 1,
            uid: "E804-62DB-86BA-555E".to_string(),
            exp: 1893456000,
            user_id: "VIP-USER-8899".to_string(),
            tier: 3,
        };

        let key_str = sign_license_payload(&signing_key, &payload).unwrap();
        let parts: Vec<&str> = key_str.split('.').collect();

        let mut sig_bytes = LicenseVerifier::decode_base64(parts[1]).unwrap();
        // 翻转签名的第 0 个字节的最低位
        sig_bytes[0] ^= 1;
        let tampered_sig_b64 = B64_URL_SAFE.encode(&sig_bytes);

        let forged_key = format!("{}.{}", parts[0], tampered_sig_b64);
        let res = verifier.verify(&forged_key, 1728470000, None);

        assert_eq!(res.unwrap_err(), LicenseError::SignatureVerificationFailed);
    }

    #[test]
    fn test_expired_license_fails() {
        let (signing_key, verifier) = generate_test_keys();
        let payload = LicensePayload {
            v: 1,
            uid: "E804-62DB-86BA-555E".to_string(),
            exp: 1700000000, // 过去的时间
            user_id: "VIP-USER-8899".to_string(),
            tier: 3,
        };

        let key_str = sign_license_payload(&signing_key, &payload).unwrap();
        let now = 1710000000; // 晚于 exp
        let res = verifier.verify(&key_str, now, None);

        match res.unwrap_err() {
            LicenseError::Expired { exp, now: curr } => {
                assert_eq!(exp, 1700000000);
                assert_eq!(curr, 1710000000);
            }
            other => panic!("预期 Expired 错误，实际为: {:?}", other),
        }
    }

    #[test]
    fn test_perpetual_license_never_expires() {
        let (signing_key, verifier) = generate_test_keys();
        let payload = LicensePayload {
            v: 1,
            uid: "E804-62DB-86BA-555E".to_string(),
            exp: 0, // 永久授权
            user_id: "LIFETIME-USER".to_string(),
            tier: 3,
        };

        let key_str = sign_license_payload(&signing_key, &payload).unwrap();
        let far_future = 2500000000;
        let res = verifier.verify(&key_str, far_future, None);
        assert!(res.is_ok());
    }

    #[test]
    fn test_machine_uid_mismatch_fails() {
        let (signing_key, verifier) = generate_test_keys();
        let payload = LicensePayload {
            v: 1,
            uid: "E804-62DB-86BA-555E".to_string(),
            exp: 0,
            user_id: "USER-1".to_string(),
            tier: 2,
        };

        let key_str = sign_license_payload(&signing_key, &payload).unwrap();
        let res = verifier.verify_for_machine(&key_str, "DIFFERENT-MACHINE", 1720000000, None);

        match res.unwrap_err() {
            LicenseError::MachineMismatch { expected, actual } => {
                assert_eq!(expected, "E804-62DB-86BA-555E");
                assert_eq!(actual, "DIFFERENT-MACHINE");
            }
            other => panic!("预期 MachineMismatch 错误，实际为: {:?}", other),
        }
    }

    #[test]
    fn test_clock_rollback_detected() {
        let (signing_key, verifier) = generate_test_keys();
        let payload = LicensePayload {
            v: 1,
            uid: "E804-62DB-86BA-555E".to_string(),
            exp: 1800000000,
            user_id: "USER-1".to_string(),
            tier: 1,
        };

        let key_str = sign_license_payload(&signing_key, &payload).unwrap();
        let recorded = 1720000000;
        // 攻击者将系统时间倒流 2 天 (172800 秒)
        let rollbacked_time = recorded - 172800;
        let res = verifier.verify(&key_str, rollbacked_time, Some(recorded));

        match res.unwrap_err() {
            LicenseError::ClockRollbackDetected { recorded: r, current } => {
                assert_eq!(r, recorded);
                assert_eq!(current, rollbacked_time);
            }
            other => panic!("预期 ClockRollbackDetected 错误，实际为: {:?}", other),
        }
    }

    #[test]
    fn test_small_clock_tolerance_allowed() {
        let (signing_key, verifier) = generate_test_keys();
        let payload = LicensePayload {
            v: 1,
            uid: "E804-62DB-86BA-555E".to_string(),
            exp: 1800000000,
            user_id: "USER-1".to_string(),
            tier: 1,
        };

        let key_str = sign_license_payload(&signing_key, &payload).unwrap();
        let recorded = 1720000000;
        // 倒流 100 秒（在 300 秒容差内，例如 NTP 修正），应予放行
        let slightly_back = recorded - 100;
        let res = verifier.verify(&key_str, slightly_back, Some(recorded));
        assert!(res.is_ok());
    }

    #[test]
    fn test_interop_with_cli_generated_license() {
        let verifier = LicenseVerifier::with_embedded_key().expect("内置公钥必须有效");
        // 由 scripts/generate-license.ts 真实生成的激活码
        let generated_token = "eyJ2IjoxLCJ1aWQiOiJFODA0LTYyREItODZCQS01NTVFIiwiZXhwIjoxNzk0MTE0NDk5LCJ1c2VyX2lkIjoiQ1VTVE9NRVJfVEVTVF8wMSIsInRpZXIiOjN9.8vJVC6GsDRD4_lZ4Rm2zz-oR0pQUiuTr0ta0gCuAe3EUhAskI2WBevPu9Pv3LvwtdOlbEaQgzRvkcZ2xrvuGAg";
        let now = 1794000000;
        let res = verifier.verify_for_machine(generated_token, "E804-62DB-86BA-555E", now, None);
        assert!(res.is_ok(), "CLI 生成的激活码在 Rust 端验签失败: {:?}", res.err());
        let ctx = res.unwrap();
        assert_eq!(ctx.payload.uid, "E804-62DB-86BA-555E");
        assert_eq!(ctx.payload.user_id, "CUSTOMER_TEST_01");
        assert_eq!(ctx.payload.tier, 3);
        assert_eq!(ctx.payload.exp, 1794114499);
    }
}
