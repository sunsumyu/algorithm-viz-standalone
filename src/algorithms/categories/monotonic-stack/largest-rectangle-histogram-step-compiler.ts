import { HighlightTarget } from '../../../core/renderers/dark-code-terminal-presenter';

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
  log?: string;
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
    message: `初始化：在两端各添加高度为 0 的哨兵，初始将左哨兵下标 0 压入单调递增栈`,
    codeLine: lines.init,
  });

  for (let i = 1; i < paddedHeights.length; i++) {
    const curH = paddedHeights[i];
    const isRightSentinel = i === paddedHeights.length - 1;

    steps.push({
      originalHeights: [...rawHeights],
      paddedHeights: [...paddedHeights],
      currentIndex: i,
      stack: [...stack],
      leftIdx: null,
      midIdx: null,
      rightIdx: i,
      currentArea: 0,
      maxArea,
      bestRect,
      action: 'scan',
      message: isRightSentinel
        ? `🔍 考察右哨兵 [${i}] (高度 0)：准备将栈内所有剩余柱子依次弹出结算`
        : `🔍 考察柱子 [${i}] (高度 ${curH})：与栈顶 ${stack.length > 0 ? `[${stack[stack.length - 1]}] (高度 ${paddedHeights[stack[stack.length - 1]]})` : '（栈空）'} 比对`,
      codeLine: lines.scan,
    });

    while (stack.length > 0 && curH < paddedHeights[stack[stack.length - 1]]) {
      const mid = stack.pop()!;
      const midH = paddedHeights[mid];
      const left = stack[stack.length - 1];
      const width = i - left - 1;
      const area = midH * width;

      if (area > maxArea) {
        maxArea = area;
        bestRect = { left: left + 1, right: i - 1, height: midH };
      }

      steps.push({
        originalHeights: [...rawHeights],
        paddedHeights: [...paddedHeights],
        currentIndex: i,
        stack: [...stack],
        leftIdx: left,
        midIdx: mid,
        rightIdx: i,
        currentArea: area,
        maxArea,
        bestRect,
        action: 'pop_calc',
        message: `🔥 弹出基准柱 [${mid}] (高度 ${midH})！左界 [${left}], 右界 [${i}] &rarr; 宽度 w=${width}, 面积 = ${area} 单位！当前最大面积 = ${maxArea}`,
        codeLine: lines.popCalc,
      });
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

export function withMetrics(steps: LRHStep[]): LRHStep[] {
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
