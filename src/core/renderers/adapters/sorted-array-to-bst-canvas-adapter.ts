/**
 * 有序数组转二叉搜索树视觉适配器 (Convert Sorted Array to BST Canvas Adapter)
 * LeetCode 108
 * 负责纯净树沙盘与 Card 2 递归调用栈/三队列 BFS 监视器
 */

import { TreeCanvasAdapter } from './tree-canvas-adapter';
import { RecursiveCallTraceAdapter } from './recursive-call-trace-adapter';
import {
  SortedArrayToBstStep,
  collectTreeValues,
} from './sorted-array-to-bst-step-compiler';

/**
 * Card 1: 纯粹的树形沙盘渲染 (Pure SVG Sandbox)
 */
export function renderSortedArrayToBstCanvas(container: HTMLElement, step: SortedArrayToBstStep): void {
  if (step.tree) {
    const allVals = collectTreeValues(step.tree);
    const isDone = step.action === 'done';
    const visited = isDone ? allVals : (step.visitedNodes ?? []);
    const highlights =
      step.highlightedNodes && step.highlightedNodes.length > 0
        ? step.highlightedNodes
        : step.currentVal != null
        ? [step.currentVal]
        : [];

    TreeCanvasAdapter.renderTree(container, {
      tree: step.tree,
      current: step.currentVal,
      highlightedNodes: highlights,
      visitedNodes: visited,
      primaryColor: '#fbbf24', // 金黄选中节点
      visitedColor: '#10b981', // 翡翠绿完工节点
      secondaryColor: '#3b82f6', // 天蓝辅助节点
    });
  } else {
    container.innerHTML = `
      <div style="display: flex; flex-direction: column; align-items: center; justify-content: center; height: 260px; width: 100%;">
        <svg width="240" height="120" viewBox="0 0 240 120">
          <circle cx="120" cy="50" r="24" fill="#eff6ff" stroke="#3b82f6" stroke-width="2" stroke-dasharray="4,4"/>
          <text x="120" y="55" text-anchor="middle" font-size="11" fill="#3b82f6" font-weight="bold">分治准备中</text>
        </svg>
        <span style="font-size: 11px; color: #64748b; margin-top: 8px;">即将从区间中点选取根节点...</span>
      </div>
    `;
  }
}

/**
 * Card 2: 领域指标监控与递归调用栈沙盘 (Custom Metrics & Recursive Call Trace / Queue Monitor)
 */
export function renderSortedArrayToBstCustomMetrics(container: HTMLElement, step: SortedArrayToBstStep): void {
  container.innerHTML = '';
  container.className = 'p-3 flex flex-col gap-3 min-h-[300px] overflow-y-auto';

  // 1. 顶部 4 维核心数值卡片网格
  const metricGrid = document.createElement('div');
  metricGrid.className = 'grid grid-cols-2 sm:grid-cols-4 gap-2 flex-shrink-0';
  metricGrid.innerHTML = `
    <div class="p-2 rounded-lg bg-slate-800/80 border border-slate-700/60 flex flex-col justify-between">
      <span class="text-[10px] text-slate-400">当前分治区间:</span>
      <span class="text-sm font-bold text-sky-400 font-mono">${step.left >= 0 && step.right >= 0 ? `[${step.left}..${step.right}]` : '—'}</span>
    </div>
    <div class="p-2 rounded-lg bg-slate-800/80 border border-slate-700/60 flex flex-col justify-between">
      <span class="text-[10px] text-slate-400">中点索引 mid:</span>
      <span class="text-sm font-bold text-amber-400 font-mono">${step.mid != null ? `mid=${step.mid}` : '—'}</span>
    </div>
    <div class="p-2 rounded-lg bg-slate-800/80 border border-slate-700/60 flex flex-col justify-between">
      <span class="text-[10px] text-slate-400">选中节点值:</span>
      <span class="text-sm font-bold text-emerald-400 font-mono">${step.currentVal != null ? `${step.currentVal}` : '—'}</span>
    </div>
    <div class="p-2 rounded-lg bg-slate-800/80 border border-slate-700/60 flex flex-col justify-between">
      <span class="text-[10px] text-slate-400">当前动作阶段:</span>
      <span class="text-sm font-bold text-indigo-400 font-mono">${step.action.toUpperCase()}</span>
    </div>
  `;
  container.appendChild(metricGrid);

  // 2. 中部：Stage 1/2 递归调用栈踪迹监控沙盘 VS Stage 3 显式三队列状态监控
  if (step.bfsQueues) {
    const queueBox = document.createElement('div');
    queueBox.className = 'p-2.5 rounded-lg bg-slate-800/70 border border-slate-700/60 flex-shrink-0';
    queueBox.innerHTML = `
      <div class="text-[11px] font-bold text-slate-300 mb-1.5 flex items-center gap-1.5">
        <span>🥞 三队列显式 BFS 状态 (Explicit Queues)</span>
        <span class="text-[10px] text-slate-400 font-normal">(O(N) 零递归栈层序构建)</span>
      </div>
      <div class="flex flex-col gap-1 text-xs font-mono">
        <div class="flex items-center gap-2">
          <span class="text-slate-400 w-24">nodeQueue:</span>
          <span class="text-amber-300 font-bold">[${step.bfsQueues.nodeVals.join(', ')}]</span>
        </div>
        <div class="flex items-center gap-2">
          <span class="text-slate-400 w-24">leftQueue:</span>
          <span class="text-sky-300">[${step.bfsQueues.leftRanges.join(', ')}]</span>
        </div>
        <div class="flex items-center gap-2">
          <span class="text-slate-400 w-24">rightQueue:</span>
          <span class="text-teal-300">[${step.bfsQueues.rightRanges.join(', ')}]</span>
        </div>
      </div>
    `;
    container.appendChild(queueBox);
  } else if (step.callTrace) {
    const traceBox = document.createElement('div');
    traceBox.className =
      'flex-1 min-h-[160px] max-h-[260px] overflow-hidden flex flex-col rounded-lg bg-slate-800/60 border border-slate-700/50';
    RecursiveCallTraceAdapter.render(traceBox, step.callTrace);
    container.appendChild(traceBox);
  }

  // 3. 底部推演决策卡片
  const isDone = step.action === 'done';
  const summaryBox = document.createElement('div');
  summaryBox.className = `p-2.5 rounded-lg border text-xs leading-relaxed flex-shrink-0 ${
    isDone
      ? 'bg-emerald-950/30 border-emerald-800/60 text-emerald-200'
      : 'bg-slate-800/50 border-slate-700/40 text-slate-300'
  }`;
  summaryBox.innerHTML = `
    <div class="font-bold mb-1 ${isDone ? 'text-emerald-400' : 'text-cyan-400'}">⚡ 决策推演: ${step.decision}</div>
    <div class="text-slate-400">${step.message}</div>
  `;
  container.appendChild(summaryBox);
}

export const SortedArrayToBstCanvasAdapter = {
  renderCanvas: renderSortedArrayToBstCanvas,
  renderCustomMetrics: renderSortedArrayToBstCustomMetrics,
};
