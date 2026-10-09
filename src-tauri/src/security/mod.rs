pub mod machine_uid;

pub use machine_uid::MachineUidResolver;

/// 暴露给前端查询本机机器码的 Tauri 命令
#[tauri::command]
pub fn get_machine_code() -> Result<String, String> {
    Ok(MachineUidResolver::get_machine_code())
}
