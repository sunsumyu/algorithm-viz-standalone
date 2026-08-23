// Prevents additional console window on Windows in release, DO NOT REMOVE!!
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

fn main() {
  #[cfg(target_os = "windows")]
  {
    // 防止屏幕截图/失焦遮挡时 WebView2 触发 Occlusion 判定与 GPU 帧暂停导致的画面空白
    let current_args = std::env::var("WEBVIEW2_ADDITIONAL_BROWSER_ARGUMENTS").unwrap_or_default();
    let custom_args = "--disable-features=CalculateNativeWinOcclusion,IntensiveWakeUpThrottling --disable-backgrounding-occluded-windows --disable-renderer-backgrounding";
    let combined_args = if current_args.is_empty() {
      custom_args.to_string()
    } else {
      format!("{} {}", current_args, custom_args)
    };
    std::env::set_var("WEBVIEW2_ADDITIONAL_BROWSER_ARGUMENTS", combined_args);
  }

  algorithm_viz_lib::run();
}

