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

  const nullProbe = (step as any).nullProbe;
  const secondaryList = (step as any).secondaryHighlightedNodes || step.sequence;

  // 确保画板占满容器全高，杜绝大面积死白留白
  container.style.cssText =
    'width:100%; height:100%; min-height:0; flex:1; display:flex; align-items:center; justify-content:center; overflow:hidden; position:relative;';

  TreeCanvasAdapter.renderTree(container, {
    tree: step.tree,
    current: primaryNode,
    secondaryHighlightedNodes: secondaryList,
    visitedNodes: visitedNodes,
    nullProbe: nullProbe,
    primaryColor: step.invalidNode !== null ? '#ef4444' : '#fbbf24',
    secondaryColor: '#60a5fa',
    visitedColor: '#34d399',
    height: '100%',
    tightViewBox: true,
  });
}

// ============================================================
// Card 2 自定义辅助面板与推演栈渲染器 (Card 2 Presentation Adapters)
// 遵循 Zero-Subbox 规范：顶部指标已由顶层 .dsp-metrics-grid 统一承载，绝不在内部重复渲染 statsRow！
// ============================================================

/**
 * Stage 1: Card 2 递归调用推演跟踪栈
 */
export function renderStage1CustomMetrics(container: HTMLElement, step: VBStep): void {
  if (!container) return;
  container.innerHTML = '';
  container.style.cssText =
    'width:100%; height:100%; display:flex; flex-direction:column; gap:8px; padding:10px 12px; font-family:system-ui,-apple-system,sans-serif; font-size:12px; box-sizing:border-box; overflow:hidden;';

  const isDone = step.action === 'done';
  const isValid = step.valid;

  // 1. 中序递增序列流 (动态药丸徽章)
  const seqRow = document.createElement('div');
  seqRow.style.cssText =
    'display:flex; flex-wrap:wrap; align-items:center; gap:5px; padding:6px 10px; background:#ffffff; border:1px solid #e2e8f0; border-radius:8px; font-size:11px; flex-shrink:0; box-shadow:0 1px 2px rgba(0,0,0,0.02);';
  const seqHtml =
    step.sequence.length > 0
      ? step.sequence
          .map(
            (v, i) => `
        <span style="padding:2px 7px; background:#f0fdf4; border:1px solid #bbf7d0; color:#15803d; border-radius:5px; font-family:ui-monospace,monospace; font-weight:700; font-size:11.5px;">${v}</span>
        ${i < step.sequence.length - 1 ? '<span style="color:#94a3b8; font-size:11px; font-weight:700;">&lt;</span>' : ''}
      `
          )
          .join('')
      : '<span style="color:#94a3b8; font-style:italic;">等待首个中序访问节点...</span>';
  seqRow.innerHTML = `<span style="font-weight:700; color:#475569; margin-right:4px;">中序序列流:</span> ${seqHtml}`;
  container.appendChild(seqRow);

  // 2. 决策信息条
  const decisionBar = document.createElement('div');
  decisionBar.style.cssText = `padding:7px 10px; border-radius:8px; font-size:11.5px; line-height:1.5; flex-shrink:0; background:${
    isValid ? (isDone ? '#f0fdf4' : '#f8fafc') : '#fff1f2'
  }; border:1px solid ${isValid ? (isDone ? '#bbf7d0' : '#e2e8f0') : '#fecdd3'};`;
  decisionBar.innerHTML = `<div style="font-weight:700; color:${
    isValid ? (isDone ? '#15803d' : '#0284c7') : '#e11d48'
  };">🧭 决策: ${step.decision}</div>`;
  container.appendChild(decisionBar);

  // 3. 底部弹性容器挂载 RecursiveCallTraceAdapter (主角展现区)
  const traceContainer = document.createElement('div');
  traceContainer.style.cssText =
    'flex:1; min-height:0; overflow:hidden; display:flex; flex-direction:column; border-radius:8px; border:1px solid #e2e8f0; box-shadow:0 1px 2px rgba(0,0,0,0.02);';
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
  container.style.cssText =
    'width:100%; height:100%; display:flex; flex-direction:column; gap:8px; padding:10px 12px; font-family:system-ui,-apple-system,sans-serif; font-size:12px; box-sizing:border-box; overflow:hidden;';

  const inRange = step.boundary?.inRange ?? true;
  const isDone = step.action === 'done';

  // 1. 决策信息条
  const decisionBar = document.createElement('div');
  decisionBar.style.cssText = `padding:7px 10px; border-radius:8px; font-size:11.5px; line-height:1.5; flex-shrink:0; background:${
    inRange ? (isDone ? '#f0fdf4' : '#f8fafc') : '#fff1f2'
  }; border:1px solid ${inRange ? (isDone ? '#bbf7d0' : '#e2e8f0') : '#fecdd3'};`;
  decisionBar.innerHTML = `<div style="font-weight:700; color:${
    inRange ? (isDone ? '#15803d' : '#0284c7') : '#e11d48'
  };">🧭 决策: ${step.decision}</div>`;
  container.appendChild(decisionBar);

  // 2. 底部弹性容器挂载 RecursiveCallTraceAdapter
  const traceContainer = document.createElement('div');
  traceContainer.style.cssText =
    'flex:1; min-height:0; overflow:hidden; display:flex; flex-direction:column; border-radius:8px; border:1px solid #e2e8f0; box-shadow:0 1px 2px rgba(0,0,0,0.02);';
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
  container.style.cssText =
    'width:100%; height:100%; display:flex; flex-direction:column; gap:8px; padding:10px 12px; font-family:system-ui,-apple-system,sans-serif; font-size:12px; box-sizing:border-box; overflow:hidden;';

  const stackVals = step.stack || [];

  // 1. 显式栈槽位可视化
  const stackRow = document.createElement('div');
  stackRow.style.cssText =
    'display:flex; flex-direction:column; gap:6px; padding:8px 10px; background:#ffffff; border:1px solid #e2e8f0; border-radius:8px; font-size:11px; flex-shrink:0; box-shadow:0 1px 2px rgba(0,0,0,0.02);';
  const stackChips =
    stackVals.length > 0
      ? stackVals
          .map(
            (v) =>
              `<span style="padding:3px 8px; background:#eff6ff; border:1px solid #bfdbfe; color:#1d4ed8; font-weight:700; font-family:ui-monospace,monospace; border-radius:4px; font-size:11px;">Node(${v})</span>`
          )
          .join('')
      : '<span style="color:#94a3b8; font-style:italic;">当前显式栈为空</span>';
  stackRow.innerHTML = `
    <div style="display:flex; align-items:center; justify-content:space-between; font-weight:700; color:#475569;">
      <span>🥞 显式调用栈 Stack&lt;TreeNode&gt;:</span>
      <span style="font-size:10px; color:#94a3b8; font-weight:normal;">栈底在左 ➔ 栈顶在右</span>
    </div>
    <div style="display:flex; align-items:center; gap:6px; flex-wrap:wrap;">${stackChips}</div>
  `;
  container.appendChild(stackRow);

  // 2. 中序序列流
  const seqRow = document.createElement('div');
  seqRow.style.cssText =
    'display:flex; flex-wrap:wrap; align-items:center; gap:5px; padding:6px 10px; background:#ffffff; border:1px solid #e2e8f0; border-radius:8px; font-size:11px; flex-shrink:0; box-shadow:0 1px 2px rgba(0,0,0,0.02);';
  const seqHtml =
    step.sequence.length > 0
      ? step.sequence
          .map(
            (v, i) => `
        <span style="padding:2px 7px; background:#f0fdf4; border:1px solid #bbf7d0; color:#15803d; border-radius:5px; font-family:ui-monospace,monospace; font-weight:700; font-size:11.5px;">${v}</span>
        ${i < step.sequence.length - 1 ? '<span style="color:#94a3b8; font-size:11px; font-weight:700;">&lt;</span>' : ''}
      `
          )
          .join('')
      : '<span style="color:#94a3b8; font-style:italic;">等待出栈节点...</span>';
  seqRow.innerHTML = `<span style="font-weight:700; color:#475569; margin-right:4px;">已出栈中序序列:</span> ${seqHtml}`;
  container.appendChild(seqRow);

  // 3. 决策信息条
  const decisionBar = document.createElement('div');
  decisionBar.style.cssText = `padding:7px 10px; border-radius:8px; font-size:11.5px; line-height:1.5; flex-shrink:0; background:${
    step.valid ? (step.action === 'done' ? '#f0fdf4' : '#f8fafc') : '#fff1f2'
  }; border:1px solid ${step.valid ? (step.action === 'done' ? '#bbf7d0' : '#e2e8f0') : '#fecdd3'};`;
  decisionBar.innerHTML = `<div style="font-weight:700; color:${
    step.valid ? (step.action === 'done' ? '#15803d' : '#0284c7') : '#e11d48'
  };">🧭 决策: ${step.decision}</div>`;
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
