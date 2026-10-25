/**
 * 快速排序与荷兰国旗三向切分 全景推演树渲染策略 (QuickSortDeductionRenderer)
 * 纯静态无状态，展示三路划分、随机基准与递归分治推演过程
 */

import { IDeductionTreeRenderer, StaticDeductionRenderOptions } from './types';
import { DeductionBoardPrimitives } from './deduction-board-primitives';

export class QuickSortDeductionRenderer implements IDeductionTreeRenderer {
  public readonly id = 'quick-sort-deduction';

  public canHandle(modelId: string): boolean {
    return (
      modelId === 'quick-sort' ||
      modelId === 'quick-sort-dutch-flag-045' ||
      modelId === 'class045-code01' ||
      modelId === 'dutch-flag'
    );
  }

  public render(_options: StaticDeductionRenderOptions): string {
    const rawArr = [3, 5, 2, 3, 6, 3];
    const n = rawArr.length;

    const header = DeductionBoardPrimitives.renderHeader({
      title: '快速排序三路切分推演展板 (Dutch National Flag Partition)',
      badge: 'O(N log N) 期望 · O(log N) 栈深度 · 原地分治',
      descriptionHtml:
        '采用荷兰国旗（三向切分）优化经典快排：选取基准 <code>pivot</code>，将数组划分成小于区 <code>[&lt; pivot]</code>、等于区 <code>[== pivot]</code> 与大于区 <code>[&gt; pivot]</code>。等于区所有相同元素一次性全部就位，递归仅需深入小于区和大于区。',
      initialStateText: `待排数组 A = [${rawArr.join(', ')}], 选取 pivot = 3`,
    });

    const baseCases = DeductionBoardPrimitives.renderBaseCases([
      { prefix: '├───', label: '递归基底 (L >= R)', valuesStr: '当子区间长度 ≤ 1 时，自然就位直接返回' },
      { prefix: '├───', label: '三界划分指针', valuesStr: '初始化 less = L - 1 (小于区右界)，more = R + 1 (大于区左界)，i = L (扫描指针)' },
      { prefix: '└───', label: '三色动作规约', valuesStr: 'A[i] < pivot → swap(++less, i++); A[i] == pivot → i++; A[i] > pivot → swap(--more, i)' },
    ]);

    const partitionSteps = [
      {
        step: 1,
        i: 0,
        val: 3,
        action: 'A[0]=3 == pivot',
        desc: '当前数等于基准，无需交换直接纳入等于区，指针步进 i++ 移动到 1',
        boundaries: 'less = -1, more = 6, i = 1',
        arrState: '[3, 5, 2, 3, 6, 3]',
      },
      {
        step: 2,
        i: 1,
        val: 5,
        action: 'A[1]=5 > pivot',
        desc: '当前数大于基准，与大于区前一位 swap(--more, i) 即交换 A[5] 与 A[1]，more 收缩至 5。注意换上来的新值仍需判定，i 保持 1！',
        boundaries: 'less = -1, more = 5, i = 1',
        arrState: '[3, 3, 2, 3, 6, 5]',
      },
      {
        step: 3,
        i: 1,
        val: 3,
        action: 'A[1]=3 == pivot',
        desc: '重新判定换上来的 3：等于基准，纳入等于区，指针 i++ 移动到 2',
        boundaries: 'less = -1, more = 5, i = 2',
        arrState: '[3, 3, 2, 3, 6, 5]',
      },
      {
        step: 4,
        i: 2,
        val: 2,
        action: 'A[2]=2 < pivot',
        desc: '当前数小于基准，执行 swap(++less, i++)，与小于区下一位 A[0] 交换，less 扩展至 0，i 步进至 3',
        boundaries: 'less = 0, more = 5, i = 3',
        arrState: '[2, 3, 3, 3, 6, 5]',
      },
      {
        step: 5,
        i: 3,
        val: 3,
        action: 'A[3]=3 == pivot',
        desc: '等于基准，纳入等于区，指针 i++ 移动到 4',
        boundaries: 'less = 0, more = 5, i = 4',
        arrState: '[2, 3, 3, 3, 6, 5]',
      },
      {
        step: 6,
        i: 4,
        val: 6,
        action: 'A[4]=6 > pivot',
        desc: '大于基准，执行 swap(--more, i) 与 A[4] 自交换，more 收缩至 4。此时 i(4) == more(4)，划分循环终止！',
        boundaries: 'less = 0, more = 4, 遍历终点',
        arrState: '[2 | 3, 3, 3 | 6, 5]',
      },
    ];

    const roundsHtml = partitionSteps
      .map(s =>
        DeductionBoardPrimitives.renderOuterRound({
          title: `切分步骤 ${s.step}: 检验元素 A[${s.i}] = ${s.val}`,
          subtitle: s.action,
          innerStepsHtml: DeductionBoardPrimitives.renderInnerStep({
            connector: '└──',
            label: s.desc,
            badgeHtml: `<span class="text-xs px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 font-mono">${s.boundaries}</span>`,
            detailLines: [
              `当前三区边界: ${s.boundaries}`,
              `操作指令: ${s.action}`,
            ],
            fillLine: `实时切分形态: ${s.arrState}`,
          }),
        })
      )
      .join('');

    const loopSection = DeductionBoardPrimitives.renderLoopSection(
      roundsHtml,
      '双边界收缩 · 三向切分 · 等于区大批量一次性锁定'
    );

    const finalReturn = DeductionBoardPrimitives.renderFinalReturn({
      returnCode: '小于区 [2], 等于区 [3, 3, 3], 大于区 [5, 6]',
      answerDescription:
        '通过荷兰国旗三向切分，下标 [1, 3] 内所有值为 3 的元素全部就位！递归仅需深入左侧 [0, 0] 与右侧 [4, 5]，对大量重复值数组时间复杂度优化至极限 O(N)。',
      complexityStr: '期望时间: O(N log N) | 空间复杂度 (栈): O(log N)',
    });

    return DeductionBoardPrimitives.wrapBoard(`
      ${header}
      ${baseCases}
      ${loopSection}
      ${finalReturn}
    `);
  }
}
