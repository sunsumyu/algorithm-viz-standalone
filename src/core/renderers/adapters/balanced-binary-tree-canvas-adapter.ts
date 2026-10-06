/**
 * 平衡二叉树表现层适配器 (Balanced Binary Tree Canvas & Metrics Adapter)
 * Matt Pocock 深模块设计：将二叉树拓扑沙盘、指标卡片与调用栈追踪完全解耦
 */

import { TreeCanvasAdapter } from './tree-canvas-adapter';
import { renderTreeSvg } from '../../../algorithms/categories/tree/tree-036-037/tree-036-037-shared';
import { RecursiveCallTraceAdapter } from './recursive-call-trace-adapter';
import {
  BalancedTree037Step,
  collectTreeValues,
} from './balanced-binary-tree-step-compiler';

export class BalancedBinaryTreeCanvasAdapter {
  /**
   * Card 1: 表现层画板渲染器 (Presentation Canvas Renderer)
   */
  static renderCanvas(container: HTMLElement, step: BalancedTree037Step): void {
    if (step.tree) {
      const isDone =
        step.decision.includes('完成') ||
        step.decision.includes('最终判定') ||
        step.decision.includes('完毕') ||
        step.statusBadge?.type === 'success' ||
        step.statusBadge?.type === 'danger';
      const allTreeVals = collectTreeValues(step.tree);
      let current = step.current;
      let visitedNodes = step.visitedNodes;
      const secondaryHighlightedNodes =
        step.secondaryCurrent != null ? [step.secondaryCurrent] : [];

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
        primaryColor: '#f59e0b',
        secondaryColor: '#38bdf8',
        visitedColor: '#34d399',
      });
    } else if ((step.extraData as any)?.treeNodes) {
      const treeNodes = (step.extraData as any).treeNodes;
      container.innerHTML = `
        <div style="display: flex; justify-content: center; align-items: center; width: 100%; height: 100%; min-height: 280px; box-sizing: border-box; padding: 8px;">
          ${renderTreeSvg(treeNodes, step.activeNodeId ?? step.current, step.secondaryNodeId ?? step.secondaryCurrent)}
        </div>
      `;
    } else {
      container.innerHTML = `
        <div style="display: flex; flex-direction: column; align-items: center; justify-content: center; height: 260px; width: 100%;">
          <svg width="240" height="120" viewBox="0 0 240 120">
            <circle cx="120" cy="50" r="24" fill="#eff6ff" stroke="#3b82f6" stroke-width="2" stroke-dasharray="4,4"/>
            <text x="120" y="55" text-anchor="middle" font-size="11" fill="#3b82f6" font-weight="bold">空树 (Null)</text>
          </svg>
        </div>
      `;
    }
  }

  /**
   * Card 2: 表现层自定义指标与递归推演栈渲染器 (Card 2 Custom Metrics & Trace Renderer)
   */
  static renderCustomMetrics(container: HTMLElement, step: BalancedTree037Step): void {
    if (!container) return;
    container.innerHTML = '';
    container.style.cssText =
      'display: flex; flex-direction: column; gap: 8px; width: 100%; height: 100%; box-sizing: border-box; overflow-y: auto; padding: 4px;';

    // 1. 指标卡片网格
    const statsBox = document.createElement('div');
    statsBox.style.cssText =
      'display: grid; grid-template-columns: repeat(auto-fit, minmax(110px, 1fr)); gap: 6px;';

    const items: Array<{ label: string; value: string; color: string }> = [];
    if (step.metrics) {
      Object.entries(step.metrics).forEach(([k, v]) => {
        let color = '#475569';
        if (k.includes('平衡') || k.includes('判定')) {
          color = String(v).includes('TRUE') || String(v).includes('平衡') ? '#16a34a' : '#dc2626';
        } else if (k.includes('节点')) {
          color = '#d97706';
        } else if (k.includes('高') || k.includes('差')) {
          color = '#0284c7';
        }
        items.push({ label: k, value: String(v), color });
      });
    }

    items.forEach((item) => {
      const card = document.createElement('div');
      card.style.cssText =
        'background: #ffffff; border: 1px solid #e2e8f0; border-radius: 6px; padding: 6px 8px; box-shadow: 0 1px 2px rgba(0,0,0,0.03);';
      card.innerHTML = `
        <div style="font-size: 10.5px; color: #64748b; font-weight: 500;">${item.label}</div>
        <div style="font-size: 12px; font-weight: 700; color: ${item.color}; margin-top: 2px; font-family: 'JetBrains Mono', monospace; word-break: break-all;">${item.value}</div>
      `;
      statsBox.appendChild(card);
    });
    if (items.length > 0) {
      container.appendChild(statsBox);
    }

    // 2. Stage 3 显式栈状态 (若存在)
    if (step.stackState && step.stackState.length > 0) {
      const stackBox = document.createElement('div');
      stackBox.style.cssText =
        'background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 6px; padding: 6px 8px; font-size: 11px;';
      stackBox.innerHTML = `
        <div style="font-weight: 600; color: #475569; margin-bottom: 4px;">🥞 后序显式栈 (Size: ${step.stackState.length})</div>
        <div style="display: flex; gap: 4px; flex-wrap: wrap;">
          ${step.stackState.map((val, idx) => `<span style="padding: 2px 6px; border-radius: 4px; font-family: monospace; font-size: 11px; font-weight: 600; background: ${idx === step.stackState!.length - 1 ? '#dbeafe; color: #1d4ed8; border: 1px solid #93c5fd;' : '#ffffff; color: #334155; border: 1px solid #cbd5e1;'}">Node(${val})</span>`).join('')}
        </div>
      `;
      container.appendChild(stackBox);
    }

    // 3. 递归调用推演跟踪树 (Recursive Call Trace)
    if (step.callTrace) {
      const traceHost = document.createElement('div');
      traceHost.className = 'balanced-tree-trace-host';
      traceHost.style.cssText = 'flex: 1; min-height: 140px; overflow: hidden;';
      container.appendChild(traceHost);
      RecursiveCallTraceAdapter.render(traceHost, step.callTrace, {
        title:
          step.stageId === 'stage-2'
            ? '⚡ -1 剪枝击穿递归推演栈 (LC 110 最优解)'
            : '🌳 Info 二元组自底向上递归推演栈 (Tree DP Info)',
        theme: 'light',
        maxHeight: '100%',
        showTerminalHeader: true,
      });
    }

    // 4. 当前决策与操作动作总结
    const isDone =
      step.action === 'done' ||
      step.statusBadge?.type === 'success' ||
      step.statusBadge?.type === 'danger';
    const summaryBox = document.createElement('div');
    summaryBox.style.cssText = `background: ${isDone ? '#f0fdf4' : '#f8fafc'}; padding: 8px 10px; border-radius: 6px; border: 1px solid ${isDone ? '#86efac' : '#e2e8f0'}; font-size: 12px; line-height: 1.5; color: #334155;`;
    summaryBox.innerHTML = `
      <div style="font-weight: 700; color: ${isDone ? '#16a34a' : '#0284c7'}; margin-bottom: 2px;">⚡ 当前操作动作: ${step.decision}</div>
      <div style="color: #475569;">${step.message}</div>
    `;
    container.appendChild(summaryBox);
  }
}

export const renderBalancedTreeCanvas = BalancedBinaryTreeCanvasAdapter.renderCanvas;
export const renderBalancedCustomMetrics = BalancedBinaryTreeCanvasAdapter.renderCustomMetrics;
