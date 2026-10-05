/**
 * 二叉树中的最大路径和 (Binary Tree Maximum Path Sum · LeetCode 124) 视觉呈现与监控适配器
 * Card 1: 纯净二叉树拓扑与最优路径高亮
 * Card 2: 4 格 KPI 指标 + 最优路径 + 推演栈 / Info 二元组 / 显式栈
 */

import { TreeCanvasAdapter } from './tree-canvas-adapter';
import { TreeNode } from '../../../algorithms/categories/tree/tree-template';
import { collectTreeValues } from './max-path-sum-step-compiler';
import type { PathSumStep } from './max-path-sum-step-compiler';
import { RecursiveCallTraceAdapter } from './recursive-call-trace-adapter';

export function renderMaxPathSumCanvas(container: HTMLElement, step: PathSumStep): void {
  if (step.tree) {
    const isDone = step.decision.includes('完毕') || step.decision.includes('完成') || step.statusBadge?.type === 'success';
    const allTreeVals = collectTreeValues(step.tree);
    let current = step.currentNode;
    let visitedNodes = step.visitedNodes;

    if (isDone) {
      if (current === null && step.tree) {
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
      secondaryHighlightedNodes: step.bestArchPath && step.bestArchPath.length > 0 ? step.bestArchPath : [],
      primaryColor: '#fbbf24',
      secondaryColor: '#34d399',
      visitedColor: '#38bdf8',
    });
  } else {
    container.innerHTML = `
      <div style="display: flex; flex-direction: column; align-items: center; justify-content: center; height: 260px; width: 100%;">
        <svg width="240" height="120" viewBox="0 0 240 120">
          <circle cx="120" cy="50" r="24" fill="#eff6ff" stroke="#3b82f6" stroke-width="2" stroke-dasharray="4,4"/>
          <text x="120" y="55" text-anchor="middle" font-size="11" fill="#3b82f6" font-weight="bold">空树或初始化</text>
        </svg>
        <span style="font-size: 11px; color: #64748b; margin-top: 8px;">准备自底向上后序遍历计算最大路径和...</span>
      </div>
    `;
  }
}

/**
 * Card 2: 自定义运行监控与推演面板 (4 格指标 + 最优路径 + 推演栈 / Info 二元组 / 显式栈)
 */
export function renderMaxPathSumCustomMetrics(container: HTMLElement, step: PathSumStep): void {
  container.innerHTML = '';
  container.className = 'flex flex-col gap-2 p-2 h-full overflow-y-auto text-slate-200';

  // 1. 顶部 4 格 KPI 卡片
  const metricsGrid = document.createElement('div');
  metricsGrid.className = 'grid grid-cols-4 gap-2 flex-shrink-0';
  metricsGrid.innerHTML = `
    <div class="flex flex-col p-2 rounded-lg bg-slate-800/80 border border-slate-700/60 shadow-sm">
      <span class="text-[11px] text-slate-400 font-medium">全局最大路径和</span>
      <span class="text-base font-bold font-mono text-emerald-400">
        ${step.maxGlobalSum === -Infinity ? '—' : step.maxGlobalSum}
      </span>
    </div>
    <div class="flex flex-col p-2 rounded-lg bg-slate-800/80 border border-slate-700/60 shadow-sm">
      <span class="text-[11px] text-slate-400 font-medium">当前拱形和</span>
      <span class="text-base font-bold font-mono text-cyan-400">
        ${step.currentArchSum !== 0 ? step.currentArchSum : '—'}
      </span>
    </div>
    <div class="flex flex-col p-2 rounded-lg bg-slate-800/80 border border-slate-700/60 shadow-sm">
      <span class="text-[11px] text-slate-400 font-medium">左单侧有效增益</span>
      <span class="text-base font-bold font-mono text-amber-400">
        ${step.leftGain !== undefined ? step.leftGain : '—'}
      </span>
    </div>
    <div class="flex flex-col p-2 rounded-lg bg-slate-800/80 border border-slate-700/60 shadow-sm">
      <span class="text-[11px] text-slate-400 font-medium">右单侧有效增益</span>
      <span class="text-base font-bold font-mono text-indigo-400">
        ${step.rightGain !== undefined ? step.rightGain : '—'}
      </span>
    </div>
  `;
  container.appendChild(metricsGrid);

  // 2. 最优全路径展示区
  if (step.bestArchPath && step.bestArchPath.length > 0) {
    const pathBox = document.createElement('div');
    pathBox.className = 'p-2 rounded-lg bg-slate-800/60 border border-slate-700/50 flex items-center justify-between flex-shrink-0';
    pathBox.innerHTML = `
      <div class="flex items-center gap-2">
        <span class="text-[11px] text-slate-400">🏔️ 当前最优全路径:</span>
        <div class="flex items-center gap-1">
          ${step.bestArchPath.map((v, i) => `
            <span class="inline-flex items-center justify-center px-1.5 py-0.5 rounded bg-emerald-950/60 border border-emerald-600/70 font-mono text-xs font-bold text-emerald-300">
              ${v}
            </span>
            ${i < step.bestArchPath.length - 1 ? '<span class="text-slate-500 text-xs">➔</span>' : ''}
          `).join('')}
        </div>
      </div>
      <span class="text-xs font-mono font-bold text-emerald-400">Sum = ${step.maxGlobalSum}</span>
    `;
    container.appendChild(pathBox);
  }

  // 3. 中间推演区：根据 stageId 呈现推演树、二元组或显式栈
  if (step.stageId === 'stage-2') {
    const infoBox = document.createElement('div');
    infoBox.className = 'p-2.5 rounded-lg bg-slate-800/70 border border-slate-700/60 flex-shrink-0';
    infoBox.innerHTML = `
      <div class="text-[11px] font-bold text-slate-300 mb-1.5 flex items-center gap-1.5">
        <span>📦 树形 DP 二元组 Info 数据流</span>
        <span class="text-[10px] text-slate-400 font-normal">(Zuoshen Class 077 套路)</span>
      </div>
      <div class="grid grid-cols-2 gap-2 text-xs font-mono">
        <div class="p-2 rounded bg-slate-900/60 border border-slate-800 flex flex-col">
          <span class="text-[10px] text-slate-400">子树内部最大全路径和 (maxPathSum):</span>
          <span class="text-sm font-bold text-emerald-400">${step.infoResult ? step.infoResult.maxPathSum : (step.maxGlobalSum === -Infinity ? '—' : step.maxGlobalSum)}</span>
        </div>
        <div class="p-2 rounded bg-slate-900/60 border border-slate-800 flex flex-col">
          <span class="text-[10px] text-slate-400">从根向下延伸单边最大收益 (maxGainFromRoot):</span>
          <span class="text-sm font-bold text-cyan-400">${step.infoResult ? step.infoResult.maxGainFromRoot : (step.currentNode !== null ? (step.currentNode + Math.max(step.leftGain, step.rightGain)) : '—')}</span>
        </div>
      </div>
    `;
    container.appendChild(infoBox);
  } else if (step.stageId === 'stage-3') {
    const stackBox = document.createElement('div');
    stackBox.className = 'p-2.5 rounded-lg bg-slate-800/70 border border-slate-700/60 flex-shrink-0';
    stackBox.innerHTML = `
      <div class="text-[11px] font-bold text-slate-300 mb-1.5 flex items-center gap-1.5">
        <span>🥞 显式栈与增益映射表 (Gain Map)</span>
        <span class="text-[10px] text-slate-400 font-normal">(零系统栈后序遍历)</span>
      </div>
      <div class="flex flex-col gap-1.5 text-xs font-mono">
        <div class="flex items-center gap-2">
          <span class="text-slate-400">显式遍历栈:</span>
          <div class="flex items-center gap-1">
            ${(step.stackState && step.stackState.length > 0)
              ? step.stackState.map(v => `<span class="px-1.5 py-0.5 rounded bg-blue-950/70 border border-blue-600/60 text-blue-300 font-bold">${v}</span>`).join('')
              : '<span class="text-slate-500 italic">空栈 []</span>'}
          </div>
        </div>
        ${step.gainMapState && step.gainMapState.length > 0 ? `
          <div class="flex items-center gap-2 flex-wrap">
            <span class="text-slate-400">已结算单边增益:</span>
            <div class="flex items-center gap-1.5 flex-wrap">
              ${step.gainMapState.map(item => `
                <span class="px-1.5 py-0.5 rounded bg-slate-900 border border-slate-700 text-slate-300">
                  Node(${item.val}) ➔ <strong class="text-amber-400">${item.gain}</strong>
                </span>
              `).join('')}
            </div>
          </div>
        ` : ''}
      </div>
    `;
    container.appendChild(stackBox);
  } else if (step.callTrace) {
    const traceBox = document.createElement('div');
    traceBox.className = 'flex-1 min-h-[160px] max-h-[260px] overflow-hidden flex flex-col rounded-lg bg-slate-800/60 border border-slate-700/50';
    RecursiveCallTraceAdapter.render(traceBox, step.callTrace);
    container.appendChild(traceBox);
  }

  // 4. 当前推演决策总结
  const isDone = step.decision.includes('完成') || step.decision.includes('完毕') || step.statusBadge?.type === 'success';
  const summaryBox = document.createElement('div');
  summaryBox.className = `p-2.5 rounded-lg border text-xs leading-relaxed flex-shrink-0 ${
    isDone ? 'bg-emerald-950/30 border-emerald-800/60 text-emerald-200' : 'bg-slate-800/50 border-slate-700/40 text-slate-300'
  }`;
  summaryBox.innerHTML = `
    <div class="font-bold mb-1 ${isDone ? 'text-emerald-400' : 'text-cyan-400'}">⚡ 当前决策: ${step.decision}</div>
    <div class="text-slate-400">${step.message}</div>
  `;
  container.appendChild(summaryBox);
}

// =========================================================================
// 顶层声明式算法注册 (Register Declarative Algorithm)
// =========================================================================

export class MaxPathSumCanvasAdapter {
  public static renderCanvas = renderMaxPathSumCanvas;
  public static renderCustomMetrics = renderMaxPathSumCustomMetrics;
}
