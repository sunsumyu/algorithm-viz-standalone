/**
 * Trim BST Canvas Adapter (LeetCode 669 / Class 037 Code06)
 *
 * 统一深模块适配器：委托 TreeCanvasAdapter 渲染修剪前后拓扑与指针流动，
 * 自动获得树上挂树子视图、空调用探针 (∅ 虚线) 与区间指针标签。
 */

import { Tree036Step } from '../../../algorithms/categories/tree/tree-036-037/tree-036-037-shared';
import { TreeCanvasAdapter } from './tree-canvas-adapter';

export function renderTrimBstCanvas(container: HTMLElement, step: Tree036Step): void {
  const current = typeof step.current === 'number' ? step.current : null;
  const isPrune = step.statusBadge?.type === 'danger';

  // 指针标签：当前考察节点标 root，被裁剪节点标 ✂️ (按节点 id 键控，防 id/val 错位)
  const labels = new Map<number | string, string>();
  const activeId = (step as any).activeNodeId;
  if (current != null) labels.set(current, 'root');
  if (activeId != null) labels.set(activeId, 'root');
  const secondary = step.secondaryHighlightedNodes ?? [];
  for (const v of secondary) labels.set(v, '✂️');

  TreeCanvasAdapter.renderTree(container, {
    tree: (step as any).tree ?? null,
    current,
    highlightedNodes: current != null ? [current] : [],
    secondaryHighlightedNodes: secondary,
    primaryColor: isPrune ? '#ef4444' : '#3b82f6',
    secondaryColor: '#f59e0b',
    labels: labels.size > 0 ? labels : undefined,
    nullProbe: (step as any).nullProbe,
  });
}

export class TrimBstCanvasAdapter {
  static renderCanvas = renderTrimBstCanvas;
}
