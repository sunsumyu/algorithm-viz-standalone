/**
 * 二叉搜索树搜索表现层适配器 (BST Search Canvas & Metrics Adapter)
 * Matt Pocock 深模块设计：将二叉树拓扑沙盘、下潜路径与决策监控彻底解耦封装
 */

import { TreeCanvasAdapter } from './tree-canvas-adapter';
import { RecursiveCallTraceAdapter } from './recursive-call-trace-adapter';
import { BSTSStep } from './bst-search-step-compiler';

export class BstSearchCanvasAdapter {
  /**
   * Card 1: 纯净二叉树画布渲染器 (纯 View 逻辑，杜绝跨容器 DOM 穿透)
   */
  static renderCanvas(
    container: HTMLElement,
    step: BSTSStep,
    stageId: 'stage-1' | 'stage-2' | 'stage-3' = 'stage-1'
  ): void {
    TreeCanvasAdapter.renderTree(container, {
      tree: step.tree,
      current: step.insertedVal != null ? step.insertedVal : step.current,
      secondaryHighlightedNodes: step.path,
      primaryColor: step.insertedVal != null ? '#8b5cf6' : step.found ? '#16a34a' : '#3b82f6',
      secondaryColor: '#fbbf24',
    });
  }

  /**
   * Card 2: 自定义运行监控与推演面板 (4 格指标 + 下潜路径 + 递归推演树 / 槽位状态)
   */
  static renderCustomMetrics(container: HTMLElement, step: BSTSStep): void {
    container.innerHTML = '';
    container.className = 'flex flex-col gap-2 p-2 h-full overflow-y-auto text-slate-200';

    // 1. 顶部 4 格 KPI 卡片
    const metricsGrid = document.createElement('div');
    metricsGrid.className = 'grid grid-cols-4 gap-2 flex-shrink-0';
    const foundText = step.insertedVal != null
      ? '已挂载新节点'
      : step.found
      ? '已命中目标'
      : step.action === 'not-found'
      ? '未找到 (null)'
      : '检索中';
    const foundColor = step.insertedVal != null
      ? 'text-purple-400'
      : step.found
      ? 'text-emerald-400'
      : step.action === 'not-found'
      ? 'text-rose-400'
      : 'text-cyan-400';

    metricsGrid.innerHTML = `
      <div class="flex flex-col p-2 rounded-lg bg-slate-800/80 border border-slate-700/60 shadow-sm">
        <span class="text-[11px] text-slate-400 font-medium">检索目标数值</span>
        <span class="text-base font-bold font-mono text-amber-400">val = ${step.val}</span>
      </div>
      <div class="flex flex-col p-2 rounded-lg bg-slate-800/80 border border-slate-700/60 shadow-sm">
        <span class="text-[11px] text-slate-400 font-medium">当前考察节点</span>
        <span class="text-base font-bold font-mono text-blue-400">${step.current !== null ? `Node(${step.current})` : '—'}</span>
      </div>
      <div class="flex flex-col p-2 rounded-lg bg-slate-800/80 border border-slate-700/60 shadow-sm">
        <span class="text-[11px] text-slate-400 font-medium">分支转向决策</span>
        <span class="text-xs font-semibold text-slate-200 truncate mt-1">${step.decision}</span>
      </div>
      <div class="flex flex-col p-2 rounded-lg bg-slate-800/80 border border-slate-700/60 shadow-sm">
        <span class="text-[11px] text-slate-400 font-medium">搜索命中状态</span>
        <span class="text-sm font-bold ${foundColor} mt-0.5">${foundText}</span>
      </div>
    `;
    container.appendChild(metricsGrid);

    // 2. 检索下潜路径展示区
    const pathBox = document.createElement('div');
    pathBox.className = 'p-2 rounded-lg bg-slate-800/60 border border-slate-700/50 flex items-center justify-between flex-shrink-0';
    pathBox.innerHTML = `
      <div class="flex items-center gap-2">
        <span class="text-[11px] text-slate-400">🛤️ 检索下潜路径:</span>
        <div class="flex items-center gap-1">
          ${step.path && step.path.length > 0 ? step.path.map((v, i) => {
            const isTarget = v === step.val;
            const bg = isTarget ? 'bg-emerald-950/70 border-emerald-500/80 text-emerald-300' : 'bg-slate-900 border-slate-700 text-slate-300';
            return `
              <span class="inline-flex items-center justify-center px-2 py-0.5 rounded border font-mono text-xs font-bold ${bg}">
                ${v}
              </span>
              ${i < step.path.length - 1 ? '<span class="text-slate-500 text-xs">➔</span>' : ''}
            `;
          }).join('') : '<span class="text-xs text-slate-500 italic">未开始</span>'}
        </div>
      </div>
      ${step.targetSubtree ? `<span class="text-xs font-mono font-bold text-emerald-400">Subtree(Root=${step.targetSubtree.val})</span>` : ''}
    `;
    container.appendChild(pathBox);

    // 3. 中间推演区：如果是 Stage 2 展示 Call Trace，其他 Stage 展示单向剪枝/槽位信息
    if (step.stageId === 'stage-2' && step.callTrace) {
      const traceBox = document.createElement('div');
      traceBox.className = 'flex-1 min-h-[160px] max-h-[260px] overflow-hidden flex flex-col rounded-lg bg-slate-800/60 border border-slate-700/50';
      RecursiveCallTraceAdapter.render(traceBox, step.callTrace);
      container.appendChild(traceBox);
    } else if (step.stageId === 'stage-3') {
      const insertBox = document.createElement('div');
      insertBox.className = 'p-2.5 rounded-lg bg-slate-800/70 border border-slate-700/60 flex-shrink-0';
      insertBox.innerHTML = `
        <div class="text-[11px] font-bold text-slate-300 mb-1.5 flex items-center gap-1.5">
          <span>🌱 BST 读写闭环动态插入 (LC 701)</span>
        </div>
        <div class="text-xs text-slate-300 flex items-center gap-2">
          <span class="text-slate-400">当前槽位动作:</span>
          <span class="font-bold ${step.insertedVal != null ? 'text-purple-400' : 'text-cyan-400'}">${step.decision}</span>
        </div>
      `;
      container.appendChild(insertBox);
    }

    // 4. 当前推演决策总结
    const isDone = step.decision.includes('完成') || step.decision.includes('成功') || step.statusBadge?.type === 'success';
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
}

export const renderBstSearchCanvas = BstSearchCanvasAdapter.renderCanvas;
export const renderBstSearchCustomMetrics = BstSearchCanvasAdapter.renderCustomMetrics;
