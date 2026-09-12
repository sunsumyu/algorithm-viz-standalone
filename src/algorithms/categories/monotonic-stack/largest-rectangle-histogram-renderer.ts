/**
 * 柱状图中最大的矩形可视化器（单调栈）— 声明式 4-Card 标准架构
 * LeetCode 84：首尾加哨兵 0，单调递增栈寻找左右两侧首个更矮柱子，以 mid 为高展开矩形
 */

import { registerDeclarativeAlgorithm } from '../../../core/declarative-algorithm-visualizer';
import { parseNumberList } from '../../../core/input-primitives';
import { HighlightTarget } from '../../../core/renderers/dark-code-terminal-presenter';
import {
  LARGEST_RECTANGLE_HISTOGRAM_PROBLEM_HTML,
  LARGEST_RECTANGLE_HISTOGRAM_ANALYSIS_HTML,
  LARGEST_RECTANGLE_HISTOGRAM_CODE_LANGUAGES,
} from './largest-rectangle-histogram-problem-content';

export interface LRHStep {
  originalHeights: number[];
  paddedHeights: number[];
  currentIndex: number;
  stack: number[]; // 存储在 paddedHeights 中的下标
  leftIdx: number | null;
  midIdx: number | null;
  rightIdx: number | null;
  currentArea: number;
  maxArea: number;
  bestRect: { left: number; right: number; height: number } | null;
  action: 'init' | 'scan' | 'pop_calc' | 'push' | 'done';
  message: string;
  codeLine: HighlightTarget;
  metrics?: Record<string, string>;
}

export function buildLargestRectangleHistogramSteps(rawHeights: number[]): LRHStep[] {
  const steps: LRHStep[] = [];
  const n = rawHeights.length;

  const lines = {
    init: { java: [2, 7], cpp: [4, 7], python: [3, 4], javascript: [2, 3] },
    scan: { java: [9, 10], cpp: [9, 10], python: [6, 7], javascript: [5, 6] },
    popCalc: { java: [11, 16], cpp: [11, 15], python: [8, 11], javascript: [7, 10] },
    push: { java: 18, cpp: 17, python: 12, javascript: 12 },
    done: { java: 20, cpp: 19, python: 13, javascript: 14 },
  };

  if (n === 0) {
    steps.push({
      originalHeights: [],
      paddedHeights: [0, 0],
      currentIndex: -1,
      stack: [],
      leftIdx: null,
      midIdx: null,
      rightIdx: null,
      currentArea: 0,
      maxArea: 0,
      bestRect: null,
      action: 'done',
      message: '输入数组为空，最大矩形面积为 0',
      codeLine: lines.done,
    });
    return steps;
  }

  const paddedHeights = [0, ...rawHeights, 0];
  const stack: number[] = [0];
  let maxArea = 0;
  let bestRect: { left: number; right: number; height: number } | null = null;

  steps.push({
    originalHeights: [...rawHeights],
    paddedHeights: [...paddedHeights],
    currentIndex: 0,
    stack: [0],
    leftIdx: null,
    midIdx: null,
    rightIdx: null,
    currentArea: 0,
    maxArea: 0,
    bestRect: null,
    action: 'init',
    message: `初始化：首尾插入哨兵 0 构成长度 ${paddedHeights.length} 的扩展数组，将下标 0 (高度 0) 压入栈底`,
    codeLine: lines.init,
  });

  for (let i = 1; i < paddedHeights.length; i++) {
    const curH = paddedHeights[i];
    const isTailSentinel = i === paddedHeights.length - 1;

    steps.push({
      originalHeights: [...rawHeights],
      paddedHeights: [...paddedHeights],
      currentIndex: i,
      stack: [...stack],
      leftIdx: null,
      midIdx: null,
      rightIdx: null,
      currentArea: 0,
      maxArea,
      bestRect,
      action: 'scan',
      message: `🔍 考察柱子 [${i}] (${isTailSentinel ? '尾部哨兵 0' : `高度 ${curH}`})：与栈顶 [${stack[stack.length - 1]}] (高度 ${paddedHeights[stack[stack.length - 1]]}) 比对`,
      codeLine: lines.scan,
    });

    while (stack.length > 0 && curH < paddedHeights[stack[stack.length - 1]]) {
      const mid = stack.pop()!;
      const midH = paddedHeights[mid];

      if (stack.length > 0) {
        const left = stack[stack.length - 1];
        const right = i;
        const w = right - left - 1;
        const area = midH * w;

        if (area > maxArea) {
          maxArea = area;
          bestRect = { left: left + 1, right: right - 1, height: midH };
        }

        steps.push({
          originalHeights: [...rawHeights],
          paddedHeights: [...paddedHeights],
          currentIndex: i,
          stack: [...stack],
          leftIdx: left,
          midIdx: mid,
          rightIdx: right,
          currentArea: area,
          maxArea,
          bestRect,
          action: 'pop_calc',
          message: `🔥 弹出基准柱 [${mid}] (高度 ${midH})！左侧更矮 [${left}], 右侧更矮 [${right}] &rarr; 宽度 w=${w}, 高度 h=${midH}, 本次面积 = ${area}！全局最大 maxArea = ${maxArea}`,
          codeLine: lines.popCalc,
        });
      }
    }

    stack.push(i);

    steps.push({
      originalHeights: [...rawHeights],
      paddedHeights: [...paddedHeights],
      currentIndex: i,
      stack: [...stack],
      leftIdx: null,
      midIdx: null,
      rightIdx: null,
      currentArea: 0,
      maxArea,
      bestRect,
      action: 'push',
      message: `📥 将柱子 [${i}] (高度 ${curH}) 压入单调栈，维持单调递增`,
      codeLine: lines.push,
    });
  }

  steps.push({
    originalHeights: [...rawHeights],
    paddedHeights: [...paddedHeights],
    currentIndex: paddedHeights.length - 1,
    stack: [...stack],
    leftIdx: null,
    midIdx: null,
    rightIdx: null,
    currentArea: 0,
    maxArea,
    bestRect,
    action: 'done',
    message: `🎉 遍历结算完成！最终可勾勒出的最大矩形面积为：${maxArea} 单位`,
    codeLine: lines.done,
  });

  return steps;
}

/** 为每一步附加状态监视器指标（键名与 spec.metrics 的 id 一一对应） */
function withMetrics(steps: LRHStep[]): LRHStep[] {
  return steps.map((s) => {
    const h = s.paddedHeights;
    let action = '🔍 比对栈顶';
    if (s.action === 'pop_calc') action = `🔥 弹出基准柱算矩形 (面积 = ${s.currentArea})`;
    else if (s.action === 'push') action = '📥 压入栈顶 (递增)';
    else if (s.action === 'done') action = '🎉 遍历结算完成';
    else if (s.action === 'init') action = '初始化哨兵';

    return {
      ...s,
      log: s.message,
      metrics: {
        'rect-3':
          s.midIdx !== null
            ? `左[${s.leftIdx}] (${h[s.leftIdx!]}) | 基准[${s.midIdx}] (${h[s.midIdx]}) | 右[${s.rightIdx}] (${h[s.rightIdx!]})`
            : '暂无矩形弹出结算',
        area: s.currentArea > 0 ? `${s.currentArea} 单位` : '0',
        'max-area': s.bestRect
          ? `${s.maxArea} (最优 [${s.bestRect.left}..${s.bestRect.right}], h=${s.bestRect.height})`
          : `${s.maxArea}`,
        action,
      },
    };
  });
}

/** 主视觉：直方图柱状图（矩形覆盖高亮）+ 单调递增栈沙盘 */
export function renderLargestRectangleHistogramCanvas(
  container: HTMLElement,
  step: LRHStep
): void {
  const paddedHeights = step.paddedHeights;
  const stack = step.stack;
  const n = paddedHeights.length;

  if (n === 0) {
    container.innerHTML = '<div style="display:flex;align-items:center;justify-content:center;height:100%;color:#94a3b8;font-size:12px;">输入为空</div>';
    return;
  }

  const curIdx = step.currentIndex;
  const isDone = step.action === 'done';
  const isPopCalc = step.action === 'pop_calc';

  const maxH = Math.max(...paddedHeights, 1);

  // 上方：直方图柱子与当前矩形覆盖
  const colsHtml = paddedHeights
    .map((h, idx) => {
      const isSentinel = idx === 0 || idx === n - 1;
      const isCurrent = idx === curIdx && !isDone;
      const isMid = idx === step.midIdx;
      const isLeft = idx === step.leftIdx;
      const isRight = idx === step.rightIdx;
      const inStack = stack.includes(idx);

      // 是否在当前计算矩形覆盖范围内
      const inCurrentRect =
        isPopCalc && step.leftIdx !== null && step.rightIdx !== null && idx > step.leftIdx && idx < step.rightIdx;

      const colHeightPx = isSentinel ? 6 : Math.max(10, Math.round((h / (maxH + 1)) * 90));

      let barBg = '#475569';
      let border = '#334155';

      if (isSentinel) {
        barBg = '#cbd5e1';
        border = '#94a3b8';
      } else if (isMid) {
        barBg = '#ef4444';
        border = '#dc2626';
      } else if (inCurrentRect) {
        barBg = '#f87171';
        border = '#ef4444';
      } else if (isLeft || isRight) {
        barBg = '#3b82f6';
        border = '#2563eb';
      } else if (isCurrent) {
        barBg = '#f59e0b';
        border = '#d97706';
      } else if (inStack) {
        barBg = '#fbbf24';
        border = '#d97706';
      }

      return `
        <div style="display: flex; flex-direction: column; align-items: center; gap: 2px; flex: 1; min-width: 24px; max-width: 46px;">
          <span style="font-size: 8.5px; font-weight: 700; color: ${isMid ? '#ef4444' : inCurrentRect ? '#f87171' : '#64748b'}; font-family: monospace;">
            ${isMid ? `h=${h}` : isSentinel ? '哨兵' : `[${idx}]`}
          </span>
          <div style="width: 100%; height: 95px; display: flex; flex-direction: column; justify-content: flex-end; align-items: center;">
            <div style="width: 22px; height: ${colHeightPx}px; background: ${barBg}; border: 1.5px solid ${border}; border-radius: 4px 4px 0 0; display: flex; align-items: center; justify-content: center; color: ${isSentinel ? '#475569' : '#ffffff'}; font-size: 9px; font-weight: 800; box-shadow: 0 1px 2px rgba(0,0,0,0.05);">
              ${h}
            </div>
          </div>
          <span style="font-size: 8.5px; color: ${isMid ? '#ef4444' : isLeft ? '#2563eb' : isRight ? '#2563eb' : isCurrent ? '#d97706' : '#94a3b8'}; font-weight: 700;">
            ${isMid ? '基准' : isLeft ? '左矮' : isRight ? '右矮' : isCurrent ? '当前' : isSentinel ? '0' : `h:${h}`}
          </span>
        </div>
      `;
    })
    .join('');

  // 栈内展示
  const stackItemsHtml = stack
    .map((idx) => {
      return `
        <div style="padding: 2px 8px; border-radius: 6px; background: #fffbeb; border: 1.5px solid #fde68a; color: #b45309; font-size: 11px; font-weight: 800; font-family: 'JetBrains Mono', monospace; display: flex; align-items: center; gap: 4px;">
          <span>[${idx}]</span>
          <span style="color: #ef4444;">h=${paddedHeights[idx]}</span>
        </div>
      `;
    })
    .join('');

  container.innerHTML = `
    <div style="width: 100%; height: 100%; display: flex; flex-direction: column; justify-content: center; gap: 8px; padding: 12px; box-sizing: border-box;">
      <!-- 柱状图与矩形覆盖展示 -->
      <div style="display: flex; justify-content: space-around; align-items: flex-end; padding: 2px 0; border-bottom: 1px solid #e2e8f0;">
        ${colsHtml}
      </div>

      <!-- 单调栈容器 -->
      <div style="display: flex; align-items: center; gap: 8px; padding-top: 2px;">
        <span style="font-size: 10.5px; font-weight: 700; color: #475569; white-space: nowrap;">🥞 单调递增栈 (栈底 &rarr; 栈顶):</span>
        <div style="display: flex; gap: 4px; overflow-x: auto; flex: 1; align-items: center; min-height: 28px;">
          ${stack.length > 0 ? stackItemsHtml : '<span style="font-size: 10.5px; color: #94a3b8;">栈空</span>'}
        </div>
      </div>
    </div>
  `;
}

registerDeclarativeAlgorithm({
  id: 'largest-rectangle-histogram',
  name: '柱状图中最大的矩形',
  category: 'monotonic-stack',
  description: '首尾插入哨兵 0，单调递增栈寻找每根柱子左右首个更矮边界，计算最大矩形面积',
  icon: '📊',
  difficulty: 3,
  levelOrder: 5,
  learningGoal: '掌握单调递增栈在直方图最大矩形中的双向边界扩展技巧，深刻理解首尾哨兵 0 消除边界特判的精妙设计',
  inputs: [
    {
      id: 'heights',
      label: '柱子高度数组',
      type: 'text',
      defaultValue: '2,1,5,6,2,3',
      placeholder: '2,1,5,6,2,3',
    },
  ],
  presets: [
    { label: '示例 1 (面积 10)', values: { heights: '2,1,5,6,2,3' } },
    { label: '示例 2 (面积 4)', values: { heights: '2,4' } },
    { label: '多峰波谷 (面积 16)', values: { heights: '6,7,5,2,4,5,9,3' } },
  ],
  metrics: [
    { id: 'rect-3', label: '左矮界 & 基准柱 & 右矮界', color: '#ef4444' },
    { id: 'area', label: '本次计算矩形面积', color: '#059669' },
    { id: 'max-area', label: '全局最大矩形面积', color: '#ef4444' },
    { id: 'action', label: '计算状态', color: '#2563eb' },
  ],
  legend: [
    { label: '🟥 当前计算矩形', color: '#ef4444' },
    { label: '🥞 单调栈内递增柱', color: '#fbbf24' },
    { label: '⚪ 首尾哨兵 0', color: '#cbd5e1' },
  ],
  codeLanguages: LARGEST_RECTANGLE_HISTOGRAM_CODE_LANGUAGES,
  problemHtml: LARGEST_RECTANGLE_HISTOGRAM_PROBLEM_HTML,
  analysisHtml: LARGEST_RECTANGLE_HISTOGRAM_ANALYSIS_HTML,
  generateSteps: (inputs) => {
    const rawHeights = parseNumberList(inputs.heights, '2,1,5,6,2,3');
    return withMetrics(
      buildLargestRectangleHistogramSteps(rawHeights.length ? rawHeights : [2, 1, 5, 6, 2, 3])
    );
  },
  renderCanvas: (container, step) =>
    renderLargestRectangleHistogramCanvas(container, step as LRHStep),
});
