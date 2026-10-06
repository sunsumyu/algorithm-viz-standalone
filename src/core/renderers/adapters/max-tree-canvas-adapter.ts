/**
 * LeetCode 654: 最大二叉树 (Maximum Binary Tree) 表现层画布与指标适配器
 * 负责树结构高亮渲染、数组切片沙盘、Stage 1/2/3 调用栈与单调栈/任务栈监视器呈现
 */

import { TreeCanvasAdapter } from './tree-canvas-adapter';
import { RecursiveCallTraceAdapter } from './recursive-call-trace-adapter';
import { MaxTreeStep, collectTreeValues } from './max-tree-step-compiler';

// ============================================================
// 统一表现层渲染器 (Card 1: 树画布纯净沙盘)
// ============================================================
export function renderMaxTreeCanvas(container: HTMLElement, step: MaxTreeStep): void {
  if (!step.tree) {
    container.innerHTML = `
      <div style="width: 100%; height: 100%; display: flex; align-items: center; justify-content: center; flex-direction: column; color: #64748b; font-size: 13px;">
        <span style="font-size: 32px; margin-bottom: 8px;">🌲</span>
        <span>待构建最大二叉树 (树为空或尚未生成节点)</span>
      </div>
    `;
    return;
  }

  const isDone = step.action === 'done' || step.message.includes('完成');
  const allTreeVals = collectTreeValues(step.tree);

  let primaryNode = step.current;
  let visitedNodes = step.visitedNodes ?? [];
  let secondaryNodes: number[] = [];

  if (isDone) {
    visitedNodes = allTreeVals;
    if (primaryNode === null && step.tree) {
      primaryNode = step.tree.val;
    }
  } else if (step.maxIdx != null && step.nums && step.nums[step.maxIdx] != null) {
    secondaryNodes = [step.nums[step.maxIdx]];
  }

  TreeCanvasAdapter.renderTree(container, {
    tree: step.tree,
    current: primaryNode,
    secondaryHighlightedNodes: secondaryNodes,
    visitedNodes: visitedNodes,
    primaryColor: '#fbbf24', // 金黄: 当前焦点/考察元素
    secondaryColor: '#c084fc', // 紫罗兰: 区间最大值节点
    visitedColor: '#34d399', // 翡翠绿: 已建树收尾高亮
  });
}

// ============================================================
// Card 2 自定义指标与推演栈渲染器 (Card 2 Presentation Adapters)
// ============================================================

/** 辅助生成数组切片与区间扫描沙盘 */
export function renderArrayScanBar(step: MaxTreeStep): HTMLElement {
  const arrayBox = document.createElement('div');
  arrayBox.style.display = 'flex';
  arrayBox.style.flexDirection = 'column';
  arrayBox.style.gap = '6px';
  arrayBox.style.background = 'rgba(15, 23, 42, 0.5)';
  arrayBox.style.padding = '8px 10px';
  arrayBox.style.borderRadius = '6px';
  arrayBox.style.border = '1px solid rgba(51, 65, 85, 0.6)';

  const arrayTitle = document.createElement('div');
  arrayTitle.style.fontSize = '11px';
  arrayTitle.style.fontWeight = '700';
  arrayTitle.style.color = '#94a3b8';
  arrayTitle.textContent = step.range
    ? `当前扫描区间 [${step.range[0]}, ${step.range[1]}]`
    : '输入数组 nums 元素状态';
  arrayBox.appendChild(arrayTitle);

  const arrayRow = document.createElement('div');
  arrayRow.style.display = 'flex';
  arrayRow.style.flexWrap = 'wrap';
  arrayRow.style.gap = '5px';

  step.nums.forEach((val, i) => {
    const item = document.createElement('div');
    item.style.display = 'flex';
    item.style.flexDirection = 'column';
    item.style.alignItems = 'center';
    item.style.justifyContent = 'center';
    item.style.minWidth = '34px';
    item.style.height = '40px';
    item.style.borderRadius = '5px';
    item.style.fontSize = '12px';
    item.style.fontWeight = '700';
    item.style.fontFamily = 'monospace';
    item.style.transition = 'all 0.15s ease';

    const inRange = step.range ? i >= step.range[0] && i <= step.range[1] : true;
    const isScan = step.scanIdx === i;
    const isMax = step.maxIdx === i;
    const isCurrent = step.current === val;

    if (isMax) {
      item.style.background = 'rgba(192, 132, 252, 0.25)';
      item.style.color = '#e9d5ff';
      item.style.border = '2px solid #c084fc';
    } else if (isScan) {
      item.style.background = 'rgba(245, 158, 11, 0.25)';
      item.style.color = '#fde047';
      item.style.border = '2px solid #f59e0b';
    } else if (isCurrent) {
      item.style.background = 'rgba(56, 189, 248, 0.25)';
      item.style.color = '#38bdf8';
      item.style.border = '1px solid #38bdf8';
    } else if (inRange) {
      item.style.background = 'rgba(30, 41, 59, 0.8)';
      item.style.color = '#e2e8f0';
      item.style.border = '1px solid #475569';
    } else {
      item.style.background = 'rgba(15, 23, 42, 0.4)';
      item.style.color = '#475569';
      item.style.border = '1px dashed #334155';
      item.style.opacity = '0.5';
    }

    item.innerHTML = `
      <span>${val}</span>
      <span style="font-size: 8px; opacity: 0.7; font-weight: normal;">#${i}</span>
    `;
    arrayRow.appendChild(item);
  });
  arrayBox.appendChild(arrayRow);
  return arrayBox;
}

/** 辅助生成推演决策总结框 */
export function renderDecisionSummary(step: MaxTreeStep): HTMLElement {
  const summaryBox = document.createElement('div');
  summaryBox.style.background = 'rgba(30, 41, 59, 0.5)';
  summaryBox.style.padding = '8px 10px';
  summaryBox.style.borderRadius = '6px';
  summaryBox.style.fontSize = '11px';
  summaryBox.style.lineHeight = '1.4';
  summaryBox.style.color = '#94a3b8';
  summaryBox.style.border = '1px solid rgba(51, 65, 85, 0.4)';
  summaryBox.innerHTML = `
    <div style="font-weight: 700; color: #38bdf8; margin-bottom: 2px;">⚡ 推演动态</div>
    <div style="color: #e2e8f0;">${step.message}</div>
  `;
  return summaryBox;
}

/**
 * Stage 1: Card 2 递归调用推演跟踪栈
 */
export function renderStage1CustomMetrics(container: HTMLElement, step: MaxTreeStep): void {
  container.innerHTML = '';
  container.className = 'w-full h-full flex flex-col gap-2.5 p-3 text-xs font-sans overflow-hidden';

  // 1. 顶部 4 格关键指标
  const statsRow = document.createElement('div');
  statsRow.className = 'grid grid-cols-4 gap-2 flex-shrink-0';
  statsRow.innerHTML = `
    <div class="bg-slate-800/80 border border-slate-700/60 rounded-lg p-2 flex flex-col">
      <span class="text-slate-400 text-[10px] uppercase font-semibold tracking-wider">当前焦点</span>
      <span class="text-amber-300 font-mono font-bold text-sm mt-0.5 truncate">${step.current ?? '-'}</span>
    </div>
    <div class="bg-slate-800/80 border border-slate-700/60 rounded-lg p-2 flex flex-col">
      <span class="text-slate-400 text-[10px] uppercase font-semibold tracking-wider">区间最值</span>
      <span class="text-purple-300 font-mono font-bold text-sm mt-0.5 truncate">${step.maxVal ?? '-'}</span>
    </div>
    <div class="bg-slate-800/80 border border-slate-700/60 rounded-lg p-2 flex flex-col">
      <span class="text-slate-400 text-[10px] uppercase font-semibold tracking-wider">递归深度</span>
      <span class="text-emerald-300 font-mono font-bold text-sm mt-0.5 truncate">${step.depth}</span>
    </div>
    <div class="bg-slate-800/80 border border-slate-700/60 rounded-lg p-2 flex flex-col">
      <span class="text-slate-400 text-[10px] uppercase font-semibold tracking-wider">当前区间</span>
      <span class="text-cyan-300 font-mono font-bold text-sm mt-0.5 truncate">${step.range ? `[${step.range[0]}, ${step.range[1]}]` : '全域'}</span>
    </div>
  `;
  container.appendChild(statsRow);

  // 2. 数组与区间沙盘
  container.appendChild(renderArrayScanBar(step));

  // 3. 递归调用推演跟踪栈
  const traceBox = document.createElement('div');
  traceBox.className = 'flex-1 min-h-0 bg-slate-900/60 border border-slate-800 rounded-lg p-2 overflow-y-auto';
  if (step.callTrace) {
    RecursiveCallTraceAdapter.render(traceBox, step.callTrace);
  } else {
    traceBox.innerHTML = '<span class="text-slate-500 italic text-xs">无活动调用栈</span>';
  }
  container.appendChild(traceBox);

  // 4. 当前推演决策总结
  container.appendChild(renderDecisionSummary(step));
}

/**
 * Stage 2: Card 2 单调栈笛卡尔树监视器
 */
export function renderStage2CustomMetrics(container: HTMLElement, step: MaxTreeStep): void {
  container.innerHTML = '';
  container.className = 'w-full h-full flex flex-col gap-2.5 p-3 text-xs font-sans overflow-hidden';

  // 1. 顶部 4 格关键指标
  const statsRow = document.createElement('div');
  statsRow.className = 'grid grid-cols-4 gap-2 flex-shrink-0';
  statsRow.innerHTML = `
    <div class="bg-slate-800/80 border border-slate-700/60 rounded-lg p-2 flex flex-col">
      <span class="text-slate-400 text-[10px] uppercase font-semibold tracking-wider">考察元素</span>
      <span class="text-amber-300 font-mono font-bold text-sm mt-0.5 truncate">${step.activeNum ?? step.current ?? '-'}</span>
    </div>
    <div class="bg-slate-800/80 border border-slate-700/60 rounded-lg p-2 flex flex-col">
      <span class="text-slate-400 text-[10px] uppercase font-semibold tracking-wider">笛卡尔树根</span>
      <span class="text-purple-300 font-mono font-bold text-sm mt-0.5 truncate">${step.stackVals && step.stackVals.length > 0 ? step.stackVals[0] : '-'}</span>
    </div>
    <div class="bg-slate-800/80 border border-slate-700/60 rounded-lg p-2 flex flex-col">
      <span class="text-slate-400 text-[10px] uppercase font-semibold tracking-wider">单调栈深</span>
      <span class="text-emerald-300 font-mono font-bold text-sm mt-0.5 truncate">${step.stackVals ? step.stackVals.length : 0}</span>
    </div>
    <div class="bg-slate-800/80 border border-slate-700/60 rounded-lg p-2 flex flex-col">
      <span class="text-slate-400 text-[10px] uppercase font-semibold tracking-wider">遍历进度</span>
      <span class="text-cyan-300 font-mono font-bold text-sm mt-0.5 truncate">${(step.scanIdx ?? 0) + 1} / ${step.nums.length}</span>
    </div>
  `;
  container.appendChild(statsRow);

  // 2. 数组与扫描状态条
  container.appendChild(renderArrayScanBar(step));

  // 3. 单调栈槽监视器
  const stackBox = document.createElement('div');
  stackBox.className = 'flex-1 min-h-0 flex flex-col gap-2 bg-slate-900/60 border border-slate-800 rounded-lg p-2.5 overflow-y-auto';

  const stackHeader = document.createElement('div');
  stackHeader.className = 'flex items-center justify-between text-slate-400 text-[11px] font-semibold';
  stackHeader.innerHTML = `
    <span>🧭 单调递减栈槽 (栈底 ➔ 栈顶)</span>
    <span class="text-slate-500 font-mono">Size: ${step.stackVals?.length ?? 0}</span>
  `;
  stackBox.appendChild(stackHeader);

  const stackRow = document.createElement('div');
  stackRow.className = 'flex flex-wrap gap-2 items-center';

  if (!step.stackVals || step.stackVals.length === 0) {
    stackRow.innerHTML = `<span class="text-slate-500 italic text-xs">(栈为空)</span>`;
  } else {
    step.stackVals.forEach((v, idx) => {
      const isTop = idx === step.stackVals!.length - 1;
      const slot = document.createElement('div');
      slot.className = `px-2.5 py-1.5 rounded border font-mono text-xs font-bold transition-all ${
        isTop
          ? 'bg-amber-500/20 border-amber-400 text-amber-200 shadow-sm shadow-amber-500/10'
          : 'bg-slate-800/80 border-slate-700 text-slate-300'
      }`;
      slot.innerHTML = `<span>${v}</span>${isTop ? '<span class="text-[9px] text-amber-300 ml-1 font-normal">(顶)</span>' : ''}`;
      stackRow.appendChild(slot);
    });
  }
  stackBox.appendChild(stackRow);
  container.appendChild(stackBox);

  // 4. 当前推演决策总结
  container.appendChild(renderDecisionSummary(step));
}

/**
 * Stage 3: Card 2 显式任务栈监视器
 */
export function renderStage3CustomMetrics(container: HTMLElement, step: MaxTreeStep): void {
  container.innerHTML = '';
  container.className = 'w-full h-full flex flex-col gap-2.5 p-3 text-xs font-sans overflow-hidden';

  // 1. 顶部 4 格关键指标
  const statsRow = document.createElement('div');
  statsRow.className = 'grid grid-cols-4 gap-2 flex-shrink-0';
  statsRow.innerHTML = `
    <div class="bg-slate-800/80 border border-slate-700/60 rounded-lg p-2 flex flex-col">
      <span class="text-slate-400 text-[10px] uppercase font-semibold tracking-wider">当前处理</span>
      <span class="text-amber-300 font-mono font-bold text-sm mt-0.5 truncate">${step.current ?? '-'}</span>
    </div>
    <div class="bg-slate-800/80 border border-slate-700/60 rounded-lg p-2 flex flex-col">
      <span class="text-slate-400 text-[10px] uppercase font-semibold tracking-wider">子树最值</span>
      <span class="text-purple-300 font-mono font-bold text-sm mt-0.5 truncate">${step.maxVal ?? '-'}</span>
    </div>
    <div class="bg-slate-800/80 border border-slate-700/60 rounded-lg p-2 flex flex-col">
      <span class="text-slate-400 text-[10px] uppercase font-semibold tracking-wider">任务栈深</span>
      <span class="text-emerald-300 font-mono font-bold text-sm mt-0.5 truncate">${step.depth}</span>
    </div>
    <div class="bg-slate-800/80 border border-slate-700/60 rounded-lg p-2 flex flex-col">
      <span class="text-slate-400 text-[10px] uppercase font-semibold tracking-wider">子树区间</span>
      <span class="text-cyan-300 font-mono font-bold text-sm mt-0.5 truncate">${step.range ? `[${step.range[0]}, ${step.range[1]}]` : '根就绪'}</span>
    </div>
  `;
  container.appendChild(statsRow);

  // 2. 数组与区间沙盘
  container.appendChild(renderArrayScanBar(step));

  // 3. 任务队列状态监视器
  const taskBox = document.createElement('div');
  taskBox.className = 'flex-1 min-h-0 flex flex-col gap-2 bg-slate-900/60 border border-slate-800 rounded-lg p-2.5 overflow-y-auto';

  const taskHeader = document.createElement('div');
  taskHeader.className = 'flex items-center justify-between text-slate-400 text-[11px] font-semibold';
  taskHeader.innerHTML = `
    <span>🧱 显式任务栈调度器</span>
    <span class="text-slate-500 font-mono">Tasks: ${step.depth}</span>
  `;
  taskBox.appendChild(taskHeader);

  const taskContent = document.createElement('div');
  taskContent.className = 'text-xs text-slate-300 flex flex-col gap-1.5';
  taskContent.innerHTML = `
    <div class="flex items-center gap-2">
      <span class="text-slate-500">当前任务区间:</span>
      <span class="font-mono text-cyan-300 font-semibold">${step.range ? `[${step.range[0]}, ${step.range[1]}]` : '(全域调度)'}</span>
    </div>
    <div class="flex items-center gap-2">
      <span class="text-slate-500">操作节点:</span>
      <span class="font-mono text-amber-300 font-semibold">${step.current ?? '-'}</span>
    </div>
  `;
  taskBox.appendChild(taskContent);
  container.appendChild(taskBox);

  // 4. 当前推演决策总结
  container.appendChild(renderDecisionSummary(step));
}

/**
 * 领域画布与视觉统一门面 (MaxTreeCanvasAdapter)
 */
export class MaxTreeCanvasAdapter {
  static renderCanvas = renderMaxTreeCanvas;
  static renderStage1Metrics = renderStage1CustomMetrics;
  static renderStage2Metrics = renderStage2CustomMetrics;
  static renderStage3Metrics = renderStage3CustomMetrics;
  static renderArrayScanBar = renderArrayScanBar;
  static renderDecisionSummary = renderDecisionSummary;
}
