/**
 * 左叶子之和画布适配器 (Sum of Left Leaves Canvas Adapter)
 * LeetCode 404
 * 负责纯净树沙盘与空树占位呈现 (Double Invariant Guard)
 */

import { TreeCanvasAdapter } from './tree-canvas-adapter';
import { LeftLeavesStep, collectTreeValues } from './left-leaves-step-compiler';

export function renderLeftLeavesCanvas(container: HTMLElement, step: LeftLeavesStep): void {
  if (step.tree) {
    const isDone =
      step.decision.includes('完成') ||
      step.decision.includes('结束') ||
      step.decision.includes('排空') ||
      step.statusBadge?.type === 'success';
    const allTreeVals = collectTreeValues(step.tree);
    let current = step.current;
    let visitedNodes = step.visitedNodes;
    let secondaryHighlightedNodes = step.leftNodes
      ? Array.from(step.leftNodes)
      : step.secondaryHighlightedNodes || [];

    if (isDone) {
      if (current === null) {
        current = step.tree.val;
      }
      if (!visitedNodes || visitedNodes.length === 0) {
        visitedNodes = allTreeVals;
      }
    }

    TreeCanvasAdapter.renderTree(container, {
      tree: step.tree,
      current,
      visitedNodes: visitedNodes && visitedNodes.length > 0 ? visitedNodes : undefined,
      secondaryHighlightedNodes: secondaryHighlightedNodes.length > 0 ? secondaryHighlightedNodes : [],
      primaryColor: '#fbbf24',
      secondaryColor: '#10b981',
      visitedColor: '#34d399',
    });
  } else {
    container.innerHTML = `
      <div style="display: flex; flex-direction: column; align-items: center; justify-content: center; height: 260px; width: 100%;">
        <svg width="240" height="120" viewBox="0 0 240 120">
          <circle cx="120" cy="50" r="24" fill="#eff6ff" stroke="#3b82f6" stroke-width="2" stroke-dasharray="4,4"/>
          <text x="120" y="55" text-anchor="middle" font-size="11" fill="#3b82f6" font-weight="bold">空树 (Null)</text>
        </svg>
        <span style="font-size: 11px; color: #64748b; margin-top: 8px;">空树无任何节点，左叶子之和为 0</span>
      </div>
    `;
  }
}

export const LeftLeavesCanvasAdapter = {
  renderCanvas: renderLeftLeavesCanvas,
};
