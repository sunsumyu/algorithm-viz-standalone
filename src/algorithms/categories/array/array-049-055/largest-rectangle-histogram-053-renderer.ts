/**
 * Class 053: 柱状图最大矩形 (Largest Rectangle in Histogram)
 * 单调栈求解柱体左右扩散极值与跨度面积 / LeetCode 84
 */

import { registerDeclarativeAlgorithm } from '../../../../core/declarative-algorithm-visualizer';
import { ARRAY_049_055_PROBLEMS } from './array-049-055-problem-content';
import { LARGEST_RECTANGLE_053_CODES, LARGEST_RECTANGLE_053_LINES } from './array-049-055-stage-codes';
import { Array049Step, renderLargestRectangleBoard } from './array-049-055-shared';
import { renderFormulaCard } from '../../string/string-100-105/string-100-105-shared';

export interface LargestRectangle053Step extends Array049Step {
  heights: number[];
  curBar: number | null;
  curH: number;
  curW: number;
  maxArea: number;
}

export function buildLargestRectangle053Steps(): LargestRectangle053Step[] {
  const steps: LargestRectangle053Step[] = [];
  const lines = LARGEST_RECTANGLE_053_LINES;

  const heights = [2, 1, 5, 6, 2, 3];

  // Step 0: 入口
  steps.push({
    heights,
    curBar: null,
    curH: 0,
    curW: 0,
    maxArea: 0,
    decision: '主函数入口：开始在柱状图 [2, 1, 5, 6, 2, 3] 中寻找最大矩形面积。',
    message: '核心思想：遍历每个柱子，计算以该柱子为瓶颈高度时，向左右最多能扩展多宽。',
    log: 'enter largestRectangleArea: heights=[2, 1, 5, 6, 2, 3]',
    codeLine: lines.entry,
    metrics: { '柱子数量': 6, '最大面积': 0 },
  });

  // Step 1: 扫描到 1，弹出柱 0 (height=2)
  // 宽度 w = 1, 面积 = 2 * 1 = 2
  steps.push({
    heights,
    curBar: 0,
    curH: 2,
    curW: 1,
    maxArea: 2,
    decision: '遇到 heights[1]=1 < heights[0]=2：弹出柱 0 结算，瓶颈高度 H=2，跨度宽度 W=1。',
    message: '以 heights[0]=2 为高的矩形面积为 2 * 1 = 2，更新 maxArea = 2。',
    log: 'pop bar 0: H=2, W=1 -> area 2',
    codeLine: lines.updateMax,
    statusBadge: { text: '面积: 2', type: 'info' },
    metrics: { '当前柱高': 2, '当前宽': 1, '最大面积': 2 },
  });

  // Step 2: 压入 1, 5, 6，遇到 2 ➔ 弹出柱 3 (height=6)
  // 宽度 w = 4 - 2 - 1 = 1, 面积 = 6 * 1 = 6
  steps.push({
    heights,
    curBar: 3,
    curH: 6,
    curW: 1,
    maxArea: 6,
    decision: '遍历至 i=4 (heights[4]=2)：小于栈顶 heights[3]=6，弹出柱 3 结算！',
    message: '柱 3 瓶颈高度 H=6，左边界为柱 2(idx 2)，右边界为当前 i=4，跨度宽 W = 4 - 2 - 1 = 1，面积 6 * 1 = 6！',
    log: 'pop bar 3: H=6, W=1 -> area 6',
    codeLine: lines.updateMax,
    statusBadge: { text: '面积: 6', type: 'info' },
    metrics: { '当前柱高': 6, '当前宽': 1, '最大面积': 6 },
  });

  // Step 3: 继续弹出柱 2 (height=5) ➔ 关键时刻！
  // 此时栈顶为 1(idx 1)，右边界为 i=4
  // 宽度 w = 4 - 1 - 1 = 2, 面积 = 5 * 2 = 10！
  steps.push({
    heights,
    curBar: 2,
    curH: 5,
    curW: 2,
    maxArea: 10,
    decision: '柱 2 (heights[2]=5) 同样大于 2，继续弹出结算！',
    message: '柱 2 瓶颈高 H=5，左边界为栈内下一层 idx 1(val 1)，右边界为 i=4，跨度宽 W = 4 - 1 - 1 = 2，面积 5 * 2 = 10！突破纪录！',
    log: 'pop bar 2: H=5, W=2 -> area 10 (NEW MAX!)',
    codeLine: lines.updateMax,
    statusBadge: { text: '命中全局最大: 10', type: 'success' },
    metrics: { '当前柱高': 5, '当前宽': 2, '最大面积': 10 },
  });

  // Step 4: 循环终结
  steps.push({
    heights,
    curBar: null,
    curH: 0,
    curW: 0,
    maxArea: 10,
    decision: '遍历与栈内剩余元素清空完成，全局最大矩形面积确认是 10。',
    message: '单调栈巧妙将暴力枚举 O(N^2) 降至严格的 O(N) 线性时间。',
    log: 'largestRectangleArea complete -> return 10',
    codeLine: lines.entry,
    statusBadge: { text: '计算完成', type: 'success' },
    metrics: { '最大矩形面积': 10, '复杂度': 'O(N)' },
  });

  return steps;
}

export const largestRectangle053Visualizer = registerDeclarativeAlgorithm<LargestRectangle053Step>({
  id: 'largest-rectangle-histogram-053',
  name: '柱状图最大矩形 (Class 053)',
  category: 'monotonic-stack',
  difficulty: 'hard',
  problemContent: ARRAY_049_055_PROBLEMS.largestRectangle053,
  sourceCodes: LARGEST_RECTANGLE_053_CODES,
  generateSteps: buildLargestRectangle053Steps,
  renderCanvas: (container, step) => {
    container.innerHTML = `
      <div style="padding: 16px; font-family: system-ui, -apple-system, sans-serif;">
        ${renderLargestRectangleBoard(
          step.heights,
          step.curBar,
          step.curH,
          step.curW,
          step.maxArea
        )}
        ${renderFormulaCard(
          '单调栈确定最大矩形跨度公式',
          '\\text{Width} = \\begin{cases} i, & \\text{stack is empty} \\\\ i - \\text{stack.top()} - 1, & \\text{otherwise} \\end{cases}, \\quad \\text{Area} = \\text{height}[cur] \\times \\text{Width}',
          '由于单调递增栈内所有下层元素均比当前弹出的柱体矮，因而该柱体能往左最远延伸到栈顶下一个柱子之后，往右最远延伸到迫使它出栈的柱子之前。'
        )}
      </div>
    `;
  },
});
