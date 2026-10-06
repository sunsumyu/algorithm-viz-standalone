/**
 * House Robber III Canvas Adapter (LeetCode 337 / Class 037 Code05)
 *
 * 遵循 Matt Pocock 深模块哲学与 Thin Domain Adapter 架构规范。
 * 纯表现层适配器：委托 renderTreeSvg 渲染树形拓扑与激活节点高亮。
 */

import { Tree036Step, renderTreeSvg } from '../../../algorithms/categories/tree/tree-036-037/tree-036-037-shared';
import { ROB_TREE_NODES } from './house-robber-iii-step-compiler';

export function renderHouseRobberIIICanvas(container: HTMLElement, step: Tree036Step): void {
  const treeNodes = (step.extraData as any)?.treeNodes || ROB_TREE_NODES;
  container.innerHTML = `
    <div style="display: flex; justify-content: center; align-items: center; width: 100%; height: 100%; min-height: 280px; box-sizing: border-box; padding: 8px;">
      ${renderTreeSvg(treeNodes, step.activeNodeId, step.secondaryNodeId)}
    </div>
  `;
}

export class HouseRobberIIICanvasAdapter {
  static renderCanvas = renderHouseRobberIIICanvas;
}
