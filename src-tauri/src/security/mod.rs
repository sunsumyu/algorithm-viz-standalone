pub mod license_verifier;
pub mod machine_uid;

pub use license_verifier::{
    sign_license_payload, LicenseContext, LicenseError, LicensePayload, LicenseVerifier,
    EMBEDDED_PUBLIC_KEY,
};
pub use machine_uid::MachineUidResolver;

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
