//! 启动期非法参数拦截器 (AntiCdpGuard)
//!
//! 进程级防远程调试与自动化爬虫注入守卫。
//! 客户端在进程启动阶段自检命令行入参，一旦检测到企图开启 Chrome 远程调试协议 (CDP)
//! 或注入调试器（如 `--remote-debugging-port`、`--inspect`）的恶意参数，
//! 立即静默终止当前进程，封死利用 Headless 爬虫脚本批量 dump 算法数据的通道。

/// 命中的黑名单调试特征列表（全部小写）
const FORBIDDEN_ARG_PATTERNS: &[&str] = &[
    "remote-debugging-port",
    "remote-debugging-targets",
    "remote-debugging-pipe",
    "remote-debugging-address",
    "remote-allow-origins",
    "inspect",
    "inspect-brk",
    "devtools-flags",
    "auto-open-devtools-for-tabs",
];

pub struct AntiCdpGuard;

impl AntiCdpGuard {
    /// 检查参数列表中是否包含禁止的调试参数
    pub fn has_disallowed_args<I, S>(args: I) -> bool
    where
        I: IntoIterator<Item = S>,
        S: AsRef<str>,
    {
        for arg in args {
            let s = arg.as_ref().trim();
            if s.is_empty() {
                continue;
            }

            // 统一转为小写处理，剥离可能的前缀 '-' 或 '--'
            let lower = s.to_ascii_lowercase();
            let stripped = lower.trim_start_matches('-');

            // 按照 '=' 分割提取参数名（如 --remote-debugging-port=9222 -> remote-debugging-port）
            let param_name = stripped.split('=').next().unwrap_or(stripped).trim();

            for &pattern in FORBIDDEN_ARG_PATTERNS {
                if param_name == pattern {
                    return true;
                }
            }
        }
        false
    }

    /// 执行启动期参数安全检查
    /// 如果发现非法调试参数，生产环境下立即静默终止
    pub fn enforce_startup_guard() {
        let args = std::env::args().collect::<Vec<_>>();
        if Self::has_disallowed_args(&args) {
            #[cfg(debug_assertions)]
            {
                log::warn!("[AntiCdpGuard] 检测到非法调试启动参数，开发模式放行并打印警告: {:?}", args);
            }

            #[cfg(not(debug_assertions))]
            {
                // 生产环境直接静默终止进程，杜绝爬虫 CDP 注入
                std::process::exit(0);
            }
        }
    }

    /// 消毒 WEBVIEW2_ADDITIONAL_BROWSER_ARGUMENTS 环境变量
    ///
    /// 攻击者可在启动 exe 前预设该环境变量注入 `--remote-debugging-port` 等 CDP 参数
    /// （该向量绕过进程 argv 检查，因为 WebView2 直接读取环境变量）。
    /// 此函数按空白分词逐 token 审计，剔除全部调试注入参数，保留其余合法参数。
    pub fn sanitize_webview_env_args(raw: &str) -> String {
        raw.split_whitespace()
            .filter(|token| !Self::has_disallowed_args([token]))
            .collect::<Vec<_>>()
            .join(" ")
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_clean_args_pass() {
        let normal_args = vec![
            "algorithm-viz.exe",
            "--fullscreen",
            "--lang=zh-CN",
            "-v",
        ];
        assert!(!AntiCdpGuard::has_disallowed_args(normal_args));
    }

    #[test]
    fn test_detect_remote_debugging_port() {
        assert!(AntiCdpGuard::has_disallowed_args(vec!["--remote-debugging-port=9222"]));
        assert!(AntiCdpGuard::has_disallowed_args(vec!["--remote-debugging-port", "9222"]));
        assert!(AntiCdpGuard::has_disallowed_args(vec!["-remote-debugging-port=9222"]));
        assert!(AntiCdpGuard::has_disallowed_args(vec!["--REMOTE-DEBUGGING-PORT=1234"]));
    }

    #[test]
    fn test_detect_inspect_flags() {
        assert!(AntiCdpGuard::has_disallowed_args(vec!["--inspect"]));
        assert!(AntiCdpGuard::has_disallowed_args(vec!["--inspect=9229"]));
        assert!(AntiCdpGuard::has_disallowed_args(vec!["--inspect-brk"]));
        assert!(AntiCdpGuard::has_disallowed_args(vec!["--INSPECT-BRK=5858"]));
    }

    #[test]
    fn test_detect_devtools_auto_open() {
        assert!(AntiCdpGuard::has_disallowed_args(vec!["--auto-open-devtools-for-tabs"]));
        assert!(AntiCdpGuard::has_disallowed_args(vec!["--devtools-flags=true"]));
    }

    #[test]
    fn test_empty_and_whitespace_args() {
        assert!(!AntiCdpGuard::has_disallowed_args(vec!["", "   ", "---"]));
    }

    #[test]
    fn test_sanitize_webview_env_args_removes_cdp_injection() {
        // 攻击者注入 remote-debugging-port，合法参数必须保留
        let injected = "CalculateNativeWinOcclusion --remote-debugging-port=9222 --disable-features=X";
        let sanitized = AntiCdpGuard::sanitize_webview_env_args(injected);
        assert!(!sanitized.contains("remote-debugging-port"));
        assert!(sanitized.contains("CalculateNativeWinOcclusion"));
        assert!(sanitized.contains("--disable-features=X"));
        assert!(!AntiCdpGuard::has_disallowed_args(sanitized.split_whitespace()));
    }

    #[test]
    fn test_sanitize_webview_env_args_strips_all_debug_variants() {
        let injected = "--inspect --remote-allow-origins=* clean-flag --auto-open-devtools-for-tabs";
        let sanitized = AntiCdpGuard::sanitize_webview_env_args(injected);
        assert_eq!(sanitized, "clean-flag");
    }

    #[test]
    fn test_sanitize_webview_env_args_passthrough_clean() {
        let clean = "CalculateNativeWinOcclusion --disable-backgrounding-occluded-windows";
        assert_eq!(AntiCdpGuard::sanitize_webview_env_args(clean), clean);
        assert_eq!(AntiCdpGuard::sanitize_webview_env_args(""), "");
    }
}
