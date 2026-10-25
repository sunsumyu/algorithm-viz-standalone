/**
 * 冒泡排序 全景推演树渲染策略 (BubbleSortDeductionRenderer)
 * 纯静态无状态，展示相邻比较、元素冒泡与早停标记的完整推导过程
 */

import { IDeductionTreeRenderer, StaticDeductionRenderOptions } from './types';
import { DeductionBoardPrimitives } from './deduction-board-primitives';

export class BubbleSortDeductionRenderer implements IDeductionTreeRenderer {
  public readonly id = 'bubble-sort-deduction';

  public canHandle(modelId: string): boolean {
    return (
      modelId === 'bubble-sort' ||
      modelId === 'bubble-sort-004' ||
      modelId === 'bubble'
    );
  }

  public render(_options: StaticDeductionRenderOptions): string {
    const rawArr = [5, 2, 9, 1, 5, 6];
    const n = rawArr.length;

    const header = DeductionBoardPrimitives.renderHeader({
      title: '冒泡排序全景推演展板 (Bubble Sort Invariant)',
      badge: 'O(N²) 时间 · O(1) 额外空间 · 稳定排序',
      descriptionHtml:
        '通过相邻两两比较并在逆序时交换，每轮将未就位区间内的最大元素逐步“冒泡”到末尾。引入 <code>swapped</code> 标志位实现近有序早停优化。',
      initialStateText: `待排数组 A = [${rawArr.join(', ')}], 规模 N = ${n}`,
    });

    const baseCases = DeductionBoardPrimitives.renderBaseCases([
      { prefix: '├───', label: '循环边界', valuesStr: '外层轮次 i 从 0 到 N-2，内层扫描 j 从 0 到 N-2-i' },
      { prefix: '├───', label: '早停标志', valuesStr: '每轮初始置 swapped = false，若整轮无交换直接 break' },
      { prefix: '└───', label: '就位不变量', valuesStr: '第 i 轮结束后，区间 A[N-1-i ... N-1] 必定全局严格有序且就位' },
    ]);

    const passes = [
      {
        pass: 0,
        swapped: true,
        comparisons: [
          'j=0: 比较 A[0]=5 与 A[1]=2 → 5 > 2 交换 → [2, 5, 9, 1, 5, 6]',
          'j=1: 比较 A[1]=5 与 A[2]=9 → 5 ≤ 9 不动 → [2, 5, 9, 1, 5, 6]',
          'j=2: 比较 A[2]=9 与 A[3]=1 → 9 > 1 交换 → [2, 5, 1, 9, 5, 6]',
          'j=3: 比较 A[3]=9 与 A[4]=5 → 9 > 5 交换 → [2, 5, 1, 5, 9, 6]',
          'j=4: 比较 A[4]=9 与 A[5]=6 → 9 > 6 交换 → [2, 5, 1, 5, 6, 9]',
        ],
        endArr: '[2, 5, 1, 5, 6, 9]',
        locked: '末尾元素 9 就位 (A[5])',
      },
      {
        pass: 1,
        swapped: true,
        comparisons: [
          'j=0: 比较 A[0]=2 与 A[1]=5 → 2 ≤ 5 不动',
          'j=1: 比较 A[1]=5 与 A[2]=1 → 5 > 1 交换 → [2, 1, 5, 5, 6, 9]',
          'j=2: 比较 A[2]=5 与 A[3]=5 → 5 ≤ 5 保持相对顺序 (稳定)',
          'j=3: 比较 A[3]=5 与 A[4]=6 → 5 ≤ 6 不动',
        ],
        endArr: '[2, 1, 5, 5, 6, 9]',
        locked: '次大元素 6 就位 (A[4])',
      },
      {
        pass: 2,
        swapped: true,
        comparisons: [
          'j=0: 比较 A[0]=2 与 A[1]=1 → 2 > 1 交换 → [1, 2, 5, 5, 6, 9]',
          'j=1: 比较 A[1]=2 与 A[2]=5 → 2 ≤ 5 不动',
          'j=2: 比较 A[2]=5 与 A[3]=5 → 5 ≤ 5 不动',
        ],
        endArr: '[1, 2, 5, 5, 6, 9]',
        locked: '元素 5 就位 (A[3])',
      },
      {
        pass: 3,
        swapped: false,
        comparisons: [
          'j=0: 比较 A[0]=1 与 A[1]=2 → 1 ≤ 2 不动',
          'j=1: 比较 A[1]=2 与 A[2]=5 → 2 ≤ 5 不动',
        ],
        endArr: '[1, 2, 5, 5, 6, 9]',
        locked: '本轮未发生任何交换 (swapped=false)，触发提前终止！',
      },
    ];

    const roundsHtml = passes
      .map(p =>
        DeductionBoardPrimitives.renderOuterRound({
          title: `第 ${p.pass + 1} 轮扫描 (Round ${p.pass + 1})`,
          subtitle: p.swapped ? '发生交换 · 持续推进' : '零交换 · 早停触发',
          innerStepsHtml: DeductionBoardPrimitives.renderInnerStep({
            connector: '└──',
            label: `扫描区间 j ∈ [0, ${n - 2 - p.pass}]`,
            badgeHtml: `<span class="text-xs px-2 py-0.5 rounded ${p.swapped ? 'bg-amber-100 text-amber-800' : 'bg-emerald-100 text-emerald-800'}">${p.locked}</span>`,
            detailLines: p.comparisons,
            fillLine: `轮末数组状态: ${p.endArr}`,
          }),
        })
      )
      .join('');

    const loopSection = DeductionBoardPrimitives.renderLoopSection(
      roundsHtml,
      '相邻滑动比对 · 逆序交换 · 早停检测'
    );

    const finalReturn = DeductionBoardPrimitives.renderFinalReturn({
      returnCode: '[1, 2, 5, 5, 6, 9]',
      answerDescription:
        '通过 4 轮迭代（原需 5 轮，早停节省 1 轮），完成全数组就位。最坏时间 O(N²)，最好时间 O(N)，原地排序空间 O(1)。',
      complexityStr: '时间复杂度: O(N²) | 空间复杂度: O(1)',
    });

    return DeductionBoardPrimitives.wrapBoard(`
      ${header}
      ${baseCases}
      ${loopSection}
      ${finalReturn}
    `);
  }
}
