/**
 * 运行时审查防范与 DevTools 拦截深模块 (Runtime Inspection Guard)
 *
 * 职责：
 * 1. 在生产模式下全局拦截鼠标右键上下文菜单，防止审查元素；
 * 2. 拦截 F12、Ctrl+Shift+I / J / C 及 Ctrl+U 源码查看快捷键；
 * 3. 在开发调试模式（import.meta.env.DEV）下主动短路放行，保证开发者调试体验不受影响；
 * 4. 提供幂等安全的 cleanup 函数，支持生命周期注销与无头测试。
 */

const BLOCKED_INSPECT_KEYS = new Set(['I', 'J', 'C', 'i', 'j', 'c']);

/**
 * 判断是否属于开发者工具或查看源码快捷键
 */
export function isDevToolsShortcut(e: KeyboardEvent): boolean {
  // F12
  if (e.key === 'F12') {
    return true;
  }

  // Ctrl+Shift+I / J / C
  if (e.ctrlKey && e.shiftKey && BLOCKED_INSPECT_KEYS.has(e.key)) {
    return true;
  }

  // Ctrl+U (查看源代码)
  if (e.ctrlKey && !e.shiftKey && !e.altKey && (e.key === 'u' || e.key === 'U')) {
    return true;
  }

  return false;
}

/**
 * 启动运行时审查拦截防线
 * @param isDev 是否为开发模式（默认为 import.meta.env.DEV）
 * @returns 清理注销函数
 */
export function setupRuntimeInspectionGuard(
  isDev: boolean = typeof import.meta !== 'undefined' && Boolean(import.meta.env?.DEV)
): () => void {
  // 开发模式放行，保留正常调试体验
  if (isDev) {
    return () => {};
  }

  if (typeof window === 'undefined') {
    return () => {};
  }

  const handleContextMenu = (e: MouseEvent): void => {
    e.preventDefault();
  };

  const handleKeyDown = (e: KeyboardEvent): void => {
    if (isDevToolsShortcut(e)) {
      e.preventDefault();
      e.stopPropagation();
    }
  };

  window.addEventListener('contextmenu', handleContextMenu, { capture: true });
  window.addEventListener('keydown', handleKeyDown, { capture: true });

  return () => {
    window.removeEventListener('contextmenu', handleContextMenu, { capture: true });
    window.removeEventListener('keydown', handleKeyDown, { capture: true });
  };
}
