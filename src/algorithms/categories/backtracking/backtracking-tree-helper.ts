/**
 * 回溯决策树共享门面模块 (Backtracking Tree Facade)
 * 遵循外观模式 (Facade Pattern) 与深模块原则 (Deep Module)：
 * 核心算法数学计算委托给 TreeLayoutEngine，
 * 视觉呈现与手势交互委托给 BacktrackTreeVisualAdapter。
 */

import {
  BacktrackTreeNode,
  BacktrackTreeStep,
  TreeLayoutEngine,
  LEVEL_HEIGHT,
  NODE_RADIUS,
  HORIZONTAL_GAP
} from './tree-layout-engine';

import {
  BacktrackTreeVisualAdapter,
  RenderTreeOptions
} from './backtrack-tree-visual-adapter';

export type {
  BacktrackTreeNode,
  BacktrackTreeStep,
  RenderTreeOptions
};

export {
  LEVEL_HEIGHT,
  NODE_RADIUS,
  HORIZONTAL_GAP,
  TreeLayoutEngine,
  BacktrackTreeVisualAdapter
};

/* ── 扁平化节点列表 ─────────────────────────────────────────── */
export function flattenTree(root: BacktrackTreeNode): BacktrackTreeNode[] {
  return TreeLayoutEngine.flatten(root);
}

/* ── 决策树布局计算 ─────────────────────────────────────────── */
export function layoutTree(
  root: BacktrackTreeNode,
  options?: { horizontalGap?: number; levelHeight?: number }
): void {
  TreeLayoutEngine.layout(root, options);
}

/* ── 路径节点溯源判断 ───────────────────────────────────────── */
export function isNodeOnPath(
  nodeId: string,
  nodeMap: Map<string, BacktrackTreeNode>,
  currentNodeId: string
): boolean {
  return TreeLayoutEngine.isNodeOnPath(nodeId, nodeMap, currentNodeId);
}

/* ── 视口状态存取与重置 ─────────────────────────────────────── */
export function getContainerViewState(container: HTMLElement) {
  return BacktrackTreeVisualAdapter.getContainerViewState(container);
}

export function resetContainerViewState(container: HTMLElement | null): void {
  BacktrackTreeVisualAdapter.resetContainerViewState(container);
}

/* ── 确保样式注入 ───────────────────────────────────────────── */
export function ensureBacktrackTreeCSS(prefix: string = 'cs'): void {
  BacktrackTreeVisualAdapter.ensureBacktrackTreeCSS(prefix);
}

/* ── 渲染 SVG 决策树 ────────────────────────────────────────── */
export function renderBacktrackTree(options: RenderTreeOptions): void {
  BacktrackTreeVisualAdapter.render(options);
}

/* ── 渲染步骤日志流 ─────────────────────────────────────────── */
export function renderBacktrackLog(
  logEl: HTMLElement | null,
  steps: BacktrackTreeStep[],
  currentIndex: number,
  cssPrefix: string = 'cs'
): void {
  if (!logEl) return;
  ensureBacktrackTreeCSS(cssPrefix);
  logEl.innerHTML = '';
  steps.slice(0, currentIndex + 1).forEach((s, i) => {
    const line = document.createElement('div');
    line.className =
      i === currentIndex
        ? `${cssPrefix}-log-line ${cssPrefix}-log-active`
        : `${cssPrefix}-log-line`;
    line.innerHTML = `<span class="${cssPrefix}-log-num">${String(i + 1).padStart(
      2,
      '0'
    )}.</span> ${s.message}`;
    logEl?.appendChild(line);
  });
  logEl.scrollTop = logEl.scrollHeight;
}

/* ── 获取决策树 CSS 模板 ────────────────────────────────────── */
export function getBacktrackTreeCSS(prefix: string = 'cs'): string {
  return BacktrackTreeVisualAdapter.getBacktrackTreeCSS(prefix);
}
