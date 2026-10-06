/**
 * BST 节点删除画布与指标呈现适配器 (LC 450 · Delete Node in a BST)
 *
 * 遵循深模块架构规范：
 * - 纯净委托 TreeCanvasAdapter 渲染 SVG 树形拓扑
 * - 零内联套娃、零样式冲突、高内聚封装指标卡与 RecursiveCallTrace 栈视图
 */

import { TreeCanvasAdapter } from './tree-canvas-adapter';
import { RecursiveCallTraceAdapter } from './recursive-call-trace-adapter';
import { BSTDeleteStep, collectTreeValues } from './bst-delete-step-compiler';

export class BstDeleteCanvasAdapter {
  /**
   * Card 1: 纯粹的树形沙盘渲染 (Pure SVG Sandbox)
   */
  static renderCanvas(container: HTMLElement, step: BSTDeleteStep): void {
    if (step.tree) {
      const allVals = collectTreeValues(step.tree);
      const isDone = step.action === 'done';
      const visited = isDone ? allVals : (step.visitedNodes ?? []);
      const highlights = step.highlightedNodes && step.highlightedNodes.length > 0
        ? step.highlightedNodes
        : (step.currentVal != null ? [step.currentVal] : []);

      TreeCanvasAdapter.renderTree(container, {
        tree: step.tree,
        current: step.currentVal,
        highlightedNodes: highlights,
        visitedNodes: visited,
        primaryColor: '#ef4444', // 鲜红目标
        visitedColor: '#3b82f6', // 天蓝访问路径
        secondaryColor: '#10b981', // 翡翠绿后继
      });
    } else {
      container.innerHTML = `
        <div style="display: flex; flex-direction: column; align-items: center; justify-content: center; height: 260px; width: 100%;">
          <svg width="240" height="120" viewBox="0 0 240 120">
            <circle cx="120" cy="50" r="24" fill="#fef2f2" stroke="#ef4444" stroke-width="2" stroke-dasharray="4,4"/>
            <text x="120" y="55" text-anchor="middle" font-size="11" fill="#ef4444" font-weight="bold">空二叉树 (null)</text>
          </svg>
          <span style="font-size: 11px; color: #94a3b8; margin-top: 8px;">二叉搜索树为空，无节点可被删除</span>
        </div>
      `;
    }
  }

  /**
   * Card 2: 领域指标监控与递归调用栈沙盘 (Custom Metrics & Recursive Call Trace)
   */
  static renderCustomMetrics(container: HTMLElement, step: BSTDeleteStep): void {
    container.innerHTML = '';
    container.className = 'p-3 flex flex-col gap-3 min-h-[300px] overflow-y-auto';

    // 1. 顶部 4 维核心指标卡片网格
    const metricGrid = document.createElement('div');
    metricGrid.className = 'grid grid-cols-2 sm:grid-cols-4 gap-2 flex-shrink-0';
    metricGrid.innerHTML = `
      <div class="p-2 rounded-lg bg-slate-800/80 border border-slate-700/60 flex flex-col justify-between">
        <span class="text-[10px] text-slate-400">待删目标键:</span>
        <span class="text-sm font-bold text-rose-400 font-mono">${step.targetKey}</span>
      </div>
      <div class="p-2 rounded-lg bg-slate-800/80 border border-slate-700/60 flex flex-col justify-between">
        <span class="text-[10px] text-slate-400">当前探查节点:</span>
        <span class="text-sm font-bold text-sky-400 font-mono">${step.currentVal != null ? `${step.currentVal}` : '—'}</span>
      </div>
      <div class="p-2 rounded-lg bg-slate-800/80 border border-slate-700/60 flex flex-col justify-between">
        <span class="text-[10px] text-slate-400">极小后继节点:</span>
        <span class="text-sm font-bold text-emerald-400 font-mono">${step.successorVal != null ? `${step.successorVal}` : '—'}</span>
      </div>
      <div class="p-2 rounded-lg bg-slate-800/80 border border-slate-700/60 flex flex-col justify-between">
        <span class="text-[10px] text-slate-400">当前操作动作:</span>
        <span class="text-sm font-bold text-amber-400 font-mono">${step.action.toUpperCase()}</span>
      </div>
    `;
    container.appendChild(metricGrid);

    // 2. 中部：结构化调用栈踪迹沙盘 (Stage 1 & 2) 或迭代状态沙盘 (Stage 3)
    if (step.callTrace) {
      const traceBox = document.createElement('div');
      traceBox.className = 'flex-1 min-h-[160px] max-h-[260px] overflow-hidden flex flex-col rounded-lg bg-slate-800/60 border border-slate-700/50';
      RecursiveCallTraceAdapter.render(traceBox, step.callTrace);
      container.appendChild(traceBox);
    } else {
      const iterBox = document.createElement('div');
      iterBox.className = 'p-3 rounded-lg bg-slate-800/60 border border-slate-700/50 text-xs flex flex-col gap-2';
      iterBox.innerHTML = `
        <div class="text-[11px] font-bold text-slate-300">⚡ 双指针迭代状态监视器 (O(1) 空间)</div>
        <div class="flex items-center gap-4 text-xs font-mono">
          <div><span class="text-slate-400">父节点 pre:</span> <span class="text-amber-400 font-bold">${step.parentVal != null ? step.parentVal : 'null (根)'}</span></div>
          <div><span class="text-slate-400">当前游标 cur:</span> <span class="text-sky-400 font-bold">${step.currentVal != null ? step.currentVal : 'null'}</span></div>
        </div>
      `;
      container.appendChild(iterBox);
    }

    // 3. 底部推演决策卡片
    const isDone = step.action === 'done';
    const summaryBox = document.createElement('div');
    summaryBox.className = `p-2.5 rounded-lg border text-xs leading-relaxed flex-shrink-0 ${
      isDone ? 'bg-emerald-950/30 border-emerald-800/60 text-emerald-200' : 'bg-slate-800/50 border-slate-700/40 text-slate-300'
    }`;
    summaryBox.innerHTML = `
      <div class="font-bold mb-1 ${isDone ? 'text-emerald-400' : 'text-cyan-400'}">⚡ 决策推演: ${step.decision}</div>
      <div class="text-slate-400">${step.message}</div>
    `;
    container.appendChild(summaryBox);
  }
}
