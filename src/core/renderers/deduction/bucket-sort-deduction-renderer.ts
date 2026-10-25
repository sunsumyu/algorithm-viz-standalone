/**
 * 桶排序 全景推演树渲染策略 (BucketSortDeductionRenderer)
 * 纯静态无状态，展示区间分桶、桶内排序与顺序归拢推导过程
 */

import { IDeductionTreeRenderer, StaticDeductionRenderOptions } from './types';
import { DeductionBoardPrimitives } from './deduction-board-primitives';

export class BucketSortDeductionRenderer implements IDeductionTreeRenderer {
  public readonly id = 'bucket-sort-deduction';

  public canHandle(modelId: string): boolean {
    return modelId === 'bucket-sort' || modelId === 'bucket-sort-standard';
  }

  public render(_options: StaticDeductionRenderOptions): string {
    const rawArr = [29, 25, 3, 49, 9, 37, 21, 43];
    const n = rawArr.length;
    const bucketCount = 5;

    const header = DeductionBoardPrimitives.renderHeader({
      title: '桶排序全景推演展板 (Bucket Sort Interval Partition)',
      badge: 'O(N + K) 最好 · O(N²) 最坏 · 稳定排序',
      descriptionHtml:
        '通过均匀散列将数据分发到多个有序区间桶中：先扫描数组确定极值 <code>[min, max]</code>，划分 <code>K</code> 个互不重叠的子区间桶；将元素散列入桶并在桶内分别排序；最后按桶序依次串联。',
      initialStateText: `待排数组 A = [${rawArr.join(', ')}], min = 3, max = 49, 桶数量 K = ${bucketCount}`,
    });

    const baseCases = DeductionBoardPrimitives.renderBaseCases([
      { prefix: '├───', label: '分桶公式', valuesStr: '桶索引 bucketIdx = Math.floor((val - min) / bucketRange)' },
      { prefix: '├───', label: '区间跨度', valuesStr: 'bucketRange = (max - min) / (K - 1) ≈ (49 - 3) / 4 = 11.5' },
      { prefix: '└───', label: '桶内独立性', valuesStr: '不同桶之间天然严格有序，仅需对各个桶内部做插入或快排即可' },
    ]);

    const buckets = [
      {
        idx: 0,
        range: '[3, 14.5)',
        items: [3, 9],
        sorted: [3, 9],
        detail: '散列落入: 3, 9 → 桶内排序: [3, 9]',
      },
      {
        idx: 1,
        range: '[14.5, 26)',
        items: [25, 21],
        sorted: [21, 25],
        detail: '散列落入: 25, 21 → 桶内插入排序: [21, 25]',
      },
      {
        idx: 2,
        range: '[26, 37.5)',
        items: [29, 37],
        sorted: [29, 37],
        detail: '散列落入: 29, 37 → 桶内排序: [29, 37]',
      },
      {
        idx: 3,
        range: '[37.5, 49)',
        items: [43],
        sorted: [43],
        detail: '散列落入: 43 → 单元素自然有序: [43]',
      },
      {
        idx: 4,
        range: '[49, 60.5]',
        items: [49],
        sorted: [49],
        detail: '散列落入最大值: 49 → [49]',
      },
    ];

    const roundsHtml = buckets
      .map(b =>
        DeductionBoardPrimitives.renderOuterRound({
          title: `桶 ${b.idx} (区间 ${b.range})`,
          subtitle: `容量 ${b.items.length} 项`,
          innerStepsHtml: DeductionBoardPrimitives.renderInnerStep({
            connector: '└──',
            label: b.detail,
            badgeHtml: `<span class="text-xs px-2 py-0.5 rounded bg-amber-100 text-amber-800 font-mono">已排好: [${b.sorted.join(', ')}]</span>`,
            detailLines: [
              `初始散列入桶元素: [${b.items.join(', ')}]`,
              `桶内微观排序结果: [${b.sorted.join(', ')}]`,
            ],
            fillLine: `桶内有序状态: [${b.sorted.join(', ')}]`,
          }),
        })
      )
      .join('');

    const loopSection = DeductionBoardPrimitives.renderLoopSection(
      roundsHtml,
      '极值区间划分 · 散列分流 · 桶内局部排序 · 顺序归拢'
    );

    const finalReturn = DeductionBoardPrimitives.renderFinalReturn({
      returnCode: '[3, 9, 21, 25, 29, 37, 43, 49]',
      answerDescription:
        '按桶序号 0 → 1 → 2 → 3 → 4 将各桶内元素顺次拼接回填，若数据在值域内近似均匀分布，各桶元素数量接近常数，整体时间复杂度达到 O(N)。',
      complexityStr: '时间复杂度: 最好 O(N + K) / 最坏 O(N²) | 空间复杂度: O(N + K)',
    });

    return DeductionBoardPrimitives.wrapBoard(`
      ${header}
      ${baseCases}
      ${loopSection}
      ${finalReturn}
    `);
  }
}
