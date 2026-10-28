/**
 * House Robber III Canvas Adapter (LeetCode 337 / Class 037 Code05)
 *
 * 遵循 Matt Pocock 深模块哲学与 Thin Domain Adapter 架构规范 (LOC < 150 行)。
 * Card 1: 委托 renderTreeSvg 渲染树形拓扑、激活高亮与节点 DP 状态徽章；
 * Card 2: 树形 DP 状态转移方程与局部收益监视器 (全景推演树由 Card 1 子视图接管)。
 */

import { Tree036Step, renderTreeSvg } from '../../../algorithms/categories/tree/tree-036-037/tree-036-037-shared';
import { ROB_TREE_NODES } from './house-robber-iii-step-compiler';

export function renderHouseRobberIIICanvas(container: HTMLElement, step: Tree036Step): void {
  const treeNodes = (step.extraData as any)?.treeNodes || ROB_TREE_NODES;
  const badges = (step.extraData as any)?.badges || {};
  const isDone = step.statusBadge?.type === 'success';

  container.innerHTML = `
    <div style="display: flex; justify-content: center; align-items: center; width: 100%; height: 100%; min-height: 280px; box-sizing: border-box; padding: 8px;">
      ${renderTreeSvg(treeNodes, step.activeNodeId, step.secondaryNodeId, isDone ? '#eab308' : '#3b82f6', badges)}
    </div>
  `;
}

export class HouseRobberIIICanvasAdapter {
  static renderCanvas = renderHouseRobberIIICanvas;

  /**
   * Card 2: 树形 DP 状态转移方程与当前收益决策监视器
   * 铁律：全景推演树属于 Card 1 子视图，Card 2 仅承载紧凑指标与方程
   */
  static renderCustomMetrics(container: HTMLElement, step: Tree036Step): void {
    if (!container) return;
    container.innerHTML = '';
    container.style.cssText =
      'width: 100%; height: 100%; box-sizing: border-box; overflow: hidden; padding: 6px 10px; display: flex; flex-direction: column; gap: 8px; justify-content: center;';

    const badges = (step.extraData as any)?.badges || {};
    const curVal = step.activeNodeId ? badges[step.activeNodeId] : null;

    const formulaBox = document.createElement('div');
    formulaBox.style.cssText = 'padding: 8px 12px; border-radius: 8px; background: #f8fafc; border: 1px solid #e2e8f0; font-size: 11px;';
    formulaBox.innerHTML = `
      <div style="font-weight: 700; color: #334155; margin-bottom: 4px; display: flex; justify-content: space-between;">
        <span>📐 树形 DP 状态转移方程 (Tree DP Recurrence)</span>
        <span style="color: #2563eb; font-weight: 700;">${curVal ? `当前节点状态: ${curVal}` : '后序汇聚中'}</span>
      </div>
      <div style="color: #475569; font-family: ui-monospace, monospace; font-size: 10.5px; line-height: 1.5;">
        <div>• 偷当前节点: <span style="color: #d97706; font-weight: 700;">rob = val + left.notRob + right.notRob</span></div>
        <div>• 不偷当前节点: <span style="color: #2563eb; font-weight: 700;">notRob = max(left) + max(right)</span></div>
      </div>
    `;
    container.appendChild(formulaBox);

    const decisionBox = document.createElement('div');
    decisionBox.style.cssText = 'padding: 8px 12px; border-radius: 8px; background: #f0fdf4; border: 1px solid #bbf7d0; font-size: 11.5px; line-height: 1.5; color: #166534;';
    decisionBox.innerHTML = `
      <span style="font-weight: 700; color: #15803d;">💡 当前决策: </span>${step.decision || step.message || '自底向上归约子树最优收益'}
    `;
    container.appendChild(decisionBox);
  }
}
