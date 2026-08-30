/**
 * 算法动画演示 - 主入口
 * 
 * 初始化 Plugin 系统，注册并加载 algorithm-viz 插件
 * 同时绑定 Tauri 桌面窗口的自定义标题栏控制
 */

import './styles/visualizer-theme.css';
import './styles/shortcut-modal.css';
import './styles/settings-modal.css';
import { pluginLoader } from './core/plugin-loader';
import { setupTauriWindowControls } from './core/tauri-window-controls';
import { algorithmVizPlugin } from './plugins/algorithm-viz/index';
import { algorithmManager } from './core/algorithm-manager';
import { shortcutController } from './core/controllers/keyboard-shortcut-controller';
import { shortcutManagerModal } from './core/shortcuts/shortcut-manager-modal';
import { appSettingsRepo } from './core/settings/app-settings-repository';
import { appSettingsModal } from './core/settings/app-settings-modal';

if (typeof window !== 'undefined') {
  (window as unknown as { algorithmManager: typeof algorithmManager }).algorithmManager = algorithmManager;
  (window as unknown as { shortcutManagerModal: typeof shortcutManagerModal }).shortcutManagerModal = shortcutManagerModal;
  (window as unknown as { appSettingsModal: typeof appSettingsModal }).appSettingsModal = appSettingsModal;
  (window as unknown as { appSettingsRepo: typeof appSettingsRepo }).appSettingsRepo = appSettingsRepo;
}

/**
 * 应用初始化
 */
async function main(): Promise<void> {
  const startTime = performance.now();
  console.log('[Main] Starting Algorithm Visualization Desktop App...');
  console.log(`[Main] Platform: ${navigator.platform}, User Agent: ${navigator.userAgent}`);
  console.log(`[Main] Initial Algorithm Metadata Count: ${algorithmManager.getAllAlgorithms().length}`);

  try {
    // 1. 立即注册并加载核心 UI 插件（毫秒级瞬间渲染侧边栏和算法卡片）
    const pluginT0 = performance.now();
    pluginLoader.register(algorithmVizPlugin);
    await pluginLoader.load('algorithm-viz');
    console.log(`[Main] Plugin loaded & UI rendered in ${(performance.now() - pluginT0).toFixed(1)}ms`);

    // 2. 异步绑定桌面窗口控制（最小化/最大化/关闭），不阻塞首屏渲染
    setupTauriWindowControls().catch((err) => {
      console.warn('[Main] Window controls init warning:', err);
    });

    // 3. 绑定主页全局设置与快捷键按钮点击事件
    const titlebarSettingsBtn = document.getElementById('titlebar-settings-btn');
    titlebarSettingsBtn?.addEventListener('click', () => appSettingsModal.open());

    const titlebarShortcutsBtn = document.getElementById('titlebar-shortcuts-btn');
    titlebarShortcutsBtn?.addEventListener('click', () => shortcutManagerModal.open());

    const totalTime = (performance.now() - startTime).toFixed(1);
    console.log(`[Main] Application ready in ${totalTime}ms (Total ${algorithmManager.getAllAlgorithms().length} algorithms active)`);
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

