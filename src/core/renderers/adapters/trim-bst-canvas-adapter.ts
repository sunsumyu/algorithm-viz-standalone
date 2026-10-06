/**
 * Trim BST Canvas Adapter (LeetCode 669 / Class 037 Code06)
 *
 * 遵循 Matt Pocock 深模块哲学与 Thin Domain Adapter 架构规范。
 * 纯表现层适配器：委托 renderTreeSvg 渲染二叉搜索树修剪前后拓扑。
 */

import { Tree036Step, renderTreeSvg } from '../../../algorithms/categories/tree/tree-036-037/tree-036-037-shared';
import { TRIM_BST_NODES } from './trim-bst-step-compiler';

export function renderTrimBstCanvas(container: HTMLElement, step: Tree036Step): void {
  const treeNodes = (step.extraData as any)?.treeNodes || TRIM_BST_NODES;
  container.innerHTML = `
    <div style="display: flex; justify-content: center; align-items: center; width: 100%; height: 100%; min-height: 280px; box-sizing: border-box; padding: 8px;">
      ${renderTreeSvg(treeNodes, step.activeNodeId, step.secondaryNodeId)}
    </div>
  `;
}

export class TrimBstCanvasAdapter {
  static renderCanvas = renderTrimBstCanvas;
}
