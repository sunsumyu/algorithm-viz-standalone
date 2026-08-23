#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
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
    .setup(|app| {
      if cfg!(debug_assertions) {
        app.handle().plugin(
          tauri_plugin_log::Builder::default()
            .level(log::LevelFilter::Info)
            .build(),
        )?;
      }
      Ok(())
    })
    .run(tauri::generate_context!())
    .expect("error while running tauri application");
}

