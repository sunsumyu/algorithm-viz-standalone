/**
 * 最大矩形 (Maximal Rectangle · LeetCode 85 / Class 052)
 * 全景推演树渲染策略 (MaximalRectangleDeductionRenderer)
 * 遵循 Matt Pocock 深模块设计模式与 IDeductionTreeRenderer 统一顶层抽象
 */

import { IDeductionTreeRenderer, StaticDeductionRenderOptions } from './types';
import { DeductionBoardPrimitives } from './deduction-board-primitives';

export class MaximalRectangleDeductionRenderer implements IDeductionTreeRenderer {
  public readonly id = 'maximal-rectangle';

  public canHandle(modelId: string): boolean {
    return (
      modelId === 'maximal-rectangle' ||
      modelId === '85' ||
      modelId === 'leetcode-85' ||
      modelId === 'maximal-rectangle-052' ||
      modelId === 'class052-code06'
    );
  }

  public render(_options: StaticDeductionRenderOptions): string {
    const header = DeductionBoardPrimitives.renderHeader({
      title: '力扣 85. 最大矩形 (Maximal Rectangle) · 全景推演树',
      badge: '左程云 Class 052 & 代码随想录 · 二维 0/1 矩阵向一维连续高度压缩 / 逐行复用直方图单调栈 / 严格 O(M*N) 时空规约',
      descriptionHtml: `
        核心目标：给定一个仅包含 <code>0</code> 和 <code>1</code> 、大小为 <code>rows x cols</code> 的二维二进制矩阵，找出只包含 <code>1</code> 的最大矩形，并返回其面积。<br/>
        <strong>左程云算法体系教学核心——二维降维压缩与直方图单调栈串联母题：</strong><br/>
        1. <strong>连续 1 矩阵压缩降维定理</strong>：<br/>
        • 设 <code>heights[j]</code> 表示以第 <code>i</code> 行为底、第 <code>j</code> 列向上延伸的<strong>连续 1 的高度</strong>；<br/>
        • <strong>状态转移规约</strong>：<br/>
          若 <code>matrix[i][j] == '1'</code>，则 <code>heights[j] = heights[j] + 1</code>；<br/>
          若 <code>matrix[i][j] == '0'</code>，则地基断裂，<strong>强制归零 <code>heights[j] = 0</code></strong>！<br/>
        2. <strong>逐行直方图单调栈复用</strong>：<br/>
        • 矩阵每一行压缩出的 <code>heights</code> 数组，本质上就是一个标准的<strong>直方图</strong>；<br/>
        • 直接套用 LeetCode 84（柱状图最大矩形）的单调递增栈算法，在 <code>O(cols)</code> 时间内求出以当前行为底的最大矩形；<br/>
        • 遍历所有 <code>rows</code> 行，全局最大值即为答案！总时间复杂度为极速的 <code>O(rows * cols)</code>。
      `,
      initialStateText: `压缩入口：maximalRectangle(matrix) ➔ 初始化 int[] heights = new int[cols], maxArea = 0。`,
    });

    const baseCase = DeductionBoardPrimitives.renderBaseCases([
      {
        prefix: '├───',
        label: '边界判空退化 (Empty Matrix)',
        valuesStr: 'matrix == null || matrix.length == 0 || matrix[0].length == 0 ➔ return 0',
      },
      {
        prefix: '└───',
        label: '终止判定条件 (Termination Condition)',
        valuesStr: '逐行压缩与直方图计算完成 ➔ 返回全局最大矩形面积 maxArea',
      },
    ]);

    const step1 = DeductionBoardPrimitives.renderInnerStep({
      connector: '├───',
      label: '阶段 1: 逐行地基连续 1 累加压缩 (Row Ground Compression)',
      badgeHtml: '<span class="px-1.5 py-0.5 rounded bg-blue-100 text-blue-800 font-mono text-[9px]">O(M*N) Height</span>',
      detailLines: [
        'for (int i = 0; i < rows; i++) {',
        '  for (int j = 0; j < cols; j++) {',
        '    heights[j] = (matrix[i][j] == \'1\') ? heights[j] + 1 : 0;',
        '  }',
        '}',
      ],
      fillLine: '地基演化：逢 1 高度攀升，逢 0 归零斩断，二维网格瞬间映射为一维柱状图',
    });

    const step2 = DeductionBoardPrimitives.renderInnerStep({
      connector: '├───',
      label: '阶段 2: 注入单调栈求直方图最大面积 (Histogram Monotonic Stack)',
      badgeHtml: '<span class="px-1.5 py-0.5 rounded bg-amber-100 text-amber-800 font-mono text-[9px]">LC 84 Subroutine</span>',
      detailLines: [
        'int curRowMax = largestRectangleArea(heights);',
        'maxArea = Math.max(maxArea, curRowMax);',
      ],
      fillLine: '母题嵌套：每一行直接复用单调递增栈向两侧搜寻矮柱边界，求取当前行最大面积',
    });

    const step3 = DeductionBoardPrimitives.renderInnerStep({
      connector: '└───',
      label: '阶段 3: 行扫描收敛与全局最大矩形交付 (Global Convergence)',
      badgeHtml: '<span class="px-1.5 py-0.5 rounded bg-emerald-100 text-emerald-800 font-mono text-[9px]">Final Area</span>',
      detailLines: [
        '// 历经所有行的以当前行为底的最大矩形考察',
        'return maxArea;',
      ],
      fillLine: '无缝闭环：彻底将原本复杂的二维几何极值问题降解为 M 次一维单调栈问题',
    });

    const round = DeductionBoardPrimitives.renderOuterRound({
      title: '最大矩形推演流 (2D Compression ➔ Consecutive 1s ➔ 1D Histogram Stack ➔ Max Area)',
      subtitle: 'LeetCode 85 & Zuoshen Class 052 Maximal Rectangle Masterclass',
      innerStepsHtml: step1 + step2 + step3,
    });

    const finalReturn = DeductionBoardPrimitives.renderFinalReturn({
      resultStr: '全矩阵中最大全 1 矩形面积 maxArea',
      complexityStr: '时间复杂度: O(rows * cols) 严格二维单趟扫描 · 空间复杂度: O(cols) 一维高度数组与栈',
    });

    return header + baseCase + round + finalReturn;
  }
}
