/**
 * 验证二叉搜索树 (Validate BST · LeetCode 98) 表现层画布与指标适配器
 * 负责树结构高亮渲染、中序递增输出流、Stage 1/2/3 调用栈与显式栈状态呈现
 */

import { TreeCanvasAdapter } from './tree-canvas-adapter';
import { RecursiveCallTraceAdapter } from './recursive-call-trace-adapter';
import { VBStep, collectTreeValues } from './valid-bst-step-compiler';

// ============================================================
// 统一表现层渲染器 (Card 1: 树画布纯净沙盘)
// ============================================================
export function renderValidBstCanvas(container: HTMLElement, step: VBStep, _stageId?: string): void {
  const isDone = step.action === 'done';
  const allTreeNodes = collectTreeValues(step.tree);

  let primaryNode = step.invalidNode !== null ? step.invalidNode : step.current;
  let visitedNodes = step.sequence;

  if (isDone && step.valid) {
    visitedNodes = allTreeNodes;
    if (primaryNode === null && step.tree) {
      primaryNode = step.tree.val;
    }
  }

  TreeCanvasAdapter.renderTree(container, {
    tree: step.tree,
    current: primaryNode,
    secondaryHighlightedNodes: step.sequence,
    visitedNodes: visitedNodes,
    primaryColor: step.invalidNode !== null ? '#ef4444' : '#fbbf24',
    secondaryColor: '#60a5fa',
    visitedColor: '#34d399',
  });
}

// ============================================================
// Card 2 自定义指标与推演栈渲染器 (Card 2 Presentation Adapters)
// ============================================================

/**
 * Stage 1: Card 2 递归调用推演跟踪栈
 */
export function renderStage1CustomMetrics(container: HTMLElement, step: VBStep): void {
  container.innerHTML = '';
  container.className = 'w-full h-full flex flex-col gap-2.5 p-3 text-xs font-sans overflow-hidden';

  const isDone = step.action === 'done';
  const isValid = step.valid;

  // 1. 顶部 4 格关键指标
  const statsRow = document.createElement('div');
  statsRow.className = 'grid grid-cols-4 gap-2 flex-shrink-0';
  statsRow.innerHTML = `
    <div class="bg-slate-50 border border-slate-200 rounded p-2 text-center">
      <div class="text-[10px] text-slate-500 font-bold">当前考察</div>
      <div class="text-sm font-bold ${step.invalidNode !== null ? 'text-rose-600' : 'text-amber-600'}">${step.current ?? '—'}</div>
    </div>
    <div class="bg-slate-50 border border-slate-200 rounded p-2 text-center">
      <div class="text-[10px] text-slate-500 font-bold">前驱 prev</div>
      <div class="text-sm font-bold text-blue-600">${step.prev ?? 'null'}</div>
    </div>
    <div class="bg-slate-50 border border-slate-200 rounded p-2 text-center">
      <div class="text-[10px] text-slate-500 font-bold">单调性判定</div>
      <div class="text-sm font-bold ${isValid ? 'text-emerald-600' : 'text-rose-600'}">${isValid ? (isDone ? '全体验证通过' : '严格递增') : '违规破坏'}</div>
    </div>
    <div class="bg-slate-50 border border-slate-200 rounded p-2 text-center">
      <div class="text-[10px] text-slate-500 font-bold">已收集序列</div>
      <div class="text-sm font-bold text-slate-700">${step.sequence.length} 个</div>
    </div>
  `;
  container.appendChild(statsRow);

  // 2. 中序递增序列流
  const seqRow = document.createElement('div');
  seqRow.className = 'flex flex-wrap items-center gap-1 p-2 bg-slate-50 border border-slate-200 rounded text-xs flex-shrink-0';
  const seqHtml = step.sequence.length > 0
    ? step.sequence.map((v, i) => `
        <span class="px-2 py-0.5 bg-emerald-50 border border-emerald-300 text-emerald-800 rounded font-mono font-bold">${v}</span>
        ${i < step.sequence.length - 1 ? '<span class="text-slate-400 text-[10px]">&lt;</span>' : ''}
      `).join('')
    : '<span class="text-slate-400 italic">等待首个中序访问节点...</span>';
  seqRow.innerHTML = `<span class="text-[11px] font-bold text-slate-600 mr-1">中序序列:</span> ${seqHtml}`;
  container.appendChild(seqRow);

  // 3. 决策信息条
  const decisionBar = document.createElement('div');
  decisionBar.className = 'p-2 bg-blue-50/60 border border-blue-100 rounded text-[11px] text-slate-700 flex-shrink-0';
  decisionBar.innerHTML = `<span class="font-bold text-blue-900">🧭 决策:</span> ${step.decision} <span class="text-slate-500 ml-2">(${step.message})</span>`;
  container.appendChild(decisionBar);

  // 4. 底部弹性容器挂载 RecursiveCallTraceAdapter
  const traceContainer = document.createElement('div');
  traceContainer.className = 'flex-1 min-h-0 w-full overflow-hidden';
  container.appendChild(traceContainer);

  RecursiveCallTraceAdapter.render(traceContainer, step.callTrace || null, {
    theme: 'light',
    title: '🌳 中序递归调用推演跟踪树 (Inorder Call Trace)',
    showTerminalHeader: true,
  });
}

/**
 * Stage 2: Card 2 先序开区间定界与追踪栈
 */
export function renderStage2CustomMetrics(container: HTMLElement, step: VBStep): void {
  container.innerHTML = '';
  container.className = 'w-full h-full flex flex-col gap-2.5 p-3 text-xs font-sans overflow-hidden';

  const minVal = step.boundary?.min ?? '-∞';
  const maxVal = step.boundary?.max ?? '+∞';
  const inRange = step.boundary?.inRange ?? true;

  // 1. 顶部 4 格关键指标
  const statsRow = document.createElement('div');
  statsRow.className = 'grid grid-cols-4 gap-2 flex-shrink-0';
  statsRow.innerHTML = `
    <div class="bg-slate-50 border border-slate-200 rounded p-2 text-center">
      <div class="text-[10px] text-slate-500 font-bold">当前考察</div>
      <div class="text-sm font-bold ${inRange ? 'text-amber-600' : 'text-rose-600'}">${step.current ?? '—'}</div>
    </div>
    <div class="bg-slate-50 border border-slate-200 rounded p-2 text-center">
      <div class="text-[10px] text-slate-500 font-bold">合法开区间</div>
      <div class="text-sm font-bold text-blue-600 font-mono">(${minVal}, ${maxVal})</div>
    </div>
    <div class="bg-slate-50 border border-slate-200 rounded p-2 text-center">
      <div class="text-[10px] text-slate-500 font-bold">区间检验</div>
      <div class="text-sm font-bold ${inRange ? 'text-emerald-600' : 'text-rose-600'}">${inRange ? '落入区间' : '越界违规'}</div>
    </div>
    <div class="bg-slate-50 border border-slate-200 rounded p-2 text-center">
      <div class="text-[10px] text-slate-500 font-bold">已检验节点</div>
      <div class="text-sm font-bold text-slate-700">${step.sequence.length} 个</div>
    </div>
  `;
  container.appendChild(statsRow);

  // 2. 决策信息条
  const decisionBar = document.createElement('div');
  decisionBar.className = 'p-2 bg-blue-50/60 border border-blue-100 rounded text-[11px] text-slate-700 flex-shrink-0';
  decisionBar.innerHTML = `<span class="font-bold text-blue-900">🧭 决策:</span> ${step.decision} <span class="text-slate-500 ml-2">(${step.message})</span>`;
  container.appendChild(decisionBar);

  // 3. 底部弹性容器挂载 RecursiveCallTraceAdapter
  const traceContainer = document.createElement('div');
  traceContainer.className = 'flex-1 min-h-0 w-full overflow-hidden';
  container.appendChild(traceContainer);

  RecursiveCallTraceAdapter.render(traceContainer, step.callTrace || null, {
    theme: 'light',
    title: '📐 先序定界递归推演跟踪树 (Boundary Range Trace)',
    showTerminalHeader: true,
  });
}

/**
 * Stage 3: Card 2 显式栈状态监视器
 */
export function renderStage3CustomMetrics(container: HTMLElement, step: VBStep): void {
  container.innerHTML = '';
  container.className = 'w-full h-full flex flex-col gap-2.5 p-3 text-xs font-sans overflow-hidden';

  const stackVals = step.stack || [];

  // 1. 顶部 4 格关键指标
  const statsRow = document.createElement('div');
  statsRow.className = 'grid grid-cols-4 gap-2 flex-shrink-0';
  statsRow.innerHTML = `
    <div class="bg-slate-50 border border-slate-200 rounded p-2 text-center">
      <div class="text-[10px] text-slate-500 font-bold">当前考察</div>
      <div class="text-sm font-bold text-amber-600">${step.current ?? '—'}</div>
    </div>
    <div class="bg-slate-50 border border-slate-200 rounded p-2 text-center">
      <div class="text-[10px] text-slate-500 font-bold">栈内深度</div>
      <div class="text-sm font-bold text-indigo-600">${stackVals.length}</div>
    </div>
    <div class="bg-slate-50 border border-slate-200 rounded p-2 text-center">
      <div class="text-[10px] text-slate-500 font-bold">前驱 prev</div>
      <div class="text-sm font-bold text-blue-600">${step.prev ?? 'null'}</div>
    </div>
    <div class="bg-slate-50 border border-slate-200 rounded p-2 text-center">
      <div class="text-[10px] text-slate-500 font-bold">单调性判定</div>
      <div class="text-sm font-bold ${step.valid ? 'text-emerald-600' : 'text-rose-600'}">${step.valid ? '严格递增' : '违规破坏'}</div>
    </div>
  `;
  container.appendChild(statsRow);

  // 2. 显式栈槽位可视化
  const stackRow = document.createElement('div');
  stackRow.className = 'flex flex-col gap-1.5 p-2 bg-slate-50 border border-slate-200 rounded text-xs flex-shrink-0';
  const stackChips = stackVals.length > 0
    ? stackVals.map((v) => `<span class="px-2.5 py-1 bg-indigo-50 border border-indigo-200 text-indigo-700 font-bold font-mono rounded text-xs shadow-sm">${v}</span>`).join('')
    : '<span class="text-slate-400 italic">当前栈为空</span>';
  stackRow.innerHTML = `
    <div class="flex items-center justify-between text-[11px] font-bold text-slate-600">
      <span>🥞 显式调用栈 Stack&lt;TreeNode&gt;:</span>
      <span class="text-[10px] text-slate-400">栈底在左 ➔ 栈顶在右</span>
    </div>
    <div class="flex items-center gap-1.5 flex-wrap">${stackChips}</div>
  `;
  container.appendChild(stackRow);

  // 3. 中序序列流
  const seqRow = document.createElement('div');
  seqRow.className = 'flex flex-wrap items-center gap-1 p-2 bg-slate-50 border border-slate-200 rounded text-xs flex-shrink-0';
  const seqHtml = step.sequence.length > 0
    ? step.sequence.map((v, i) => `
        <span class="px-2 py-0.5 bg-emerald-50 border border-emerald-300 text-emerald-800 rounded font-mono font-bold">${v}</span>
        ${i < step.sequence.length - 1 ? '<span class="text-slate-400 text-[10px]">&lt;</span>' : ''}
      `).join('')
    : '<span class="text-slate-400 italic">等待出栈节点...</span>';
  seqRow.innerHTML = `<span class="text-[11px] font-bold text-slate-600 mr-1">已出栈中序序列:</span> ${seqHtml}`;
  container.appendChild(seqRow);

  // 4. 决策信息条
  const decisionBar = document.createElement('div');
  decisionBar.className = 'p-2 bg-blue-50/60 border border-blue-100 rounded text-[11px] text-slate-700 flex-shrink-0';
  decisionBar.innerHTML = `<span class="font-bold text-blue-900">🧭 决策:</span> ${step.decision} <span class="text-slate-500 ml-2">(${step.message})</span>`;
  container.appendChild(decisionBar);
}

/**
 * 领域画布与视觉统一门面 (ValidBstCanvasAdapter)
 */
export class ValidBstCanvasAdapter {
  static renderCanvas = renderValidBstCanvas;
  static renderStage1Metrics = renderStage1CustomMetrics;
  static renderStage2Metrics = renderStage2CustomMetrics;
  static renderStage3Metrics = renderStage3CustomMetrics;
}
