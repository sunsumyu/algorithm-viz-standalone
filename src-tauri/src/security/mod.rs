pub mod account_store;
pub mod anti_cdp;
pub mod anti_debugger;
pub mod code_hash;
pub mod content_gateway;
pub mod content_pack_key;
pub mod hkdf_deriver;
pub mod ipc_zeroize;
pub mod license_verifier;
pub mod machine_ledger;
pub mod machine_uid;
pub mod rate_limiter;
pub mod stream_decrypt;
pub mod voucher;
pub mod watermark;

pub use account_store::{
    AccountSessionView, AccountStore, AccountStoreError, Entitlement, EntitlementStatus,
    SessionRecord, DEFAULT_TRIAL_DAYS,
};
pub use content_gateway::{
    clear_unlock, is_unlocked, stamp_unlock, CONTENT_UNLOCK_TTL_SECS,
};
pub use content_pack_key::{
    derive_content_pack_key, master_key_from_env, parse_master_key_hex, CONTENT_MASTER_KEY_ENV,
};
pub use machine_ledger::{MachineLedger, MachineLedgerError, TrialGrant};
pub use anti_cdp::AntiCdpGuard;
pub use anti_debugger::{is_debugger_present, AntiDebuggerGuard};
pub use watermark::{WatermarkInjector, ZeroWidthWatermark};
pub use rate_limiter::{RateLimitError, ScrapeRateLimiter};
pub use code_hash::{
    compute_code_fingerprint_from_bytes, CodeAsKeyVerifier, CODE_KEY_SALT_PREFIX,
};
pub use hkdf_deriver::{DerivedAssetKey, HkdfDeriveError, HkdfKeyDeriver, DEFAULT_ASSET_KEY_INFO};
pub use ipc_zeroize::AlgorithmSessionManager;
pub use license_verifier::{
    sign_license_payload, LicenseContext, LicenseError, LicensePayload, LicenseVerifier,
    EMBEDDED_PUBLIC_KEY,
};
pub use machine_uid::MachineUidResolver;
pub use voucher::{sign_voucher_payload, VoucherError, VoucherPayload, VoucherVerifier};
pub use stream_decrypt::{
    AssetPackCompiler, AssetPackError, ChunkIndex, StreamDecryptEngine, ASSET_PACK_MAGIC,
    ASSET_PACK_VERSION,
};

/// 暴露给前端查询本机机器码的 Tauri 命令
#[tauri::command]
pub fn get_machine_code() -> Result<String, String> {
    Ok(MachineUidResolver::get_machine_code())
}

/// 暴露给前端验证激活码的 Tauri 命令
#[tauri::command]
pub fn verify_license_code(license_key: String) -> Result<LicensePayload, String> {
    let verifier = LicenseVerifier::with_embedded_key().map_err(|e| e.to_string())?;
    let machine_code = MachineUidResolver::get_machine_code();
    let current_time = std::time::SystemTime::now()
        .duration_since(std::time::UNIX_EPOCH)
        .map(|d| d.as_secs() as i64)
        .unwrap_or(0);

    let ctx = verifier
        .verify_for_machine(&license_key, &machine_code, current_time, None)
        .map_err(|e| e.to_string())?;

    // 内容网关授权印章：有效期与 24h TTL 取短，试用期激活码以 exp 封顶
    let valid_until = if ctx.payload.exp > 0 {
        ctx.payload.exp
    } else {
        current_time + content_gateway::CONTENT_UNLOCK_TTL_SECS
    };
    content_gateway::stamp_unlock(current_time, valid_until);

    Ok(ctx.payload)
}

/// 暴露给前端请求并解密单算法数据的 Tauri 命令
#[tauri::command]
pub fn fetch_algorithm_chunk(
    algorithm_id: String,
    license_key: String,
) -> Result<String, String> {
    ipc_zeroize::fetch_algorithm_chunk(algorithm_id, license_key)
}

/// 暴露给前端注销并覆写清零单算法数据的 Tauri 命令
#[tauri::command]
pub fn release_algorithm_chunk(algorithm_id: String) -> Result<bool, String> {
    ipc_zeroize::release_algorithm_chunk(algorithm_id)
}

/// apv:// 内容协议请求裁决（内容资产网关 · 协议处理器入口）
///
/// * 资产在加密包索引中 → 授权印章 + 限流 → 解密返回（403/429/200）；
/// * 其余路径 → 内嵌 dist 明文兜底（boot 引导集合与杂项资源）；
/// * 未知路径 → 404。
pub fn apv_handle_request(
    app: &tauri::AppHandle,
    uri_path: &str,
) -> tauri::http::Response<Vec<u8>> {
    use tauri::Manager;

    let now_secs = std::time::SystemTime::now()
        .duration_since(std::time::UNIX_EPOCH)
        .map(|d| d.as_secs() as i64)
        .unwrap_or(0);
    let now_ms = std::time::SystemTime::now()
        .duration_since(std::time::UNIX_EPOCH)
        .map(|d| d.as_millis() as u64)
        .unwrap_or(0);

    let respond = |status: u16, mime: &str, body: Vec<u8>| {
        tauri::http::Response::builder()
            .status(status)
            .header("Content-Type", mime)
            .header("Access-Control-Allow-Origin", "*")
            .header("Cache-Control", "no-store")
            .body(body)
            .expect("apv 响应构造不可失败")
    };

    let Some(asset_id) = content_gateway::normalize_asset_path(uri_path) else {
        return respond(404, "text/plain", b"Not Found".to_vec());
    };

    let manager = AlgorithmSessionManager::global()
        .lock()
        .unwrap_or_else(|poisoned| poisoned.into_inner());

    if manager.contains_asset(&asset_id) {
        if !content_gateway::is_unlocked(now_secs) {
            return respond(403, "text/plain", b"Forbidden: authorization required".to_vec());
        }
        if content_gateway::check_rate(now_ms).is_err() {
            return respond(429, "text/plain", b"Too Many Requests".to_vec());
        }
        return match manager.decrypt_asset(&asset_id) {
            Ok(bytes) => respond(200, content_gateway::guess_mime(&asset_id), bytes),
            Err(e) => respond(500, "text/plain", e.into_bytes()),
        };
    }

    match app.asset_resolver().get(asset_id.clone()) {
        Some(asset) => respond(
            200,
            asset.mime_type.as_str(),
            asset.bytes,
        ),
        None => respond(404, "text/plain", b"Not Found".to_vec()),
    }
}

// ============================================================
// 账号注册 / 登录 / 权益 Tauri 命令族（服务端化前的本地优先实现）
// ============================================================

fn unix_now_secs() -> i64 {
    std::time::SystemTime::now()
        .duration_since(std::time::UNIX_EPOCH)
        .map(|d| d.as_secs() as i64)
        .unwrap_or(0)
}

/// 手机号 + 密码注册新账号，默认授予试用期并自动登录
#[tauri::command]
pub async fn account_register(
    phone: String,
    password: String,
    display_name: String,
) -> Result<AccountSessionView, String> {
    // PBKDF2 为 CPU 密集操作，先在阻塞线程完成，避免占用异步运行时
    tauri::async_runtime::spawn_blocking(move || {
        account_store::with_default_store(|store, ledger| {
            let view = store.register(&phone, &password, &display_name, unix_now_secs(), ledger)?;
            if view.status.active {
                content_gateway::stamp_unlock(
                    unix_now_secs(),
                    unix_now_secs() + content_gateway::CONTENT_UNLOCK_TTL_SECS,
                );
            }
            Ok(view)
        })
    })
    .await
    .map_err(|e| format!("注册任务执行失败: {}", e))?
}

/// 手机号 + 密码登录
#[tauri::command]
pub async fn account_login(phone: String, password: String) -> Result<AccountSessionView, String> {
    tauri::async_runtime::spawn_blocking(move || {
        account_store::with_default_store(|store, _ledger| {
            let view = store.login(&phone, &password, unix_now_secs())?;
            if view.status.active {
                content_gateway::stamp_unlock(
                    unix_now_secs(),
                    unix_now_secs() + content_gateway::CONTENT_UNLOCK_TTL_SECS,
                );
            }
            Ok(view)
        })
    })
    .await
    .map_err(|e| format!("登录任务执行失败: {}", e))?
}

/// 注销当前会话
#[tauri::command]
pub async fn account_logout(token: String) -> Result<bool, String> {
    tauri::async_runtime::spawn_blocking(move || {
        account_store::with_default_store(|store, _ledger| {
            let existed = store.logout(&token)?;
            // 注销即撕章：内容资产请求立即失效
            content_gateway::clear_unlock();
            Ok(existed)
        })
    })
    .await
    .map_err(|e| format!("注销任务执行失败: {}", e))?
}

/// 查询当前会话账号的权益状态（试用剩余 / 按量余量 / 会员模式）
#[tauri::command]
pub async fn account_get_entitlement(token: String) -> Result<EntitlementStatus, String> {
    tauri::async_runtime::spawn_blocking(move || {
        account_store::with_default_store(|store, _ledger| {
            let status = store.get_entitlement(&token, unix_now_secs())?;
            if status.active {
                content_gateway::stamp_unlock(
                    unix_now_secs(),
                    unix_now_secs() + content_gateway::CONTENT_UNLOCK_TTL_SECS,
                );
            }
            Ok(status)
        })
    })
    .await
    .map_err(|e| format!("权益查询任务执行失败: {}", e))?
}

/// 消费一次算法使用（试用期内免扣次，按量付费模式扣减余量）
#[tauri::command]
pub async fn account_consume_credit(token: String) -> Result<EntitlementStatus, String> {
    tauri::async_runtime::spawn_blocking(move || {
        account_store::with_default_store(|store, _ledger| {
            let status = store.consume_use(&token, unix_now_secs())?;
            // 扣次成功即权益有效的即时证明，刷新内容网关印章
            content_gateway::stamp_unlock(
                unix_now_secs(),
                unix_now_secs() + content_gateway::CONTENT_UNLOCK_TTL_SECS,
            );
            Ok(status)
        })
    })
    .await
    .map_err(|e| format!("扣次任务执行失败: {}", e))?
}

/// 兑换开发者签发的 Ed25519 权益凭证（延长试用 / 充值次数 / 开通永久会员）
#[tauri::command]
pub async fn account_redeem_voucher(token: String, voucher: String) -> Result<EntitlementStatus, String> {
    tauri::async_runtime::spawn_blocking(move || {
        account_store::with_default_store(|store, ledger| {
            let status = store.redeem_voucher(&token, &voucher, unix_now_secs(), ledger)?;
            if status.active {
                content_gateway::stamp_unlock(
                    unix_now_secs(),
                    unix_now_secs() + content_gateway::CONTENT_UNLOCK_TTL_SECS,
                );
            }
            Ok(status)
        })
    })
    .await
    .map_err(|e| format!("凭证兑换任务执行失败: {}", e))?
}
