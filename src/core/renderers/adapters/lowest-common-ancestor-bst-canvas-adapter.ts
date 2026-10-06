/**
 * Lowest Common Ancestor in BST Canvas Adapter (LeetCode 235 / Class 037 Code02)
 *
 * 遵循 Matt Pocock 深模块哲学与 Thin Domain Adapter 架构规范。
 * 纯表现层适配器：委托 renderTreeSvg 渲染二叉搜索树分叉节点与 LCA 激活高亮。
 */

import { Tree036Step, renderTreeSvg } from '../../../algorithms/categories/tree/tree-036-037/tree-036-037-shared';
import { BST_LCA_NODES } from './lowest-common-ancestor-bst-step-compiler';

export function renderLcaBstCanvas(container: HTMLElement, step: Tree036Step): void {
  const treeNodes = (step.extraData as any)?.treeNodes || BST_LCA_NODES;
  container.innerHTML = `
    <div style="display: flex; justify-content: center; align-items: center; width: 100%; height: 100%; min-height: 280px; box-sizing: border-box; padding: 8px;">
      ${renderTreeSvg(treeNodes, step.activeNodeId, step.secondaryNodeId)}
    </div>
  `;
}

export class LowestCommonAncestorBstCanvasAdapter {
  static renderCanvas = renderLcaBstCanvas;
}
