/**
 * 归并分治小和问题 全景推演树渲染策略 (SmallSumDeductionRenderer)
 * 纯静态无状态，展示利用归并局部有序性实现 O(N log N) 批量跨区累加推导过程 (Class 044 / 022)
 */

import { IDeductionTreeRenderer, StaticDeductionRenderOptions } from './types';
import { DeductionBoardPrimitives } from './deduction-board-primitives';

export class SmallSumDeductionRenderer implements IDeductionTreeRenderer {
  public readonly id = 'small-sum-deduction';

  public canHandle(modelId: string): boolean {
    return (
      modelId === 'small-sum-merge-044' ||
      modelId === 'small-sum' ||
      modelId === 'class044-code01' ||
      modelId === 'class022-code01' ||
      modelId === 'merge-sort-small-sum-022'
    );
  }

  public render(_options: StaticDeductionRenderOptions): string {
    const rawArr = [1, 3, 4, 2, 5];
    const n = rawArr.length;

    const header = DeductionBoardPrimitives.renderHeader({
      title: '归并分治小和问题推演展板 (Small Sum Bulk Contribution)',
      badge: 'O(N log N) 归并分治 · 逆向视角转换 · 批量乘积累加',
      descriptionHtml:
        '求解数组中所有元素的左侧更小值之和。暴力求解需两两比对耗时 <code>O(N²)</code>。左程云归并优化：逆转视角为“当右侧出现多少个比我大的数时，我就产生多少次贡献”。借助归并排序的左右半区局部有序性，以 <code>(R - p2 + 1)</code> 批量乘法一次性算出贡献。',
      initialStateText: `待求数组 A = [${rawArr.join(', ')}], 规模 N = ${n}`,
    });

    const baseCases = DeductionBoardPrimitives.renderBaseCases([
      { prefix: '├───', label: '递归三部曲', valuesStr: '总小和 = 左半区内部小和 + 右半区内部小和 + 跨半区合并小和' },
      { prefix: '├───', label: '批量累加核心', valuesStr: '当 A[p1] < A[p2] 时，由于右区有序，从 p2 到 R 全都大于 A[p1]，产生 A[p1] * (R - p2 + 1) 贡献' },
      { prefix: '└───', label: '指针滑动不变量', valuesStr: '当 A[p1] >= A[p2] 时不产生小和，先拷贝 A[p2] 入辅助数组以维持单调性' },
    ]);

    const steps = [
      {
        stage: '二分切分',
        desc: '数组拆解为左区 [1, 3, 4] 与右区 [2, 5]',
        calc: '递归深入子区间分别计算内部小和',
        subtotal: '左区内部产生 4，右区内部产生 2，子区间累计小和 = 6',
      },
      {
        stage: '跨区归并: p1=0 (val=1) vs p2=3 (val=2)',
        desc: '左区元素 1 < 右区元素 2',
        calc: '右区当前剩余 [2, 5] 共 2 个数全大于 1！\n批量贡献 = 1 * (5 - 3 + 1) = 1 * 2 = 2',
        subtotal: '拷贝 1 入 help[], p1 后移。累计小和 = 6 + 2 = 8',
      },
      {
        stage: '跨区归并: p1=1 (val=3) vs p2=3 (val=2)',
        desc: '左区元素 3 ≥ 右区元素 2',
        calc: '3 不比 2 小，无法断言右区后续元素是否大于 3。\n不产生贡献 (增加 0)',
        subtotal: '拷贝 2 入 help[], p2 后移至 4 (val=5)。累计保持 8',
      },
      {
        stage: '跨区归并: p1=1 (val=3) vs p2=4 (val=5)',
        desc: '左区元素 3 < 右区元素 5',
        calc: '右区当前剩余 [5] 共 1 个数大于 3！\n批量贡献 = 3 * (5 - 4 + 1) = 3 * 1 = 3',
        subtotal: '拷贝 3 入 help[], p1 后移至 2 (val=4)。累计小和 = 8 + 3 = 11',
      },
      {
        stage: '跨区归并: p1=2 (val=4) vs p2=4 (val=5)',
        desc: '左区元素 4 < 右区元素 5',
        calc: '右区当前剩余 [5] 共 1 个数大于 4！\n批量贡献 = 4 * 1 = 4',
        subtotal: '拷贝 4 入 help[]。累计小和 = 11 + 4 = 15',
      },
    ];

    const roundsHtml = steps
      .map((s, idx) =>
        DeductionBoardPrimitives.renderOuterRound({
          title: `推导阶段 ${idx + 1}: ${s.stage}`,
          subtitle: `贡献推导`,
          innerStepsHtml: DeductionBoardPrimitives.renderInnerStep({
            connector: '└──',
            label: s.desc,
            badgeHtml: `<span class="text-xs px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 font-mono">Stage ${idx + 1}</span>`,
            detailLines: s.calc.split('\n'),
            fillLine: s.subtotal,
          }),
        })
      )
      .join('');

    const loopSection = DeductionBoardPrimitives.renderLoopSection(
      roundsHtml,
      '分治递归 · 左右局部有序 · 批量相乘累加 · 复杂度突破'
    );

    const finalReturn = DeductionBoardPrimitives.renderFinalReturn({
      returnCode: '总小和 totalSmallSum = 16',
      answerDescription:
        '通过归并分治与跨区有序性，将原本需要两两检验的 O(N²) 暴力过程完美规约为 O(N log N) 的高效分治，此思想也是“翻转对 (LeetCode 493)”与“逆序对 (剑指 Offer 51)”的通用母题。',
      complexityStr: '时间复杂度: O(N log N) | 额外空间: O(N)',
    });

    return DeductionBoardPrimitives.wrapBoard(`
      ${header}
      ${baseCases}
      ${loopSection}
      ${finalReturn}
    `);
  }
}
