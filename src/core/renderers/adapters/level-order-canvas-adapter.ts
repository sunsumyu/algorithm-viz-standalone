/**
 * 二叉树层序遍历视觉与指标看板深模块适配器 (LevelOrderCanvasAdapter)
 * 深度模块 (Deep Module): 封装层序 BFS 队列管道流、静态数组双指针物理槽位、
 * 哈希表层级键值映射、DFS 递归栈与已收集层序结果集 ans 表现层呈现
 * 遵循 Matt Pocock 深模块规范与 Zero-Subbox 表现层契约
 */

import { TreeCanvasAdapter } from './tree-canvas-adapter';
import { TreeNode } from '../../../algorithms/categories/tree/tree-template';

export interface LevelOrderStaticQueueState {
  array: (number | null)[];
  l: number;
  r: number;
  windowSize: number;
}

export interface LevelOrderHashMapState {
  entries: { nodeVal: number; level: number }[];
  currentQueriedNode?: number | null;
  currentQueriedLevel?: number | null;
}

export interface LevelOrderStepPresentation {
  tree: TreeNode | null;
  current: number | null;
  secondaryNodes?: number[];
  visitedNodes?: number[];
  queue: number[];
  result: number[][];
  staticQueueState?: LevelOrderStaticQueueState;
  hashMapState?: LevelOrderHashMapState;
  callStack?: string[];
}

export class LevelOrderCanvasAdapter {
  /**
   * Card 1: 树拓扑画布渲染（精准处理当前节点、队列待访问蓝色、已收集层绿色）
   */
  public static renderLevelOrderCanvas(
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
    const collected = new Set<number>([
      ...step.result.flat(),
      ...(step.currentLevel || []),
      ...(step.visitedNodes || []),
    ]);

    if (step.current != null) {
      collected.delete(step.current);
    }

    const queueSet = new Set<number>(step.queue || []);
    queueSet.forEach((val) => {
      if (step.current !== val) {
        collected.delete(val);
      }
    });

    TreeCanvasAdapter.renderTree(container, {
      tree: step.tree,
      current: step.current,
      secondaryHighlightedNodes: step.queue || [],
      visitedNodes: Array.from(collected),
      primaryColor,
      secondaryColor: '#60a5fa',
      visitedColor: '#34d399',
    });
  }

  /**
   * 统一标准指标字典生成器
   */
  public static makeMetrics(lvl: number, qLen: number, totalCols: number): Record<string, string | number> {
    return {
      'cur-level': `第 ${lvl} 层`,
      'queue-size': qLen,
      'total-collected': `${totalCols} 层`,
      'metric-cur-level': `第 ${lvl} 层`,
      'metric-queue-size': qLen,
      'metric-total-collected': `${totalCols} 层`,
    };
  }

  /**
   * 缓冲器呈现器 1：标准 FIFO 队列管道流
   */
  public static renderQueueBufferHtml(queue: number[]): string {
    const chips = queue.length > 0
      ? queue.map((v, idx) => `
          <div style="display: flex; align-items: center;">
            <span style="padding: 3px 8px; background: #eff6ff; border: 1px solid #bfdbfe; color: #1e40af; border-radius: 6px; font-size: 11px; font-weight: 700; font-family: monospace;">${v}</span>
            ${idx < queue.length - 1 ? '<span style="color: #94a3b8; font-size: 10px; margin: 0 4px;">➔</span>' : ''}
          </div>`).join('')
      : '<span style="color:#94a3b8; font-size:11px; font-style:italic;">队列为空 (Empty)</span>';

    return `
      <div style="display: flex; flex-direction: column; gap: 4px;">
        <span style="font-size: 11px; font-weight: 700; color: #334155; display: flex; align-items: center; justify-content: space-between;">
          <span style="display: flex; align-items: center; gap: 4px;"><span>🥞</span> BFS 队列管道流 (队首 ➔ 队尾):</span>
          <span style="color: #2563eb; font-size: 10px; font-weight: 600;">当前大小: ${queue.length}</span>
        </span>
        <div style="display: flex; flex-wrap: wrap; align-items: center; gap: 4px; padding: 6px 10px; background: #f8fafc; border: 1px dashed #cbd5e1; border-radius: 8px; min-height: 38px;">
          ${chips}
        </div>
      </div>
    `;
  }

  /**
   * 缓冲器呈现器 2：静态数组模拟队列 (连续物理槽位 + l/r 双指针)
   */
  public static renderStaticArrayBufferHtml(state?: LevelOrderStaticQueueState): string {
    if (!state) return '';
    const { array, l, r, windowSize } = state;
    const maxSlots = Math.min(array.length, 10);
    const slotsHtml: string[] = [];

    for (let i = 0; i < maxSlots; i++) {
      const val = array[i];
      const isL = i === l;
      const isR = i === r;
      const inWindow = i >= l && i < r;

      let bg = '#ffffff';
      let border = '#e2e8f0';
      let text = '#94a3b8';

      if (inWindow) {
        bg = '#dbeafe';
        border = '#3b82f6';
        text = '#1d4ed8';
      } else if (i < l) {
        bg = '#f1f5f9';
        border = '#cbd5e1';
        text = '#64748b';
      }

      slotsHtml.push(`
        <div style="display: flex; flex-direction: column; align-items: center; gap: 2px;">
          <div style="font-size: 9px; font-family: monospace; color: #64748b;">[${i}]</div>
          <div style="width: 32px; height: 32px; display: flex; align-items: center; justify-content: center; background: ${bg}; border: 1.5px solid ${border}; border-radius: 6px; font-weight: 700; font-size: 12px; color: ${text}; font-family: monospace;">
            ${val != null ? val : '·'}
          </div>
          <div style="display: flex; gap: 2px; min-height: 14px;">
            ${isL ? '<span style="font-size: 9px; padding: 0 3px; background: #ef4444; color: #fff; border-radius: 3px; font-weight: 700;">l</span>' : ''}
            ${isR ? '<span style="font-size: 9px; padding: 0 3px; background: #10b981; color: #fff; border-radius: 3px; font-weight: 700;">r</span>' : ''}
          </div>
        </div>
      `);
    }

    return `
      <div style="display: flex; flex-direction: column; gap: 4px;">
        <div style="font-size: 11px; font-weight: 700; color: #334155; display: flex; align-items: center; justify-content: space-between;">
          <span style="display: flex; align-items: center; gap: 4px;"><span>⚡</span> 静态数组 queue[MAXN] (l/r 双指针游标):</span>
          <span style="color: #059669; font-size: 10.5px; font-family: monospace; font-weight: 600;">size = r - l = ${r} - ${l} = ${windowSize}</span>
        </div>
        <div style="display: flex; align-items: center; gap: 6px; padding: 8px 10px; background: #f8fafc; border: 1px dashed #cbd5e1; border-radius: 8px; overflow-x: auto;">
          ${slotsHtml.join('')}
          ${array.length > maxSlots ? '<span style="color: #94a3b8; font-size: 11px; margin-left: 4px;">...</span>' : ''}
        </div>
      </div>
    `;
  }

  /**
   * 缓冲器呈现器 3：哈希表键值映射表 (节点 ➔ 层号)
   */
  public static renderHashMapBufferHtml(state?: LevelOrderHashMapState): string {
    if (!state) return '';
    const { entries, currentQueriedNode } = state;

    const chips = entries.length > 0
      ? entries.map((item) => {
          const isCurrent = item.nodeVal === currentQueriedNode;
          return `
            <div style="display: flex; align-items: center; gap: 4px; padding: 3px 8px; background: ${isCurrent ? '#fef3c7' : '#ffffff'}; border: 1px solid ${isCurrent ? '#f59e0b' : '#e2e8f0'}; border-radius: 6px; font-size: 11px; font-family: monospace;">
              <span style="font-weight: 700; color: ${isCurrent ? '#b45309' : '#1e293b'};">Node(${item.nodeVal})</span>
              <span style="color: #94a3b8;">➔</span>
              <span style="color: #2563eb; font-weight: 600;">L${item.level}</span>
            </div>
          `;
        }).join('')
      : '<span style="color:#94a3b8; font-size:11px; font-style:italic;">哈希表尚未填充</span>';

    return `
      <div style="display: flex; flex-direction: column; gap: 4px;">
        <div style="font-size: 11px; font-weight: 700; color: #334155; display: flex; align-items: center; justify-content: space-between;">
          <span style="display: flex; align-items: center; gap: 4px;"><span>🗺️</span> HashMap&lt;TreeNode, Integer&gt; 层级映射 (反面教材):</span>
          <span style="color: #ea580c; font-size: 10px; font-weight: 600;">键值数量: ${entries.length}</span>
        </div>
        <div style="display: flex; flex-wrap: wrap; gap: 6px; padding: 6px 10px; background: #f8fafc; border: 1px dashed #cbd5e1; border-radius: 8px; max-height: 100px; overflow-y: auto;">
          ${chips}
        </div>
      </div>
    `;
  }

  /**
   * 缓冲器呈现器 4：DFS 递归调用栈
   */
  public static renderDfsStackBufferHtml(callStack?: string[]): string {
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
          <span>📚</span> DFS 递归调用栈 (栈底 → 栈顶):
        </span>
        <div style="display: flex; flex-direction: column; gap: 3px; padding: 6px 10px; background: #f8fafc; border: 1px dashed #cbd5e1; border-radius: 8px; max-height: 120px; overflow-y: auto;">
          ${stackHtml}
        </div>
      </div>
    `;
  }

  /**
   * 统一外壳容器组件：包含缓冲器卡片与已收集层序结果集卡片
   */
  public static renderLevelOrderMetricsShell(
    step: { result: number[][] },
    bufferHtml: string
  ): string {
    const layersHtml = step.result.length > 0
      ? step.result.map((layer, idx) => `
          <div style="display: flex; align-items: center; gap: 6px; padding: 2px 8px; background: #f0fdf4; border: 1px solid #bbf7d0; border-radius: 6px;">
            <span style="font-size: 10.5px; font-weight: 700; color: #166534;">第 ${idx} 层:</span>
            <span style="font-size: 11px; font-family: monospace; color: #15803d; font-weight: 600;">[${layer.join(', ')}]</span>
          </div>`).join('')
      : '<span style="color:#94a3b8; font-size:11px; font-style:italic;">等待收集第一层...</span>';

    return `
      <div style="display: flex; flex-direction: column; gap: 10px; padding: 6px 0;">
        ${bufferHtml}
        <div style="display: flex; flex-direction: column; gap: 4px;">
          <span style="font-size: 11px; font-weight: 700; color: #334155; display: flex; align-items: center; gap: 4px;">
            <span>📦</span> 已收集层序结果集 ans:
          </span>
          <div style="display: flex; flex-wrap: wrap; gap: 6px; padding: 6px 10px; background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px;">
            ${layersHtml}
          </div>
        </div>
      </div>
    `;
  }

  /**
   * Card 2: 依据阶段自动组装指标与缓冲器容器
   */
  public static renderCustomMetrics(
    container: HTMLElement,
    step: LevelOrderStepPresentation,
    stageId?: string
  ): void {
    let bufferHtml = '';

    if (stageId === 'stage-2' || step.staticQueueState) {
      bufferHtml = this.renderStaticArrayBufferHtml(step.staticQueueState);
    } else if (stageId === 'stage-3' || step.hashMapState) {
      bufferHtml = this.renderHashMapBufferHtml(step.hashMapState);
    } else if (stageId === 'stage-4' || step.callStack) {
      bufferHtml = this.renderDfsStackBufferHtml(step.callStack);
    } else {
      bufferHtml = this.renderQueueBufferHtml(step.queue || []);
    }

    container.innerHTML = this.renderLevelOrderMetricsShell(step, bufferHtml);
  }
}
