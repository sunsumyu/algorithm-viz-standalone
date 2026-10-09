pub mod anti_cdp;
pub mod anti_debugger;
pub mod code_hash;
pub mod hkdf_deriver;
pub mod ipc_zeroize;
pub mod license_verifier;
pub mod machine_uid;
pub mod rate_limiter;
pub mod stream_decrypt;
pub mod watermark;

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
