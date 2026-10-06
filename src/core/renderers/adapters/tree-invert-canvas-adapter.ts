/**
 * Tree Invert Canvas Adapter (LeetCode 226)
 *
 * 遵循 Matt Pocock 深模块哲学与 Thin Domain Adapter 架构规范。
 * 纯表现层适配器：委托 TreeCanvasAdapter 呈现二叉树镜像翻转沙盘，
 * 封装递归推演栈、BFS 队列管道与左神连续内存静态数组可视化面板。
 */

import { TreeCanvasAdapter } from './tree-canvas-adapter';
import { RecursiveCallTraceAdapter } from './recursive-call-trace-adapter';
import { InvertStep, collectTreeValues } from './tree-invert-step-compiler';

/** Card 1: 树画布渲染 (Double Invariant Guard) */
export function renderTreeInvertCanvasForStep(
  container: HTMLElement,
  step: InvertStep,
  primaryColor: string = '#0284c7'
): void {
  const isDone = step.action === 'done';
  const allTreeVals = collectTreeValues(step.tree);
  let current = step.current;
  let visitedNodes = step.visitedNodes;

  if (isDone && step.tree) {
    if (current === null) {
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
    secondaryHighlightedNodes: step.highlightedNodes && step.highlightedNodes.length > 0 ? step.highlightedNodes : undefined,
    primaryColor: isDone ? '#fbbf24' : (step.isSwapping ? '#f59e0b' : primaryColor),
    visitedColor: '#34d399',
    secondaryColor: '#10b981',
  });
}

/** Card 2 缓冲器：Stage 1 指针互换对比面板 */
export function renderStage1SwapBufferHtml(step: InvertStep): string {
  const lVal = step.leftVal !== null ? `${step.leftVal}` : 'null';
  const rVal = step.rightVal !== null ? `${step.rightVal}` : 'null';

  return `
    <div style="display: flex; flex-direction: column; gap: 8px;">
      <div style="display: flex; justify-content: space-between; align-items: center; padding: 6px 12px; background: #f0fdf4; border: 1px solid #bbf7d0; border-radius: 6px;">
        <span style="font-size: 11px; font-weight: 700; color: #166534;">当前指针互换状态:</span>
        <span style="font-size: 12px; font-weight: 700; font-family: monospace; color: #15803d;">
          左孩子: ${lVal} &nbsp;🔀&nbsp; 右孩子: ${rVal}
        </span>
      </div>
      <div style="display: flex; justify-content: space-between; align-items: center; padding: 6px 10px; background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 6px; font-size: 11px; color: #64748b;">
        <span>• 暂存左指针: temp = root.left</span>
        <span>• 互换挂载: root.left = root.right; root.right = temp;</span>
      </div>
    </div>
  `;
}

/** Card 2 缓冲器：Stage 2 队列管道面板 */
export function renderStage2QueueBufferHtml(step: InvertStep): string {
  const q = step.queue ?? [];
  const chips = q.length > 0
    ? q.map((v, idx) => {
        const isHead = idx === 0;
        const bg = isHead ? '#dbeafe' : '#f1f5f9';
        const color = isHead ? '#1e40af' : '#475569';
        const border = isHead ? '#93c5fd' : '#cbd5e1';
        return `<span style="padding: 2px 7px; background: ${bg}; color: ${color}; border: 1px solid ${border}; border-radius: 4px; font-size: 11px; font-weight: 700; font-family: monospace;">${v}</span>`;
      }).join('')
    : '<span style="color:#94a3b8; font-size:11px;">[ 队列已清空 ]</span>';

  return `
    <div style="display: flex; flex-direction: column; gap: 8px;">
      <div style="display: flex; justify-content: space-between; align-items: center; padding: 6px 12px; background: #eff6ff; border: 1px solid #bfdbfe; border-radius: 6px;">
        <span style="font-size: 11px; font-weight: 700; color: #1e40af;">BFS 层序遍历队列大小:</span>
        <span style="font-size: 12px; font-weight: 700; font-family: monospace; color: #1d4ed8;">
          ${q.length} 个待处理节点
        </span>
      </div>
      <div style="display: flex; flex-direction: column; gap: 4px;">
        <span style="font-size: 11px; font-weight: 700; color: #475569;">出队并互换左右子树管道:</span>
        <div style="display: flex; flex-wrap: wrap; gap: 4px; padding: 6px 10px; background: #f8fafc; border: 1px dashed #cbd5e1; border-radius: 6px; min-height: 36px; align-items: center;">
          ${chips}
        </div>
      </div>
    </div>
  `;
}

/** Card 2 缓冲器：Stage 3 静态数组面板 */
export function renderStage3StaticArrayBufferHtml(step: InvertStep): string {
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
          [l=${s?.l ?? 0}, r=${s?.r ?? 0}) | 待处理: ${Math.max(0, (s?.r ?? 0) - (s?.l ?? 0))}
        </span>
      </div>
      <div style="display: flex; gap: 6px; padding: 6px 10px; background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; overflow-x: auto;">
        ${cells}
      </div>
    </div>
  `;
}

/** Card 2 全景指标诊断看板外壳 */
export function renderTreeInvertMetricsShell(step: InvertStep, bufferHtml: string, tipHtml: string): string {
  const curVal = step.current != null ? `节点 ${step.current}` : '—';
  const stateText = step.isSwapping ? '正在互换左右指针' : step.action === 'done' ? '翻转全部完成' : '递归遍历中';
  const stateColor = step.isSwapping ? '#d97706' : step.action === 'done' ? '#16a34a' : '#2563eb';

  return `
    <div style="display: flex; flex-direction: column; gap: 10px; padding: 12px 14px; background: #ffffff; border-radius: 10px; border: 1px solid #e2e8f0; box-shadow: 0 1px 3px rgba(0,0,0,0.03);">
      <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(130px, 1fr)); gap: 8px;">
        <div style="background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 8px 10px;">
          <div style="font-size: 10px; font-weight: 700; color: #64748b; text-transform: uppercase;">当前考察节点</div>
          <div style="font-size: 14px; font-weight: 800; color: #0f172a; margin-top: 2px;">${curVal}</div>
        </div>
        <div style="background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 8px 10px;">
          <div style="font-size: 10px; font-weight: 700; color: #64748b; text-transform: uppercase;">当前状态</div>
          <div style="font-size: 13px; font-weight: 800; color: ${stateColor}; margin-top: 2px;">${stateText}</div>
        </div>
        <div style="background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 8px 10px;">
          <div style="font-size: 10px; font-weight: 700; color: #64748b; text-transform: uppercase;">已互换子树次数</div>
          <div style="font-size: 14px; font-weight: 800; color: #2563eb; margin-top: 2px;">${step.invertedCount} 次</div>
        </div>
        <div style="background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 8px 10px;">
          <div style="font-size: 10px; font-weight: 700; color: #64748b; text-transform: uppercase;">时间复杂度</div>
          <div style="font-size: 13px; font-weight: 800; color: #0d9488; margin-top: 2px;">O(N) · O(H)</div>
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

export class TreeInvertCanvasAdapter {
  static renderCanvas = renderTreeInvertCanvasForStep;

  static renderCustomMetricsStage1(container: HTMLElement, step: InvertStep): void {
    const curVal = step.current != null ? `Node(${step.current})` : '—';
    const isSwapping = step.isSwapping;
    const stateColor = isSwapping ? '#d97706' : step.action === 'done' ? '#16a34a' : '#2563eb';
    const stateText = isSwapping ? '🔄 左右互换中' : step.action === 'done' ? '✅ 全部翻转完成' : '🔍 递归遍历中';

    container.innerHTML = `
      <div style="display: flex; flex-direction: column; gap: 8px; height: 100%; box-sizing: border-box;">
        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(110px, 1fr)); gap: 6px;">
          <div style="background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 6px; padding: 6px 8px;">
            <div style="font-size: 10px; font-weight: 700; color: #64748b; text-transform: uppercase;">当前考察节点</div>
            <div style="font-size: 13px; font-weight: 800; color: #0f172a; margin-top: 1px;">${curVal}</div>
          </div>
          <div style="background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 6px; padding: 6px 8px;">
            <div style="font-size: 10px; font-weight: 700; color: #64748b; text-transform: uppercase;">当前状态</div>
            <div style="font-size: 12px; font-weight: 800; color: ${stateColor}; margin-top: 1px;">${stateText}</div>
          </div>
          <div style="background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 6px; padding: 6px 8px;">
            <div style="font-size: 10px; font-weight: 700; color: #64748b; text-transform: uppercase;">已互换子树次数</div>
            <div style="font-size: 13px; font-weight: 800; color: #2563eb; margin-top: 1px;">${step.invertedCount} 次</div>
          </div>
          <div style="background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 6px; padding: 6px 8px;">
            <div style="font-size: 10px; font-weight: 700; color: #64748b; text-transform: uppercase;">时间复杂度</div>
            <div style="font-size: 12px; font-weight: 800; color: #0d9488; margin-top: 1px;">O(N) · O(H)</div>
          </div>
        </div>

        <div class="tree-invert-trace-host" style="flex: 1; min-height: 140px; overflow: hidden;"></div>
      </div>
    `;

    if (step.callTrace) {
      const traceHost = container.querySelector('.tree-invert-trace-host') as HTMLElement | null;
      if (traceHost) {
        RecursiveCallTraceAdapter.render(traceHost, step.callTrace, {
          title: '📜 翻转二叉树前序递归调用推演栈',
          theme: 'light',
          maxHeight: '100%',
          showTerminalHeader: true,
        });
      }
    }
  }

  static renderCustomMetricsStage2(container: HTMLElement, step: InvertStep): void {
    container.innerHTML = renderTreeInvertMetricsShell(
      step,
      renderStage2QueueBufferHtml(step),
      '广度优先迭代：使用队列按层访问，弹出节点立即互换其左右孩子指针，并将非空孩子入队。'
    );
  }

  static renderCustomMetricsStage3(container: HTMLElement, step: InvertStep): void {
    container.innerHTML = renderTreeInvertMetricsShell(
      step,
      renderStage3StaticArrayBufferHtml(step),
      '左神 Class 036 招牌：queue[MAXN] 连续数组配合 l, r 双指针，彻底消灭 GC 开销！'
    );
  }

  static renderStage1Metrics(container: HTMLElement, step: InvertStep): void {
    TreeInvertCanvasAdapter.renderCustomMetricsStage1(container, step);
  }

  static renderStage2Metrics(container: HTMLElement, step: InvertStep): void {
    TreeInvertCanvasAdapter.renderCustomMetricsStage2(container, step);
  }

  static renderStage3Metrics(container: HTMLElement, step: InvertStep): void {
    TreeInvertCanvasAdapter.renderCustomMetricsStage3(container, step);
  }
}

