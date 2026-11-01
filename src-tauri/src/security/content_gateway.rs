//! 内容资产网关 (Content Gateway)
//!
//! 职责（内容资产加密管线 · 服务端裁决层）：
//! 1. **授权印章**：激活码验签成功 / 账号登录成功时盖章（TTL 24 小时，
//!    试用期激活码以 exp 与 TTL 取短），`apv://` 协议处理器仅对盖章有效期内的
//!    内容资产请求提供解密服务；账号注销立即撕章；
//! 2. **请求裁决纯函数**：URI 路径归一化（含目录穿越拒绝）与 MIME 推断，
//!    供协议处理器调用，均为无副作用函数，单元测试全覆盖；
//! 3. **内容限流**：独立于算法切片限流器的宽松策略（批量加载 30+ chunk 不误伤，
//!    仍拦截脚本化批量 dump 的高频连续请求）。
//!
//! 威胁模型说明：主密钥随资源文件分发（与编译进二进制同级的桌面端通例），
//! 网关目标是让「在线获取内容」必须持有对本机有效的授权；
//! 离线提取内容的残余风险由主密钥逆向成本承担（见 docs/encrypted-content-activation.md）。

use std::sync::{Mutex, OnceLock};

use super::rate_limiter::ScrapeRateLimiter;

/// 授权印章默认有效期（秒）：24 小时
pub const CONTENT_UNLOCK_TTL_SECS: i64 = 24 * 3600;

/// 内容资产限流策略：1 秒窗口 40 次（批量 chunk 加载不误伤），违规冷却 5 秒
pub const GATEWAY_WINDOW_MS: u64 = 1000;
pub const GATEWAY_MAX_REQUESTS: usize = 40;
pub const GATEWAY_COOLDOWN_MS: u64 = 5000;

// ============================================================
// 授权印章
// ============================================================

pub struct ContentGatewayState {
    /// 印章有效期截止 (Unix 秒, 0 = 未盖章)
    unlocked_until_secs: i64,
    limiter: ScrapeRateLimiter,
}

static GATEWAY_STATE: OnceLock<Mutex<ContentGatewayState>> = OnceLock::new();

fn gateway_state() -> &'static Mutex<ContentGatewayState> {
    GATEWAY_STATE.get_or_init(|| {
        Mutex::new(ContentGatewayState {
            unlocked_until_secs: 0,
            limiter: ScrapeRateLimiter::new(
                GATEWAY_WINDOW_MS,
                GATEWAY_MAX_REQUESTS,
                GATEWAY_COOLDOWN_MS,
            ),
        })
    })
}

/// 盖章：内容资产请求放行至 `valid_until_secs`（与 24h TTL 取短）
pub fn stamp_unlock(now_secs: i64, valid_until_secs: i64) {
    let mut state = gateway_state()
        .lock()
        .unwrap_or_else(|poisoned| poisoned.into_inner());
    let ttl_bound = now_secs + CONTENT_UNLOCK_TTL_SECS;
    state.unlocked_until_secs = state
        .unlocked_until_secs
        .max(valid_until_secs.min(ttl_bound));
}

/// 撕章（账号注销时调用）
pub fn clear_unlock() {
    let mut state = gateway_state()
        .lock()
        .unwrap_or_else(|poisoned| poisoned.into_inner());
    state.unlocked_until_secs = 0;
}

/// 当前是否处于放行期
pub fn is_unlocked(now_secs: i64) -> bool {
    let state = gateway_state()
        .lock()
        .unwrap_or_else(|poisoned| poisoned.into_inner());
    state.unlocked_until_secs > now_secs
}

/// 内容请求限流检查（放行返回 Ok）
pub fn check_rate(now_ms: u64) -> Result<(), super::rate_limiter::RateLimitError> {
    let mut state = gateway_state()
        .lock()
        .unwrap_or_else(|poisoned| poisoned.into_inner());
    state.limiter.check_request(now_ms)
}

// ============================================================
// 裁决纯函数
// ============================================================

/// URI 路径归一化为包内资产 id（dist 相对 POSIX 路径）
///
/// * `/assets/main-AbCd.js` → `assets/main-AbCd.js`
/// * `/` / 空路径 / 目录穿越 (`..`) / 反斜杠 → None
pub fn normalize_asset_path(uri_path: &str) -> Option<String> {
    let trimmed = uri_path.split('?').next()?.trim();
    let trimmed = trimmed.trim_start_matches('/');
    if trimmed.is_empty() {
        return None;
    }
    if trimmed.contains('\\') {
        return None;
    }
    let mut normalized = String::with_capacity(trimmed.len());
    for segment in trimmed.split('/') {
        match segment {
            "" | "." => continue,
            ".." => return None,
            s => {
                if !normalized.is_empty() {
                    normalized.push('/');
                }
                normalized.push_str(s);
            }
        }
    }
    if normalized.is_empty() {
        None
    } else {
        Some(normalized)
    }
}

/// 按扩展名推断 MIME（覆盖前端构建产物全部常见类型）
pub fn guess_mime(path: &str) -> &'static str {
    let ext = path.rsplit('.').next().unwrap_or("").to_ascii_lowercase();
    match ext.as_str() {
        "js" | "mjs" => "text/javascript",
        "css" => "text/css",
        "json" | "map" => "application/json",
        "html" | "htm" => "text/html",
        "svg" => "image/svg+xml",
        "png" => "image/png",
        "jpg" | "jpeg" => "image/jpeg",
        "gif" => "image/gif",
        "webp" => "image/webp",
        "ico" => "image/x-icon",
        "woff" => "font/woff",
        "woff2" => "font/woff2",
        "ttf" => "font/ttf",
        "otf" => "font/otf",
        "eot" => "application/vnd.ms-fontobject",
        "wasm" => "application/wasm",
        "txt" | "md" => "text/plain",
        "yaml" | "yml" => "text/yaml",
        "xml" => "application/xml",
        "mp3" => "audio/mpeg",
        "mp4" => "video/mp4",
        _ => "application/octet-stream",
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_normalize_asset_path() {
        assert_eq!(
            normalize_asset_path("/assets/main-AbCdEf.js"),
            Some("assets/main-AbCdEf.js".to_string())
        );
        assert_eq!(
            normalize_asset_path("/assets/renderer.chunk.css?v=1"),
            Some("assets/renderer.chunk.css".to_string())
        );
        assert_eq!(normalize_asset_path("/"), None);
        assert_eq!(normalize_asset_path(""), None);
        assert_eq!(normalize_asset_path("/../etc/passwd"), None);
        assert_eq!(normalize_asset_path("/assets/../../secret"), None);
        assert_eq!(normalize_asset_path("/assets\\evil.js"), None);
        // 含 ".." 段一律整体拒绝（fail-closed，不做解析放行）
        assert_eq!(normalize_asset_path("/assets/a/../b/./c.js"), None);
    }

    #[test]
    fn test_guess_mime_covers_build_outputs() {
        assert_eq!(guess_mime("assets/index-BHOrqsT3.js"), "text/javascript");
        assert_eq!(guess_mime("assets/chunk.mjs"), "text/javascript");
        assert_eq!(guess_mime("assets/index-B_hpoE0U.css"), "text/css");
        assert_eq!(guess_mime("assets/vendor.woff2"), "font/woff2");
        assert_eq!(guess_mime("assets/logo.svg"), "image/svg+xml");
        assert_eq!(guess_mime("assets/data.json"), "application/json");
        assert_eq!(guess_mime("assets/kernel.wasm"), "application/wasm");
        assert_eq!(guess_mime("assets/unknown.xyz"), "application/octet-stream");
    }

    /// 印章用例共享全局态，必须串行执行
    static STAMP_TEST_LOCK: std::sync::Mutex<()> = std::sync::Mutex::new(());

    #[test]
    fn test_stamp_unlock_ttl_and_expiry() {
        let _guard = STAMP_TEST_LOCK.lock().unwrap_or_else(|p| p.into_inner());
        // 隔离：先清空全局态
        clear_unlock();
        let now = 1_730_000_000;
        assert!(!is_unlocked(now));

        // 超长授权期：24h TTL 封顶（永久授权在命令层已折算为 now+TTL）
        stamp_unlock(now, i64::MAX);
        assert!(is_unlocked(now + CONTENT_UNLOCK_TTL_SECS - 1));
        assert!(!is_unlocked(now + CONTENT_UNLOCK_TTL_SECS));

        // 试用期授权 1 小时后到期：印章取短
        clear_unlock();
        stamp_unlock(now, now + 3600);
        assert!(is_unlocked(now + 3599));
        assert!(!is_unlocked(now + 3600));

        // TTL 短于授权期：以 TTL 为准
        clear_unlock();
        stamp_unlock(now, now + 100 * 365 * 86400);
        assert!(is_unlocked(now + CONTENT_UNLOCK_TTL_SECS - 1));
        assert!(!is_unlocked(now + CONTENT_UNLOCK_TTL_SECS));

        clear_unlock();
        assert!(!is_unlocked(now + 10));
    }

    #[test]
    fn test_stamp_accumulates_max_not_sum() {
        let _guard = STAMP_TEST_LOCK.lock().unwrap_or_else(|p| p.into_inner());
        clear_unlock();
        let now = 1_740_000_000;
        stamp_unlock(now, now + 1000);
        stamp_unlock(now + 10, now + 5000);
        // 取 max 而非叠加：2000 处已失效
        assert!(is_unlocked(now + 1000 + 10));
        assert!(!is_unlocked(now + 5000));
        clear_unlock();
    }

    #[test]
    fn test_rate_limit_allows_burst_then_throttles() {
        clear_unlock();
        // 新建独立限流器实例做策略验证（全局态由其他用例共享，这里只验策略参数）
        let mut limiter = ScrapeRateLimiter::new(GATEWAY_WINDOW_MS, GATEWAY_MAX_REQUESTS, GATEWAY_COOLDOWN_MS);
        let base = 1_000_000u64;
        for i in 0..GATEWAY_MAX_REQUESTS {
            assert!(limiter.check_request(base + (i as u64) * 10).is_ok(), "第 {} 次应放行", i + 1);
        }
        assert!(limiter.check_request(base + 500).is_err(), "窗口内超额必须拦截");
    }
}
