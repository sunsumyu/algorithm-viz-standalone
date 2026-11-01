pub mod security;

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
  // 启动期非法参数拦截（防止附加 --remote-debugging-port 等自动化爬虫参数）
  security::AntiCdpGuard::enforce_startup_guard();

  #[cfg(target_os = "windows")]
  {
    // 安全消毒：攻击者可在启动前预设 WEBVIEW2_ADDITIONAL_BROWSER_ARGUMENTS 注入
    // --remote-debugging-port 等 CDP 参数（绕过进程 argv 检查），必须先剔除调试注入参数
    let current_args = std::env::var("WEBVIEW2_ADDITIONAL_BROWSER_ARGUMENTS").unwrap_or_default();
    let sanitized_args = security::AntiCdpGuard::sanitize_webview_env_args(&current_args);
    if sanitized_args.len() != current_args.trim().len() {
      log::warn!(
        "[Security] WEBVIEW2_ADDITIONAL_BROWSER_ARGUMENTS 检测到调试注入参数，已消毒: {} -> {}",
        current_args,
        sanitized_args
      );
    }

    if !sanitized_args.contains("CalculateNativeWinOcclusion") {
      let custom_args = "--disable-features=CalculateNativeWinOcclusion,IntensiveWakeUpThrottling --disable-backgrounding-occluded-windows --disable-renderer-backgrounding";
      let combined_args = if sanitized_args.is_empty() {
        custom_args.to_string()
      } else {
        format!("{} {}", sanitized_args, custom_args)
      };
      std::env::set_var("WEBVIEW2_ADDITIONAL_BROWSER_ARGUMENTS", combined_args);
    } else if sanitized_args != current_args {
      std::env::set_var("WEBVIEW2_ADDITIONAL_BROWSER_ARGUMENTS", sanitized_args);
    }
  }

  tauri::Builder::default()
    // apv 内容协议：内容资产网关裁决层
    // * 加密包内资产 → 授权印章 + 限流 → 解密返回（403/429/200）
    // * 其余路径 → 内嵌 dist 明文兜底（boot 引导集合）
    // 生产构建（tauri:build:protected）将 vite base 指向 http://apv.localhost/，
    // dev 模式 base 保持 '/'，不走本协议，热更体验不变。
    .register_asynchronous_uri_scheme_protocol("apv", |ctx, request, responder| {
      let path = request.uri().path().to_string();
      let app = ctx.app_handle().clone();
      responder.respond(security::apv_handle_request(&app, &path));
    })
    .invoke_handler(tauri::generate_handler![
      security::get_machine_code,
      security::verify_license_code,
      security::fetch_algorithm_chunk,
      security::release_algorithm_chunk,
      security::account_register,
      security::account_login,
      security::account_logout,
      security::account_get_entitlement,
      security::account_consume_credit,
      security::account_redeem_voucher,
    ])
    .setup(|app| {
      use tauri::Manager;

      // 内容资产包管线启动装载：主密钥与资产包文件齐备时激活，
      // 任一缺失/无效即休眠（对应用行为零影响）
      {
        let resource_dir = app.path().resource_dir().ok();
        let mut manager = security::AlgorithmSessionManager::global()
          .lock()
          .map_err(|_| "资产包管理器互斥锁中毒".to_string())?;
        manager.init_from_default_locations(resource_dir.as_deref())?;
      }

      #[cfg(debug_assertions)]
      {
        app.handle().plugin(
          tauri_plugin_log::Builder::default()
            .level(log::LevelFilter::Info)
            .build(),
        )?;
        if let Some(main_window) = app.get_webview_window("main") {
          main_window.open_devtools();
        }
      }

      #[cfg(not(debug_assertions))]
      {
        let guard = security::AntiDebuggerGuard::start_watchdog_default();
        Box::leak(Box::new(guard));
      }

      Ok(())
    })
    .run(tauri::generate_context!())
    .expect("error while running tauri application");
}

