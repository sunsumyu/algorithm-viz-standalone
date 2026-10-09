//! 零宽字符 (Zero-Width) 隐形盲水印双向编解码器与注入器 (Watermark)
//!
//! 职责：
//! 1. `ZeroWidthWatermark`: 将购买者身份标识 (user_id) 编码为肉眼不可见的 Unicode 零宽字符；
//! 2. `decode_watermark`: 从任何泄露的文本中精准扫描并 100% 还原原始买家身份；
//! 3. `WatermarkInjector`: 算法切片下发时，在题目自然段间隙中注入隐形水印，并对图论坐标进行浮点微扰。

pub const ZW_ZERO: char = '\u{200B}';  // 零宽空格 (Zero-Width Space) -> 0
pub const ZW_ONE: char = '\u{200C}';   // 零宽非连字符 (Zero-Width Non-Joiner) -> 1
pub const ZW_DELIM: char = '\u{200D}'; // 零宽连字符 (Zero-Width Joiner) -> 起始与结束界定符

pub struct ZeroWidthWatermark;

impl ZeroWidthWatermark {
    /// 将买家 ID 编码为不可见的零宽字符序列
    pub fn encode(user_id: &str) -> String {
        let bytes = user_id.as_bytes();
        let mut out = String::with_capacity(bytes.len() * 8 + 2);
        out.push(ZW_DELIM);

        for &b in bytes {
            for shift in (0..8).rev() {
                let bit = (b >> shift) & 1;
                if bit == 1 {
                    out.push(ZW_ONE);
                } else {
                    out.push(ZW_ZERO);
                }
            }
        }

        out.push(ZW_DELIM);
        out
    }

    /// 从可能含有水印的文本中扫描并提取买家 ID
    pub fn decode(text: &str) -> Option<String> {
        let chars: Vec<char> = text.chars().collect();
        let mut i = 0;

        while i < chars.len() {
            if chars[i] == ZW_DELIM {
                // 寻找匹配的闭合界定符
                let mut bits = Vec::new();
                let mut j = i + 1;
                let mut found_end = false;

                while j < chars.len() {
                    let c = chars[j];
                    if c == ZW_DELIM {
                        found_end = true;
                        break;
                    } else if c == ZW_ZERO {
                        bits.push(0u8);
                    } else if c == ZW_ONE {
                        bits.push(1u8);
                    }
                    j += 1;
                }

                if found_end && !bits.is_empty() && bits.len() % 8 == 0 {
                    let mut bytes = Vec::with_capacity(bits.len() / 8);
                    for chunk in bits.chunks(8) {
                        let mut byte = 0u8;
                        for &bit in chunk {
                            byte = (byte << 1) | bit;
                        }
                        bytes.push(byte);
                    }

                    if let Ok(user_id) = String::from_utf8(bytes) {
                        return Some(user_id);
                    }
                }

                i = j;
            }
            i += 1;
        }

        None
    }
}

pub struct WatermarkInjector;

impl WatermarkInjector {
    /// 将不可见水印自然织入普通文本中（优先插入在中文句号、英文句号或换行符后）
    pub fn inject_into_text(text: &str, user_id: &str) -> String {
        let watermark = ZeroWidthWatermark::encode(user_id);
        if text.is_empty() {
            return watermark;
        }

        // 寻找首个句号或段落结束符
        let puncts = ['。', '！', '？', '.', '!', '?', '\n'];
        if let Some(pos) = text.find(|c: char| puncts.contains(&c)) {
            // 在第一个标点符号后插入
            let insert_idx = pos + text[pos..].chars().next().map(|c| c.len_utf8()).unwrap_or(1);
            let mut result = String::with_capacity(text.len() + watermark.len());
            result.push_str(&text[..insert_idx]);
            result.push_str(&watermark);
            result.push_str(&text[insert_idx..]);
            result
        } else {
            // 没有明显标点时追加到末尾
            format!("{}{}", text, watermark)
        }
    }

    /// 对几何坐标增加视觉无感浮点微扰 (微移 0.0001 ~ 0.0009 像素)
    pub fn perturb_coord(val: f64, user_id: &str, axis_seed: u32) -> f64 {
        use sha2::{Digest, Sha256};
        let mut hasher = Sha256::new();
        hasher.update(user_id.as_bytes());
        hasher.update(&axis_seed.to_le_bytes());
        let hash = hasher.finalize();

        // 提取前 2 个字节映射到 [-0.0005, 0.0005] 的极微小扰动
        let raw = u16::from_le_bytes([hash[0], hash[1]]) as f64;
        let delta = (raw / 65535.0 - 0.5) * 0.001;
        val + delta
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_zero_width_encode_decode_roundtrip() {
        let test_users = vec![
            "ORDER_20261009_99812",
            "VIP-ALICE-10086",
            "USER_888",
            "ZH_买家_中文ID",
        ];

        for uid in test_users {
            let encoded = ZeroWidthWatermark::encode(uid);
            // 编码出的都是零宽字符
            for c in encoded.chars() {
                assert!(c == ZW_ZERO || c == ZW_ONE || c == ZW_DELIM);
            }

            let decoded = ZeroWidthWatermark::decode(&encoded);
            assert_eq!(decoded.as_deref(), Some(uid));
        }
    }

    #[test]
    fn test_watermark_injected_into_natural_text() {
        let original_text = "Dijkstra 算法用于求解单源最短路径。时间复杂度为 O((V+E)logV)。";
        let user_id = "BUYER_9527";

        let injected = WatermarkInjector::inject_into_text(original_text, user_id);

        // 1. 视觉字符长度检查：虽然包含隐藏字符，但肉眼看与原文本完全等价
        assert!(injected.contains("Dijkstra 算法用于求解单源最短路径。"));

        // 2. 从被注入的文本中 100% 精确提取买家身份
        let extracted = ZeroWidthWatermark::decode(&injected);
        assert_eq!(extracted.as_deref(), Some("BUYER_9527"));
    }

    #[test]
    fn test_clean_text_returns_none() {
        let clean = "这是一段完全干净、不包含任何零宽字符的普通题目讲义。";
        assert_eq!(ZeroWidthWatermark::decode(clean), None);
    }

    #[test]
    fn test_coord_perturbation_is_subtle() {
        let base_x = 100.0;
        let user1 = "USER_A";
        let user2 = "USER_B";

        let p1 = WatermarkInjector::perturb_coord(base_x, user1, 1);
        let p2 = WatermarkInjector::perturb_coord(base_x, user2, 1);

        // 扰动极小（小于 0.01 像素）
        assert!((p1 - base_x).abs() < 0.001);
        assert!((p2 - base_x).abs() < 0.001);
        // 不同用户扰动唯一且不同
        assert_ne!(p1, p2);
    }
}
