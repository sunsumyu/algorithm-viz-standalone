//! 账号本地库与会话权益管理深模块 (AccountStore)
//!
//! 职责：
//! 1. 提供手机号 + 密码的本地注册 / 登录 / 会话管理（PBKDF2-HMAC-SHA256 口令哈希）；
//! 2. 管理账号权益模型：试用期 (trial) / 按量付费 (paygo) / 永久会员 (lifetime)，
//!    为后续服务端化迁移预留单一事实来源接口；
//! 3. 兑换开发者签发的 Ed25519 权益凭证（延长试用 / 充值次数 / 开通会员），
//!    凭证 nonce 一次性消费，杜绝重放；
//! 4. 存储文件以 HKDF(机器指纹) 派生密钥执行 HMAC-SHA256 完整性防护，
//!    篡改/伪造账号库即整体失效自愈重置（本地优先阶段的纵深防御基线）。
//!
//! 服务端化路线：未来接入远程认证服务时，仅需将本模块的读写替换为 HTTP 客户端，
//! 前端 `account-service.ts` 与 Tauri 命令契约保持不变。

use hmac::{Hmac, Mac};
use hkdf::Hkdf;
use serde::{Deserialize, Serialize};
use sha2::Sha256;
use std::collections::BTreeMap;
use std::path::PathBuf;
use std::sync::OnceLock;

use super::machine_ledger::{MachineLedger, MachineLedgerError};
use super::voucher::{sign_voucher_payload, VoucherVerifier, VOUCHER_TYPE_CREDITS, VOUCHER_TYPE_LIFETIME, VOUCHER_TYPE_TRIAL};

/// 新注册账号的默认试用天数（服务端化前由客户端默认授予，可凭证延长）
pub const DEFAULT_TRIAL_DAYS: i64 = 7;
/// 会话令牌有效期（秒）：30 天
pub const SESSION_TTL_SECS: i64 = 30 * 86400;
/// PBKDF2 迭代次数：release 按 OWASP 2023 对 PBKDF2-HMAC-SHA256 的建议取 60 万次；
/// debug/测试构建取 1 万次（Rust debug 构建慢约 30 倍，保证 cargo test 速度，语义不变）
#[cfg(debug_assertions)]
pub const PBKDF2_ITERATIONS: u32 = 10_000;
#[cfg(not(debug_assertions))]
pub const PBKDF2_ITERATIONS: u32 = 600_000;
/// 单账号最多记录的已消费凭证 nonce 数（FIFO 截断，防重放窗口）
pub const MAX_USED_NONCES: usize = 128;

const STORE_FILE_NAME: &str = "account_store.json";
const STORE_FORMAT_VERSION: u8 = 1;
const ACCOUNT_STORE_PEPPER: &[u8] = b"algorithm-viz/account-store-pepper-v1";
const ACCOUNT_STORE_INTEGRITY_INFO: &[u8] = b"algorithm-viz/account-store-integrity-v1";

/// 账号权益模式：trial 试用期 | paygo 按量付费 | lifetime 永久会员
pub const MODE_TRIAL: &str = "trial";
pub const MODE_PAYGO: &str = "paygo";
pub const MODE_LIFETIME: &str = "lifetime";

// ============================================================
// 数据模型
// ============================================================

/// 账号权益
#[derive(Serialize, Deserialize, Clone, Debug, PartialEq)]
pub struct Entitlement {
    /// 当前模式: trial | paygo | lifetime
    pub mode: String,
    /// 试用截止 Unix epoch 秒
    pub trial_ends_at: i64,
    /// 按量付费剩余次数
    pub credits: i64,
}

impl Entitlement {
    pub fn new_trial(now: i64, days: i64) -> Self {
        Self {
            mode: MODE_TRIAL.to_string(),
            trial_ends_at: now + days * 86400,
            credits: 0,
        }
    }

    /// 空按量权益（机器已消耗过试用时，新账号以此起步，需充值/凭证方可使用）
    pub fn empty_paygo() -> Self {
        Self {
            mode: MODE_PAYGO.to_string(),
            trial_ends_at: 0,
            credits: 0,
        }
    }

    /// 试用是否处于有效期内
    pub fn is_trial_active(&self, now: i64) -> bool {
        self.trial_ends_at > 0 && now <= self.trial_ends_at
    }

    /// 权益是否允许使用软件（终身会员 / 试用期内 / 按量有余量 任一满足）
    pub fn is_active(&self, now: i64) -> bool {
        self.mode == MODE_LIFETIME || self.is_trial_active(now) || self.credits > 0
    }
}

/// 账号记录
#[derive(Serialize, Deserialize, Clone, Debug)]
pub struct AccountRecord {
    pub phone: String,
    #[serde(default)]
    pub display_name: String,
    pub salt_hex: String,
    pub password_hash_hex: String,
    pub created_at: i64,
    pub entitlement: Entitlement,
    #[serde(default)]
    pub used_nonces: Vec<String>,
    /// 注册时的机器指纹（审计与运营查询用；旧库文件缺省为空）
    #[serde(default)]
    pub machine_code: String,
}

/// 会话记录
#[derive(Serialize, Deserialize, Clone, Debug)]
pub struct SessionRecord {
    pub phone: String,
    pub created_at: i64,
    pub expires_at: i64,
}

/// 存储体（BTreeMap 保证序列化键序确定，完整性标签可复算）
#[derive(Serialize, Deserialize, Clone, Debug, Default)]
pub struct AccountStoreBody {
    pub v: u8,
    pub accounts: BTreeMap<String, AccountRecord>,
    pub sessions: BTreeMap<String, SessionRecord>,
}

/// 落盘文件结构：存储体 + HMAC-SHA256 完整性标签
#[derive(Serialize, Deserialize, Clone, Debug)]
pub struct AccountStoreFile {
    pub body: AccountStoreBody,
    pub integrity: String,
}

/// 前端可见的权益状态视图
#[derive(Serialize, Deserialize, Clone, Debug, PartialEq)]
pub struct EntitlementStatus {
    pub phone: String,
    pub display_name: String,
    pub mode: String,
    pub trial_ends_at: i64,
    pub trial_active: bool,
    pub trial_remaining_secs: i64,
    pub credits: i64,
    pub active: bool,
    /// false = 本地库阶段；未来接入远程计费服务后由服务端盖章
    pub server_synced: bool,
}

/// 会话建立视图（登录 / 注册成功返回）
#[derive(Serialize, Deserialize, Clone, Debug, PartialEq)]
pub struct AccountSessionView {
    pub token: String,
    pub status: EntitlementStatus,
}

/// 账号库错误类型
#[derive(Debug, Clone, PartialEq)]
pub enum AccountStoreError {
    InvalidPhone,
    InvalidPassword,
    PhoneAlreadyRegistered,
    InvalidCredentials,
    SessionExpired,
    SessionNotFound,
    InsufficientCredits,
    VoucherInvalid(String),
    VoucherAlreadyUsed,
    VoucherTargetMismatch { expected: String, actual: String },
    /// 机器安全台账异常（完整性受损等）
    Ledger(String),
    /// 系统时钟倒流超出容差（由台账 last_seen 检出）
    ClockRollbackDetected { recorded: i64, current: i64 },
    Io(String),
}

impl std::fmt::Display for AccountStoreError {
    fn fmt(&self, f: &mut std::fmt::Formatter<'_>) -> std::fmt::Result {
        match self {
            AccountStoreError::InvalidPhone => write!(f, "手机号格式不正确（需为 11 位数字且以 1 开头）"),
            AccountStoreError::InvalidPassword => write!(f, "密码长度需至少 6 位"),
            AccountStoreError::PhoneAlreadyRegistered => write!(f, "该手机号已注册，请直接登录"),
            AccountStoreError::InvalidCredentials => write!(f, "手机号或密码错误"),
            AccountStoreError::SessionExpired => write!(f, "登录会话已过期，请重新登录"),
            AccountStoreError::SessionNotFound => write!(f, "登录状态无效，请重新登录"),
            AccountStoreError::InsufficientCredits => write!(f, "按量付费次数已用尽，请充值后继续使用"),
            AccountStoreError::VoucherInvalid(msg) => write!(f, "权益凭证无效: {}", msg),
            AccountStoreError::VoucherAlreadyUsed => write!(f, "该权益凭证已被兑换过，请勿重复使用"),
            AccountStoreError::VoucherTargetMismatch { expected, actual } => {
                write!(f, "权益凭证目标账号不匹配 (凭证: {}, 当前: {})", actual, expected)
            }
            AccountStoreError::Ledger(msg) => write!(f, "机器安全台账异常: {}", msg),
            AccountStoreError::ClockRollbackDetected { recorded, current } => {
                write!(f, "系统时钟出现异常倒流 (上次记录: {}, 当前: {})", recorded, current)
            }
            AccountStoreError::Io(msg) => write!(f, "账号库读写失败: {}", msg),
        }
    }
}

impl std::error::Error for AccountStoreError {}

// ============================================================
// 密码学原语
// ============================================================

/// PBKDF2-HMAC-SHA256 单块派生 (dkLen = 32 字节, RFC 2898)
pub fn pbkdf2_sha256(password: &[u8], salt: &[u8], iterations: u32) -> [u8; 32] {
    let h0 = Hmac::<Sha256>::new_from_slice(password).expect("HMAC 接受任意长度密钥");
    let mut first = h0.clone();
    first.update(salt);
    first.update(&1u32.to_be_bytes());
    let mut u = first.finalize().into_bytes();
    let mut out = [0u8; 32];
    out.copy_from_slice(&u);
    for _ in 1..iterations {
        let mut h = h0.clone();
        h.update(&u);
        u = h.finalize().into_bytes();
        for (o, x) in out.iter_mut().zip(u.iter()) {
            *o ^= x;
        }
    }
    out
}

/// 由机器指纹派生存储完整性保护密钥（绑定设备：整库拷贝到其他机器即失效）
pub fn derive_integrity_key(machine_code: &str) -> [u8; 32] {
    let hk = Hkdf::<Sha256>::new(Some(ACCOUNT_STORE_PEPPER), machine_code.as_bytes());
    let mut key = [0u8; 32];
    hk.expand(ACCOUNT_STORE_INTEGRITY_INFO, &mut key)
        .expect("32 字节输出长度合法");
    key
}

/// 计算存储体完整性标签
pub fn compute_integrity(body: &AccountStoreBody, machine_code: &str) -> String {
    let key = derive_integrity_key(machine_code);
    let mut mac = Hmac::<Sha256>::new_from_slice(&key).expect("HMAC 接受任意长度密钥");
    let bytes = serde_json::to_vec(body).expect("存储体序列化不可失败");
    mac.update(&bytes);
    hex_encode(&mac.finalize().into_bytes())
}

/// 安全随机字节（getrandom 系统熵源）
fn random_bytes(len: usize) -> Vec<u8> {
    use getrandom::getrandom;
    let mut buf = vec![0u8; len];
    getrandom(&mut buf).expect("系统熵源读取不可失败");
    buf
}

fn hex_encode(bytes: &[u8]) -> String {
    bytes.iter().map(|b| format!("{:02x}", b)).collect()
}

/// 手机号格式校验：中国大陆 11 位手机号（1 开头，严格无空白）
pub fn is_valid_phone(phone: &str) -> bool {
    phone.len() == 11
        && phone.starts_with('1')
        && phone.chars().all(|c| c.is_ascii_digit())
}

/// 手机号掩码（供水印与 UI 展示）：138****8000
pub fn mask_phone(phone: &str) -> String {
    if phone.len() != 11 {
        return phone.to_string();
    }
    format!("{}****{}", &phone[..3], &phone[7..])
}

// ============================================================
// 账号库核心
// ============================================================

pub struct AccountStore {
    dir: PathBuf,
    machine_code: String,
    body: AccountStoreBody,
    voucher_verifier: VoucherVerifier,
}

/// 构造前端可见的权益状态视图（自由函数：不依赖存储实例，规避借用冲突）
fn status_of(account: &AccountRecord, now: i64) -> EntitlementStatus {
    let trial_active = account.entitlement.is_trial_active(now);
    EntitlementStatus {
        phone: mask_phone(&account.phone),
        display_name: account.display_name.clone(),
        mode: account.entitlement.mode.clone(),
        trial_ends_at: account.entitlement.trial_ends_at,
        trial_active,
        trial_remaining_secs: if trial_active {
            account.entitlement.trial_ends_at - now
        } else {
            0
        },
        credits: account.entitlement.credits,
        active: account.entitlement.is_active(now),
        server_synced: false,
    }
}

impl AccountStore {
    /// 从指定目录与机器指纹构造（测试注入用）
    pub fn new(dir: PathBuf, machine_code: &str) -> Self {
        let body = Self::read_body(&dir, machine_code);
        Self {
            dir,
            machine_code: machine_code.to_string(),
            body,
            voucher_verifier: VoucherVerifier::with_embedded_key()
                .expect("内置公钥必须有效"),
        }
    }

    /// 注入自定义凭证验签器（单元测试注入测试密钥用）
    pub fn with_voucher_verifier(mut self, verifier: VoucherVerifier) -> Self {
        self.voucher_verifier = verifier;
        self
    }

    /// 默认存储目录：%APPDATA%/algorithm-viz/security (Windows) 或 ~/.algorithm-viz/security
    pub fn default_dir() -> PathBuf {
        #[cfg(target_os = "windows")]
        {
            std::env::var("APPDATA")
                .map(PathBuf::from)
                .unwrap_or_else(|_| std::env::temp_dir())
                .join("algorithm-viz")
                .join("security")
        }
        #[cfg(not(target_os = "windows"))]
        {
            std::env::var("HOME")
                .map(|h| PathBuf::from(h).join(".algorithm-viz").join("security"))
                .unwrap_or_else(|_| std::env::temp_dir())
        }
    }

    /// 读取并验证存储体；文件缺失 / 完整性失败 / 解析失败 一律自愈为全新空库
    fn read_body(dir: &PathBuf, machine_code: &str) -> AccountStoreBody {
        let path = dir.join(STORE_FILE_NAME);
        let raw = match std::fs::read_to_string(&path) {
            Ok(raw) => raw,
            Err(_) => return Self::fresh_body(),
        };

        let file: AccountStoreFile = match serde_json::from_str(&raw) {
            Ok(file) => file,
            Err(_) => {
                log::warn!("[AccountStore] 账号库文件解析失败，已重置");
                return Self::fresh_body();
            }
        };

        let expected = compute_integrity(&file.body, machine_code);
        if file.integrity != expected {
            log::warn!("[AccountStore] 账号库完整性校验失败（疑似被篡改或跨设备拷贝），已重置");
            return Self::fresh_body();
        }

        if file.body.v != STORE_FORMAT_VERSION {
            return Self::fresh_body();
        }

        file.body
    }

    fn fresh_body() -> AccountStoreBody {
        AccountStoreBody {
            v: STORE_FORMAT_VERSION,
            accounts: BTreeMap::new(),
            sessions: BTreeMap::new(),
        }
    }

    /// 持久化：以当前机器指纹重算完整性标签后原子写盘
    pub fn save(&self) -> Result<(), AccountStoreError> {
        let path = self.dir.join(STORE_FILE_NAME);
        if let Some(parent) = path.parent() {
            std::fs::create_dir_all(parent).map_err(|e| AccountStoreError::Io(e.to_string()))?;
        }

        let file = AccountStoreFile {
            integrity: compute_integrity(&self.body, &self.machine_code),
            body: self.body.clone(),
        };
        let json = serde_json::to_vec(&file).map_err(|e| AccountStoreError::Io(e.to_string()))?;
        let tmp_path = path.with_extension("json.tmp");
        std::fs::write(&tmp_path, json).map_err(|e| AccountStoreError::Io(e.to_string()))?;
        std::fs::rename(&tmp_path, &path).map_err(|e| AccountStoreError::Io(e.to_string()))?;
        Ok(())
    }

    fn make_session(&mut self, phone: &str, now: i64) -> String {
        let token = hex_encode(&random_bytes(16));
        self.body.sessions.insert(
            token.clone(),
            SessionRecord {
                phone: phone.to_string(),
                created_at: now,
                expires_at: now + SESSION_TTL_SECS,
            },
        );
        token
    }

    fn purge_expired_sessions(&mut self, now: i64) {
        let expired: Vec<String> = self
            .body
            .sessions
            .iter()
            .filter(|(_, s)| s.expires_at <= now)
            .map(|(k, _)| k.clone())
            .collect();
        for key in expired {
            self.body.sessions.remove(&key);
        }
    }

    /// 校验会话并返回手机号
    pub fn resolve_session_phone(&mut self, token: &str, now: i64) -> Result<String, AccountStoreError> {
        self.purge_expired_sessions(now);
        let session = self
            .body
            .sessions
            .get(token)
            .ok_or(AccountStoreError::SessionNotFound)?;
        if session.expires_at <= now {
            return Err(AccountStoreError::SessionExpired);
        }
        Ok(session.phone.clone())
    }


    // --------------------------------------------------------
    // 注册 / 登录 / 会话
    // --------------------------------------------------------

    /// 注册新账号并自动建立会话
    ///
    /// 试用授予策略（反试用农场）：试用期每台机器仅授予一次——印记记录在
    /// 机器级安全台账（独立于账号库存活），删除账号库重建账号不再获得新试用；
    /// 台账疑似被篡改时 fail-closed 拒绝授予。
    pub fn register(
        &mut self,
        phone: &str,
        password: &str,
        display_name: &str,
        now: i64,
        ledger: &mut MachineLedger,
    ) -> Result<AccountSessionView, AccountStoreError> {
        let phone = phone.trim().to_string();
        if !is_valid_phone(&phone) {
            return Err(AccountStoreError::InvalidPhone);
        }
        if password.len() < 6 {
            return Err(AccountStoreError::InvalidPassword);
        }
        if self.body.accounts.contains_key(&phone) {
            return Err(AccountStoreError::PhoneAlreadyRegistered);
        }

        let grant_trial = ledger.trial_available(&self.machine_code);
        let salt = random_bytes(16);
        let hash = pbkdf2_sha256(password.as_bytes(), &salt, PBKDF2_ITERATIONS);
        let record = AccountRecord {
            phone: phone.clone(),
            display_name: display_name.trim().to_string(),
            salt_hex: hex_encode(&salt),
            password_hash_hex: hex_encode(&hash),
            created_at: now,
            entitlement: if grant_trial {
                Entitlement::new_trial(now, DEFAULT_TRIAL_DAYS)
            } else {
                Entitlement::empty_paygo()
            },
            used_nonces: Vec::new(),
            machine_code: self.machine_code.clone(),
        };
        let status = status_of(&record, now);
        self.body.accounts.insert(phone.clone(), record);
        let token = self.make_session(&phone, now);
        self.save()?;

        if grant_trial {
            ledger.record_trial_grant(&self.machine_code, &phone, now);
            if let Err(e) = ledger.persist() {
                log::warn!("[AccountStore] 试用印记写入台账失败（最坏情况: 删库后可重复试用）: {}", e);
            }
        }

        Ok(AccountSessionView { token, status })
    }

    /// 登录并建立会话
    pub fn login(
        &mut self,
        phone: &str,
        password: &str,
        now: i64,
    ) -> Result<AccountSessionView, AccountStoreError> {
        let phone = phone.trim().to_string();
        let account = self
            .body
            .accounts
            .get(&phone)
            .ok_or(AccountStoreError::InvalidCredentials)?
            .clone();

        let salt = hex_decode(&account.salt_hex);
        let hash = pbkdf2_sha256(password.as_bytes(), &salt, PBKDF2_ITERATIONS);
        if hex_encode(&hash) != account.password_hash_hex {
            return Err(AccountStoreError::InvalidCredentials);
        }

        self.purge_expired_sessions(now);
        let status = status_of(&account, now);
        let token = self.make_session(&phone, now);
        self.save()?;
        Ok(AccountSessionView { token, status })
    }

    /// 注销会话
    pub fn logout(&mut self, token: &str) -> Result<bool, AccountStoreError> {
        let existed = self.body.sessions.remove(token).is_some();
        if existed {
            self.save()?;
        }
        Ok(existed)
    }

    /// 查询会话对应账号的权益状态
    pub fn get_entitlement(
        &mut self,
        token: &str,
        now: i64,
    ) -> Result<EntitlementStatus, AccountStoreError> {
        let phone = self.resolve_session_phone(token, now)?;
        let account = self.body.accounts.get(&phone).cloned().ok_or(AccountStoreError::SessionNotFound)?;
        Ok(status_of(&account, now))
    }

    // --------------------------------------------------------
    // 按量付费扣次
    // --------------------------------------------------------

    /// 消费一次算法使用：终身会员放行；试用期内放行；否则扣减一次按量余量
    pub fn consume_use(
        &mut self,
        token: &str,
        now: i64,
    ) -> Result<EntitlementStatus, AccountStoreError> {
        let phone = self.resolve_session_phone(token, now)?;
        let account = self
            .body
            .accounts
            .get_mut(&phone)
            .ok_or(AccountStoreError::SessionNotFound)?;

        if account.entitlement.mode == MODE_LIFETIME || account.entitlement.is_trial_active(now) {
            let status = status_of(account, now);
            return Ok(status);
        }

        if account.entitlement.credits <= 0 {
            return Err(AccountStoreError::InsufficientCredits);
        }

        account.entitlement.credits -= 1;
        if account.entitlement.mode != MODE_PAYGO {
            account.entitlement.mode = MODE_PAYGO.to_string();
        }
        let status = status_of(account, now);
        self.save()?;
        Ok(status)
    }

    // --------------------------------------------------------
    // 权益凭证兑换
    // --------------------------------------------------------

    /// 兑换 Ed25519 签名的权益凭证（延长试用 / 充值次数 / 永久会员）
    ///
    /// nonce 双层防重放：账号库内记录（随账号存活）+ 机器级台账记录
    /// （随机器存活，删除账号库重建账号亦无法在同一台机器上二次兑换）。
    pub fn redeem_voucher(
        &mut self,
        token: &str,
        voucher_key: &str,
        now: i64,
        ledger: &mut MachineLedger,
    ) -> Result<EntitlementStatus, AccountStoreError> {
        let phone = self.resolve_session_phone(token, now)?;

        let payload = self
            .voucher_verifier
            .verify(voucher_key, now)
            .map_err(|e| AccountStoreError::VoucherInvalid(e.to_string()))?;

        if payload.target != "*" && payload.target != phone {
            return Err(AccountStoreError::VoucherTargetMismatch {
                expected: phone,
                actual: payload.target,
            });
        }

        let account = self
            .body
            .accounts
            .get_mut(&phone)
            .ok_or(AccountStoreError::SessionNotFound)?;

        if account.used_nonces.iter().any(|n| n == &payload.nonce) || ledger.has_nonce(&payload.nonce) {
            return Err(AccountStoreError::VoucherAlreadyUsed);
        }

        match payload.typ.as_str() {
            VOUCHER_TYPE_TRIAL => {
                // 自 max(now, 现有试用截止) 起顺延，试用未到期不浪费剩余天数
                let base = account.entitlement.trial_ends_at.max(now);
                account.entitlement.trial_ends_at = base + payload.days * 86400;
                if account.entitlement.mode != MODE_LIFETIME {
                    account.entitlement.mode = MODE_TRIAL.to_string();
                }
            }
            VOUCHER_TYPE_CREDITS => {
                account.entitlement.credits += payload.credits;
                if account.entitlement.mode != MODE_LIFETIME {
                    account.entitlement.mode = MODE_PAYGO.to_string();
                }
            }
            VOUCHER_TYPE_LIFETIME => {
                account.entitlement.mode = MODE_LIFETIME.to_string();
            }
            other => return Err(AccountStoreError::VoucherInvalid(format!("未知凭证类型: {}", other))),
        }

        ledger.record_nonce(&payload.nonce);
        account.used_nonces.push(payload.nonce);
        if account.used_nonces.len() > MAX_USED_NONCES {
            let overflow = account.used_nonces.len() - MAX_USED_NONCES;
            account.used_nonces.drain(0..overflow);
        }

        let status = status_of(account, now);
        self.save()?;
        if let Err(e) = ledger.persist() {
            log::warn!("[AccountStore] 凭证 nonce 台账写入失败（删库重建可能重放该凭证）: {}", e);
        }
        Ok(status)
    }

    // --------------------------------------------------------
    // 运维辅助
    // --------------------------------------------------------

    pub fn get_account_by_phone(&self, phone: &str) -> Option<&AccountRecord> {
        self.body.accounts.get(phone)
    }

    pub fn account_count(&self) -> usize {
        self.body.accounts.len()
    }
}

fn hex_decode(hex: &str) -> Vec<u8> {
    (0..hex.len() / 2)
        .map(|i| u8::from_str_radix(&hex[2 * i..2 * i + 2], 16).unwrap_or(0))
        .collect()
}

// ============================================================
// 全局单例访问（Tauri 命令入口，机器指纹缓存避免重复起子进程探测）
// ============================================================

static MACHINE_CODE_CACHE: OnceLock<String> = OnceLock::new();
static STORE_MUTEX: OnceLock<std::sync::Mutex<()>> = OnceLock::new();
static GLOBAL_LEDGER: OnceLock<std::sync::Mutex<MachineLedger>> = OnceLock::new();

/// 获取缓存的机器指纹（首次调用时真实探测，后续直取缓存）
pub fn cached_machine_code() -> String {
    MACHINE_CODE_CACHE
        .get_or_init(|| super::MachineUidResolver::get_machine_code())
        .clone()
}

fn global_ledger(machine_code: &str) -> std::sync::MutexGuard<'static, MachineLedger> {
    let mutex = GLOBAL_LEDGER
        .get_or_init(|| std::sync::Mutex::new(MachineLedger::with_default_locations(machine_code)));
    mutex.lock().unwrap_or_else(|poisoned| poisoned.into_inner())
}

fn unix_now_secs() -> i64 {
    std::time::SystemTime::now()
        .duration_since(std::time::UNIX_EPOCH)
        .map(|d| d.as_secs() as i64)
        .unwrap_or(0)
}

/// 可注入的事务执行体：时钟防回拨校验 → 装载账号库 → 执行操作
/// （台账与账号库在此汇合，注册验印记 / 凭证验 nonce 均经此通道）
pub fn transact<T>(
    store_dir: PathBuf,
    ledger: &mut MachineLedger,
    now: i64,
    operation: impl FnOnce(&mut AccountStore, &mut MachineLedger) -> Result<T, AccountStoreError>,
) -> Result<T, AccountStoreError> {
    ledger.check_and_touch_clock(now).map_err(|e| match e {
        MachineLedgerError::ClockRollbackDetected { recorded, current } => {
            AccountStoreError::ClockRollbackDetected { recorded, current }
        }
        other => AccountStoreError::Ledger(other.to_string()),
    })?;
    let mut store = AccountStore::new(store_dir, ledger.machine_code());
    operation(&mut store, ledger)
}

/// 在全局互斥锁内对默认账号库与机器级安全台账执行读-改-写事务
pub fn with_default_store<T>(
    operation: impl FnOnce(&mut AccountStore, &mut MachineLedger) -> Result<T, AccountStoreError>,
) -> Result<T, String> {
    let lock = STORE_MUTEX.get_or_init(|| std::sync::Mutex::new(()));
    let _guard = lock.lock().map_err(|_| "账号库互斥锁中毒".to_string())?;
    let machine_code = cached_machine_code();
    let mut ledger = global_ledger(&machine_code);
    transact(AccountStore::default_dir(), &mut ledger, unix_now_secs(), operation)
        .map_err(|e| e.to_string())
}

/// 测试与 CLI 共用：对给定载荷签发凭证字符串（使用测试密钥）
#[allow(dead_code)]
pub fn sign_voucher_for_testing(payload: &super::voucher::VoucherPayload) -> String {
    let signing_key = ed25519_dalek::SigningKey::from_bytes(&[42u8; 32]);
    sign_voucher_payload(&signing_key, payload).expect("测试凭证签名不可失败")
}

#[cfg(test)]
mod tests {
    use super::*;
    use crate::security::machine_ledger::LedgerSlot;
    use base64::engine::general_purpose::URL_SAFE_NO_PAD as B64_URL_SAFE;
    use base64::Engine;

    fn temp_dir(tag: &str) -> PathBuf {
        let dir = std::env::temp_dir()
            .join(format!("algo_viz_account_test_{}_{}", tag, std::process::id()));
        let _ = std::fs::remove_dir_all(&dir);
        dir
    }

    fn now() -> i64 {
        1_730_000_000
    }

    /// 构造注入「测试签名密钥对应验签器」的账号库，与 sign_voucher_for_testing 配对
    fn store(tag: &str) -> AccountStore {
        let signing_key = ed25519_dalek::SigningKey::from_bytes(&[42u8; 32]);
        let verifier = VoucherVerifier::new(signing_key.verifying_key().as_bytes())
            .expect("测试公钥必须有效");
        AccountStore::new(temp_dir(tag), "TEST-MACHINE-CODE").with_voucher_verifier(verifier)
    }

    /// 与 store 配对的独立台账实例（独立临时目录，避免相互清除）
    fn ledger(tag: &str) -> MachineLedger {
        let dir = temp_dir(&format!("{}_ledger", tag));
        MachineLedger::new("TEST-MACHINE-CODE", vec![LedgerSlot::File(dir.join("ledger.json"))])
    }

    #[test]
    fn test_phone_validation() {
        assert!(is_valid_phone("13800138000"));
        assert!(!is_valid_phone("23800138000"));
        assert!(!is_valid_phone("1380013800"));
        assert!(!is_valid_phone("1380013800a"));
        assert!(!is_valid_phone(" 13800138000"));
    }

    #[test]
    fn test_phone_masking() {
        assert_eq!(mask_phone("13800138000"), "138****8000");
        assert_eq!(mask_phone("short"), "short");
    }

    #[test]
    fn test_register_and_login_roundtrip() {
        let mut s = store("roundtrip");
        let mut l = ledger("roundtrip");
        let view = s.register("13800138000", "secret1", "张三", now(), &mut l).unwrap();
        assert!(!view.token.is_empty());
        assert!(view.status.active);
        assert_eq!(view.status.mode, MODE_TRIAL);
        assert_eq!(view.status.phone, "138****8000");
        // 默认试用 7 天
        assert_eq!(
            view.status.trial_remaining_secs,
            DEFAULT_TRIAL_DAYS * 86400
        );

        // 正确密码登录
        let login = s.login("13800138000", "secret1", now() + 100).unwrap();
        assert!(!login.token.is_empty());

        // 错误密码拒绝
        assert_eq!(
            s.login("13800138000", "wrong!", now() + 100).unwrap_err(),
            AccountStoreError::InvalidCredentials
        );

        // 重复注册拒绝
        assert_eq!(
            s.register("13800138000", "secret2", "", now() + 100, &mut l).unwrap_err(),
            AccountStoreError::PhoneAlreadyRegistered
        );
    }

    #[test]
    fn test_register_validation() {
        let mut s = store("validation");
        let mut l = ledger("validation");
        assert_eq!(s.register("13800", "secret1", "", now(), &mut l).unwrap_err(), AccountStoreError::InvalidPhone);
        assert_eq!(
            s.register("13800138000", "12345", "", now(), &mut l).unwrap_err(),
            AccountStoreError::InvalidPassword
        );
    }

    #[test]
    fn test_password_hash_is_salted_per_account() {
        let mut s = store("salted");
        let mut l = ledger("salted");
        s.register("13800138000", "samepass", "", now(), &mut l).unwrap();
        s.register("13900139000", "samepass", "", now(), &mut l).unwrap();

        let a = s.get_account_by_phone("13800138000").unwrap();
        let b = s.get_account_by_phone("13900139000").unwrap();
        assert_ne!(a.salt_hex, b.salt_hex, "同密码不同账号必须产生不同盐");
        assert_ne!(a.password_hash_hex, b.password_hash_hex);
    }

    #[test]
    fn test_persistence_roundtrip_and_integrity() {
        let dir = temp_dir("persist");
        {
            let mut s = AccountStore::new(dir.clone(), "MACHINE-A");
            let mut l = MachineLedger::new(
                "MACHINE-A",
                vec![LedgerSlot::File(temp_dir("persist_ledger").join("ledger.json"))],
            );
            s.register("13800138000", "secret1", "", now(), &mut l).unwrap();
        }
        // 同机器重新加载：账号仍在
        {
            let mut s = AccountStore::new(dir.clone(), "MACHINE-A");
            assert!(s.login("13800138000", "secret1", now() + 10).is_ok());
        }
        // 跨机器（不同指纹）加载：完整性失效，整库自愈为空
        {
            let mut s = AccountStore::new(dir, "MACHINE-B");
            assert_eq!(s.account_count(), 0);
            assert!(s.login("13800138000", "secret1", now()).is_err());
        }
    }

    #[test]
    fn test_session_expiry() {
        let mut s = store("session");
        let mut l = ledger("session");
        let view = s.register("13800138000", "secret1", "", now(), &mut l).unwrap();
        // 会话有效期内
        assert!(s.get_entitlement(&view.token, now() + 100).is_ok());
        // 超过 30 天 TTL
        assert_eq!(
            s.get_entitlement(&view.token, now() + SESSION_TTL_SECS + 10).unwrap_err(),
            AccountStoreError::SessionNotFound
        );
    }

    #[test]
    fn test_logout_invalidates_session() {
        let mut s = store("logout");
        let mut l = ledger("logout");
        let view = s.register("13800138000", "secret1", "", now(), &mut l).unwrap();
        s.logout(&view.token).unwrap();
        assert_eq!(
            s.get_entitlement(&view.token, now()).unwrap_err(),
            AccountStoreError::SessionNotFound
        );
    }

    #[test]
    fn test_trial_expiry_then_inactive() {
        let mut s = store("trial_expiry");
        let mut l = ledger("trial_expiry");
        let view = s.register("13800138000", "secret1", "", now(), &mut l).unwrap();
        let later = now() + DEFAULT_TRIAL_DAYS * 86400 + 60;
        let status = s.get_entitlement(&view.token, later).unwrap();
        assert!(!status.active, "试用过期且无次数余额必须失活");
        assert!(!status.trial_active);
    }

    #[test]
    fn test_consume_use_trial_first_then_credits() {
        let mut s = store("consume");
        let mut l = ledger("consume");
        let view = s.register("13800138000", "secret1", "", now(), &mut l).unwrap();
        // 试用期内消费不扣次数
        let status = s.consume_use(&view.token, now()).unwrap();
        assert_eq!(status.credits, 0);
        assert!(status.active);

        // 试用过期后，无余额消费被拒
        let after_trial = now() + DEFAULT_TRIAL_DAYS * 86400 + 60;
        assert_eq!(
            s.consume_use(&view.token, after_trial).unwrap_err(),
            AccountStoreError::InsufficientCredits
        );

        // 充值 3 次后可消费，且逐次递减
        let voucher = sign_voucher_for_testing(&super::super::voucher::VoucherPayload {
            v: 2,
            typ: VOUCHER_TYPE_CREDITS.to_string(),
            target: "*".to_string(),
            days: 0,
            credits: 3,
            exp: 0,
            nonce: "N-CREDIT-1".to_string(),
        });
        let status = s.redeem_voucher(&view.token, &voucher, after_trial, &mut l).unwrap();
        assert_eq!(status.credits, 3);
        assert_eq!(status.mode, MODE_PAYGO);

        assert_eq!(s.consume_use(&view.token, after_trial).unwrap().credits, 2);
        assert_eq!(s.consume_use(&view.token, after_trial).unwrap().credits, 1);
        assert_eq!(s.consume_use(&view.token, after_trial).unwrap().credits, 0);
        assert_eq!(
            s.consume_use(&view.token, after_trial).unwrap_err(),
            AccountStoreError::InsufficientCredits
        );
    }

    #[test]
    fn test_voucher_extends_trial_from_max_now_or_expiry() {
        let mut s = store("extend");
        let mut l = ledger("extend");
        let view = s.register("13800138000", "secret1", "", now(), &mut l).unwrap();
        let voucher = sign_voucher_for_testing(&super::super::voucher::VoucherPayload {
            v: 2,
            typ: VOUCHER_TYPE_TRIAL.to_string(),
            target: "13800138000".to_string(),
            days: 30,
            credits: 0,
            exp: 0,
            nonce: "N-TRIAL-1".to_string(),
        });

        // 试用未到期：从原截止时间顺延
        let status = s.redeem_voucher(&view.token, &voucher, now(), &mut l).unwrap();
        assert_eq!(
            status.trial_ends_at,
            now() + (DEFAULT_TRIAL_DAYS + 30) * 86400
        );

        // 同 nonce 重放拒绝（账号库层 + 台账层双重防护）
        assert_eq!(
            s.redeem_voucher(&view.token, &voucher, now(), &mut l).unwrap_err(),
            AccountStoreError::VoucherAlreadyUsed
        );
    }

    #[test]
    fn test_voucher_trial_extension_after_expiry_starts_from_now() {
        let mut s = store("extend_after");
        let mut l = ledger("extend_after");
        s.register("13800138000", "secret1", "", now(), &mut l).unwrap();
        let long_after = now() + 365 * 86400;
        // 远期时间点会话已过期，先重新登录
        let view = s.login("13800138000", "secret1", long_after).unwrap();
        let voucher = sign_voucher_for_testing(&super::super::voucher::VoucherPayload {
            v: 2,
            typ: VOUCHER_TYPE_TRIAL.to_string(),
            target: "*".to_string(),
            days: 15,
            credits: 0,
            exp: 0,
            nonce: "N-TRIAL-2".to_string(),
        });
        let status = s.redeem_voucher(&view.token, &voucher, long_after, &mut l).unwrap();
        assert_eq!(status.trial_ends_at, long_after + 15 * 86400);
        assert!(status.active);
    }

    #[test]
    fn test_voucher_target_mismatch_rejected() {
        let mut s = store("target");
        let mut l = ledger("target");
        let view = s.register("13800138000", "secret1", "", now(), &mut l).unwrap();
        let voucher = sign_voucher_for_testing(&super::super::voucher::VoucherPayload {
            v: 2,
            typ: VOUCHER_TYPE_CREDITS.to_string(),
            target: "13900139000".to_string(),
            days: 0,
            credits: 10,
            exp: 0,
            nonce: "N-T-1".to_string(),
        });
        assert!(matches!(
            s.redeem_voucher(&view.token, &voucher, now(), &mut l).unwrap_err(),
            AccountStoreError::VoucherTargetMismatch { .. }
        ));
    }

    #[test]
    fn test_voucher_tampered_signature_rejected() {
        let mut s = store("tamper");
        let mut l = ledger("tamper");
        let view = s.register("13800138000", "secret1", "", now(), &mut l).unwrap();
        let voucher = sign_voucher_for_testing(&super::super::voucher::VoucherPayload {
            v: 2,
            typ: VOUCHER_TYPE_CREDITS.to_string(),
            target: "*".to_string(),
            days: 0,
            credits: 10,
            exp: 0,
            nonce: "N-TAMPER-1".to_string(),
        });
        let parts: Vec<&str> = voucher.split('.').collect();
        let mut sig = B64_URL_SAFE.decode(parts[1]).unwrap();
        sig[0] ^= 1;
        let forged = format!("{}.{}", parts[0], B64_URL_SAFE.encode(&sig));
        assert!(matches!(
            s.redeem_voucher(&view.token, &forged, now(), &mut l).unwrap_err(),
            AccountStoreError::VoucherInvalid(_)
        ));
    }

    #[test]
    fn test_lifetime_voucher() {
        let mut s = store("lifetime");
        let mut l = ledger("lifetime");
        let view = s.register("13800138000", "secret1", "", now(), &mut l).unwrap();
        let voucher = sign_voucher_for_testing(&super::super::voucher::VoucherPayload {
            v: 2,
            typ: VOUCHER_TYPE_LIFETIME.to_string(),
            target: "*".to_string(),
            days: 0,
            credits: 0,
            exp: 0,
            nonce: "N-LIFE-1".to_string(),
        });
        let status = s.redeem_voucher(&view.token, &voucher, now(), &mut l).unwrap();
        assert_eq!(status.mode, MODE_LIFETIME);
        // 永久会员在任何未来时间都有效（远期需重新登录，会话 TTL 30 天）
        let far_future = now() + 100 * 365 * 86400;
        let view2 = s.login("13800138000", "secret1", far_future).unwrap();
        assert!(s.get_entitlement(&view2.token, far_future).unwrap().active);
        // 永久会员消费不扣次数
        let st = s.consume_use(&view2.token, far_future).unwrap();
        assert_eq!(st.mode, MODE_LIFETIME);
    }

    // ============================================================
    // 机器级安全台账集成（反试用农场 / 删库重放 / 时钟防回拨）
    // ============================================================

    #[test]
    fn test_trial_farming_blocked_after_store_deletion() {
        let store_dir = temp_dir("farming");
        let ledger_dir = temp_dir("farming_ledger");

        {
            let signing_key = ed25519_dalek::SigningKey::from_bytes(&[42u8; 32]);
            let verifier = VoucherVerifier::new(signing_key.verifying_key().as_bytes()).unwrap();
            let mut s = AccountStore::new(store_dir.clone(), "TEST-MACHINE-CODE")
                .with_voucher_verifier(verifier);
            let mut l = MachineLedger::new(
                "TEST-MACHINE-CODE",
                vec![LedgerSlot::File(ledger_dir.join("ledger.json"))],
            );
            let view = s.register("13800138000", "secret1", "", now(), &mut l).unwrap();
            assert_eq!(view.status.mode, MODE_TRIAL, "首台机器首次注册必须授予试用");
        }

        // 攻击者删除账号库（和会话），企图换个手机号重新薅一轮试用
        let _ = std::fs::remove_dir_all(&store_dir);

        {
            let signing_key = ed25519_dalek::SigningKey::from_bytes(&[42u8; 32]);
            let verifier = VoucherVerifier::new(signing_key.verifying_key().as_bytes()).unwrap();
            let mut s = AccountStore::new(store_dir, "TEST-MACHINE-CODE")
                .with_voucher_verifier(verifier);
            // 台账实例从持久化位置重新加载（模拟进程重启）
            let mut l = MachineLedger::new(
                "TEST-MACHINE-CODE",
                vec![LedgerSlot::File(ledger_dir.join("ledger.json"))],
            );
            let view = s.register("13900139000", "secret2", "", now() + 60, &mut l).unwrap();
            assert_eq!(
                view.status.mode, MODE_PAYGO,
                "同机重建账号不得再次获得试用"
            );
            assert_eq!(view.status.credits, 0);
            assert_eq!(view.status.trial_ends_at, 0);
            assert!(!view.status.active, "无试用无余额的新账号必须失活");
        }
    }

    #[test]
    fn test_wildcard_voucher_replay_blocked_after_store_reset() {
        let store_dir = temp_dir("replay");
        let ledger_dir = temp_dir("replay_ledger");
        let voucher = sign_voucher_for_testing(&super::super::voucher::VoucherPayload {
            v: 2,
            typ: VOUCHER_TYPE_CREDITS.to_string(),
            target: "*".to_string(),
            days: 0,
            credits: 50,
            exp: 0,
            nonce: "N-WILDCARD-REPLAY-1".to_string(),
        });

        let build = || {
            let signing_key = ed25519_dalek::SigningKey::from_bytes(&[42u8; 32]);
            let verifier = VoucherVerifier::new(signing_key.verifying_key().as_bytes()).unwrap();
            AccountStore::new(store_dir.clone(), "TEST-MACHINE-CODE").with_voucher_verifier(verifier)
        };
        let build_ledger = || {
            MachineLedger::new(
                "TEST-MACHINE-CODE",
                vec![LedgerSlot::File(ledger_dir.join("ledger.json"))],
            )
        };

        // 第一次兑换：成功
        {
            let mut s = build();
            let mut l = build_ledger();
            let view = s.register("13800138000", "secret1", "", now(), &mut l).unwrap();
            let status = s.redeem_voucher(&view.token, &voucher, now(), &mut l).unwrap();
            assert_eq!(status.credits, 50);
        }

        // 攻击者删除账号库重建账号，企图重放同一张通配凭证
        let _ = std::fs::remove_dir_all(&store_dir);
        {
            let mut s = build();
            let mut l = build_ledger();
            let view = s.register("13900139000", "secret2", "", now() + 60, &mut l).unwrap();
            assert_eq!(
                s.redeem_voucher(&view.token, &voucher, now() + 60, &mut l).unwrap_err(),
                AccountStoreError::VoucherAlreadyUsed,
                "机器级台账必须在删库后依然拦截同一凭证重放"
            );
        }
    }

    #[test]
    fn test_transact_clock_rollback_rejected() {
        let store_dir = temp_dir("rollback");
        let mut l = ledger("rollback");

        // 正常时间运行一次（last_seen 记录为 now）
        transact(store_dir.clone(), &mut l, now(), |_s, _l| Ok::<_, AccountStoreError>(())).unwrap();

        // 时钟倒流 2 天后再执行任何账号操作：整体拒绝
        let err = transact(store_dir, &mut l, now() - 172800, |_s, _l| {
            Ok::<_, AccountStoreError>(())
        })
        .unwrap_err();
        match err {
            AccountStoreError::ClockRollbackDetected { recorded, current } => {
                assert_eq!(recorded, now());
                assert_eq!(current, now() - 172800);
            }
            other => panic!("预期 ClockRollbackDetected，实际: {:?}", other),
        }
    }

    #[test]
    fn test_transact_new_account_on_fresh_machine_gets_trial() {
        let store_dir = temp_dir("fresh_machine");
        let mut l = ledger("fresh_machine");
        let view = transact(store_dir, &mut l, now(), |s, l| {
            s.register("13800138000", "secret1", "", now(), l)
        })
        .unwrap();
        assert!(view.status.active);
        assert_eq!(view.status.mode, MODE_TRIAL);
    }

    #[test]
    fn test_pbkdf2_known_vector() {
        // RFC 6070 风格自洽校验：确定性 + 雪崩
        let a = pbkdf2_sha256(b"password", b"salt", 4096);
        let b = pbkdf2_sha256(b"password", b"salt", 4096);
        let c = pbkdf2_sha256(b"password", b"salt2", 4096);
        assert_eq!(a, b);
        assert_ne!(a, c);
        // PBKDF2-HMAC-SHA256("password", "salt", 1) 的权威前 8 字节: 120fb6cffcf8b32c
        let single = pbkdf2_sha256(b"password", b"salt", 1);
        assert_eq!(hex_encode(&single).get(..16), Some("120fb6cffcf8b32c"));
    }

    #[test]
    fn test_integrity_key_binds_to_machine() {
        let k1 = derive_integrity_key("MACHINE-A");
        let k2 = derive_integrity_key("MACHINE-A");
        let k3 = derive_integrity_key("MACHINE-B");
        assert_eq!(k1, k2);
        assert_ne!(k1, k3);
    }
}
