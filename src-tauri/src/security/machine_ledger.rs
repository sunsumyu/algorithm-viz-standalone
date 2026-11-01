//! 机器级安全台账 (Machine Security Ledger)
//!
//! 职责（针对本地优先账号体系的三大滥用面）：
//! 1. **试用防农场**：以机器码为键记录「该机已授予过试用期」印记。印记与账号库
//!    分离存放（ProgramData 文件 + Windows 注册表双位置），删除账号库文件不会
//!    重置试用资格；重新注册新手机号不再获得新试用。
//! 2. **凭证防重放（机器级）**：权益凭证兑换后 nonce 同时记入台账。即使攻击者
//!    删除账号库重建账号，通配凭证也无法在同一台机器上二次兑换。
//! 3. **时钟防回拨**：记录 last_seen 时间戳并拒绝超过容差的倒流，
//!    与 license_verifier 的激活码防回拨策略（300 秒容差）保持一致。
//!
//! 篡改语义（fail-closed）：任一位置「存在但完整性校验失败」→ `tamper_suspected`，
//! 此后拒绝授予任何新试用（nonce 仍取自未受损位置的并集），受损位置被干净数据覆写。
//! 全部位置均缺失 → 视为全新环境（重装系统等价于新机器，接受该边界）。

use hmac::{Hmac, Mac};
use hkdf::Hkdf;
use serde::{Deserialize, Serialize};
use sha2::Sha256;
use std::collections::BTreeMap;
use std::path::PathBuf;

use super::license_verifier::CLOCK_ROLLBACK_TOLERANCE_SECS;

const LEDGER_FILE_NAME: &str = "security_ledger.json";
const LEDGER_FORMAT_VERSION: u8 = 1;
const LEDGER_PEPPER: &[u8] = b"algorithm-viz/machine-ledger-pepper-v1";
const LEDGER_INTEGRITY_INFO: &[u8] = b"algorithm-viz/machine-ledger-integrity-v1";
const LEDGER_NONCE_CAP: usize = 128;
/// last_seen 落盘的最小推进间隔（秒），避免高频操作反复写注册表/文件
const LAST_SEEN_PERSIST_THRESHOLD_SECS: i64 = 60;

/// Windows 注册表台账位置
#[cfg(target_os = "windows")]
const REGISTRY_KEY: &str = r"HKCU\Software\AlgorithmViz\SecurityState";
#[cfg(target_os = "windows")]
const REGISTRY_VALUE: &str = "LedgerV1";

// ============================================================
// 数据模型
// ============================================================

/// 试用授予印记（machine_code -> grant）
#[derive(Serialize, Deserialize, Clone, Debug, PartialEq)]
pub struct TrialGrant {
    pub phone: String,
    pub granted_at: i64,
}

/// 台账存储体（BTreeMap 保证序列化确定性）
#[derive(Serialize, Deserialize, Clone, Debug, Default, PartialEq)]
pub struct LedgerBody {
    pub v: u8,
    pub trial_grants: BTreeMap<String, TrialGrant>,
    pub consumed_nonces: Vec<String>,
    pub last_seen_secs: i64,
}

/// 落盘结构：存储体 + HMAC-SHA256 完整性标签
#[derive(Serialize, Deserialize, Clone, Debug)]
pub struct LedgerFile {
    pub body: LedgerBody,
    pub integrity: String,
}

/// 台账存储位置
#[derive(Clone, Debug)]
pub enum LedgerSlot {
    File(PathBuf),
    #[cfg(target_os = "windows")]
    Registry { key: String, value: String },
}

/// 台账错误类型
#[derive(Debug, Clone, PartialEq)]
pub enum MachineLedgerError {
    Io(String),
    /// 任一位置存在但完整性失败（fail-closed：锁定新试用授予）
    TamperSuspected,
    ClockRollbackDetected { recorded: i64, current: i64 },
    /// 全部位置写入失败（印记可能丢失）
    PersistFailed(String),
}

impl std::fmt::Display for MachineLedgerError {
    fn fmt(&self, f: &mut std::fmt::Formatter<'_>) -> std::fmt::Result {
        match self {
            MachineLedgerError::Io(msg) => write!(f, "安全台账读写失败: {}", msg),
            MachineLedgerError::TamperSuspected => {
                write!(f, "安全台账完整性校验失败（疑似被篡改），试用授予已锁定")
            }
            MachineLedgerError::ClockRollbackDetected { recorded, current } => write!(
                f,
                "系统时钟出现异常倒流 (台账记录: {}, 当前: {})",
                recorded, current
            ),
            MachineLedgerError::PersistFailed(msg) => write!(f, "安全台账写入失败: {}", msg),
        }
    }
}

impl std::error::Error for MachineLedgerError {}

// ============================================================
// 完整性原语
// ============================================================

/// 由机器指纹派生台账完整性密钥（与账号库密钥隔离：不同 salt/info 域）
pub fn derive_ledger_key(machine_code: &str) -> [u8; 32] {
    let hk = Hkdf::<Sha256>::new(Some(LEDGER_PEPPER), machine_code.as_bytes());
    let mut key = [0u8; 32];
    hk.expand(LEDGER_INTEGRITY_INFO, &mut key)
        .expect("32 字节输出长度合法");
    key
}

fn compute_integrity(body: &LedgerBody, machine_code: &str) -> String {
    let mut mac =
        Hmac::<Sha256>::new_from_slice(&derive_ledger_key(machine_code)).expect("HMAC 接受任意长度密钥");
    let bytes = serde_json::to_vec(body).expect("台账体序列化不可失败");
    mac.update(&bytes);
    hex_encode(&mac.finalize().into_bytes())
}

fn hex_encode(bytes: &[u8]) -> String {
    bytes.iter().map(|b| format!("{:02x}", b)).collect()
}

// ============================================================
// 台账核心
// ============================================================

pub struct MachineLedger {
    machine_code: String,
    slots: Vec<LedgerSlot>,
    body: LedgerBody,
    /// 任一位置存在但校验失败（fail-closed 标志）
    tamper_suspected: bool,
}

impl MachineLedger {
    /// 以显式存储位置构造（测试注入用）；构造时加载并合并全部位置
    pub fn new(machine_code: &str, slots: Vec<LedgerSlot>) -> Self {
        let mut ledger = Self {
            machine_code: machine_code.to_string(),
            slots,
            body: LedgerBody {
                v: LEDGER_FORMAT_VERSION,
                ..Default::default()
            },
            tamper_suspected: false,
        };
        ledger.load_and_merge();
        ledger
    }

    /// 生产默认位置：ProgramData/用户目录文件 + Windows 注册表（双位置互为备份）
    pub fn with_default_locations(machine_code: &str) -> Self {
        let mut slots = vec![LedgerSlot::File(Self::default_file_path())];
        #[cfg(target_os = "windows")]
        slots.push(LedgerSlot::Registry {
            key: REGISTRY_KEY.to_string(),
            value: REGISTRY_VALUE.to_string(),
        });
        Self::new(machine_code, slots)
    }

    pub fn default_file_path() -> PathBuf {
        #[cfg(target_os = "windows")]
        {
            std::env::var("ProgramData")
                .map(|p| PathBuf::from(p).join("AlgorithmViz").join(LEDGER_FILE_NAME))
                .unwrap_or_else(|_| std::env::temp_dir().join(LEDGER_FILE_NAME))
        }
        #[cfg(not(target_os = "windows"))]
        {
            std::env::var("HOME")
                .map(|h| PathBuf::from(h).join(".algorithm-viz").join(LEDGER_FILE_NAME))
                .unwrap_or_else(|_| std::env::temp_dir().join(LEDGER_FILE_NAME))
        }
    }

    pub fn machine_code(&self) -> &str {
        &self.machine_code
    }

    pub fn is_tamper_suspected(&self) -> bool {
        self.tamper_suspected
    }

    // --------------------------------------------------------
    // 加载与合并
    // --------------------------------------------------------

    /// 读取全部位置：有效体并集合并；「存在但校验失败」置 tamper 标志（fail-closed）
    fn load_and_merge(&mut self) {
        let mut merged = LedgerBody {
            v: LEDGER_FORMAT_VERSION,
            ..Default::default()
        };
        let mut found_any_valid = false;

        for slot in &self.slots {
            match Self::read_slot(slot, &self.machine_code) {
                SlotRead::Missing => {}
                SlotRead::Valid(body) => {
                    found_any_valid = true;
                    for (machine, grant) in body.trial_grants {
                        merged.trial_grants.entry(machine).or_insert(grant);
                    }
                    for nonce in body.consumed_nonces {
                        if !merged.consumed_nonces.contains(&nonce) {
                            merged.consumed_nonces.push(nonce);
                        }
                    }
                    merged.last_seen_secs = merged.last_seen_secs.max(body.last_seen_secs);
                }
                SlotRead::Tampered => {
                    // fail-closed：受损位置本身即是篡改证据
                    self.tamper_suspected = true;
                }
            }
        }

        if found_any_valid {
            // nonce 容量上限：保留最新（队首淘汰）
            if merged.consumed_nonces.len() > LEDGER_NONCE_CAP {
                let overflow = merged.consumed_nonces.len() - LEDGER_NONCE_CAP;
                merged.consumed_nonces.drain(0..overflow);
            }
            self.body = merged;
        }
    }

    fn read_slot(slot: &LedgerSlot, machine_code: &str) -> SlotRead {
        let raw = match slot {
            LedgerSlot::File(path) => match std::fs::read_to_string(path) {
                Ok(raw) => raw,
                Err(_) => return SlotRead::Missing,
            },
            #[cfg(target_os = "windows")]
            LedgerSlot::Registry { key, value } => match Self::registry_read(key, value) {
                Some(raw) => raw,
                None => return SlotRead::Missing,
            },
        };

        // 注册表位置存 Base64(JSON)，文件位置存明文 JSON
        let json_str = match slot {
            LedgerSlot::File(_) => raw,
            #[cfg(target_os = "windows")]
            LedgerSlot::Registry { .. } => match base64_decode(&raw.trim()) {
                Some(decoded) => decoded,
                None => return SlotRead::Tampered,
            },
        };

        let file: LedgerFile = match serde_json::from_str(&json_str) {
            Ok(file) => file,
            Err(_) => return SlotRead::Tampered,
        };

        if file.integrity != compute_integrity(&file.body, machine_code) || file.body.v != LEDGER_FORMAT_VERSION {
            return SlotRead::Tampered;
        }

        SlotRead::Valid(file.body)
    }

    // --------------------------------------------------------
    // 试用印记
    // --------------------------------------------------------

    /// 该机器是否仍可授予新试用期
    /// （已授予过 / 台账疑似被篡改 → 一律不可，fail-closed）
    pub fn trial_available(&self, machine_code: &str) -> bool {
        !self.tamper_suspected && !self.body.trial_grants.contains_key(machine_code)
    }

    /// 记录试用授予印记
    pub fn record_trial_grant(&mut self, machine_code: &str, phone: &str, now: i64) {
        self.body
            .trial_grants
            .insert(machine_code.to_string(), TrialGrant {
                phone: phone.to_string(),
                granted_at: now,
            });
    }

    // --------------------------------------------------------
    // 凭证 nonce 机器级去重
    // --------------------------------------------------------

    pub fn has_nonce(&self, nonce: &str) -> bool {
        self.body.consumed_nonces.iter().any(|n| n == nonce)
    }

    pub fn record_nonce(&mut self, nonce: &str) {
        if !self.has_nonce(nonce) {
            self.body.consumed_nonces.push(nonce.to_string());
            if self.body.consumed_nonces.len() > LEDGER_NONCE_CAP {
                let overflow = self.body.consumed_nonces.len() - LEDGER_NONCE_CAP;
                self.body.consumed_nonces.drain(0..overflow);
            }
        }
    }

    // --------------------------------------------------------
    // 时钟防回拨
    // --------------------------------------------------------

    /// 校验当前时间未发生超容差倒流，并推进 last_seen（推进 ≥ 阈值时落盘）
    pub fn check_and_touch_clock(&mut self, now: i64) -> Result<(), MachineLedgerError> {
        let recorded = self.body.last_seen_secs;
        if recorded > 0 && now < recorded - CLOCK_ROLLBACK_TOLERANCE_SECS {
            return Err(MachineLedgerError::ClockRollbackDetected {
                recorded,
                current: now,
            });
        }

        if now > recorded {
            self.body.last_seen_secs = now;
            // 首次记录或推进超过阈值时落盘，其余情况仅驻内存（随后续写入持久化）
            if recorded == 0 || now - recorded >= LAST_SEEN_PERSIST_THRESHOLD_SECS {
                self.persist()?;
            }
        }
        Ok(())
    }

    // --------------------------------------------------------
    // 持久化
    // --------------------------------------------------------

    /// 将当前体写入全部位置（Best-effort：至少一个位置成功即视为成功）
    pub fn persist(&mut self) -> Result<(), MachineLedgerError> {
        if self.slots.is_empty() {
            return Ok(());
        }

        let file = LedgerFile {
            integrity: compute_integrity(&self.body, &self.machine_code),
            body: self.body.clone(),
        };
        let json = serde_json::to_string(&file).map_err(|e| MachineLedgerError::Io(e.to_string()))?;

        let mut any_success = false;
        let mut last_err = String::new();
        for slot in &self.slots {
            match Self::write_slot(slot, &json) {
                Ok(()) => any_success = true,
                Err(e) => last_err = e,
            }
        }

        if any_success {
            Ok(())
        } else {
            Err(MachineLedgerError::PersistFailed(last_err))
        }
    }

    fn write_slot(slot: &LedgerSlot, json: &str) -> Result<(), String> {
        match slot {
            LedgerSlot::File(path) => {
                if let Some(parent) = path.parent() {
                    std::fs::create_dir_all(parent).map_err(|e| e.to_string())?;
                }
                let tmp = path.with_extension("json.tmp");
                std::fs::write(&tmp, json).map_err(|e| e.to_string())?;
                std::fs::rename(&tmp, path).map_err(|e| e.to_string())?;
                Ok(())
            }
            #[cfg(target_os = "windows")]
            LedgerSlot::Registry { key, value } => {
                // 注册表值存 Base64，规避 JSON 引号与空格的 argv 转义问题
                let encoded = base64_encode(json.as_bytes());
                let output = std::process::Command::new("reg")
                    .args(["add", key, "/v", value, "/t", "REG_SZ", "/d", &encoded, "/f"])
                    .output()
                    .map_err(|e| e.to_string())?;
                if output.status.success() {
                    Ok(())
                } else {
                    Err(format!("reg add 失败: {}", String::from_utf8_lossy(&output.stderr)))
                }
            }
        }
    }

    #[cfg(target_os = "windows")]
    fn registry_read(key: &str, value: &str) -> Option<String> {
        let output = std::process::Command::new("reg")
            .args(["query", key, "/v", value])
            .output()
            .ok()?;
        if !output.status.success() {
            return None;
        }
        let text = String::from_utf8_lossy(&output.stdout);
        for line in text.lines() {
            if line.contains(value) {
                let parts: Vec<&str> = line.split_whitespace().collect();
                if parts.len() >= 3 {
                    return Some(parts[2..].join(" "));
                }
            }
        }
        None
    }
}

enum SlotRead {
    Missing,
    Valid(LedgerBody),
    Tampered,
}

fn base64_encode(data: &[u8]) -> String {
    use base64::Engine;
    base64::engine::general_purpose::URL_SAFE_NO_PAD.encode(data)
}

fn base64_decode(data: &str) -> Option<String> {
    use base64::Engine;
    let bytes = base64::engine::general_purpose::URL_SAFE_NO_PAD.decode(data).ok()?;
    String::from_utf8(bytes).ok()
}

#[cfg(test)]
mod tests {
    use super::*;

    fn temp_dir(tag: &str) -> PathBuf {
        let dir = std::env::temp_dir().join(format!("algo_viz_ledger_test_{}_{}", tag, std::process::id()));
        let _ = std::fs::remove_dir_all(&dir);
        dir
    }

    fn file_slot(tag: &str) -> LedgerSlot {
        LedgerSlot::File(temp_dir(tag).join("ledger.json"))
    }

    const MACHINE: &str = "TEST-MACHINE-CODE";
    const NOW: i64 = 1_730_000_000;

    #[test]
    fn test_trial_grant_roundtrip_across_instances() {
        let slot = file_slot("roundtrip");
        {
            let mut ledger = MachineLedger::new(MACHINE, vec![slot.clone()]);
            assert!(ledger.trial_available(MACHINE));
            ledger.record_trial_grant(MACHINE, "13800138000", NOW);
            ledger.persist().unwrap();
        }
        // 重建实例（模拟删除账号库后重新加载台账）：印记仍在
        let ledger = MachineLedger::new(MACHINE, vec![slot]);
        assert!(!ledger.trial_available(MACHINE));
        assert_eq!(
            ledger.body.trial_grants.get(MACHINE).unwrap().phone,
            "13800138000"
        );
    }

    #[test]
    fn test_trial_binding_is_per_machine() {
        let mut ledger = MachineLedger::new(MACHINE, vec![file_slot("per_machine")]);
        ledger.record_trial_grant(MACHINE, "13800138000", NOW);
        assert!(ledger.trial_available("OTHER-MACHINE"));
        assert!(!ledger.trial_available(MACHINE));
    }

    #[test]
    fn test_tamper_fail_closed_locks_trial() {
        let path = temp_dir("tamper").join("ledger.json");
        {
            let mut ledger = MachineLedger::new(MACHINE, vec![LedgerSlot::File(path.clone())]);
            ledger.record_trial_grant(MACHINE, "13800138000", NOW);
            ledger.persist().unwrap();
        }
        // 篡改文件内容（伪造合法外观的 JSON 但无有效 HMAC）
        let corrupted = r#"{"body":{"v":1,"trial_grants":{},"consumed_nonces":[],"last_seen_secs":0},"integrity":"deadbeef"}"#;
        std::fs::write(&path, corrupted).unwrap();

        let ledger = MachineLedger::new(MACHINE, vec![LedgerSlot::File(path)]);
        assert!(ledger.is_tamper_suspected());
        // fail-closed：即使伪造体声称「无试用记录」，也拒绝授予新试用
        assert!(!ledger.trial_available(MACHINE));
        assert!(!ledger.trial_available("ANY-OTHER-MACHINE"));
    }

    #[test]
    fn test_missing_all_slots_is_fresh_environment() {
        let ledger = MachineLedger::new(MACHINE, vec![file_slot("fresh")]);
        assert!(!ledger.is_tamper_suspected());
        assert!(ledger.trial_available(MACHINE));
        assert!(!ledger.has_nonce("N-1"));
    }

    #[test]
    fn test_merge_union_across_two_slots() {
        let slot_a = file_slot("merge_a");
        let slot_b = file_slot("merge_b");
        {
            let mut a = MachineLedger::new(MACHINE, vec![slot_a.clone()]);
            a.record_trial_grant(MACHINE, "13800138000", NOW);
            a.record_nonce("N-TRIAL-1");
            a.persist().unwrap();
        }
        {
            let mut b = MachineLedger::new(MACHINE, vec![slot_b.clone()]);
            b.record_nonce("N-CREDIT-2");
            b.body.last_seen_secs = NOW + 500;
            b.persist().unwrap();
        }
        // 双位置实例：并集合并
        let merged = MachineLedger::new(MACHINE, vec![slot_a, slot_b]);
        assert!(!merged.trial_available(MACHINE));
        assert!(merged.has_nonce("N-TRIAL-1"));
        assert!(merged.has_nonce("N-CREDIT-2"));
        assert_eq!(merged.body.last_seen_secs, NOW + 500);
    }

    #[test]
    fn test_nonce_record_check_and_cap() {
        let mut ledger = MachineLedger::new(MACHINE, vec![file_slot("nonce")]);
        for i in 0..(LEDGER_NONCE_CAP + 10) {
            ledger.record_nonce(&format!("N-{}", i));
        }
        assert!(ledger.has_nonce(&format!("N-{}", LEDGER_NONCE_CAP + 9)));
        assert!(!ledger.has_nonce("N-0"), "超过容量后最旧 nonce 应被淘汰");
        assert_eq!(ledger.body.consumed_nonces.len(), LEDGER_NONCE_CAP);

        // 重复记录幂等
        let before = ledger.body.consumed_nonces.len();
        ledger.record_nonce(&format!("N-{}", LEDGER_NONCE_CAP + 9));
        assert_eq!(ledger.body.consumed_nonces.len(), before);
    }

    #[test]
    fn test_clock_rollback_detection() {
        let mut ledger = MachineLedger::new(MACHINE, vec![file_slot("clock")]);
        ledger.check_and_touch_clock(NOW).unwrap();

        // 容差内小幅倒流放行（NTP 微调）
        ledger.check_and_touch_clock(NOW - 100).unwrap();

        // 超容差倒流（2 天）拒绝
        match ledger.check_and_touch_clock(NOW - 172800).unwrap_err() {
            MachineLedgerError::ClockRollbackDetected { recorded, current } => {
                assert!(recorded >= NOW - 100);
                assert_eq!(current, NOW - 172800);
            }
            other => panic!("预期 ClockRollbackDetected，实际: {:?}", other),
        }
    }

    #[test]
    fn test_ledger_key_binds_to_machine() {
        assert_eq!(derive_ledger_key("A"), derive_ledger_key("A"));
        assert_ne!(derive_ledger_key("A"), derive_ledger_key("B"));
        // 与账号库完整性密钥必须隔离（不同派生域）
        assert_ne!(
            derive_ledger_key("MACHINE-A").to_vec(),
            super::super::account_store::derive_integrity_key("MACHINE-A").to_vec()
        );
    }

    #[test]
    fn test_base64_roundtrip() {
        let payload = r#"{"body":{"v":1},"integrity":"abc123中文"}"#;
        let encoded = base64_encode(payload.as_bytes());
        assert!(!encoded.contains('"'));
        assert!(!encoded.contains(' '));
        assert_eq!(base64_decode(&encoded).unwrap(), payload);
    }

    /// Windows 注册表真实读写往返（独立测试键，结束时清理，不触碰生产键）
    #[cfg(target_os = "windows")]
    #[test]
    fn test_registry_slot_roundtrip() {
        use std::process::Command;

        let test_key = format!(r"HKCU\Software\AlgorithmViz\TestLedger_{}", std::process::id());
        let test_value = "LedgerV1Test";

        let cleanup = || {
            let _ = Command::new("reg")
                .args(["delete", &test_key, "/f"])
                .output();
        };
        cleanup();

        let slot = LedgerSlot::Registry {
            key: test_key.clone(),
            value: test_value.to_string(),
        };

        // 未写入前：Missing
        assert!(matches!(
            read_slot_for_test(&slot),
            "missing"
        ));

        {
            let mut ledger = MachineLedger::new(MACHINE, vec![slot.clone()]);
            ledger.record_trial_grant(MACHINE, "13800138000", NOW);
            ledger.persist().unwrap();
        }

        // 重建实例（经真实注册表读回）：印记仍在
        let ledger = MachineLedger::new(MACHINE, vec![slot]);
        assert!(!ledger.trial_available(MACHINE));

        cleanup();
    }

    #[cfg(target_os = "windows")]
    fn read_slot_for_test(slot: &LedgerSlot) -> &'static str {
        match MachineLedger::read_slot(slot, MACHINE) {
            SlotRead::Missing => "missing",
            SlotRead::Valid(_) => "valid",
            SlotRead::Tampered => "tampered",
        }
    }
}
