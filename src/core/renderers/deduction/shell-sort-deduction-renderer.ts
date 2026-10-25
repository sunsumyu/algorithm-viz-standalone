/**
 * 希尔排序 全景推演树渲染策略 (ShellSortDeductionRenderer)
 * 纯静态无状态，展示缩小增量序列、跨步插入与粗排到精排推导过程
 */

import { IDeductionTreeRenderer, StaticDeductionRenderOptions } from './types';
import { DeductionBoardPrimitives } from './deduction-board-primitives';

export class ShellSortDeductionRenderer implements IDeductionTreeRenderer {
  public readonly id = 'shell-sort-deduction';

  public canHandle(modelId: string): boolean {
    return (
      modelId === 'shell-sort' ||
      modelId === 'shell-sort-standard' ||
      modelId === 'shell'
    );
  }

  public render(_options: StaticDeductionRenderOptions): string {
    const rawArr = [9, 8, 3, 7, 5, 6, 4, 1];
    const n = rawArr.length;

    const header = DeductionBoardPrimitives.renderHeader({
      title: '希尔排序全景推演展板 (Shell Sort Diminishing Increments)',
      badge: 'O(N^1.3 ~ N²) · O(1) 空间 · 突破 O(N²) 的插入改进',
      descriptionHtml:
        '通过“缩小增量”突破直接插入排序单步位移的限制：先选取较大步长 <code>gap</code> 进行远距离跨步插入排序，使数组宏观“基本有序”；逐步折半 <code>gap = Math.floor(gap / 2)</code> 直至 <code>gap = 1</code>，此时逆序对已大幅缩减，最后一次常规插入即可迅速完成。',
      initialStateText: `待排数组 A = [${rawArr.join(', ')}], 规模 N = ${n}`,
    });

    const baseCases = DeductionBoardPrimitives.renderBaseCases([
      { prefix: '├───', label: '增量序列公式', valuesStr: '经典折半增量: gap 初始为 N/2 = 4，每轮迭代 gap = Math.floor(gap / 2)' },
      { prefix: '├───', label: '终止条件', valuesStr: '当 gap = 1 轮次执行完毕后，排序全面收敛并终止' },
      { prefix: '└───', label: '跨步插入机制', valuesStr: '在每个以 gap 为跨度的子序列上执行直接插入排序，大幅消除长距离逆序对' },
    ]);

    const gapPasses = [
      {
        gap: 4,
        subseqs: [
          '子序列 0 (步长4): A[0]=9 与 A[4]=5 → 9 > 5 交换 → [5, ..., 9]',
          '子序列 1 (步长4): A[1]=8 与 A[5]=6 → 8 > 6 交换 → [..., 6, ..., 8]',
          '子序列 2 (步长4): A[2]=3 与 A[6]=4 → 3 ≤ 4 保持',
          '子序列 3 (步长4): A[3]=7 与 A[7]=1 → 7 > 1 交换 → [..., 1, ..., 7]',
        ],
        endArr: '[5, 6, 3, 1, 9, 8, 4, 7]',
        note: '长距离逆序对大幅缩减，小元素 (1,3,5,6) 迅速向前推进',
      },
      {
        gap: 2,
        subseqs: [
          '偶数下标子序列: [5, 3, 9, 4] 跨步插入 → 排序为 [3, 4, 5, 9]',
          '奇数下标子序列: [6, 1, 8, 7] 跨步插入 → 排序为 [1, 6, 7, 8]',
          '交织合并后数组: A[0]=3, A[1]=1, A[2]=4, A[3]=6, A[4]=5, A[5]=7, A[6]=9, A[7]=8',
        ],
        endArr: '[3, 1, 4, 6, 5, 7, 9, 8]',
        note: '全数组达到高度局部有序状态，元素偏离最终位置极小 (≤ 2)',
      },
      {
        gap: 1,
        subseqs: [
          '退化为标准插入排序: gap = 1',
          '微调步骤: 3 与 1 交换 → [1, 3, 4, 6, 5, 7, 9, 8]',
          '微调步骤: 6 与 5 插入 → [1, 3, 4, 5, 6, 7, 9, 8]',
          '微调步骤: 9 与 8 插入 → [1, 3, 4, 5, 6, 7, 8, 9]',
          '其余元素均已在正确位置，仅需极少数微调比对即可完成！',
        ],
        endArr: '[1, 3, 4, 5, 6, 7, 8, 9]',
        note: '最终精细调整就位，全数组严格有序',
      },
    ];

    const roundsHtml = gapPasses
      .map(p =>
        DeductionBoardPrimitives.renderOuterRound({
          title: `增量跨度 gap = ${p.gap}`,
          subtitle: p.note,
          innerStepsHtml: DeductionBoardPrimitives.renderInnerStep({
            connector: '└──',
            label: `跨步分组插入推演 (gap = ${p.gap})`,
            badgeHtml: `<span class="text-xs px-2 py-0.5 rounded bg-indigo-100 text-indigo-800 font-bold">gap=${p.gap} 粗排</span>`,
            detailLines: p.subseqs,
            fillLine: `轮末全景状态: ${p.endArr}`,
          }),
        })
      )
      .join('');

    const loopSection = DeductionBoardPrimitives.renderLoopSection(
      roundsHtml,
      '缩小增量序列 · 远距离逆序对优先消除 · 高度有序后极速收敛'
    );

    const finalReturn = DeductionBoardPrimitives.renderFinalReturn({
      returnCode: '[1, 3, 4, 5, 6, 7, 8, 9]',
      answerDescription:
        '希尔排序打破了传统直接插入排序 O(N²) 的时间屏障，通过由粗到精的多轮步长递减，使平均时间复杂度优化至 O(N^1.3)，是无需递归调用的高效原地排序。',
      complexityStr: '时间复杂度: O(N log² N) ~ O(N^1.5) | 空间复杂度: O(1)',
    });

    return DeductionBoardPrimitives.wrapBoard(`
      ${header}
      ${baseCases}
      ${loopSection}
      ${finalReturn}
    `);
  }
}
