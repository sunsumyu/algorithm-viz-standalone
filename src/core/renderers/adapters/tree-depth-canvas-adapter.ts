/**
 * 二叉树深度族群视觉与看板呈现适配器 (TreeDepthCanvasAdapter)
 *
 * 遵循 Matt Pocock 深模块规范与 Zero-Subbox 表现层契约，
 * 封装最大深度 (LeetCode 104) 与最小深度 (LeetCode 111) 的拓扑画布、
 * 递归调用推演栈、FIFO 队列指标、静态连续内存双指针监视器的表现层呈现。
 */

import { TreeCanvasAdapter } from './tree-canvas-adapter';
import {
  RecursiveCallTraceAdapter,
} from './recursive-call-trace-adapter';
import {
  TDStep,
  MinDepthStep,
  TDStaticQueueState,
  collectTreeValues,
} from './tree-depth-step-compiler';

export class TreeDepthCanvasAdapter {
  /**
   * 收集树中所有非空节点值
   */
  public static collectTreeValues = collectTreeValues;

  /**
   * 渲染最大深度拓扑画布 (Card 1)
   */
  public static renderTreeDepthCanvas(
    container: HTMLElement,
    step: TDStep,
    primaryColor: string = '#fbbf24'
  ): void {
    const isDone = step.action === 'done';
    const allTreeVals = collectTreeValues(step.tree);
    const resolvedNodes = isDone ? allTreeVals : Array.from(step.depthsMap.keys());
    const current = isDone && step.current === null && step.tree ? step.tree.val : step.current;

    if (step.tree) {
      TreeCanvasAdapter.renderTree(container, {
        tree: step.tree,
        current,
        secondaryHighlightedNodes: step.queue || resolvedNodes,
        visitedNodes: resolvedNodes,
        primaryColor,
        secondaryColor: '#60a5fa',
        visitedColor: '#34d399',
      });
    } else {
      container.innerHTML = `
        <div style="display: flex; flex-direction: column; align-items: center; justify-content: center; height: 240px; width: 100%;">
          <svg width="240" height="120" viewBox="0 0 240 120">
            <circle cx="120" cy="50" r="24" fill="#eff6ff" stroke="#3b82f6" stroke-width="2" stroke-dasharray="4,4"/>
            <text x="120" y="55" text-anchor="middle" font-size="11" fill="#3b82f6" font-weight="bold">空树或初始化</text>
          </svg>
          <span style="font-size: 11px; color: #64748b; margin-top: 8px;">准备计算二叉树最大深度...</span>
        </div>
      `;
    }
  }

  /**
   * 渲染最大深度 Stage 1 左右深度比对与递归调用栈看板 (Card 2)
   */
  public static renderMaxDepthStage1Metrics(container: HTMLElement, step: TDStep): void {
    const depthBadges =
      step.depthsMap.size > 0
        ? Array.from(step.depthsMap.entries())
            .map(
              ([val, d]) => `
            <div style="display: flex; align-items: center; gap: 4px; padding: 2px 7px; background: #f0fdf4; border: 1px solid #bbf7d0; border-radius: 6px;">
              <span style="font-weight: 700; color: #166534; font-size: 10.5px;">节点 ${val}:</span>
              <span style="font-family: monospace; font-size: 10.5px; color: #15803d; font-weight: 700;">深=${d}</span>
            </div>`
            )
            .join('')
        : '<span style="color:#94a3b8; font-size: 10.5px; font-style:italic;">等待首个叶节点深度归约...</span>';

    container.innerHTML = `
      <div style="display: flex; flex-direction: column; height: 100%; gap: 6px; font-size: 11px;">
        <div style="display: flex; flex-direction: column; gap: 4px; flex-shrink: 0;">
          <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 6px;">
            <div style="padding: 4px 8px; background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 6px; display: flex; align-items: center; justify-content: space-between;">
              <span style="font-size: 10px; color: #64748b;">左深 (leftDepth):</span>
              <span style="font-weight: 700; font-size: 12px; color: #2563eb;">${step.leftDepth}</span>
            </div>
            <div style="padding: 4px 8px; background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 6px; display: flex; align-items: center; justify-content: space-between;">
              <span style="font-size: 10px; color: #64748b;">右深 (rightDepth):</span>
              <span style="font-weight: 700; font-size: 12px; color: #0d9488;">${step.rightDepth}</span>
            </div>
          </div>
          <div style="display: flex; flex-wrap: wrap; gap: 4px; padding: 4px 6px; background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 6px; align-items: center;">
            <span style="font-size: 10px; font-weight: 700; color: #64748b; margin-right: 2px;">已归约:</span>
            ${depthBadges}
          </div>
        </div>
        <div class="td-trace-host" style="flex: 1; min-height: 120px; overflow: hidden;"></div>
      </div>
    `;

    if (step.callTrace) {
      const traceHost = container.querySelector('.td-trace-host') as HTMLElement | null;
      if (traceHost) {
        RecursiveCallTraceAdapter.render(traceHost, step.callTrace, {
          title: '📜 递归调用推演与归约栈',
          theme: 'light',
          maxHeight: '100%',
          showTerminalHeader: true,
        });
      }
    }
  }

  /**
   * 渲染最大深度 Stage 2 层次遍历 FIFO 队列监视器 (Card 2)
   */
  public static renderMaxDepthStage2Metrics(container: HTMLElement, queue: number[], depth: number): void {
    const chips =
      queue.length > 0
        ? queue
            .map(
              (v) =>
                `<span style="padding: 2px 7px; background: #dbeafe; color: #1e40af; border: 1px solid #bfdbfe; border-radius: 4px; font-size: 11px; font-family: monospace; font-weight: 600;">${v}</span>`
            )
            .join('')
        : '<span style="color:#94a3b8; font-size:11px; font-style:italic;">队列为空 (层序探索收敛)</span>';

    container.innerHTML = `
      <div style="display: flex; flex-direction: column; gap: 6px;">
        <div style="display: flex; align-items: center; justify-content: space-between; padding: 6px 10px; background: #f0fdf4; border: 1px solid #bbf7d0; border-radius: 6px;">
          <span style="font-size: 11px; font-weight: 700; color: #166534;">当前层序深度计数器 depth:</span>
          <span style="font-size: 14px; font-weight: 800; font-family: monospace; color: #15803d;">${depth} 层</span>
        </div>
        <div style="display: flex; flex-direction: column; gap: 3px;">
          <span style="font-size: 11px; font-weight: 700; color: #334155;">🥞 FIFO 队列待探索节点:</span>
          <div style="display: flex; flex-wrap: wrap; gap: 4px; padding: 6px 8px; background: #f8fafc; border: 1px dashed #cbd5e1; border-radius: 6px; min-height: 32px; align-items: center;">
            ${chips}
          </div>
        </div>
      </div>
    `;
  }

  /**
   * 渲染最大深度 Stage 3 静态连续内存 queue[MAXN] 与 l/r 双指针监视器 (Card 2)
   */
  public static renderMaxDepthStage3Metrics(
    container: HTMLElement,
    state?: TDStaticQueueState,
    depth: number = 0
  ): void {
    if (!state) {
      container.innerHTML = '';
      return;
    }
    const { array, l, r } = state;
    const maxDisplay = Math.max(r + 2, 8);
    const cells: string[] = [];

    for (let i = 0; i < maxDisplay; i++) {
      const val = i < array.length ? array[i] : null;
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

    container.innerHTML = `
      <div style="display: flex; flex-direction: column; gap: 6px;">
        <div style="display: flex; align-items: center; justify-content: space-between; padding: 6px 10px; background: #eff6ff; border: 1px solid #bfdbfe; border-radius: 6px;">
          <span style="font-size: 11px; font-weight: 700; color: #1e40af;">静态数组遍历层数 depth:</span>
          <span style="font-size: 14px; font-weight: 800; font-family: monospace; color: #2563eb;">${depth} 层</span>
        </div>
        <div style="display: flex; flex-direction: column; gap: 4px;">
          <div style="font-size: 11px; font-weight: 700; color: #334155; display: flex; align-items: center; justify-content: space-between;">
            <span>🏎️ queue[MAXN] 连续内存条 (Class 036 招牌零 GC):</span>
            <span style="color: #0284c7; font-size: 10px; font-weight: 600;">[l=${l}, r=${r}) 窗口大小: ${r - l}</span>
          </div>
          <div style="display: flex; gap: 4px; padding: 6px 10px; background: #f8fafc; border: 1px dashed #cbd5e1; border-radius: 8px; overflow-x: auto;">
            ${cells.join('')}
          </div>
        </div>
      </div>
    `;
  }

  /**
   * 渲染最小深度画布与看板联动 (LeetCode 111)
   */
  public static renderMinDepthCanvas(container: HTMLElement, step: MinDepthStep): void {
    // 1. Card 1 拓扑画布
    if (step.tree) {
      TreeCanvasAdapter.renderTree(container, {
        tree: step.tree,
        current: step.current,
        highlightedNodes: step.highlightedNodes,
        primaryColor: '#f59e0b',
        secondaryColor: '#38bdf8',
        visitedColor: '#34d399',
      });
    } else {
      container.innerHTML = `
        <div style="display: flex; flex-direction: column; align-items: center; justify-content: center; height: 240px; width: 100%;">
          <svg width="240" height="120" viewBox="0 0 240 120">
            <circle cx="120" cy="50" r="24" fill="#eff6ff" stroke="#3b82f6" stroke-width="2" stroke-dasharray="4,4"/>
            <text x="120" y="55" text-anchor="middle" font-size="11" fill="#3b82f6" font-weight="bold">空树或初始化</text>
          </svg>
          <span style="font-size: 11px; color: #64748b; margin-top: 8px;">准备计算二叉树最小深度...</span>
        </div>
      `;
    }

    // 2. Card 2 状态监视器与递归推演树联动
    const root = container.closest('#algo-min-depth-view') || container.parentElement;
    if (root) {
      const curEl = root.querySelector('#metric-cur');
      const depthEl = root.querySelector('#metric-depth');
      const resultEl = root.querySelector('#metric-result');

      if (curEl) curEl.textContent = step.current != null ? `Node(${step.current})` : '—';
      if (depthEl) depthEl.textContent = `${step.depth}`;
      if (resultEl) resultEl.textContent = step.minDepth != null ? `${step.minDepth}` : '计算中...';

      const customMetricsContainer = root.querySelector('#dsp-custom-metrics-container') as HTMLElement | null;
      if (customMetricsContainer) {
        if (step.callTrace) {
          // Stage 1 递归推演模式
          customMetricsContainer.innerHTML = `
            <div style="display: flex; flex-direction: column; height: 100%; gap: 6px; font-size: 11px; padding: 2px 0;">
              <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 6px; flex-shrink: 0;">
                <div style="padding: 4px 8px; background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 6px; display: flex; align-items: center; justify-content: space-between;">
                  <span style="font-size: 10px; color: #64748b;">考察节点:</span>
                  <span style="font-weight: 700; font-size: 11.5px; color: #0d9488;">${step.current != null ? `Node(${step.current})` : '已收敛'}</span>
                </div>
                <div style="padding: 4px 8px; background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 6px; display: flex; align-items: center; justify-content: space-between;">
                  <span style="font-size: 10px; color: #64748b;">递归深度:</span>
                  <span style="font-weight: 700; font-size: 11.5px; color: #2563eb;">${step.depth}</span>
                </div>
              </div>
              <div class="min-depth-trace-host" style="flex: 1; min-height: 120px; overflow: hidden;"></div>
            </div>
          `;

          const traceHost = customMetricsContainer.querySelector('.min-depth-trace-host') as HTMLElement | null;
          if (traceHost) {
            RecursiveCallTraceAdapter.render(traceHost, step.callTrace, {
              title: '📜 递归调用推演与归约栈',
              theme: 'light',
              maxHeight: '100%',
              showTerminalHeader: true,
            });
          }
        } else {
          // Stage 2 或 Stage 3：层序 BFS 队列或静态数组队列监视器
          let stateLabel = '递归调用深度';
          let stateContent = `${step.depth}`;

          if (step.staticQueueState) {
            stateLabel = `静态数组队列 [l=${step.staticQueueState.l}, r=${step.staticQueueState.r}]`;
            stateContent =
              step.staticQueueState.queue.length > 0
                ? `[${step.staticQueueState.queue.join(' ➔ ')}]`
                : '队列为空 []';
          } else if (step.queueState) {
            stateLabel = `BFS 队列 (${step.queueState.length})`;
            stateContent =
              step.queueState.length > 0
                ? `[${step.queueState.map((id) => `Node(${id})`).join(' ➔ ')}]`
                : '队列为空 []';
          }

          customMetricsContainer.innerHTML = `
            <div style="display: flex; flex-direction: column; gap: 8px; font-size: 11px; color: #475569; padding: 6px 0;">
              <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 6px;">
                <div style="padding: 6px 10px; background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 6px;">
                  <span style="font-size: 10.5px; color: #64748b;">${stateLabel}:</span>
                  <div style="font-weight: 700; font-size: 11.5px; color: #2563eb; overflow-x: auto; white-space: nowrap;">
                    ${stateContent}
                  </div>
                </div>
                <div style="padding: 6px 10px; background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 6px;">
                  <span style="font-size: 10.5px; color: #64748b;">当前考察节点:</span>
                  <div style="font-weight: 700; font-size: 12px; color: #0d9488;">
                    ${step.current != null ? `Node(${step.current})` : '已收敛'}
                  </div>
                </div>
              </div>

              <div style="padding: 8px 10px; background: #f1f5f9; border-radius: 6px;">
                <div style="font-weight: 700; color: #1e293b; margin-bottom: 2px;">🧭 决策推演: ${step.decision}</div>
                <div>${step.message}</div>
              </div>
            </div>
          `;
        }
      }
    }
  }
}
