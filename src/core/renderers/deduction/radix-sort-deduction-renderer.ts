/**
 * 基数排序 全景推演树渲染策略 (RadixSortDeductionRenderer)
 * 纯静态无状态，展示 LSD 低位优先、进位计数前缀表与多轮按位收集推导过程
 */

import { IDeductionTreeRenderer, StaticDeductionRenderOptions } from './types';
import { DeductionBoardPrimitives } from './deduction-board-primitives';

export class RadixSortDeductionRenderer implements IDeductionTreeRenderer {
  public readonly id = 'radix-sort-deduction';

  public canHandle(modelId: string): boolean {
    return (
      modelId === 'radix-sort' ||
      modelId === 'radix-sort-028' ||
      modelId === 'class028-code01'
    );
  }

  public render(_options: StaticDeductionRenderOptions): string {
    const rawArr = [17, 13, 25, 100, 72, 36, 54];
    const n = rawArr.length;

    const header = DeductionBoardPrimitives.renderHeader({
      title: '基数排序全景推演展板 (Radix Sort LSD Multi-Pass)',
      badge: 'O(N · d) 线性时间 · O(N) 辅助空间 · 稳定排序',
      descriptionHtml:
        '经典低位优先 (LSD) 线性时间排序：找出数组最大值确定最高位数 <code>d</code>。对个位、十位、百位进行 <code>d</code> 轮稳定的计数前缀划分，避免维护真实队列，仅用长度为 10 的 <code>count</code> 数组即可完成高位与低位的稳定交织。',
      initialStateText: `待排数组 A = [${rawArr.join(', ')}], 最大值 max = 100, 最大位数 d = 3 (个/十/百位)`,
    });

    const baseCases = DeductionBoardPrimitives.renderBaseCases([
      { prefix: '├───', label: '位提取公式', valuesStr: '第 b 位提取公式: (num / offset) % 10，其中 offset 分别为 1, 10, 100' },
      { prefix: '├───', label: '空间优化', valuesStr: '采用长度为 10 的 count[] 数组统计 [0..9] 数字频次并累加为前缀和' },
      { prefix: '└───', label: '稳定性关键', valuesStr: '从右向左遍历原数组将数字填入 help 临时数组，保证低位排好的顺序不被打乱' },
    ]);

    const passes = [
      {
        pass: '第 1 轮: 个位排序 (offset = 1)',
        details: [
          '提取各位数字: 17(7), 13(3), 25(5), 100(0), 72(2), 36(6), 54(4)',
          '个位频次 count = [1(0), 0, 1(2), 1(3), 1(4), 1(5), 1(6), 1(7), 0, 0]',
          '前缀和累加: ≤0有1个, ≤2有2个, ≤3有3个, ≤4有4个, ≤5有5个, ≤6有6个, ≤7有7个',
          '逆向回填 help = [100, 72, 13, 54, 25, 36, 17]',
        ],
        endArr: '[100, 72, 13, 54, 25, 36, 17]',
        note: '按个位从小到大排列完毕',
      },
      {
        pass: '第 2 轮: 十位排序 (offset = 10)',
        details: [
          '提取十位数字: 100(0), 72(7), 13(1), 54(5), 25(2), 36(3), 17(1)',
          '十位频次: 0有1个, 1有2个(13,17), 2有1个, 3有1个, 5有1个, 7有1个',
          '逆向回填时 17 比 13 先遇到，放在靠后位置，使得 13 排在 17 前面 (维持个位有序)',
          '逆向回填 help = [100, 13, 17, 25, 36, 54, 72]',
        ],
        endArr: '[100, 13, 17, 25, 36, 54, 72]',
        note: '后两位 (十位+个位) 完全有序',
      },
      {
        pass: '第 3 轮: 百位排序 (offset = 100)',
        details: [
          '提取百位数字: 100(1)，其余 13, 17, 25, 36, 54, 72 百位均为 0',
          '百位频次: 0有6个, 1有1个',
          '百位为 0 的六个数按照上一轮十位已排好的次序直接放入前 6 位，百位为 1 的 100 放入末位',
          '逆向回填 help = [13, 17, 25, 36, 54, 72, 100]',
        ],
        endArr: '[13, 17, 25, 36, 54, 72, 100]',
        note: '全数位排序完成，全局全局有序！',
      },
    ];

    const roundsHtml = passes
      .map((p, idx) =>
        DeductionBoardPrimitives.renderOuterRound({
          title: p.pass,
          subtitle: p.note,
          innerStepsHtml: DeductionBoardPrimitives.renderInnerStep({
            connector: '└──',
            label: `按位桶映射与前缀稳定收集`,
            badgeHtml: `<span class="text-xs px-2 py-0.5 rounded bg-blue-100 text-blue-800 font-mono">Pass ${idx + 1}/${passes.length}</span>`,
            detailLines: p.details,
            fillLine: `本轮写回数组: ${p.endArr}`,
          }),
        })
      )
      .join('');

    const loopSection = DeductionBoardPrimitives.renderLoopSection(
      roundsHtml,
      '低位向高位推演 · 进位桶划分 · 逆向收集维持相对序'
    );

    const finalReturn = DeductionBoardPrimitives.renderFinalReturn({
      returnCode: '[13, 17, 25, 36, 54, 72, 100]',
      answerDescription:
        '基数排序通过 d 次固定 10 个桶的前缀累加与反向收集，在不发生任何元素大小两两比较的前提下，实现严格 O(d · (N + 10)) 的卓越线性时间性能。',
      complexityStr: '时间复杂度: O(N · d) | 空间复杂度: O(N + 10)',
    });

    return DeductionBoardPrimitives.wrapBoard(`
      ${header}
      ${baseCases}
      ${loopSection}
      ${finalReturn}
    `);
  }
}
