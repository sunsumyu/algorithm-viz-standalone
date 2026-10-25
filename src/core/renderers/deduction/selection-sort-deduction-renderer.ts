/**
 * 选择排序 全景推演树渲染策略 (SelectionSortDeductionRenderer)
 * 纯静态无状态，展示未排序区最小值搜索与原地单次交换推导过程
 */

import { IDeductionTreeRenderer, StaticDeductionRenderOptions } from './types';
import { DeductionBoardPrimitives } from './deduction-board-primitives';

export class SelectionSortDeductionRenderer implements IDeductionTreeRenderer {
  public readonly id = 'selection-sort-deduction';

  public canHandle(modelId: string): boolean {
    return (
      modelId === 'selection-sort' ||
      modelId === 'selection-sort-004' ||
      modelId === 'selection'
    );
  }

  public render(_options: StaticDeductionRenderOptions): string {
    const rawArr = [29, 10, 14, 37, 13];
    const n = rawArr.length;

    const header = DeductionBoardPrimitives.renderHeader({
      title: '选择排序全景推演展板 (Selection Sort Invariant)',
      badge: 'O(N²) 时间 · O(1) 额外空间 · 不稳定排序',
      descriptionHtml:
        '每轮从未排序区间 <code>A[i ... N-1]</code> 中扫描锁定全局最小值索引 <code>minIdx</code>，并与首位 <code>A[i]</code> 进行单次交换，将前缀有序区由 <code>i</code> 扩展至 <code>i+1</code>。',
      initialStateText: `待排数组 A = [${rawArr.join(', ')}], 规模 N = ${n}`,
    });

    const baseCases = DeductionBoardPrimitives.renderBaseCases([
      { prefix: '├───', label: '循环边界', valuesStr: '外层指针 i 从 0 遍历到 N-2；当 i = N-1 时最后单一元素自然就位' },
      { prefix: '├───', label: '极值跟踪', valuesStr: '每轮初始设 minIdx = i，遍历 j ∈ [i+1, N-1] 若 A[j] < A[minIdx] 则更新' },
      { prefix: '└───', label: '单次交换', valuesStr: '仅在扫描结束时执行 swap(A[i], A[minIdx])，每轮至多发生 1 次交换操作' },
    ]);

    const passes = [
      {
        i: 0,
        initMin: 'minIdx=0 (val=29)',
        scans: [
          'j=1: 比较 A[1]=10 与 A[minIdx]=29 → 10 < 29 → 更新 minIdx = 1 (val=10)',
          'j=2: 比较 A[2]=14 与 A[minIdx]=10 → 14 ≥ 10 → 保持',
          'j=3: 比较 A[3]=37 与 A[minIdx]=10 → 37 ≥ 10 → 保持',
          'j=4: 比较 A[4]=13 与 A[minIdx]=10 → 13 ≥ 10 → 保持',
        ],
        swapAction: 'swap(A[0], A[1]) 交换 29 与 10',
        endArr: '[10 | 29, 14, 37, 13]',
        locked: '第 1 小元素 10 就位于 A[0]',
      },
      {
        i: 1,
        initMin: 'minIdx=1 (val=29)',
        scans: [
          'j=2: 比较 A[2]=14 与 A[minIdx]=29 → 14 < 29 → 更新 minIdx = 2 (val=14)',
          'j=3: 比较 A[3]=37 与 A[minIdx]=14 → 37 ≥ 14 → 保持',
          'j=4: 比较 A[4]=13 与 A[minIdx]=14 → 13 < 14 → 更新 minIdx = 4 (val=13)',
        ],
        swapAction: 'swap(A[1], A[4]) 交换 29 与 13',
        endArr: '[10, 13 | 14, 37, 29]',
        locked: '第 2 小元素 13 就位于 A[1]',
      },
      {
        i: 2,
        initMin: 'minIdx=2 (val=14)',
        scans: [
          'j=3: 比较 A[3]=37 与 A[minIdx]=14 → 37 ≥ 14 → 保持',
          'j=4: 比较 A[4]=29 与 A[minIdx]=14 → 29 ≥ 14 → 保持',
        ],
        swapAction: 'minIdx === 2 无需自交换 (原地保持)',
        endArr: '[10, 13, 14 | 37, 29]',
        locked: '第 3 小元素 14 就位于 A[2]',
      },
      {
        i: 3,
        initMin: 'minIdx=3 (val=37)',
        scans: [
          'j=4: 比较 A[4]=29 与 A[minIdx]=37 → 29 < 37 → 更新 minIdx = 4 (val=29)',
        ],
        swapAction: 'swap(A[3], A[4]) 交换 37 与 29',
        endArr: '[10, 13, 14, 29, 37]',
        locked: '第 4 小元素 29 就位，末位 37 自然就位',
      },
    ];

    const roundsHtml = passes
      .map(p =>
        DeductionBoardPrimitives.renderOuterRound({
          title: `轮次 i = ${p.i} (选出第 ${p.i + 1} 小元素)`,
          subtitle: p.swapAction,
          innerStepsHtml: DeductionBoardPrimitives.renderInnerStep({
            connector: '└──',
            label: `初始 ${p.initMin}，区间扫描 j ∈ [${p.i + 1}, ${n - 1}]`,
            badgeHtml: `<span class="text-xs px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 font-bold">${p.locked}</span>`,
            detailLines: p.scans,
            fillLine: `轮末数组状态: ${p.endArr}`,
          }),
        })
      )
      .join('');

    const loopSection = DeductionBoardPrimitives.renderLoopSection(
      roundsHtml,
      '极值扫描锁定 · 原地单次交换 · 有序前缀单调递增'
    );

    const finalReturn = DeductionBoardPrimitives.renderFinalReturn({
      returnCode: '[10, 13, 14, 29, 37]',
      answerDescription:
        '通过 N-1 轮扫描与极值锁定，以严格固定的 N(N-1)/2 次比较和至多 N-1 次交换完成排序。无论数据初始状态如何，时间复杂度恒为 O(N²)。',
      complexityStr: '时间复杂度: O(N²) (最好/最坏恒定) | 空间复杂度: O(1)',
    });

    return DeductionBoardPrimitives.wrapBoard(`
      ${header}
      ${baseCases}
      ${loopSection}
      ${finalReturn}
    `);
  }
}
