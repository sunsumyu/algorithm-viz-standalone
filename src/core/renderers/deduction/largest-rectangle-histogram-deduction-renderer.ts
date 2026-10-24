/**
 * 柱状图中最大的矩形 (Largest Rectangle in Histogram · LeetCode 84 / Class 052)
 * 全景推演树渲染策略 (LargestRectangleHistogramDeductionRenderer)
 * 遵循 Matt Pocock 深模块设计模式与 IDeductionTreeRenderer 统一顶层抽象
 */

import { IDeductionTreeRenderer, StaticDeductionRenderOptions } from './types';
import { DeductionBoardPrimitives } from './deduction-board-primitives';

export class LargestRectangleHistogramDeductionRenderer implements IDeductionTreeRenderer {
  public readonly id = 'largest-rectangle-histogram';

  public canHandle(modelId: string): boolean {
    return (
      modelId === 'largest-rectangle-histogram' ||
      modelId === '84' ||
      modelId === 'leetcode-84' ||
      modelId === 'largest-rectangle-histogram-052' ||
      modelId === 'class052-code05' ||
      modelId === 'largest-rectangle'
    );
  }

  public render(_options: StaticDeductionRenderOptions): string {
    const header = DeductionBoardPrimitives.renderHeader({
      title: '力扣 84. 柱状图中最大的矩形 (Largest Rectangle in Histogram) · 全景推演树',
      badge: '代码随想录 & 左程云 Class 052 · 首尾哨兵 0 消除边界特判 / 单调递增栈 (以当前柱为基准向两侧展开) / 严格 O(N) 线性计算',
      descriptionHtml: `
        核心目标：给定 <code>n</code> 个非负整数，用来表示柱状图中各个柱子的高度。每个柱子彼此相邻，且宽度为 1。求在该柱状图中，能够勾勒出来的矩形的最大面积。<br/>
        <strong>《代码随想录》与左程云算法体系教学核心——以每根柱子为基准高展开的最大宽度公理：</strong><br/>
        1. <strong>首尾双哨兵 0 机制（消除空栈与非空尾部特判公理）</strong>：<br/>
        • 数组头部加 <code>0</code>：防止首元素出栈导致空栈异常，恒定充当最左边界；<br/>
        • 数组尾部加 <code>0</code>：作为全场最低矮柱，迫使遍历结束前栈内所有残留递增柱<strong>全员出栈清算</strong>！<br/>
        2. <strong>单调递增栈双向定界原语</strong>：<br/>
        • 栈底到栈顶保持<strong>严格单调递增</strong>；<br/>
        • 遍历到柱子 <code>i</code> 时，若 <code>heights[i] &lt; heights[stack.top()]</code>，说明栈顶柱子找到了<strong>右侧第一个比它矮的柱子 (i)</strong>；<br/>
        • 弹出栈顶 <code>mid = stack.pop()</code>，此时新的栈顶即为 <code>mid</code> <strong>左侧第一个比它矮的柱子 (left)</strong>；<br/>
        • <strong>最大展开宽度公式</strong>：<code>w = i - left - 1</code>；<br/>
        • <strong>以 mid 为基准的最大矩形面积</strong>：<code>area = heights[mid] * w</code>；<br/>
        • 持续更新全局最大面积：<code>maxArea = Math.max(maxArea, area)</code>！
      `,
      initialStateText: `面积入口：largestRectangleArea(heights) ➔ 插入首尾哨兵 0，初始化单调栈 stack = []。`,
    });

    const baseCase = DeductionBoardPrimitives.renderBaseCases([
      {
        prefix: '├───',
        label: '哨兵数组构建 (Sentinels Preprocessing)',
        valuesStr: 'int[] newHeights = new int[n + 2]; newHeights[0] = 0; newHeights[n + 1] = 0;',
      },
      {
        prefix: '└───',
        label: '终止判定条件 (Termination Condition)',
        valuesStr: '尾部哨兵 0 触发清仓 ➔ 所有柱子结算完成，返回全局最高面积 maxArea',
      },
    ]);

    const step1 = DeductionBoardPrimitives.renderInnerStep({
      connector: '├───',
      label: '阶段 1: 遇递增柱压栈扩展 (Monotonic Increasing Accumulation)',
      badgeHtml: '<span class="px-1.5 py-0.5 rounded bg-blue-100 text-blue-800 font-mono text-[9px]">Push Stack</span>',
      detailLines: [
        'while (!stack.isEmpty() && newHeights[i] < newHeights[stack.peek()]) {',
        '  // 遇更矮柱子破坏单调性，进入阶段 2 弹出结算',
        '}',
        'stack.push(i); // 维持自底向上单调递增',
      ],
      fillLine: '单调递增：栈内柱子持续走高，等待右侧首个跌落拐点',
    });

    const step2 = DeductionBoardPrimitives.renderInnerStep({
      connector: '├───',
      label: '阶段 2: 弹出基准柱并向两侧定界 (Pop Mid & Settle Area)',
      badgeHtml: '<span class="px-1.5 py-0.5 rounded bg-amber-100 text-amber-800 font-mono text-[9px]">mid * (i - left - 1)</span>',
      detailLines: [
        'int mid = stack.pop(); // 以 mid 柱高度为矩形的高',
        'int left = stack.peek(); // 左侧首个更矮边界',
        'int right = i;          // 右侧首个更矮边界',
        'int w = right - left - 1;',
        'int h = newHeights[mid];',
        'maxArea = Math.max(maxArea, h * w);',
      ],
      fillLine: '双向定界：以 mid 柱自身高度为瓶颈，左右两侧矮柱之间形成最大矩形',
    });

    const step3 = DeductionBoardPrimitives.renderInnerStep({
      connector: '└───',
      label: '阶段 3: 尾哨兵强制清算与交付 (Tail Sentinel Flush)',
      badgeHtml: '<span class="px-1.5 py-0.5 rounded bg-emerald-100 text-emerald-800 font-mono text-[9px]">Final Max Area</span>',
      detailLines: [
        '// 尾部 0 逼迫栈内所有柱子相继出栈结算完毕',
        'return maxArea;',
      ],
      fillLine: '圆满收官：无遗漏结算直方图中每一根柱子能够支撑的全局最宽面积',
    });

    const round = DeductionBoardPrimitives.renderOuterRound({
      title: '直方图最大矩形推演流 (Sentinel Padding ➔ Mid Height Pop ➔ Bilateral Bounding)',
      subtitle: 'LeetCode 84 & Zuoshen Class 052 Histogram Area Masterclass',
      innerStepsHtml: step1 + step2 + step3,
    });

    const finalReturn = DeductionBoardPrimitives.renderFinalReturn({
      resultStr: '直方图内最大矩形面积 maxArea',
      complexityStr: '时间复杂度: O(N) 仅历经单趟线性出入栈 · 空间复杂度: O(N) 单调栈',
    });

    return header + baseCase + round + finalReturn;
  }
}
