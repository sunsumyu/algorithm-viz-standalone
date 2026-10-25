/**
 * 插入排序 全景推演树渲染策略 (InsertionSortDeductionRenderer)
 * 纯静态无状态，展示类似抓扑克牌的逆向后移与插入就位推演
 */

import { IDeductionTreeRenderer, StaticDeductionRenderOptions } from './types';
import { DeductionBoardPrimitives } from './deduction-board-primitives';

export class InsertionSortDeductionRenderer implements IDeductionTreeRenderer {
  public readonly id = 'insertion-sort-deduction';

  public canHandle(modelId: string): boolean {
    return (
      modelId === 'insertion-sort' ||
      modelId === 'insertion-sort-004' ||
      modelId === 'insertion'
    );
  }

  public render(_options: StaticDeductionRenderOptions): string {
    const rawArr = [12, 11, 13, 5, 6];
    const n = rawArr.length;

    const header = DeductionBoardPrimitives.renderHeader({
      title: '插入排序全景推演展板 (Insertion Sort Invariant)',
      badge: 'O(N²) 最坏 · O(N) 最好 · 稳定排序',
      descriptionHtml:
        '维护前缀有序区 <code>A[0 ... i-1]</code>。从 <code>i = 1</code> 开始，提取新牌 <code>key = A[i]</code>，自右向左扫描已排好的序列，将所有大于 <code>key</code> 的元素右移一位，空出正确插入槽位。',
      initialStateText: `待排数组 A = [${rawArr.join(', ')}], 规模 N = ${n}`,
    });

    const baseCases = DeductionBoardPrimitives.renderBaseCases([
      { prefix: '├───', label: '基底前缀', valuesStr: '单个元素 A[0] 自然构成有序前缀 [12]' },
      { prefix: '├───', label: '摸牌递推', valuesStr: '外层指针 i 从 1 到 N-1；每次抽出 key = A[i]' },
      { prefix: '└───', label: '逆向后移', valuesStr: '内层 j = i-1 到 0，若 A[j] > key 则 A[j+1] = A[j]；终止于 A[j] <= key' },
    ]);

    const passes = [
      {
        i: 1,
        key: 11,
        shifts: [
          'j=0: A[0]=12 > key(11) → 元素 12 后移到 A[1] → [12, 12, 13, 5, 6]',
          'j=-1: 越界到达左边界，停止后移',
        ],
        insertAction: '将 key=11 填入空位 A[0]',
        endArr: '[11, 12 | 13, 5, 6]',
        status: '前缀 [11, 12] 有序',
      },
      {
        i: 2,
        key: 13,
        shifts: [
          'j=1: A[1]=12 ≤ key(13) → 无需后移，立即就位！',
        ],
        insertAction: 'key=13 原地放回 A[2]',
        endArr: '[11, 12, 13 | 5, 6]',
        status: '前缀 [11, 12, 13] 有序 (最好情形触发)',
      },
      {
        i: 3,
        key: 5,
        shifts: [
          'j=2: A[2]=13 > key(5) → 13 后移到 A[3] → [..., 13, 13, 6]',
          'j=1: A[1]=12 > key(5) → 12 后移到 A[2] → [..., 12, 13, 6]',
          'j=0: A[0]=11 > key(5) → 11 后移到 A[1] → [11, 12, 13, 6]',
          'j=-1: 越界到达左边界，停止后移',
        ],
        insertAction: '将 key=5 填入首位 A[0]',
        endArr: '[5, 11, 12, 13 | 6]',
        status: '前缀 [5, 11, 12, 13] 有序 (发生 3 次后移)',
      },
      {
        i: 4,
        key: 6,
        shifts: [
          'j=3: A[3]=13 > key(6) → 13 后移到 A[4] → [..., 13, 13]',
          'j=2: A[2]=12 > key(6) → 12 后移到 A[3] → [..., 12, 13]',
          'j=1: A[1]=11 > key(6) → 11 后移到 A[2] → [..., 11, 12, 13]',
          'j=0: A[0]=5 ≤ key(6) → 停止后移，目标插入位为 j+1 = 1',
        ],
        insertAction: '将 key=6 填入槽位 A[1]',
        endArr: '[5, 6, 11, 12, 13]',
        status: '全数组排序完成！',
      },
    ];

    const roundsHtml = passes
      .map(p =>
        DeductionBoardPrimitives.renderOuterRound({
          title: `摸牌 i = ${p.i} (抽出 key = ${p.key})`,
          subtitle: p.insertAction,
          innerStepsHtml: DeductionBoardPrimitives.renderInnerStep({
            connector: '└──',
            label: `逆向有序区扫描与搬移腾位`,
            badgeHtml: `<span class="text-xs px-2 py-0.5 rounded bg-blue-100 text-blue-800 font-bold">${p.status}</span>`,
            detailLines: p.shifts,
            fillLine: `有序区扩展: ${p.endArr}`,
          }),
        })
      )
      .join('');

    const loopSection = DeductionBoardPrimitives.renderLoopSection(
      roundsHtml,
      '抽取待插牌 · 有序区逆序扫描 · 元素后移腾位 · 落子插入'
    );

    const finalReturn = DeductionBoardPrimitives.renderFinalReturn({
      returnCode: '[5, 6, 11, 12, 13]',
      answerDescription:
        '插入排序对于小规模数组或基本有序数组效率极高（常数极小，最好为 O(N)），且保持原数组相等元素的相对先后顺序（稳定排序）。',
      complexityStr: '时间复杂度: 最好 O(N) / 最坏 O(N²) | 空间复杂度: O(1)',
    });

    return DeductionBoardPrimitives.wrapBoard(`
      ${header}
      ${baseCases}
      ${loopSection}
      ${finalReturn}
    `);
  }
}
