/**
 * 算法动画演示 - 主入口
 * 
 * 初始化 Plugin 系统，注册并加载 algorithm-viz 插件
 * 同时绑定 Tauri 桌面窗口的自定义标题栏控制
 */

import { pluginLoader } from './core/plugin-loader';
import { setupTauriWindowControls } from './core/tauri-window-controls';
import { algorithmVizPlugin } from './plugins/algorithm-viz/index';

/**
 * 应用初始化
 */
async function main(): Promise<void> {
  console.log('[Main] Starting Algorithm Visualization Desktop App...');
  console.log(`[Main] Platform: ${navigator.platform}, User Agent: ${navigator.userAgent}`);

  try {
    // 1. 绑定桌面窗口控制
    await setupTauriWindowControls();
    console.log('[Main] Window controls initialized');

    // 2. 注册算法可视化插件
    pluginLoader.register(algorithmVizPlugin);
    console.log('[Main] Plugin registered');

    // 3. 加载插件
    await pluginLoader.load('algorithm-viz');
    console.log('[Main] Plugin loaded');

    console.log('[Main] Application ready');
  } catch (error) {
    console.error('[Main] Failed to initialize:', error);

    // 显示错误信息
    const app = document.getElementById('app');
    if (app) {
      const msg = error instanceof Error ? error.message : String(error);
      // 转义 HTML 防止 XSS
      const safeMsg = msg.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
      app.innerHTML = `
        <div style="display:flex;flex-direction:column;align-items:center;justify-content:center;height:100%;gap:1rem;padding:2rem;">
          <h1 style="color:#ef4444;">❌ 初始化失败</h1>
          <pre style="color:#f38ba8;background:#181825;padding:1rem;border-radius:0.5rem;max-width:600px;overflow:auto;">${safeMsg}</pre>
          <button id="error-reload-btn" style="background:#89b4fa;border:none;border-radius:0.4rem;padding:0.5rem 1.5rem;color:#1e1e2e;cursor:pointer;font-weight:500;">重新加载</button>
        </div>
      `;
      const reloadBtn = document.getElementById('error-reload-btn');
      if (reloadBtn) reloadBtn.addEventListener('click', () => location.reload());
    }
  }
}

// DOM 加载完成后启动
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', main);
} else {
  main();
}
