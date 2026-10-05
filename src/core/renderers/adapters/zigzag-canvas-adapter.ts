/**
 * 二叉树锯齿形层序遍历视觉呈现深模块适配器 (ZigzagCanvasAdapter)
 * 深度模块 (Deep Module): 封装锯齿形 BFS 双端收集、静态数组双向读指针、
 * 递归 DFS 深度映射、以及锯齿折返结果集 ans 表现层呈现
 * 遵循 Matt Pocock 深模块规范与 Zero-Subbox 表现层契约
 */

import { LevelOrderCanvasAdapter } from './level-order-canvas-adapter';
import { TreeNode } from '../../../algorithms/categories/tree/tree-template';

export interface ZigzagStaticQueueState {
  array: (number | null)[];
  l: number;
  r: number;
  windowSize: number;
  isReverse: boolean;
  readingIndex?: number;
}

export interface ZigzagStepPresentation {
  tree: TreeNode | null;
  current: number | null;
  levelIndex: number;
  levelSize: number;
  isReverse: boolean;
  queue: number[];
  currentLevel: number[];
  result: number[][];
  visitedNodes?: number[];
  staticQueueState?: ZigzagStaticQueueState;
  callStack?: string[];
}

export class ZigzagCanvasAdapter {
  /**
   * Card 1: 树拓扑画布渲染（精准复用 LevelOrderCanvasAdapter 核心接缝）
   */
  public static renderCanvas(
    container: HTMLElement,
    step: {
      tree: TreeNode | null;
      current: number | null;
      queue?: number[];
      result: number[][];
      currentLevel?: number[];
      visitedNodes?: number[];
    },
    primaryColor: string = '#fbbf24'
  ): void {
    LevelOrderCanvasAdapter.renderLevelOrderCanvas(container, step, primaryColor);
  }

  /**
   * 指标字典生成器（支持方向指示）
   */
  public static makeMetrics(
    lvl: number,
    qLen: number,
    totalCols: number,
    isRev: boolean
  ): Record<string, string | number> {
    return {
      'cur-level': `第 ${lvl} 层`,
      'queue-size': qLen,
      'total-collected': `${totalCols} 层`,
      'current-dir': isRev ? '从右向左 ⬅️' : '从左向右 ➡️',
      'metric-cur-level': `第 ${lvl} 层`,
      'metric-queue-size': qLen,
      'metric-total-collected': `${totalCols} 层`,
    };
  }

  /**
   * 统一外壳容器组件：包含缓冲器卡片与已收集锯齿折返层序结果集
   */
  public static renderMetricsShell(
    step: { result: number[][] },
    bufferHtml: string
  ): string {
    const layersHtml = step.result.length > 0
      ? step.result.map((layer, idx) => {
          const isOdd = idx % 2 === 1;
          return `
          <div style="display: flex; align-items: center; gap: 6px; padding: 2px 8px; background: ${isOdd ? '#eff6ff' : '#f0fdf4'}; border: 1px solid ${isOdd ? '#bfdbfe' : '#bbf7d0'}; border-radius: 6px;">
            <span style="font-size: 10.5px; font-weight: 700; color: ${isOdd ? '#1e40af' : '#166534'};">第 ${idx} 层 (${isOdd ? '⬅️ 逆序' : '➡️ 顺序'}):</span>
            <span style="font-size: 11px; font-family: monospace; color: ${isOdd ? '#2563eb' : '#15803d'}; font-weight: 600;">[${layer.join(', ')}]</span>
          </div>`;
        }).join('')
      : '<span style="color:#94a3b8; font-size:11px; font-style:italic;">等待收集第一层...</span>';

    return `
      <div style="display: flex; flex-direction: column; gap: 10px; padding: 6px 0;">
        ${bufferHtml}
        <div style="display: flex; flex-direction: column; gap: 4px;">
          <span style="font-size: 11px; font-weight: 700; color: #334155; display: flex; align-items: center; gap: 4px;">
            <span>📦</span> 锯齿折返结果集 ans (之字形交替):
          </span>
          <div style="display: flex; flex-wrap: wrap; gap: 6px; padding: 6px 10px; background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px;">
            ${layersHtml}
          </div>
        </div>
      </div>
    `;
  }

  /**
   * 缓冲器 1：Stage 1 标准队列与双端收集缓冲区
   */
  public static renderStage1BufferHtml(
    queue: number[],
    currentLevel: number[],
    isReverse: boolean
  ): string {
    const qChips = queue.length > 0
      ? queue.map((v) => `<span style="padding: 2px 7px; background: #dbeafe; color: #1e40af; border: 1px solid #bfdbfe; border-radius: 4px; font-size: 11px; font-family: monospace; font-weight: 600;">${v}</span>`).join('')
      : '<span style="color:#94a3b8; font-size:11px; font-style:italic;">队列为空</span>';

    const levelChips = currentLevel.length > 0
      ? currentLevel.map((v) => `<span style="padding: 2px 7px; background: #fef3c7; color: #92400e; border: 1px solid #fde68a; border-radius: 4px; font-size: 11px; font-family: monospace; font-weight: 600;">${v}</span>`).join('')
      : '<span style="color:#94a3b8; font-size:11px; font-style:italic;">本层尚无收集</span>';

    return `
      <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 8px;">
        <div style="display: flex; flex-direction: column; gap: 3px;">
          <span style="font-size: 11px; font-weight: 700; color: #334155; display: flex; align-items: center; gap: 4px;">
            <span>🥞</span> FIFO 主队列 (左 ➔ 右):
          </span>
          <div style="display: flex; flex-wrap: wrap; gap: 4px; padding: 6px 8px; background: #f8fafc; border: 1px dashed #cbd5e1; border-radius: 6px; min-height: 32px; align-items: center;">
            ${qChips}
          </div>
        </div>
        <div style="display: flex; flex-direction: column; gap: 3px;">
          <span style="font-size: 11px; font-weight: 700; color: #334155; display: flex; align-items: center; gap: 4px;">
            <span>🔄</span> 本层双端收集 (方向: ${isReverse ? '<span style="color:#dc2626;font-weight:700;">⬅️ 头插 addFirst</span>' : '<span style="color:#16a34a;font-weight:700;">➡️ 尾插 addLast</span>'}):
          </span>
          <div style="display: flex; flex-wrap: wrap; gap: 4px; padding: 6px 8px; background: #f8fafc; border: 1px dashed #cbd5e1; border-radius: 6px; min-height: 32px; align-items: center;">
            ${levelChips}
          </div>
        </div>
      </div>
    `;
  }

  /**
   * 缓冲器 2：Stage 2 静态连续数组 queue[MAXN] 与 l/r 双指针监视器
   */
  public static renderStage2BufferHtml(state?: ZigzagStaticQueueState): string {
    if (!state) return '';
    const { array, l, r, isReverse, readingIndex } = state;
    const maxDisplay = Math.max(r + 2, 8);
    const cells: string[] = [];

    for (let i = 0; i < maxDisplay; i++) {
      const val = i < array.length ? array[i] : null;
      const isInside = i >= l && i < r;
      const isCurrentRead = readingIndex !== undefined && i === readingIndex;
      const isL = i === l;
      const isR = i === r;

      let bg = '#ffffff';
      let borderColor = '#e2e8f0';
      let textColor = '#64748b';

      if (isCurrentRead) {
        bg = '#fef3c7';
        borderColor = '#f59e0b';
        textColor = '#b45309';
      } else if (isInside) {
        bg = '#e0f2fe';
        borderColor = '#7dd3fc';
        textColor = '#0369a1';
      }

      const pointerTags: string[] = [];
      if (isL) pointerTags.push('<span style="color:#ea580c;font-weight:800;">l</span>');
      if (isR) pointerTags.push('<span style="color:#2563eb;font-weight:800;">r</span>');

      cells.push(`
        <div style="display: flex; flex-direction: column; align-items: center; min-width: 32px;">
          <div style="height: 14px; font-size: 9.5px; font-weight: 700; font-family: monospace;">
            ${pointerTags.join('/')}
          </div>
          <div style="width: 32px; height: 32px; display: flex; align-items: center; justify-content: center; background: ${bg}; border: 1.5px solid ${borderColor}; border-radius: 6px; font-size: 11.5px; font-family: monospace; font-weight: 700; color: ${textColor};">
            ${val !== null && val !== undefined ? val : '—'}
          </div>
          <div style="font-size: 9px; color: #94a3b8; font-family: monospace; margin-top: 1px;">
            [${i}]
          </div>
        </div>
      `);
    }

    return `
      <div style="display: flex; flex-direction: column; gap: 4px;">
        <div style="font-size: 11px; font-weight: 700; color: #334155; display: flex; align-items: center; justify-content: space-between;">
          <span style="display: flex; align-items: center; gap: 4px;"><span>🏎️</span> 静态数组 queue[MAXN] 连续内存 (Class 036 招牌零 GC):</span>
          <span style="color: #0284c7; font-size: 10px; font-weight: 600;">
            [l=${l}, r=${r}) 窗口大小: ${r - l} | 读取方向: ${isReverse ? '⬅️ 逆序从 r-1 倒扫到 l' : '➡️ 顺序从 l 顺扫到 r-1'}
          </span>
        </div>
        <div style="display: flex; gap: 4px; padding: 6px 10px; background: #f8fafc; border: 1px dashed #cbd5e1; border-radius: 8px; overflow-x: auto;">
          ${cells.join('')}
        </div>
      </div>
    `;
  }

  /**
   * 缓冲器 3：Stage 3 DFS 递归调用栈
   */
  public static renderStage3BufferHtml(callStack?: string[]): string {
    const stackHtml = callStack && callStack.length > 0
      ? callStack.map((entry, idx) => `
          <div style="display: flex; align-items: center; gap: 4px;">
            <span style="font-size: 10px; color: #94a3b8; font-family: monospace; min-width: 18px; text-align: right;">${idx}</span>
            <span style="padding: 3px 8px; background: ${idx === callStack.length - 1 ? '#fef3c7' : '#f1f5f9'}; border: 1px solid ${idx === callStack.length - 1 ? '#f59e0b' : '#e2e8f0'}; color: ${idx === callStack.length - 1 ? '#92400e' : '#475569'}; border-radius: 6px; font-size: 11px; font-weight: 600; font-family: monospace;">${entry}</span>
          </div>`).join('')
      : '<span style="color:#94a3b8; font-size:11px; font-style:italic;">调用栈为空</span>';

    return `
      <div style="display: flex; flex-direction: column; gap: 4px;">
        <span style="font-size: 11px; font-weight: 700; color: #334155; display: flex; align-items: center; gap: 4px;">
          <span>📚</span> DFS 递归调用栈 (深度映射: 奇数层头插 / 偶数层尾插):
        </span>
        <div style="display: flex; flex-direction: column; gap: 3px; padding: 6px 10px; background: #f8fafc; border: 1px dashed #cbd5e1; border-radius: 8px; max-height: 120px; overflow-y: auto;">
          ${stackHtml}
        </div>
      </div>
    `;
  }
}
