//! 内容资产包密钥模型 (Content Pack Key Model)
//!
//! 职责：
//! 1. 修复旧管线的密码学设计缺陷：旧 `HkdfKeyDeriver::derive_with_info` 将
//!    **单次激活码签名** 与 **机器码** 混入资产密钥派生，导致一张通用资产包
//!    在数学上不可能被多个授权用户解密（每个用户的签名与机器都不同）；
//! 2. 新模型分层：资产包以「构建期主密钥」加密（一张包全用户通用），
//!    机器与授权绑定收敛到**服务层门禁**——`fetch_algorithm_chunk` 在每次
//!    解密前仍强制校验激活码签名与机器指纹，密钥本身不承担授权语义；
//! 3. 主密钥来源可插拔：当前支持环境变量注入（64 位 hex），协议接线切片
//!    落地时切换为 build.rs 分片混淆嵌入（见 docs/encrypted-content-activation.md）。
//!
//! 威胁模型说明：主密钥必然存在于客户端二进制中（桌面端通例），
//! 本模型的目标是让「提取内容」必须经过 二进制逆向 + 密钥重组 + 绕过服务门禁
//! 三个步骤，而不是直接从 dist 目录 grep 明文。

use hkdf::Hkdf;
use sha2::Sha256;

/// 内容包密钥 HKDF 域隔离标签
pub const CONTENT_PACK_KEY_INFO: &[u8] = b"algorithm-viz/content-pack-key-v1";

/// 运行时读取内容主密钥的环境变量名（64 位 hex = 128 字符）
pub const CONTENT_MASTER_KEY_ENV: &str = "ALGO_VIZ_CONTENT_MASTER_KEY";

/// 从构建期主密钥派生内容资产包 AES-256 密钥（共享包模型：一张包全用户通用）
pub fn derive_content_pack_key(master_key: &[u8; 32]) -> [u8; 32] {
    let hk = Hkdf::<Sha256>::new(None, master_key);
    let mut key = [0u8; 32];
    hk.expand(CONTENT_PACK_KEY_INFO, &mut key)
        .expect("32 字节输出长度合法");
    key
}

/// 主密钥提供器：从环境变量读取 64 字符 hex 主密钥
///
/// 返回 None 表示未配置（资产包管线保持休眠，应用行为与未接线时一致）。
pub fn master_key_from_env() -> Option<[u8; 32]> {
    let hex = std::env::var(CONTENT_MASTER_KEY_ENV).ok()?;
    parse_master_key_hex(&hex)
}

/// build.rs 生成的 XOR 分片嵌入密钥（密钥不以明文字符串随包分发）
mod embedded_key {
    include!(concat!(env!("OUT_DIR"), "/content_master_key.rs"));
}

/// 从二进制内嵌分片重组主密钥（未配置时 None，管线休眠）
pub fn master_key_from_embedded() -> Option<[u8; 32]> {
    if !embedded_key::EMBEDDED_PRESENT {
        return None;
    }
    let key = embedded_key::recombine();
    // 全零重组结果视为未配置（防御生成端异常）
    if key == [0u8; 32] {
        return None;
    }
    Some(key)
}

/// 解析 64 字符 hex 主密钥（容错：大小写、首尾空白）
pub fn parse_master_key_hex(hex: &str) -> Option<[u8; 32]> {
    let trimmed = hex.trim();
    if trimmed.len() != 64 || !trimmed.chars().all(|c| c.is_ascii_hexdigit()) {
        return None;
    }
    let mut key = [0u8; 32];
    for i in 0..32 {
        key[i] = u8::from_str_radix(&trimmed[2 * i..2 * i + 2], 16).ok()?;
    }
    Some(key)
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_derive_content_pack_key_is_deterministic() {
        let master = [0x42u8; 32];
        assert_eq!(derive_content_pack_key(&master), derive_content_pack_key(&master));
    }

    #[test]
    fn test_derive_content_pack_key_avalanche() {
        let mut master_a = [0x42u8; 32];
        let mut master_b = [0x42u8; 32];
        master_b[31] ^= 0x01;
        let ka = derive_content_pack_key(&master_a);
        let kb = derive_content_pack_key(&master_b);
        assert_ne!(ka, kb, "主密钥 1 位差异必须雪崩到包密钥");
        master_a[0] ^= 0x80;
        assert_ne!(derive_content_pack_key(&master_a), ka);
    }

    #[test]
    fn test_derivation_domain_separated_from_other_keys() {
        // 与账号库 / 台账完整性密钥不同域（不同 salt/info 组合）
        let master = [0x11u8; 32];
        let content_key = derive_content_pack_key(&master);
        let account_key = super::super::account_store::derive_integrity_key("MACHINE-A");
        let ledger_key = super::super::machine_ledger::derive_ledger_key("MACHINE-A");
        assert_ne!(content_key.to_vec(), account_key.to_vec());
        assert_ne!(content_key.to_vec(), ledger_key.to_vec());
    }

    #[test]
    fn test_parse_master_key_hex() {
        let hex = "00112233445566778899aabbccddeeff00112233445566778899AABBCCDDEEFF";
        let key = parse_master_key_hex(hex).unwrap();
        assert_eq!(key[0], 0x00);
        assert_eq!(key[31], 0xFF);

        assert!(parse_master_key_hex("  00112233445566778899aabbccddeeff00112233445566778899aabbccddeeff  ").is_some());
        assert!(parse_master_key_hex("").is_none());
        assert!(parse_master_key_hex("0011").is_none());
        assert!(parse_master_key_hex(&"0".repeat(63)).is_none());
        assert!(parse_master_key_hex(&format!("{}g", "0".repeat(63))).is_none());
    }

    #[test]
    fn test_embedded_key_recombines_or_absent() {
        // 本机 .security 存在密钥时 build.rs 会嵌入；fresh clone 为 None。
        // 两种状态都必须合法：Some(非全零 32 字节) 或 None。
        match master_key_from_embedded() {
            Some(key) => {
                assert_ne!(key, [0u8; 32]);
                // 重组结果必须能推导出与跨语言契约一致的包密钥（无 panic 即可）
                let _ = derive_content_pack_key(&key);
            }
            None => {}
        }
    }

    #[test]
    fn test_master_key_from_env() {
        // 注意：环境变量注入仅在持有显式配置时生效，未配置即休眠
        let master = [0xABu8; 32];
        let hex: String = master.iter().map(|b| format!("{:02x}", b)).collect();
        std::env::set_var(CONTENT_MASTER_KEY_ENV, &hex);
        assert_eq!(master_key_from_env(), Some(master));
        std::env::remove_var(CONTENT_MASTER_KEY_ENV);
        assert_eq!(master_key_from_env(), None);
    }
}
