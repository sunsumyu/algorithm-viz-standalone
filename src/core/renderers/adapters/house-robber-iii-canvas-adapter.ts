/**
 * House Robber III Canvas Adapter (LeetCode 337 / Class 037 Code05)
 *
 * 遵循 Matt Pocock 深模块哲学与 Thin Domain Adapter 架构规范 (LOC < 150 行)。
 * Card 1: 委托 renderTreeSvg 渲染树形拓扑、激活高亮与节点 DP 状态徽章；
 * Card 2: 统一接入全库标准顶层抽象 RecursiveCallTraceAdapter 呈现自底向上归约调用树。
 */

import { Tree036Step, renderTreeSvg } from '../../../algorithms/categories/tree/tree-036-037/tree-036-037-shared';
import { ROB_TREE_NODES } from './house-robber-iii-step-compiler';
import { RecursiveCallTraceAdapter } from './recursive-call-trace-adapter';

function renderDecisionHeader(step: Tree036Step): HTMLDivElement {
  const card = document.createElement('div');
  card.style.cssText =
    'background: #ffffff; border: 1px solid #e2e8f0; border-radius: 8px; padding: 7px 10px; box-shadow: 0 1px 2px rgba(0,0,0,0.03); display: flex; flex-direction: column; gap: 3px; flex-shrink: 0;';

  const bType = step.statusBadge?.type || 'info';
  const badgeStyle =
    bType === 'success'
      ? 'background: #dcfce7; color: #15803d; border: 1px solid #86efac;'
      : bType === 'warning'
      ? 'background: #fef3c7; color: #b45309; border: 1px solid #fde68a;'
      : 'background: #eff6ff; color: #1d4ed8; border: 1px solid #bfdbfe;';

  card.innerHTML = `
    <div style="display: flex; align-items: center; justify-content: space-between;">
      <span style="font-size: 11px; font-weight: 700; color: #475569; display: flex; align-items: center; gap: 4px;">
        <span>💰</span> <span>当前状态转移决策</span>
      </span>
      ${step.statusBadge ? `<span style="font-size: 10px; font-weight: 700; padding: 2px 7px; border-radius: 999px; ${badgeStyle}">${step.statusBadge.text}</span>` : ''}
    </div>
    <div style="font-size: 11.5px; font-weight: 600; color: #1e293b; line-height: 1.35;">${step.decision || '推演执行中...'}</div>
    ${step.message ? `<div style="font-size: 10.5px; color: #64748b; line-height: 1.3;">${step.message}</div>` : ''}
  `;
  return card;
}

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
   * Card 2: 挂接全库统一顶层抽象 RecursiveCallTraceAdapter 呈现树形 DP 调用树
   */
  static renderCustomMetrics(container: HTMLElement, step: Tree036Step): void {
    if (!container) return;
    container.innerHTML = '';
    container.style.cssText =
      'display: flex; flex-direction: column; gap: 6px; width: 100%; height: 100%; box-sizing: border-box; overflow: hidden; padding: 4px;';

    // 1. 顶部决策条
    container.appendChild(renderDecisionHeader(step));

    // 2. 核心：标准 RecursiveCallTrace 递归树
    const traceBox = document.createElement('div');
    traceBox.style.cssText =
      'flex: 1; min-height: 0; width: 100%; overflow: hidden; display: flex; flex-direction: column;';
    container.appendChild(traceBox);

    const callTrace = (step.extraData as any)?.callTrace;
    RecursiveCallTraceAdapter.render(traceBox, callTrace || null, {
      theme: 'light',
      title: '树形 DP 递归状态转移调用树 (Tree DP Call Trace)',
      showTerminalHeader: true,
    });
  }
}
