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
  if (!container) return;
  container.innerHTML = '';
  container.style.cssText = 'width:100%; height:100%; display:flex; flex-direction:column; gap:10px; padding:12px; font-family:system-ui,-apple-system,sans-serif; font-size:12px; box-sizing:border-box; overflow:hidden;';

  const isDone = step.action === 'done';
  const isValid = step.valid;

  // 1. 顶部 4 格关键指标
  const statsRow = document.createElement('div');
  statsRow.style.cssText = 'display:grid; grid-template-columns:repeat(4, 1fr); gap:8px; flex-shrink:0;';
  statsRow.innerHTML = `
    <div style="background:#fffbeb; border:1px solid #fde68a; border-radius:6px; padding:6px 8px; text-align:center;">
      <div style="font-size:10px; color:#b45309; font-weight:700; text-transform:uppercase;">当前考察</div>
      <div style="font-size:13px; font-weight:800; font-family:ui-monospace,monospace; color:${step.invalidNode !== null ? '#e11d48' : '#d97706'}; margin-top:2px; white-space:nowrap; overflow:hidden; text-overflow:ellipsis;">${step.current != null ? `Node(${step.current})` : '—'}</div>
    </div>
    <div style="background:#f0f9ff; border:1px solid #bae6fd; border-radius:6px; padding:6px 8px; text-align:center;">
      <div style="font-size:10px; color:#0369a1; font-weight:700; text-transform:uppercase;">前驱 prev</div>
      <div style="font-size:13px; font-weight:800; font-family:ui-monospace,monospace; color:#0284c7; margin-top:2px; white-space:nowrap; overflow:hidden; text-overflow:ellipsis;">${step.prev != null ? `Node(${step.prev})` : 'null'}</div>
    </div>
    <div style="background:${isValid ? '#f0fdf4' : '#fff1f2'}; border:1px solid ${isValid ? '#bbf7d0' : '#fecdd3'}; border-radius:6px; padding:6px 8px; text-align:center;">
      <div style="font-size:10px; color:${isValid ? '#15803d' : '#be123c'}; font-weight:700; text-transform:uppercase;">单调性判定</div>
      <div style="font-size:12px; font-weight:800; color:${isValid ? '#16a34a' : '#e11d48'}; margin-top:3px;">${isValid ? (isDone ? '全体验证通过' : '严格递增') : '违规破坏'}</div>
    </div>
    <div style="background:#f8fafc; border:1px solid #e2e8f0; border-radius:6px; padding:6px 8px; text-align:center;">
      <div style="font-size:10px; color:#475569; font-weight:700; text-transform:uppercase;">已收集序列</div>
      <div style="font-size:13px; font-weight:800; font-family:ui-monospace,monospace; color:#334155; margin-top:2px;">${step.sequence.length} 个</div>
    </div>
  `;
  container.appendChild(statsRow);

  // 2. 中序递增序列流
  const seqRow = document.createElement('div');
  seqRow.style.cssText = 'display:flex; flex-wrap:wrap; align-items:center; gap:4px; padding:6px 10px; background:#ffffff; border:1px solid #e2e8f0; border-radius:6px; font-size:11px; flex-shrink:0;';
  const seqHtml = step.sequence.length > 0
    ? step.sequence.map((v, i) => `
        <span style="padding:1px 6px; background:#f0fdf4; border:1px solid #bbf7d0; color:#15803d; border-radius:4px; font-family:ui-monospace,monospace; font-weight:700;">${v}</span>
        ${i < step.sequence.length - 1 ? '<span style="color:#94a3b8; font-size:10px;">&lt;</span>' : ''}
      `).join('')
    : '<span style="color:#94a3b8; font-style:italic;">等待首个中序访问节点...</span>';
  seqRow.innerHTML = `<span style="font-weight:700; color:#475569; margin-right:4px;">中序序列:</span> ${seqHtml}`;
  container.appendChild(seqRow);

  // 3. 决策信息条
  const decisionBar = document.createElement('div');
  decisionBar.style.cssText = `padding:8px 10px; border-radius:6px; font-size:11.5px; line-height:1.5; flex-shrink:0; background:${isValid ? (isDone ? '#f0fdf4' : '#f8fafc') : '#fff1f2'}; border:1px solid ${isValid ? (isDone ? '#bbf7d0' : '#e2e8f0') : '#fecdd3'};`;
  decisionBar.innerHTML = `<div style="font-weight:700; margin-bottom:2px; color:${isValid ? (isDone ? '#15803d' : '#0284c7') : '#e11d48'};">🧭 决策: ${step.decision}</div><div style="color:#64748b; font-size:11px;">${step.message}</div>`;
  container.appendChild(decisionBar);

  // 4. 底部弹性容器挂载 RecursiveCallTraceAdapter
  const traceContainer = document.createElement('div');
  traceContainer.style.cssText = 'flex:1; min-height:120px; overflow:hidden; display:flex; flex-direction:column; border-radius:6px; border:1px solid #e2e8f0;';
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
  if (!container) return;
  container.innerHTML = '';
  container.style.cssText = 'width:100%; height:100%; display:flex; flex-direction:column; gap:10px; padding:12px; font-family:system-ui,-apple-system,sans-serif; font-size:12px; box-sizing:border-box; overflow:hidden;';

  const minVal = step.boundary?.min ?? '-∞';
  const maxVal = step.boundary?.max ?? '+∞';
  const inRange = step.boundary?.inRange ?? true;
  const isDone = step.action === 'done';

  // 1. 顶部 4 格关键指标
  const statsRow = document.createElement('div');
  statsRow.style.cssText = 'display:grid; grid-template-columns:repeat(4, 1fr); gap:8px; flex-shrink:0;';
  statsRow.innerHTML = `
    <div style="background:#fffbeb; border:1px solid #fde68a; border-radius:6px; padding:6px 8px; text-align:center;">
      <div style="font-size:10px; color:#b45309; font-weight:700; text-transform:uppercase;">当前考察</div>
      <div style="font-size:13px; font-weight:800; font-family:ui-monospace,monospace; color:${inRange ? '#d97706' : '#e11d48'}; margin-top:2px; white-space:nowrap; overflow:hidden; text-overflow:ellipsis;">${step.current != null ? `Node(${step.current})` : '—'}</div>
    </div>
    <div style="background:#f0f9ff; border:1px solid #bae6fd; border-radius:6px; padding:6px 8px; text-align:center;">
      <div style="font-size:10px; color:#0369a1; font-weight:700; text-transform:uppercase;">合法开区间</div>
      <div style="font-size:12px; font-weight:800; font-family:ui-monospace,monospace; color:#0284c7; margin-top:3px; white-space:nowrap; overflow:hidden; text-overflow:ellipsis;">(${minVal}, ${maxVal})</div>
    </div>
    <div style="background:${inRange ? '#f0fdf4' : '#fff1f2'}; border:1px solid ${inRange ? '#bbf7d0' : '#fecdd3'}; border-radius:6px; padding:6px 8px; text-align:center;">
      <div style="font-size:10px; color:${inRange ? '#15803d' : '#be123c'}; font-weight:700; text-transform:uppercase;">区间检验</div>
      <div style="font-size:12px; font-weight:800; color:${inRange ? '#16a34a' : '#e11d48'}; margin-top:3px;">${inRange ? '落入区间' : '越界违规'}</div>
    </div>
    <div style="background:#f8fafc; border:1px solid #e2e8f0; border-radius:6px; padding:6px 8px; text-align:center;">
      <div style="font-size:10px; color:#475569; font-weight:700; text-transform:uppercase;">已检验节点</div>
      <div style="font-size:13px; font-weight:800; font-family:ui-monospace,monospace; color:#334155; margin-top:2px;">${step.sequence.length} 个</div>
    </div>
  `;
  container.appendChild(statsRow);

  // 2. 决策信息条
  const decisionBar = document.createElement('div');
  decisionBar.style.cssText = `padding:8px 10px; border-radius:6px; font-size:11.5px; line-height:1.5; flex-shrink:0; background:${inRange ? (isDone ? '#f0fdf4' : '#f8fafc') : '#fff1f2'}; border:1px solid ${inRange ? (isDone ? '#bbf7d0' : '#e2e8f0') : '#fecdd3'};`;
  decisionBar.innerHTML = `<div style="font-weight:700; margin-bottom:2px; color:${inRange ? (isDone ? '#15803d' : '#0284c7') : '#e11d48'};">🧭 决策: ${step.decision}</div><div style="color:#64748b; font-size:11px;">${step.message}</div>`;
  container.appendChild(decisionBar);

  // 3. 底部弹性容器挂载 RecursiveCallTraceAdapter
  const traceContainer = document.createElement('div');
  traceContainer.style.cssText = 'flex:1; min-height:120px; overflow:hidden; display:flex; flex-direction:column; border-radius:6px; border:1px solid #e2e8f0;';
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
  if (!container) return;
  container.innerHTML = '';
  container.style.cssText = 'width:100%; height:100%; display:flex; flex-direction:column; gap:10px; padding:12px; font-family:system-ui,-apple-system,sans-serif; font-size:12px; box-sizing:border-box; overflow:hidden;';

  const stackVals = step.stack || [];
  const isDone = step.action === 'done';

  // 1. 顶部 4 格关键指标
  const statsRow = document.createElement('div');
  statsRow.style.cssText = 'display:grid; grid-template-columns:repeat(4, 1fr); gap:8px; flex-shrink:0;';
  statsRow.innerHTML = `
    <div style="background:#fffbeb; border:1px solid #fde68a; border-radius:6px; padding:6px 8px; text-align:center;">
      <div style="font-size:10px; color:#b45309; font-weight:700; text-transform:uppercase;">当前考察</div>
      <div style="font-size:13px; font-weight:800; font-family:ui-monospace,monospace; color:#d97706; margin-top:2px; white-space:nowrap; overflow:hidden; text-overflow:ellipsis;">${step.current != null ? `Node(${step.current})` : '—'}</div>
    </div>
    <div style="background:#faf5ff; border:1px solid #e9d5ff; border-radius:6px; padding:6px 8px; text-align:center;">
      <div style="font-size:10px; color:#7e22ce; font-weight:700; text-transform:uppercase;">栈内深度</div>
      <div style="font-size:13px; font-weight:800; font-family:ui-monospace,monospace; color:#9333ea; margin-top:2px;">${stackVals.length}</div>
    </div>
    <div style="background:#f0f9ff; border:1px solid #bae6fd; border-radius:6px; padding:6px 8px; text-align:center;">
      <div style="font-size:10px; color:#0369a1; font-weight:700; text-transform:uppercase;">前驱 prev</div>
      <div style="font-size:13px; font-weight:800; font-family:ui-monospace,monospace; color:#0284c7; margin-top:2px; white-space:nowrap; overflow:hidden; text-overflow:ellipsis;">${step.prev != null ? `Node(${step.prev})` : 'null'}</div>
    </div>
    <div style="background:${step.valid ? '#f0fdf4' : '#fff1f2'}; border:1px solid ${step.valid ? '#bbf7d0' : '#fecdd3'}; border-radius:6px; padding:6px 8px; text-align:center;">
      <div style="font-size:10px; color:${step.valid ? '#15803d' : '#be123c'}; font-weight:700; text-transform:uppercase;">单调性判定</div>
      <div style="font-size:12px; font-weight:800; color:${step.valid ? '#16a34a' : '#e11d48'}; margin-top:3px;">${step.valid ? (isDone ? '全体验证通过' : '严格递增') : '违规破坏'}</div>
    </div>
  `;
  container.appendChild(statsRow);

  // 2. 显式栈槽位可视化
  const stackRow = document.createElement('div');
  stackRow.style.cssText = 'display:flex; flex-direction:column; gap:6px; padding:8px 10px; background:#ffffff; border:1px solid #e2e8f0; border-radius:6px; font-size:11px; flex-shrink:0;';
  const stackChips = stackVals.length > 0
    ? stackVals.map((v) => `<span style="padding:3px 8px; background:#eff6ff; border:1px solid #bfdbfe; color:#1d4ed8; font-weight:700; font-family:ui-monospace,monospace; border-radius:4px; font-size:11px;">Node(${v})</span>`).join('')
    : '<span style="color:#94a3b8; font-style:italic;">当前栈为空</span>';
  stackRow.innerHTML = `
    <div style="display:flex; align-items:center; justify-content:space-between; font-weight:700; color:#475569;">
      <span>🥞 显式调用栈 Stack&lt;TreeNode&gt;:</span>
      <span style="font-size:10px; color:#94a3b8; font-weight:normal;">栈底在左 ➔ 栈顶在右</span>
    </div>
    <div style="display:flex; align-items:center; gap:6px; flex-wrap:wrap;">${stackChips}</div>
  `;
  container.appendChild(stackRow);

  // 3. 中序序列流
  const seqRow = document.createElement('div');
  seqRow.style.cssText = 'display:flex; flex-wrap:wrap; align-items:center; gap:4px; padding:6px 10px; background:#ffffff; border:1px solid #e2e8f0; border-radius:6px; font-size:11px; flex-shrink:0;';
  const seqHtml = step.sequence.length > 0
    ? step.sequence.map((v, i) => `
        <span style="padding:1px 6px; background:#f0fdf4; border:1px solid #bbf7d0; color:#15803d; border-radius:4px; font-family:ui-monospace,monospace; font-weight:700;">${v}</span>
        ${i < step.sequence.length - 1 ? '<span style="color:#94a3b8; font-size:10px;">&lt;</span>' : ''}
      `).join('')
    : '<span style="color:#94a3b8; font-style:italic;">等待出栈节点...</span>';
  seqRow.innerHTML = `<span style="font-weight:700; color:#475569; margin-right:4px;">已出栈中序序列:</span> ${seqHtml}`;
  container.appendChild(seqRow);

  // 4. 决策信息条
  const decisionBar = document.createElement('div');
  decisionBar.style.cssText = `padding:8px 10px; border-radius:6px; font-size:11.5px; line-height:1.5; flex-shrink:0; background:${step.valid ? (isDone ? '#f0fdf4' : '#f8fafc') : '#fff1f2'}; border:1px solid ${step.valid ? (isDone ? '#bbf7d0' : '#e2e8f0') : '#fecdd3'};`;
  decisionBar.innerHTML = `<div style="font-weight:700; margin-bottom:2px; color:${step.valid ? (isDone ? '#15803d' : '#0284c7') : '#e11d48'};">🧭 决策: ${step.decision}</div><div style="color:#64748b; font-size:11px;">${step.message}</div>`;
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
