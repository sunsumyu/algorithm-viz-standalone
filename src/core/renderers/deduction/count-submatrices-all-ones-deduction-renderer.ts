/**
 * 统计全 1 子矩形 (Count Submatrices with All Ones · LeetCode 1504 / Class 053)
 * 全景推演树渲染策略 (CountSubmatricesAllOnesDeductionRenderer)
 * 遵循 Matt Pocock 深模块设计模式与 IDeductionTreeRenderer 统一顶层抽象
 */

import { IDeductionTreeRenderer, StaticDeductionRenderOptions } from './types';
import { DeductionBoardPrimitives } from './deduction-board-primitives';

export class CountSubmatricesAllOnesDeductionRenderer implements IDeductionTreeRenderer {
  public readonly id = 'count-submatrices-all-ones';

  public canHandle(modelId: string): boolean {
    return (
      modelId === 'count-submatrices-all-ones' ||
      modelId === 'count-submatrices-all-ones-1504' ||
      modelId === 'count-submatrices-all-ones-053' ||
      modelId === '1504' ||
      modelId === 'leetcode-1504' ||
      modelId === 'class053-code01'
    );
  }

  public render(_options: StaticDeductionRenderOptions): string {
    const header = DeductionBoardPrimitives.renderHeader({
      title: '力扣 1504. 统计全 1 子矩形 (Count Submatrices With All Ones) · 全景推演树',
      badge: '左程云 Class 053 & LeetCode 1504 · 二维高度压缩 / 单调递增栈阶梯差分 (h - down) * k(k+1)/2 / 严格 O(M*N)',
      descriptionHtml: `
        核心目标：给你一个 <code>m x n</code> 的二进制矩阵 <code>mat</code> ，返回有多少个<strong>子矩形</strong>的元素全部都是 <code>1</code>。<br/>
        <strong>左程云算法体系教学核心——从极值面积到全量组合计数的飞跃：</strong><br/>
        1. <strong>矩阵计数与求最大面积的区别</strong>：<br/>
        • 84/85 题求<strong>最大面积</strong>：出栈时只关心单根基准柱所能达到的极大值 <code>h * w</code>；<br/>
        • 1504 题求<strong>全量组合子矩形总数</strong>：每一根出栈柱子 <code>cur</code> 高出其左右相邻柱的部分，必须被完整细分为所有可能的宽度和高度组合进行计数累加！<br/>
        2. <strong>精妙阶梯高度差分组合公式</strong>：<br/>
        • 弹出栈顶 <code>cur</code>，左侧首个更矮位置为 <code>left</code>，右侧首个更矮位置为 <code>right</code>；<br/>
        • 左右两侧更矮者的<strong>较高者</strong>为底座基线：<code>down = Math.max(left == -1 ? 0 : h[left], h[right])</code>；<br/>
        • 这一段水平底座的有效跨度为：<code>k = right - left - 1</code>；<br/>
        • 在跨度 <code>k</code> 内任选左右边界的组合数为：<code>k * (k + 1) / 2</code>；<br/>
        • 当前柱子独立高出底座的高度为：<code>(h[cur] - down)</code>；<br/>
        • <strong>该阶梯独立贡献的全 1 子矩形数</strong>：<code>(h[cur] - down) * (k * (k + 1) / 2)</code>！<br/>
        • 逐行压缩直方图累加各阶梯贡献，严格保证不重不漏！
      `,
      initialStateText: `计数入口：numSubmat(mat) ➔ 初始化 int[] heights = new int[cols], totalCount = 0。`,
    });

    const baseCase = DeductionBoardPrimitives.renderBaseCases([
      {
        prefix: '├───',
        label: '边界判空退化 (Empty Matrix)',
        valuesStr: 'mat == null || mat.length == 0 || mat[0].length == 0 ➔ return 0',
      },
      {
        prefix: '└───',
        label: '终止判定条件 (Termination Condition)',
        valuesStr: '逐行高度压缩与阶梯差分累加完毕 ➔ 返回全矩阵全 1 子矩形总数',
      },
    ]);

    const step1 = DeductionBoardPrimitives.renderInnerStep({
      connector: '├───',
      label: '阶段 1: 二维压缩与底座阶梯提取 (Ground Compression)',
      badgeHtml: '<span class="px-1.5 py-0.5 rounded bg-blue-100 text-blue-800 font-mono text-[9px]">Compress Row</span>',
      detailLines: [
        'for (int i = 0; i < m; i++) {',
        '  for (int j = 0; j < n; j++) {',
        '    heights[j] = (mat[i][j] == 1) ? heights[j] + 1 : 0;',
        '  }',
        '  ans += countFromHistogram(heights);',
        '}',
      ],
      fillLine: '底座成型：矩阵每一行作为底边，将上方连续的 1 压缩为直方图',
    });

    const step2 = DeductionBoardPrimitives.renderInnerStep({
      connector: '├───',
      label: '阶段 2: 阶梯差分与组合数学结算 (Step Differential Formula)',
      badgeHtml: '<span class="px-1.5 py-0.5 rounded bg-amber-100 text-amber-800 font-mono text-[9px]">(h - down) * k(k+1)/2</span>',
      detailLines: [
        'int cur = stack.pop();',
        'int left = stack.isEmpty() ? -1 : stack.peek();',
        'int right = j;',
        'int down = Math.max(left == -1 ? 0 : heights[left], heights[right]);',
        'int k = right - left - 1;',
        'subCount += (heights[cur] - down) * (k * (k + 1) / 2);',
      ],
      fillLine: '水平切片：高出两侧底座的部分，在水平跨度 k 内以组合数自由衍生子矩形',
    });

    const step3 = DeductionBoardPrimitives.renderInnerStep({
      connector: '└───',
      label: '阶段 3: 全局无重不漏累加交付 (O(M*N) Overall Delivery)',
      badgeHtml: '<span class="px-1.5 py-0.5 rounded bg-emerald-100 text-emerald-800 font-mono text-[9px]">Total Count</span>',
      detailLines: [
        'return totalCount;',
      ],
      fillLine: '不重不漏：差分阶梯完美切分三维空间，每一块子矩形仅被其底边所在行唯一统计',
    });

    const round = DeductionBoardPrimitives.renderOuterRound({
      title: '全 1 子矩形统计推演流 (2D Compression ➔ Monotonic Differential ➔ Combinatorial Formula)',
      subtitle: 'LeetCode 1504 & Zuoshen Class 053 Combinatorial Stack Masterclass',
      innerStepsHtml: step1 + step2 + step3,
    });

    const finalReturn = DeductionBoardPrimitives.renderFinalReturn({
      resultStr: '全部全 1 子矩形总个数 totalCount',
      complexityStr: '时间复杂度: O(M * N) 极速二维线性扫描 · 空间复杂度: O(N) 仅一维栈与高度数组',
    });

    return header + baseCase + round + finalReturn;
  }
}
