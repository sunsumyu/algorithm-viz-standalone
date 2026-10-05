/**
 * 二叉树最大宽度视觉呈现深模块适配器 (WidthCanvasAdapter)
 * 深度模块 (Deep Module): 封装最大宽度完全二叉树编号模型、
 * 静态双连续数组槽位、DFS 深度映射表、各层跨度结算、以及最大跨度端点标尺
 * 遵循 Matt Pocock 深模块规范与 Zero-Subbox 表现层契约
 */

import { TreeCanvasAdapter } from './tree-canvas-adapter';
import { TreeNode } from '../../../algorithms/categories/tree/tree-template';

export interface Width036StaticQueueState {
  nq: (number | string)[];
  iq: (number | string)[];
  l: number;
  r: number;
  base: number;
  windowSize: number;
}

export interface WidthStepPresentation {
  tree: TreeNode | null;
  current: number | null;
  levelIndex: number;
  maxWidth: number;
  currentSpan: number;
  action: string;
  nodeIndices: Map<number, number>;
  queueItems?: { val: number; rawIdx: number; normalizedIdx?: number }[];
  staticQueueState?: Width036StaticQueueState;
  dfsState?: {
    leftMost: Map<number, number>;
    currentDepth: number;
    currentIndex: number;
    callStack: string[];
  };
  levelSpans?: { level: number; leftIdx: number; rightIdx: number; span: number }[];
  visitedNodes?: Set<number> | number[];
  maxWidthEndpoints?: [number, number];
  highlightedNodes?: number[];
}

export class WidthCanvasAdapter {
  /**
   * 指标字典生成器
   */
  public static makeMetrics(
    curVal: number | null,
    level: number,
    span: number,
    maxW: number
  ): Record<string, string | number> {
    return {
      'cur-node': curVal !== null ? curVal : '—',
      'cur-level': `第 ${level} 层`,
      'cur-span': span,
      'max-width': maxW,
      '最终最大宽度 maxWidth': maxW,
      '当前层号': level,
      '本层跨度': span,
      '历史最大宽度': maxW,
    };
  }

  /**
   * 统一外壳容器组件：包含缓冲器卡片与各层跨度结算历史
   */
  public static renderMetricsShell(
    step: { levelSpans?: { level: number; leftIdx: number; rightIdx: number; span: number }[]; maxWidth: number },
    bufferHtml: string
  ): string {
    const spansHtml = step.levelSpans && step.levelSpans.length > 0
      ? step.levelSpans.map((sp) => `
          <div style="display: flex; align-items: center; gap: 6px; padding: 2px 8px; background: #f0fdf4; border: 1px solid #bbf7d0; border-radius: 6px;">
            <span style="font-size: 10.5px; font-weight: 700; color: #166534;">第 ${sp.level} 层:</span>
            <span style="font-size: 11px; font-family: monospace; color: #15803d; font-weight: 600;">[#${sp.leftIdx} ~ #${sp.rightIdx}] 跨度: ${sp.span}</span>
          </div>
        `).join('')
      : '<span style="color:#94a3b8; font-size:11px; font-style:italic;">等待首层跨度结算...</span>';

    return `
      <div style="display: flex; flex-direction: column; gap: 10px; padding: 6px 0;">
        ${bufferHtml}
        <div style="display: flex; flex-direction: column; gap: 4px;">
          <span style="font-size: 11px; font-weight: 700; color: #334155; display: flex; align-items: center; gap: 4px;">
            <span>📏</span> 各层跨度结算记录 (最大跨度: <strong style="color: #0284c7; font-size: 13px;">${step.maxWidth}</strong>):
          </span>
          <div style="display: flex; flex-wrap: wrap; gap: 6px; padding: 6px 10px; background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px;">
            ${spansHtml}
          </div>
        </div>
      </div>
    `;
  }

  /**
   * 缓冲器 1：Stage 1 标准队列与归一化编号监视器
   */
  public static renderStage1QueueBufferHtml(step: {
    levelIndex: number;
    currentSpan: number;
    maxWidth: number;
    queueItems?: { val: number; rawIdx: number; normalizedIdx?: number }[];
  }): string {
    const items = step.queueItems && step.queueItems.length > 0
      ? step.queueItems.map((item) => `
          <div style="display: flex; align-items: center; gap: 4px; padding: 3px 8px; background: #e0f2fe; border: 1px solid #7dd3fc; border-radius: 6px; font-size: 11px; font-family: monospace;">
            <strong style="color: #0369a1;">Node ${item.val}</strong>
            <span style="color: #64748b;">(raw: ${item.rawIdx}${item.normalizedIdx !== undefined ? `, idx: ${item.normalizedIdx}` : ''})</span>
          </div>
        `).join('')
      : '<span style="color:#94a3b8; font-size:11px; font-style:italic;">队列为空</span>';

    return `
      <div style="display: flex; flex-direction: column; gap: 6px;">
        <div style="display: flex; justify-content: space-between; align-items: center; padding: 6px 10px; background: #eff6ff; border: 1px solid #bfdbfe; border-radius: 6px;">
          <span style="font-size: 11px; font-weight: 700; color: #1e40af;">当前层号 / 结算跨度:</span>
          <span style="font-size: 12px; font-weight: 700; color: #2563eb; font-family: monospace;">
            第 ${step.levelIndex} 层 | 跨度: ${step.currentSpan} | 最大: ${step.maxWidth}
          </span>
        </div>
        <div style="display: flex; flex-direction: column; gap: 4px;">
          <span style="font-size: 11px; font-weight: 700; color: #334155;">🥞 FIFO 节点队列 (含完全二叉树编号):</span>
          <div style="display: flex; flex-wrap: wrap; gap: 4px; padding: 6px 10px; background: #f8fafc; border: 1px dashed #cbd5e1; border-radius: 6px; min-height: 36px; align-items: center;">
            ${items}
          </div>
        </div>
      </div>
    `;
  }

  /**
   * 缓冲器 2：Stage 2 连续内存双数组 nq[MAXN] / iq[MAXN] 监视器
   */
  public static renderStage2StaticArrayBufferHtml(state?: Width036StaticQueueState): string {
    if (!state) return '';
    const { nq, iq, l, r } = state;
    const maxDisplay = Math.min(Math.max(r + 2, 8), 14);
    const cells: string[] = [];

    for (let i = 0; i < maxDisplay; i++) {
      const nodeVal = i < nq.length && nq[i] != null ? nq[i] : '—';
      const idxVal = i < iq.length && iq[i] != null ? iq[i] : '—';
      const isInside = i >= l && i < r;
      const isL = i === l;
      const isR = i === r;

      let bg = '#ffffff';
      let borderColor = '#e2e8f0';
      let textColor = '#64748b';

      if (isInside) {
        bg = '#e0f2fe';
        borderColor = '#7dd3fc';
        textColor = '#0369a1';
      }

      let ptrLabel = '&nbsp;';
      if (isL && isR) ptrLabel = '<span style="color:#ef4444; font-weight:800; font-size:9.5px;">l/r</span>';
      else if (isL) ptrLabel = '<span style="color:#0284c7; font-weight:800; font-size:9.5px;">l↓</span>';
      else if (isR) ptrLabel = '<span style="color:#10b981; font-weight:800; font-size:9.5px;">r↓</span>';

      cells.push(`
        <div style="display: flex; flex-direction: column; align-items: center; gap: 2px;">
          <div style="height: 12px; line-height: 12px; font-size: 9px; font-family: monospace;">${ptrLabel}</div>
          <div style="width: 40px; height: 42px; display: flex; flex-direction: column; align-items: center; justify-content: center; background: ${bg}; border: 1.5px solid ${borderColor}; border-radius: 6px; font-family: monospace; font-size: 11px;">
            <strong style="color: ${textColor};">${nodeVal}</strong>
            <span style="font-size: 9px; color: #94a3b8;">#${idxVal}</span>
          </div>
          <span style="font-size: 9px; color: #94a3b8; font-family: monospace;">[${i}]</span>
        </div>
      `);
    }

    const windowSize = Math.max(0, r - l);
    const curSpan = r > l && iq[r - 1] !== '—' && iq[l] !== '—' ? Number(iq[r - 1]) - Number(iq[l]) + 1 : 0;

    return `
      <div style="display: flex; flex-direction: column; gap: 8px;">
        <div style="display: flex; justify-content: space-between; align-items: center; padding: 6px 10px; background: #fffbeb; border: 1px solid #fde68a; border-radius: 6px;">
          <span style="font-size: 11px; font-weight: 700; color: #92400e;">左神双数组连续内存监视 (零 GC):</span>
          <span style="font-size: 12px; font-weight: 700; color: #b45309; font-family: monospace;">
            [l=${l}, r=${r}) | 窗口大小: ${windowSize} | 本层跨度: ${curSpan}
          </span>
        </div>
        <div style="display: flex; flex-direction: column; gap: 3px;">
          <span style="font-size: 11px; font-weight: 700; color: #334155;">🏎️ nq[MAXN] 节点与 iq[MAXN] 编号连续槽位:</span>
          <div style="display: flex; gap: 6px; padding: 8px 10px; background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; overflow-x: auto;">
            ${cells.join('')}
          </div>
        </div>
      </div>
    `;
  }

  /**
   * 缓冲器 3：Stage 3 DFS 深度映射表监视器
   */
  public static renderStage3DfsBufferHtml(step: {
    dfsState?: {
      leftMost: Map<number, number>;
      currentDepth: number;
      currentIndex: number;
    };
  }): string {
    const state = step.dfsState;
    if (!state) return '';
    const { leftMost, currentDepth, currentIndex } = state;

    const entries: string[] = [];
    leftMost.forEach((idx, depth) => {
      const isCur = depth === currentDepth;
      entries.push(`
        <div style="display: flex; align-items: center; justify-content: space-between; padding: 4px 8px; background: ${isCur ? '#fef3c7' : '#ffffff'}; border: 1px solid ${isCur ? '#f59e0b' : '#e2e8f0'}; border-radius: 6px; font-size: 11px;">
          <span style="color: ${isCur ? '#92400e' : '#475569'}; font-weight: 600;">深度 ${depth}:</span>
          <span style="font-family: monospace; font-weight: 700; color: ${isCur ? '#b45309' : '#0284c7'};">首访编号: #${idx}</span>
        </div>
      `);
    });

    const leftForCur = leftMost.get(currentDepth);
    const curFormula = leftForCur !== undefined
      ? `${currentIndex} - ${leftForCur} + 1 = ${currentIndex - leftForCur + 1}`
      : '首访入表';

    return `
      <div style="display: flex; flex-direction: column; gap: 8px;">
        <div style="display: flex; justify-content: space-between; align-items: center; padding: 6px 10px; background: #ecfdf5; border: 1px solid #a7f3d0; border-radius: 6px;">
          <span style="font-size: 11px; font-weight: 700; color: #065f46;">DFS 深度映射计算:</span>
          <span style="font-size: 12px; font-weight: 700; color: #047857; font-family: monospace;">
            depth: ${currentDepth}, index: ${currentIndex} → 跨度: ${curFormula}
          </span>
        </div>
        <div style="display: flex; flex-direction: column; gap: 3px;">
          <span style="font-size: 11px; font-weight: 700; color: #334155;">🗺️ 各深度首访最左编号表 leftMost:</span>
          <div style="display: grid; grid-template-columns: repeat(auto-fill, minmax(130px, 1fr)); gap: 6px; padding: 8px 10px; background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px;">
            ${entries.length > 0 ? entries.join('') : '<span style="color:#94a3b8; font-size:11px;">等待 DFS 遍历...</span>'}
          </div>
        </div>
      </div>
    `;
  }

  /**
   * 统一画布呈现 (全景高亮常驻与端点跨度标尺契约)
   */
  public static renderCanvas(
    container: HTMLElement,
    step: WidthStepPresentation,
    primaryColor: string = '#0284c7'
  ): void {
    const labels = new Map<number, string>();
    const isDone = step.action === 'done';
    const endpoints = step.maxWidthEndpoints || [];
    const [leftEnd, rightEnd] = endpoints.length >= 2 ? endpoints : [null, null];

    if (step.nodeIndices) {
      step.nodeIndices.forEach((idx, val) => {
        if (isDone && val === leftEnd) {
          labels.set(val, `#${idx} [最左]`);
        } else if (isDone && val === rightEnd) {
          labels.set(val, `#${idx} [最右 · 跨度${step.maxWidth}]`);
        } else {
          labels.set(val, `#${idx}`);
        }
      });
    }

    let secondaryNodes: number[] = [];
    if (step.queueItems && step.queueItems.length > 0) {
      secondaryNodes = step.queueItems.map((q) => q.val);
    } else if (step.staticQueueState && step.staticQueueState.nq) {
      const { nq, l, r } = step.staticQueueState;
      for (let i = l; i < r && i < nq.length; i++) {
        const item = nq[i];
        if (typeof item === 'number') secondaryNodes.push(item);
      }
    }

    const visitedArr = step.visitedNodes ? Array.from(step.visitedNodes) : [];
    const highlightedNodes = step.highlightedNodes || (isDone && endpoints.length > 0 ? endpoints : []);

    TreeCanvasAdapter.renderTree(container, {
      tree: step.tree,
      current: step.current,
      highlightedNodes,
      secondaryHighlightedNodes: secondaryNodes,
      visitedNodes: visitedArr,
      primaryColor: isDone ? '#eab308' : primaryColor,
      secondaryColor: '#38bdf8',
      visitedColor: '#10b981',
      labels,
    });
  }
}
