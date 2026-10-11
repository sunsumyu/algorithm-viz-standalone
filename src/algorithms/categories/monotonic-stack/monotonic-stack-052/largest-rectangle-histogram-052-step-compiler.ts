import {
  LARGEST_RECTANGLE_LINES,
} from './stack-052-stage-codes';

export interface LargestRectangle052Step {
  heights: number[];
  stack: number[];
  curI: number;
  activeRect: { left: number; right: number; height: number; area: number } | null;
  maxArea: number;
  decision: string;
  message: string;
  log: string;
  codeLine: Record<string, number>;
  metrics: Record<string, string | number>;
}

export function buildLargestRectangle052Steps(heights: number[]): LargestRectangle052Step[] {
  const steps: LargestRectangle052Step[] = [];
  const lines = LARGEST_RECTANGLE_LINES;
  const n = heights.length;

  if (n === 0) {
    steps.push({
      heights: [],
      stack: [],
      curI: 0,
      activeRect: null,
      maxArea: 0,
      decision: '柱状图为空，最大矩形面积为 0。',
      message: '输入规模 N=0。',
      log: 'empty heights',
      codeLine: lines.returnAns,
      metrics: { '规模 N': 0, '最大面积': 0 },
    });
    return steps;
  }

  const stack: number[] = [];
  let maxArea = 0;
  let bestRect: { left: number; right: number; height: number; area: number } | null = null;

  // Step 0: 入口
  steps.push({
    heights: [...heights],
    stack: [],
    curI: -1,
    activeRect: null,
    maxArea: 0,
    decision: `主函数入口：开始在柱状图 [${heights.join(', ')}] 中寻找最大矩形面积。`,
    message: '核心思想：以每个柱子的高度作为矩形瓶颈高，利用单调递增栈向左右寻找首个更矮的柱子确定最大宽度。',
    log: `enter largestRectangleArea: n=${n}`,
    codeLine: lines.entry,
    metrics: { '柱子数 N': n, '当前最大面积': 0, '栈深': 0 },
  });

  for (let i = 0; i < n; i++) {
    const curH = heights[i];

    // 比对
    steps.push({
      heights: [...heights],
      stack: [...stack],
      curI: i,
      activeRect: bestRect,
      maxArea,
      decision: `🔍 考察柱子 [${i}] (高度 H=${curH})：准备与栈顶柱子比对。`,
      message: stack.length > 0
        ? `栈顶为柱子 [${stack[stack.length - 1]}] (高度 H=${heights[stack[stack.length - 1]]})。遇到更矮柱子将触发矩形结算。`
        : '栈为空，当前柱子直接入栈。',
      log: `check bar i=${i} (H=${curH})`,
      codeLine: lines.whileCheck,
      metrics: { '考察柱子': `[${i}] (H=${curH})`, '栈顶高度': stack.length > 0 ? heights[stack[stack.length - 1]] : '空', '当前最大面积': maxArea },
    });

    // 遇到更矮柱子出栈结算
    while (stack.length > 0 && heights[stack[stack.length - 1]] >= curH) {
      const mid = stack.pop()!;
      const midH = heights[mid];
      const left = stack.length > 0 ? stack[stack.length - 1] : -1;
      const right = i;
      const width = right - left - 1;
      const area = midH * width;

      if (area > maxArea) {
        maxArea = area;
        bestRect = { left: left + 1, right: right - 1, height: midH, area };
      }

      const curRect = { left: left + 1, right: right - 1, height: midH, area };

      steps.push({
        heights: [...heights],
        stack: [...stack],
        curI: i,
        activeRect: curRect,
        maxArea,
        decision: `🔥 弹出基准柱 [${mid}] (高度 H=${midH}) 结算矩形！`,
        message: `左边界为 ${left !== -1 ? `[${left}]` : '无(-1)'}，右边界为当前 [${right}]。跨度宽度 W = ${right} - ${left} - 1 = ${width}！本次面积 = ${width} × ${midH} = ${area}！全局最大 maxArea = ${maxArea}。`,
        log: `pop bar ${mid}: H=${midH}, W=${width}, area=${area}, max=${maxArea}`,
        codeLine: lines.popCalc,
        metrics: { '基准柱': `[${mid}] (H=${midH})`, '矩形宽度': width, '本次面积': area, '全局最大面积': maxArea },
      });
    }

    // 入栈
    stack.push(i);
    steps.push({
      heights: [...heights],
      stack: [...stack],
      curI: i,
      activeRect: bestRect,
      maxArea,
      decision: `📥 将柱子 [${i}] (高度 H=${curH}) 压入栈顶，维持底到顶高度递增。`,
      message: `当前栈内柱子序列: [${stack.join(', ')}]。`,
      log: `push bar ${i} to stack`,
      codeLine: lines.push,
      metrics: { '入栈柱子': `[${i}]`, '栈深': stack.length, '全局最大面积': maxArea },
    });
  }

  // 清算阶段
  if (stack.length > 0) {
    steps.push({
      heights: [...heights],
      stack: [...stack],
      curI: n,
      activeRect: bestRect,
      maxArea,
      decision: '柱子全部扫描完毕，进入清算阶段！右侧边界统一为柱状图末尾 R = N。',
      message: '栈内剩余柱子右侧没有更矮的柱子阻挡，矩形宽度可以一路向右延伸至边界。',
      log: 'enter clear stack phase',
      codeLine: lines.clearLoop,
      metrics: { '状态': '清算阶段', '剩余栈深': stack.length, '全局最大面积': maxArea },
    });

    while (stack.length > 0) {
      const mid = stack.pop()!;
      const midH = heights[mid];
      const left = stack.length > 0 ? stack[stack.length - 1] : -1;
      const right = n;
      const width = right - left - 1;
      const area = midH * width;

      if (area > maxArea) {
        maxArea = area;
        bestRect = { left: left + 1, right: right - 1, height: midH, area };
      }

      const curRect = { left: left + 1, right: right - 1, height: midH, area };

      steps.push({
        heights: [...heights],
        stack: [...stack],
        curI: n,
        activeRect: curRect,
        maxArea,
        decision: `🧹 清算弹出基准柱 [${mid}] (高度 H=${midH}) 结算矩形！`,
        message: `左边界为 ${left !== -1 ? `[${left}]` : '无(-1)'}，右边界延伸至末尾 [${n}]。宽度 W = ${width}，面积 = ${area}！全局最大 maxArea = ${maxArea}。`,
        log: `clear pop bar ${mid}: H=${midH}, W=${width}, area=${area}, max=${maxArea}`,
        codeLine: lines.clearCalc,
        metrics: { '清算基准柱': `[${mid}] (H=${midH})`, '矩形宽度': width, '本次面积': area, '全局最大面积': maxArea },
      });
    }
  }

  // 终结
  steps.push({
    heights: [...heights],
    stack: [],
    curI: n,
    activeRect: bestRect,
    maxArea,
    decision: `🎉 计算完成！柱状图中能够勾勒出的最大矩形面积为 ${maxArea}。`,
    message: '单调栈巧妙将暴力枚举 O(N^2) 降至严格的 O(N) 线性时间。',
    log: `largestRectangleArea complete: ans=${maxArea}`,
    codeLine: lines.returnAns,
    metrics: { '最大矩形面积': maxArea, '总柱数': n, '复杂度': 'O(N)' },
  });

  return steps;
}
