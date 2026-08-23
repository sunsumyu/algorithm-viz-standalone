import { getCurrentWindow } from '@tauri-apps/api/window';
import type { UnlistenFn } from '@tauri-apps/api/event';

const TAURI_INTERNALS_KEY = '__TAURI_INTERNALS__';
const MAXIMIZE_ICON = '□';
const RESTORE_ICON = '❐';

function isTauriRuntime(): boolean {
  return TAURI_INTERNALS_KEY in window;
}

function setToggleMaximizeIcon(button: HTMLButtonElement, isMaximized: boolean): void {
  button.textContent = isMaximized ? RESTORE_ICON : MAXIMIZE_ICON;
  button.setAttribute('aria-label', isMaximized ? '还原' : '最大化');
}

// 绑定的按钮集合（防止 HMR 重复绑定）
const boundButtons = new WeakSet<HTMLElement>();
// 缓存 onResized unlisten 以便 cleanup
let resizedUnlisten: UnlistenFn | null = null;

/**
 * 绑定 Tauri 自定义标题栏的窗口控制按钮。
 * 浏览器调试环境下会安全降级，不影响 `npm run dev`。
 */
export async function setupTauriWindowControls(): Promise<void> {
  const minimizeButton = document.getElementById('window-minimize') as HTMLButtonElement | null;
  const toggleMaximizeButton = document.getElementById('window-toggle-maximize') as HTMLButtonElement | null;
  const closeButton = document.getElementById('window-close') as HTMLButtonElement | null;

  if (!minimizeButton || !toggleMaximizeButton || !closeButton) {
    return;
  }

  if (!isTauriRuntime()) {
    minimizeButton.disabled = true;
    toggleMaximizeButton.disabled = true;
    // 浏览器模式每次 setup 只绑一次 close
    if (!boundButtons.has(closeButton)) {
      boundButtons.add(closeButton);
      closeButton.addEventListener('click', () => window.close());
    }
    return;
  }

  const appWindow = getCurrentWindow();

  // 幂等绑定：每个按钮只绑一次
  if (!boundButtons.has(minimizeButton)) {
    boundButtons.add(minimizeButton);
    minimizeButton.addEventListener('click', () => {
      appWindow.minimize().catch((error) => console.error('[WindowControls] Failed to minimize:', error));
    });
  }

  if (!boundButtons.has(toggleMaximizeButton)) {
    boundButtons.add(toggleMaximizeButton);
    toggleMaximizeButton.addEventListener('click', async () => {
      try {
        await appWindow.toggleMaximize();
        setToggleMaximizeIcon(toggleMaximizeButton, await appWindow.isMaximized());
      } catch (error) {
        console.error('[WindowControls] Failed to toggle maximize:', error);
      }
    });
  }

  if (!boundButtons.has(closeButton)) {
    boundButtons.add(closeButton);
    closeButton.addEventListener('click', () => {
      appWindow.close().catch((error) => console.error('[WindowControls] Failed to close:', error));
    });
  }

  try {
    setToggleMaximizeIcon(toggleMaximizeButton, await appWindow.isMaximized());
    // 缓存 unlisten 以便 cleanup 时解绑
    if (!resizedUnlisten) {
      resizedUnlisten = await appWindow.onResized(async () => {
        setToggleMaximizeIcon(toggleMaximizeButton, await appWindow.isMaximized());
      });
    }
  } catch (error) {
    console.error('[WindowControls] Failed to sync maximize state:', error);
  }
}

/**
 * 清理 Tauri 窗口控制监听器（用于 HMR / 插件卸载等场景）
 */
export function cleanupTauriWindowControls(): void {
  if (resizedUnlisten) {
    resizedUnlisten();
    resizedUnlisten = null;
  }
  // WeakSet 是 ephemaral 的，绑定过的事件凭 DOM 节点引用存在；
  // 如果 DOM 被替换，事件不会残留；如果 DOM 保留，事件也应该保留。
}
