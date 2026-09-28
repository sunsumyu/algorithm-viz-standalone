/**
 * Class 052 Code05: 柱状图中最大的矩形 (Largest Rectangle in Histogram / LeetCode 84)
 *
 * 核心原理：
 * 遍历每个柱子作为瓶颈高度 heights[mid]，向左向右寻找第一个更矮的柱子确定矩形宽度：
 * 宽度 W = right - left - 1，面积 Area = heights[mid] * W。
 * 单调递增栈在出栈时直接确定左右边界，O(N) 求解！
 */

import { registerDeclarativeAlgorithm } from '../../../../core/declarative-algorithm-visualizer';
import { parseNumberList } from '../../../../core/input-primitives';
import { STACK_052_PROBLEMS } from './stack-052-problem-content';
import {
  LARGEST_RECTANGLE_CODES,
  LARGEST_RECTANGLE_LINES,
} from './stack-052-stage-codes';
import { renderHistogramVisualizer } from './stack-052-shared';

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

export const largestRectangleHistogram052Visualizer = registerDeclarativeAlgorithm<LargestRectangle052Step>({
  id: 'largest-rectangle-histogram-052',
  name: '柱状图中最大的矩形 (Class 052 Code05)',
  category: 'monotonic-stack',
  aliases: ['largest-rectangle-histogram-052', 'class052-code05'],
  difficulty: 'hard',
  learningGoal: '掌握以每个柱子作为瓶颈高度的单调栈极值扩展思想，理解左右边界界定矩形宽度的数学原理。',
  problemContent: STACK_052_PROBLEMS.largestRectangleHistogram052,
  codeLanguages: LARGEST_RECTANGLE_CODES,
  inputs: [
    {
      id: 'heights',
      label: '柱子高度',
      type: 'text',
      defaultValue: '2, 1, 5, 6, 2, 3',
      placeholder: '逗号分隔的非负整数',
    },
  ],
  presets: [
    { label: '示例 1: 官方例题 [2,1,5,6,2,3]', values: { heights: '2, 1, 5, 6, 2, 3' } },
    { label: '示例 2: 单调递增阶梯 [1,2,3,4,5]', values: { heights: '1, 2, 3, 4, 5' } },
    { label: '示例 3: 相同高度平顶 [4,4,4,4]', values: { heights: '4, 4, 4, 4' } },
    { label: '示例 4: 两头高中间低凹槽 [6,2,1,2,5]', values: { heights: '6, 2, 1, 2, 5' } },
  ],
  generateSteps: (inputs) => {
    const raw = parseNumberList(inputs.heights, '2, 1, 5, 6, 2, 3');
    return buildLargestRectangle052Steps(raw.length ? raw : [2, 1, 5, 6, 2, 3]);
  },
  renderCanvas: (container, step) => {
    container.innerHTML = renderHistogramVisualizer(
      step.heights,
      step.stack,
      step.curI,
      step.activeRect,
      step.maxArea,
      false
    );
  },
});
