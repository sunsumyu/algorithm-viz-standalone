//! 原生反附加动态调试器守护模块 (Anti-Debugger Guard)
//!
//! 职责：
//! 1. 深度调用 OS 原生 API 检测当前进程是否处于调试状态或被附加（如 x64dbg, WinDbg, Cheat Engine）；
//! 2. Windows 平台通过 `IsDebuggerPresent` 与 `CheckRemoteDebuggerPresent` 进行高频低开销检测；
//! 3. 运行轻量看门狗心跳线程，一旦在生产环境嗅探到调试器附加，立即执行静默安全退出；
//! 4. 具备严格的生命周期控制与可测性抽象。

use std::sync::atomic::{AtomicBool, Ordering};
use std::sync::Arc;
use std::thread::{self, JoinHandle};
use std::time::Duration;

#[cfg(target_os = "windows")]
mod win_api {
    use std::ffi::c_void;

    extern "system" {
        pub fn IsDebuggerPresent() -> i32;
        pub fn CheckRemoteDebuggerPresent(
            h_process: *mut c_void,
            pb_debugger_present: *mut i32,
        ) -> i32;
        pub fn GetCurrentProcess() -> *mut c_void;
    }
}

/// 检查当前进程是否正在被调试器附加或跟踪
pub fn is_debugger_present() -> bool {
    #[cfg(target_os = "windows")]
    {
        unsafe {
            if win_api::IsDebuggerPresent() != 0 {
                return true;
            }
            let mut is_remote: i32 = 0;
            let process = win_api::GetCurrentProcess();
            if win_api::CheckRemoteDebuggerPresent(process, &mut is_remote) != 0 && is_remote != 0 {
                return true;
            }
        }
        false
    }
    #[cfg(target_os = "linux")]
    {
        if let Ok(status) = std::fs::read_to_string("/proc/self/status") {
            for line in status.lines() {
                if line.starts_with("TracerPid:") {
                    let parts: Vec<&str> = line.split_whitespace().collect();
                    if parts.len() >= 2 && parts[1] != "0" {
                        return true;
                    }
                }
            }
        }
        false
    }
    #[cfg(not(any(target_os = "windows", target_os = "linux")))]
    {
        false
    }
}

/// 反附加调试心跳看门狗
pub struct AntiDebuggerGuard {
    running: Arc<AtomicBool>,
    handle: Option<JoinHandle<()>>,
}

impl AntiDebuggerGuard {
    /// 启动自定义配置的反调试看门狗
    pub fn start_watchdog<F>(interval_ms: u64, on_detected: F) -> Self
    where
        F: Fn() + Send + 'static,
    {
        Self::start_watchdog_with_probe(interval_ms, is_debugger_present, on_detected)
    }

    /// 启动具备可注入探测器的看门狗（便于单元测试与模拟）
    pub fn start_watchdog_with_probe<P, F>(
        interval_ms: u64,
        probe: P,
        on_detected: F,
    ) -> Self
    where
        P: Fn() -> bool + Send + 'static,
        F: Fn() + Send + 'static,
    {
        let running = Arc::new(AtomicBool::new(true));
        let running_clone = running.clone();

        let handle = thread::spawn(move || {
            while running_clone.load(Ordering::Relaxed) {
                if probe() {
                    on_detected();
                    break;
                }
                thread::sleep(Duration::from_millis(interval_ms));
            }
        });

        Self {
            running,
            handle: Some(handle),
        }
    }

    /// 生产环境默认启动：500ms 探测一次，检测到即静默退出
    pub fn start_watchdog_default() -> Self {
        Self::start_watchdog(500, || {
            std::process::exit(0);
        })
    }

    /// 优雅终止看门狗线程
    pub fn stop(&mut self) {
        self.running.store(false, Ordering::Relaxed);
        if let Some(handle) = self.handle.take() {
            let _ = handle.join();
        }
    }
}

impl Drop for AntiDebuggerGuard {
    fn drop(&mut self) {
        self.stop();
    }
}

#[cfg(test)]
mod tests {
    use super::*;
    use std::sync::atomic::AtomicUsize;

    #[test]
    fn test_is_debugger_present_callable() {
        // 在一般测试运行环境下，通常未附加调试器，或者至少不崩溃
        let result = is_debugger_present();
        // 断言其能正常返回布尔值
        let _ = result;
    }

    #[test]
    fn test_watchdog_lifecycle_normal() {
        let counter = Arc::new(AtomicUsize::new(0));
        let counter_clone = counter.clone();

        let mut guard = AntiDebuggerGuard::start_watchdog_with_probe(
            10,
            || false, // 模拟未检测到调试器
            move || {
                counter_clone.fetch_add(1, Ordering::Relaxed);
            },
        );

        thread::sleep(Duration::from_millis(50));
        guard.stop();

        assert_eq!(counter.load(Ordering::Relaxed), 0);
    }

    #[test]
    fn test_watchdog_triggers_when_debugger_detected() {
        let detected = Arc::new(AtomicBool::new(false));
        let detected_clone = detected.clone();

        let mut guard = AntiDebuggerGuard::start_watchdog_with_probe(
            10,
            || true, // 模拟检测到调试器附加
            move || {
                detected_clone.store(true, Ordering::Relaxed);
            },
        );

        thread::sleep(Duration::from_millis(50));
        guard.stop();

        assert!(detected.load(Ordering::Relaxed));
    }
}
