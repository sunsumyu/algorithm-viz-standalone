/**
 * 对称二叉树 (Symmetric Tree · LeetCode 101) 领域画布与指标适配器
 * 负责树结构高亮渲染、Stage 1/2/3 状态缓冲器与诊断面板呈现
 */

import { TreeCanvasAdapter } from './tree-canvas-adapter';
import { TSStep, collectTreeValues } from './tree-symmetric-step-compiler';
import { RecursiveCallTraceAdapter } from './recursive-call-trace-adapter';

/** Card 1: 树画布渲染 */
export function renderTreeSymmetricCanvasForStep(
  container: HTMLElement,
  step: TSStep,
  primaryColor: string = '#0284c7'
): void {
  const isDone = step.action === 'done';
  const allTreeNodes = collectTreeValues(step.tree);
  const highlights: number[] = [];
  if (step.leftVal != null) highlights.push(step.leftVal);
  if (step.rightVal != null) highlights.push(step.rightVal);

  let current = step.mismatchNode;
  let visitedNodes: number[] = [];

  if (isDone) {
    if (step.result) {
      visitedNodes = allTreeNodes;
      if (step.tree) current = step.tree.val;
    } else {
      current = step.mismatchNode;
    }
  }

  TreeCanvasAdapter.renderTree(container, {
    tree: step.tree,
    current,
    highlightedNodes: highlights,
    visitedNodes,
    primaryColor: step.mismatchNode != null ? '#ef4444' : (isDone && step.result ? '#fbbf24' : primaryColor),
    secondaryColor: '#38bdf8',
    visitedColor: '#34d399',
  });
}

/** Card 2 缓冲器：Stage 1 递归镜像面板 */
export function renderStage1RecursionBufferHtml(step: TSStep): string {
  const lVal = step.leftVal != null ? `左: ${step.leftVal}` : '左: null';
  const rVal = step.rightVal != null ? `右: ${step.rightVal}` : '右: null';

  return `
    <div style="display: flex; flex-direction: column; gap: 8px;">
      <div style="display: flex; justify-content: space-between; align-items: center; padding: 6px 12px; background: #f0fdf4; border: 1px solid #bbf7d0; border-radius: 6px;">
        <span style="font-size: 11px; font-weight: 700; color: #166534;">当前递归比对节点对:</span>
        <span style="font-size: 12px; font-weight: 700; font-family: monospace; color: #15803d;">
          ${lVal} &nbsp;⟺&nbsp; ${rVal} &nbsp;(${step.pairType === 'outside' ? '外侧' : step.pairType === 'inside' ? '内侧' : '根下'})
        </span>
      </div>
      <div style="display: flex; justify-content: space-between; align-items: center; padding: 6px 10px; background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 6px; font-size: 11px;">
        <span style="color: #64748b;">• 外侧比对: left.left 与 right.right</span>
        <span style="color: #64748b;">• 内侧比对: left.right 与 right.left</span>
      </div>
    </div>
  `;
}

/** Card 2 缓冲器：Stage 2 队列管道面板 */
export function renderStage2QueueBufferHtml(step: TSStep): string {
  const q = step.queue ?? [];
  const chips = q.length > 0
    ? q.map((v, idx) => {
        const isHead = idx < 2;
        const bg = isHead ? '#dbeafe' : '#f1f5f9';
        const color = isHead ? '#1e40af' : '#475569';
        const border = isHead ? '#93c5fd' : '#cbd5e1';
        return `<span style="padding: 2px 7px; background: ${bg}; color: ${color}; border: 1px solid ${border}; border-radius: 4px; font-size: 11px; font-weight: 700; font-family: monospace;">${v}</span>`;
      }).join('')
    : '<span style="color:#94a3b8; font-size:11px;">[ 队列已清空 ]</span>';

  return `
    <div style="display: flex; flex-direction: column; gap: 8px;">
      <div style="display: flex; justify-content: space-between; align-items: center; padding: 6px 12px; background: #eff6ff; border: 1px solid #bfdbfe; border-radius: 6px;">
        <span style="font-size: 11px; font-weight: 700; color: #1e40af;">当前队列头部核验对:</span>
        <span style="font-size: 12px; font-weight: 700; font-family: monospace; color: #1d4ed8;">
          ${step.currentPair ? `u=${step.currentPair[0]}, v=${step.currentPair[1]}` : '准备中...'}
        </span>
      </div>
      <div style="display: flex; flex-direction: column; gap: 4px;">
        <span style="font-size: 11px; font-weight: 700; color: #475569;">成对队列管道 [u.left, v.right, u.right, v.left]:</span>
        <div style="display: flex; flex-wrap: wrap; gap: 4px; padding: 6px 10px; background: #f8fafc; border: 1px dashed #cbd5e1; border-radius: 6px; min-height: 36px; align-items: center;">
          ${chips}
        </div>
      </div>
    </div>
  `;
}

/** Card 2 缓冲器：Stage 3 静态数组面板 */
export function renderStage3StaticArrayBufferHtml(step: TSStep): string {
  const s = step.staticQueueState;
  const arr = s?.array ?? [];
  const cells = arr.map((v, i) => {
    const isL = i === s?.l;
    const isR = i === s?.r;
    let ptr = '&nbsp;';
    if (isL && isR) ptr = '<span style="color:#ef4444; font-weight:800;">l/r</span>';
    else if (isL) ptr = '<span style="color:#0284c7; font-weight:800;">l↓</span>';
    else if (isR) ptr = '<span style="color:#10b981; font-weight:800;">r↓</span>';

    return `
      <div style="display: flex; flex-direction: column; align-items: center; gap: 2px;">
        <div style="height: 12px; line-height: 12px; font-size: 9px; font-family: monospace;">${ptr}</div>
        <div style="width: 36px; height: 36px; display: flex; align-items: center; justify-content: center; background: ${i >= (s?.l ?? 0) && i < (s?.r ?? 0) ? '#e0f2fe' : '#ffffff'}; border: 1px solid #cbd5e1; border-radius: 6px; font-family: monospace; font-size: 11px; font-weight: 700;">
          ${v}
        </div>
        <span style="font-size: 9px; color: #94a3b8; font-family: monospace;">[${i}]</span>
      </div>
    `;
  }).join('');

  return `
    <div style="display: flex; flex-direction: column; gap: 8px;">
      <div style="display: flex; justify-content: space-between; align-items: center; padding: 6px 12px; background: #fffbeb; border: 1px solid #fde68a; border-radius: 6px;">
        <span style="font-size: 11px; font-weight: 700; color: #92400e;">左神静态连续数组 queue[MAXN]:</span>
        <span style="font-size: 12px; font-weight: 700; font-family: monospace; color: #b45309;">
          [l=${s?.l ?? 0}, r=${s?.r ?? 0}) | 待检: ${Math.max(0, (s?.r ?? 0) - (s?.l ?? 0))}
        </span>
      </div>
      <div style="display: flex; gap: 6px; padding: 6px 10px; background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; overflow-x: auto;">
        ${cells}
      </div>
    </div>
  `;
}

/** Card 2 全景指标诊断看板外壳 */
export function renderTreeSymmetricMetricsShell(
  step: TSStep,
  bufferHtml: string,
  tipHtml: string
): string {
  const lVal = step.leftVal !== null ? `${step.leftVal}` : '—';
  const rVal = step.rightVal !== null ? `${step.rightVal}` : '—';
  const resText = step.result ? '符合镜像对称' : '失配 (False)';
  const resColor = step.result ? '#16a34a' : '#ef4444';

  return `
    <div style="display: flex; flex-direction: column; gap: 10px; padding: 12px 14px; background: #ffffff; border-radius: 10px; border: 1px solid #e2e8f0; box-shadow: 0 1px 3px rgba(0,0,0,0.03);">
      <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(130px, 1fr)); gap: 8px;">
        <div style="background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 8px 10px;">
          <div style="font-size: 10px; font-weight: 700; color: #64748b; text-transform: uppercase;">左镜像节点</div>
          <div style="font-size: 14px; font-weight: 800; color: #2563eb; margin-top: 2px;">${lVal}</div>
        </div>
        <div style="background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 8px 10px;">
          <div style="font-size: 10px; font-weight: 700; color: #64748b; text-transform: uppercase;">右镜像节点</div>
          <div style="font-size: 14px; font-weight: 800; color: #0d9488; margin-top: 2px;">${rVal}</div>
        </div>
        <div style="background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 8px 10px;">
          <div style="font-size: 10px; font-weight: 700; color: #64748b; text-transform: uppercase;">对称性判定</div>
          <div style="font-size: 13px; font-weight: 800; color: ${resColor}; margin-top: 2px;">${resText}</div>
        </div>
        <div style="background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 8px 10px;">
          <div style="font-size: 10px; font-weight: 700; color: #64748b; text-transform: uppercase;">时间复杂度</div>
          <div style="font-size: 13px; font-weight: 800; color: #0f172a; margin-top: 2px;">O(N) · O(H)</div>
        </div>
      </div>

      <div style="padding: 10px; background: #fafafa; border: 1px solid #e5e7eb; border-radius: 8px;">
        ${bufferHtml}
      </div>

      <div style="display: flex; align-items: center; gap: 8px; padding: 8px 12px; background: #f8fafc; border-left: 3px solid #3b82f6; border-radius: 0 6px 6px 0; font-size: 12px; color: #334155;">
        <span>💡</span>
        <span>${tipHtml}</span>
      </div>
    </div>
  `;
}

/** Stage 1 指标与 Trace 完整渲染 */
export function renderStage1Metrics(container: HTMLElement, step: TSStep): void {
  container.innerHTML = `
    <div style="display: flex; flex-direction: column; height: 100%; gap: 6px; font-size: 11px;">
      <div style="display: flex; flex-direction: column; gap: 4px; flex-shrink: 0;">
        ${renderStage1RecursionBufferHtml(step)}
      </div>
      <div class="ts-trace-host" style="flex: 1; min-height: 120px; overflow: hidden;"></div>
    </div>
  `;
  if (step.callTrace) {
    const traceHost = container.querySelector('.ts-trace-host') as HTMLElement | null;
    if (traceHost) {
      RecursiveCallTraceAdapter.render(traceHost, step.callTrace, {
        title: '📜 镜像递归调用推演与归约栈',
        theme: 'light',
        maxHeight: '100%',
        showTerminalHeader: true,
      });
    }
  }
}

/** Stage 2 指标诊断面板渲染 */
export function renderStage2Metrics(container: HTMLElement, step: TSStep): void {
  container.innerHTML = renderTreeSymmetricMetricsShell(
    step,
    renderStage2QueueBufferHtml(step),
    '成对迭代：每次连续弹出 u, v，将外侧对 (u.left, v.right) 与内侧对 (u.right, v.left) 按序推入。'
  );
}

/** Stage 3 指标诊断面板渲染 */
export function renderStage3Metrics(container: HTMLElement, step: TSStep): void {
  container.innerHTML = renderTreeSymmetricMetricsShell(
    step,
    renderStage3StaticArrayBufferHtml(step),
    '左神 Class 036 招牌：queue[MAXN] 连续数组配合 l, r 双指针，彻底消灭 GC 开销！'
  );
}

/**
 * 领域画布与视觉统一门面 (TreeSymmetricCanvasAdapter)
 */
export class TreeSymmetricCanvasAdapter {
  static renderCanvas = renderTreeSymmetricCanvasForStep;
  static renderStage1Buffer = renderStage1RecursionBufferHtml;
  static renderStage2Buffer = renderStage2QueueBufferHtml;
  static renderStage3Buffer = renderStage3StaticArrayBufferHtml;
  static renderMetricsShell = renderTreeSymmetricMetricsShell;
  static renderStage1Metrics = renderStage1Metrics;
  static renderStage2Metrics = renderStage2Metrics;
  static renderStage3Metrics = renderStage3Metrics;
}
