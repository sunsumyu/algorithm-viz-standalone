//! 请求频次滑动窗口熔断器 (ScrapeRateLimiter)
//!
//! 防脚本化批量爬取与自动化脱壳的风控熔断深模块。
//! 在原生 IPC 接入层设立滑动时间窗口限流器，审计算法解密切片索取频次；
//! 识别自动化爬虫脚本的高频并发访问，并在违规时实施惩罚性冷却熔断保护。

use std::collections::VecDeque;

/// 默认配置：1000ms (1秒) 滑动窗口内最多允许 8 次算法切片请求
pub const DEFAULT_WINDOW_MS: u64 = 1000;
pub const DEFAULT_MAX_REQUESTS: usize = 8;
/// 违规熔断后的惩罚冷却时长 (毫秒)
pub const DEFAULT_COOLDOWN_MS: u64 = 3000;

#[derive(Debug, Clone, PartialEq, Eq)]
pub enum RateLimitError {
    LimitExceeded { cooldown_ms: u64 },
    CooldownActive { remaining_ms: u64 },
}

impl std::fmt::Display for RateLimitError {
    fn fmt(&self, f: &mut std::fmt::Formatter<'_>) -> std::fmt::Result {
        match self {
            RateLimitError::LimitExceeded { cooldown_ms } => {
                write!(f, "请求频次异常过高，疑似自动化爬虫行为，触发熔断保护 (冷却 {}ms)", cooldown_ms)
            }
            RateLimitError::CooldownActive { remaining_ms } => {
                write!(f, "风控冷却中，请等待 {}ms 后重试", remaining_ms)
            }
        }
    }
}

impl std::error::Error for RateLimitError {}

pub struct ScrapeRateLimiter {
    window_duration_ms: u64,
    max_requests_per_window: usize,
    cooldown_duration_ms: u64,
    timestamps: VecDeque<u64>,
    cooldown_until: u64,
}

impl ScrapeRateLimiter {
    pub fn new(
        window_duration_ms: u64,
        max_requests_per_window: usize,
        cooldown_duration_ms: u64,
    ) -> Self {
        Self {
            window_duration_ms,
            max_requests_per_window,
            cooldown_duration_ms,
            timestamps: VecDeque::new(),
            cooldown_until: 0,
        }
    }

    pub fn default_policy() -> Self {
        Self::new(DEFAULT_WINDOW_MS, DEFAULT_MAX_REQUESTS, DEFAULT_COOLDOWN_MS)
    }

    /// 核心检查函数：
    /// 返回 `Ok(())` 表示放行并记录当前请求时刻；
    /// 返回 `Err(RateLimitError)` 表示拦截并拒绝当前请求。
    pub fn check_request(&mut self, now_ms: u64) -> Result<(), RateLimitError> {
        // 1. 检查是否正处于惩罚冷却期内
        if now_ms < self.cooldown_until {
            let remaining = self.cooldown_until - now_ms;
            return Err(RateLimitError::CooldownActive { remaining_ms: remaining });
        }

        // 2. 清理滑动窗口之外的过期请求时刻
        while let Some(&front) = self.timestamps.front() {
            if now_ms.saturating_sub(front) > self.window_duration_ms {
                self.timestamps.pop_front();
            } else {
                break;
            }
        }

        // 3. 检查窗口内请求数量是否超标
        if self.timestamps.len() >= self.max_requests_per_window {
            // 触发熔断，激活惩罚冷却期
            self.cooldown_until = now_ms + self.cooldown_duration_ms;
            self.timestamps.clear();
            return Err(RateLimitError::LimitExceeded {
                cooldown_ms: self.cooldown_duration_ms,
            });
        }

        // 4. 正常放行，记录当前时刻
        self.timestamps.push_back(now_ms);
        Ok(())
    }

    /// 重置限流器状态
    pub fn reset(&mut self) {
        self.timestamps.clear();
        self.cooldown_until = 0;
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_normal_requests_pass() {
        let mut limiter = ScrapeRateLimiter::new(1000, 5, 2000);
        // 人类慢速翻页：每 300ms 请求一次
        for i in 0..5 {
            let res = limiter.check_request(i * 300);
            assert!(res.is_ok(), "正常学习请求应当全部放行");
        }
    }

    #[test]
    fn test_burst_within_limit_passes() {
        let mut limiter = ScrapeRateLimiter::new(1000, 5, 2000);
        // 短暂连续点击 5 次（在上限之内）
        for _ in 0..5 {
            assert!(limiter.check_request(100).is_ok());
        }
    }

    #[test]
    fn test_burst_exceeding_limit_triggers_cooldown() {
        let mut limiter = ScrapeRateLimiter::new(1000, 5, 2000);
        for _ in 0..5 {
            assert!(limiter.check_request(100).is_ok());
        }

        // 第 6 次高频并发请求：立即触发熔断
        let res6 = limiter.check_request(120);
        assert_eq!(res6, Err(RateLimitError::LimitExceeded { cooldown_ms: 2000 }));

        // 冷却期内再次请求 (1000ms < 120 + 2000 = 2120ms)：被判定为冷却中
        let res7 = limiter.check_request(1000);
        assert_eq!(res7, Err(RateLimitError::CooldownActive { remaining_ms: 1120 }));

        // 冷却期过后 (2200ms > 2120ms)：成功恢复
        let res8 = limiter.check_request(2200);
        assert!(res8.is_ok(), "冷却期过后应当恢复放行");
    }

    #[test]
    fn test_sliding_window_expiration() {
        let mut limiter = ScrapeRateLimiter::new(1000, 3, 2000);
        // 在 t=100, 200, 300 分别发 3 次
        assert!(limiter.check_request(100).is_ok());
        assert!(limiter.check_request(200).is_ok());
        assert!(limiter.check_request(300).is_ok());

        // 到 t=1200 时，t=100 已经滑出 1000ms 窗口，应当允许新的请求
        assert!(limiter.check_request(1200).is_ok());
    }
}
