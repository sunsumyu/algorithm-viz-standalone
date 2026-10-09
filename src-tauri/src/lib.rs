pub mod security;

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
  // 启动期非法参数拦截（防止附加 --remote-debugging-port 等自动化爬虫参数）
  security::AntiCdpGuard::enforce_startup_guard();

  #[cfg(target_os = "windows")]
  {
    let current_args = std::env::var("WEBVIEW2_ADDITIONAL_BROWSER_ARGUMENTS").unwrap_or_default();
    if !current_args.contains("CalculateNativeWinOcclusion") {
      let custom_args = "--disable-features=CalculateNativeWinOcclusion,IntensiveWakeUpThrottling --disable-backgrounding-occluded-windows --disable-renderer-backgrounding";
      let combined_args = if current_args.is_empty() {
        custom_args.to_string()
      } else {
        format!("{} {}", current_args, custom_args)
      };
      std::env::set_var("WEBVIEW2_ADDITIONAL_BROWSER_ARGUMENTS", combined_args);
    }
  }

  tauri::Builder::default()
    .invoke_handler(tauri::generate_handler![
      security::get_machine_code,
      security::verify_license_code,
      security::fetch_algorithm_chunk,
      security::release_algorithm_chunk,
    ])
    .setup(|app| {
      #[cfg(debug_assertions)]
      {
        use tauri::Manager;
        app.handle().plugin(
          tauri_plugin_log::Builder::default()
            .level(log::LevelFilter::Info)
            .build(),
        )?;
        if let Some(main_window) = app.get_webview_window("main") {
          main_window.open_devtools();
        }
      }
      Ok(())
    })
    .run(tauri::generate_context!())
    .expect("error while running tauri application");
}

