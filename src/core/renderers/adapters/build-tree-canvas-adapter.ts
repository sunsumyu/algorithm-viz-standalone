/**
 * 从前序/后序与中序构造二叉树视觉与看板呈现适配器 (BuildTreeCanvasAdapter)
 *
 * 遵循 Matt Pocock 深模块规范与 Zero-Subbox 表现层契约，
 * 封装树形拓扑渐进生长画布、显式栈监控及递归调用栈推演。
 */

import { TreeCanvasAdapter } from './tree-canvas-adapter';
import {
  RecursiveCallTraceAdapter,
} from './recursive-call-trace-adapter';
import {
  BTStep,
  collectTreeValues,
} from './build-tree-step-compiler';

export class BuildTreeCanvasAdapter {
  /**
   * Card 1: 纯粹的树形沙盘渲染 (Pure SVG/Canvas Sandbox)
   * 绝对零套娃、零直接修改 #dsp-custom-metrics-container、零指标覆盖
   */
  public static renderCanvas(container: HTMLElement, step: BTStep): void {
    if (step.tree) {
      const allTreeVals = collectTreeValues(step.tree);
      const isDone = step.action === 'done';
      const visited = isDone
        ? allTreeVals
        : (step.visitedNodes ?? allTreeVals.filter((v) => v !== step.rootVal));

      const primaryNodes = step.highlightedNodes && step.highlightedNodes.length > 0
        ? step.highlightedNodes
        : (step.rootVal != null ? [step.rootVal] : []);

      TreeCanvasAdapter.renderTree(container, {
        tree: step.tree,
        current: step.rootVal,
        highlightedNodes: primaryNodes,
        visitedNodes: visited,
        primaryColor: '#fbbf24',
        visitedColor: '#34d399',
        secondaryColor: '#60a5fa',
      });
    } else {
      container.innerHTML = `
        <div style="display: flex; flex-direction: column; align-items: center; justify-content: center; height: 260px; width: 100%;">
          <svg width="240" height="120" viewBox="0 0 240 120">
            <circle cx="120" cy="50" r="24" fill="#eff6ff" stroke="#3b82f6" stroke-width="2" stroke-dasharray="4,4"/>
            <text x="120" y="55" text-anchor="middle" font-size="11" fill="#3b82f6" font-weight="bold">重构准备中</text>
          </svg>
          <span style="font-size: 11px; color: #64748b; margin-top: 8px;">即将从遍历序列定位根节点...</span>
        </div>
      `;
    }
  }

  /**
   * Card 2: 领域指标监控与递归调用栈沙盘 (Custom Metrics & Recursive Call Trace / Stack Monitor)
   */
  public static renderCustomMetrics(container: HTMLElement, step: BTStep): void {
    container.innerHTML = '';
    container.className = 'p-3 flex flex-col gap-3 min-h-[300px] overflow-y-auto';

    const isStackStage = step.stackState !== undefined;

    // 1. 顶部 4 维核心数值卡片网格
    const metricGrid = document.createElement('div');
    metricGrid.className = 'grid grid-cols-2 sm:grid-cols-4 gap-2 flex-shrink-0';
    metricGrid.innerHTML = `
      <div class="p-2 rounded-lg bg-slate-800/80 border border-slate-700/60 flex flex-col justify-between">
        <span class="text-[10px] text-slate-400">当前锁定根:</span>
        <span class="text-sm font-bold text-amber-400 font-mono">${step.rootVal != null ? `${step.rootVal}` : '—'}</span>
      </div>
      <div class="p-2 rounded-lg bg-slate-800/80 border border-slate-700/60 flex flex-col justify-between">
        <span class="text-[10px] text-slate-400">前序/后序区间:</span>
        <span class="text-sm font-bold text-blue-400 font-mono">${step.pL >= 0 ? `[${step.pL}..${step.pR}]` : '—'}</span>
      </div>
      <div class="p-2 rounded-lg bg-slate-800/80 border border-slate-700/60 flex flex-col justify-between">
        <span class="text-[10px] text-slate-400">中序区间:</span>
        <span class="text-sm font-bold text-teal-400 font-mono">${step.iL >= 0 ? `[${step.iL}..${step.iR}]` : '—'}</span>
      </div>
      <div class="p-2 rounded-lg bg-slate-800/80 border border-slate-700/60 flex flex-col justify-between">
        <span class="text-[10px] text-slate-400">${isStackStage ? '中序指针 inIdx:' : '左子树长度:'}</span>
        <span class="text-sm font-bold text-indigo-400 font-mono">${isStackStage ? `inIdx=${step.inIdx ?? 0}` : `${step.leftLen}`}</span>
      </div>
    `;
    container.appendChild(metricGrid);

    // 2. 中部：Stage 1/2 递归调用栈踪迹监控沙盘 VS Stage 3 显式遍历栈监控
    if (isStackStage) {
      const stackBox = document.createElement('div');
      stackBox.className = 'p-2.5 rounded-lg bg-slate-800/70 border border-slate-700/60 flex-shrink-0';
      stackBox.innerHTML = `
        <div class="text-[11px] font-bold text-slate-300 mb-1.5 flex items-center gap-1.5">
          <span>🥞 显式单调栈状态 (Explicit Stack)</span>
          <span class="text-[10px] text-slate-400 font-normal">(O(N) 零递归栈模拟)</span>
        </div>
        <div class="flex items-center gap-2 text-xs font-mono">
          <span class="text-slate-400">栈内元素 (栈底 ➔ 栈顶):</span>
          <div class="flex items-center gap-1 flex-wrap">
            ${(step.stackState && step.stackState.length > 0)
              ? step.stackState.map((v, idx) => `
                  <span class="px-2 py-0.5 rounded ${idx === step.stackState!.length - 1 ? 'bg-amber-950/80 border border-amber-500/70 text-amber-300 font-bold' : 'bg-blue-950/70 border border-blue-600/60 text-blue-300 font-bold'}">
                    ${v}${idx === step.stackState!.length - 1 ? ' (顶)' : ''}
                  </span>
                `).join('')
              : '<span class="text-slate-500 italic">空栈 []</span>'}
          </div>
        </div>
      `;
      container.appendChild(stackBox);
    } else if (step.callTrace) {
      const traceBox = document.createElement('div');
      traceBox.className = 'flex-1 min-h-[160px] max-h-[260px] overflow-hidden flex flex-col rounded-lg bg-slate-800/60 border border-slate-700/50';
      RecursiveCallTraceAdapter.render(traceBox, step.callTrace);
      container.appendChild(traceBox);
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

// 向后兼容函数导出
export const renderBuildTreeCanvas = BuildTreeCanvasAdapter.renderCanvas;
export const renderBuildTreeCustomMetrics = BuildTreeCanvasAdapter.renderCustomMetrics;
