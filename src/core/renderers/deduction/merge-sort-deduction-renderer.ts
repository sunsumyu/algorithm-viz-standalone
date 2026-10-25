/**
 * 归并排序 全景推演树渲染策略 (MergeSortDeductionRenderer)
 * 纯静态无状态，展示分治二分划分、Master 定理与双指针跨区合并推导
 */

import { IDeductionTreeRenderer, StaticDeductionRenderOptions } from './types';
import { DeductionBoardPrimitives } from './deduction-board-primitives';

export class MergeSortDeductionRenderer implements IDeductionTreeRenderer {
  public readonly id = 'merge-sort-deduction';

  public canHandle(modelId: string): boolean {
    return (
      modelId === 'merge-sort' ||
      modelId === 'merge-sort-043' ||
      modelId === 'class043-code01' ||
      modelId === '912' ||
      modelId === 'leetcode-912-merge'
    );
  }

  public render(_options: StaticDeductionRenderOptions): string {
    const rawArr = [38, 27, 43, 3, 9, 82, 10];
    const n = rawArr.length;

    const header = DeductionBoardPrimitives.renderHeader({
      title: '归并排序全景推演展板 (Merge Sort Divide & Conquer)',
      badge: 'O(N log N) 时间 · O(N) 辅助空间 · 稳定排序',
      descriptionHtml:
        '采用经典分治法 (Divide and Conquer)：每次将数组二分直至单一元素基底，再自底向上使用双指针合并两个已排好序的子区间，在 <code>help[]</code> 缓冲区中完成归拢后写回。',
      initialStateText: `待排数组 A = [${rawArr.join(', ')}], 规模 N = ${n}`,
    });

    const baseCases = DeductionBoardPrimitives.renderBaseCases([
      { prefix: '├───', label: '递归基底 (L == R)', valuesStr: '当区间仅有 1 个元素时，自然有序无需操作，直接返回' },
      { prefix: '├───', label: '二分切分 mid', valuesStr: '计算 mid = L + ((R - L) >> 1)，拆解为 [L, mid] 与 [mid+1, R]' },
      { prefix: '└───', label: '双指针归并', valuesStr: 'p1 指向左区首位，p2 指向右区首位，谁小取谁拷贝入 help[] 数组' },
    ]);

    const divideAndConquerNodes = [
      {
        level: 'Top-Level 二分拆解',
        left: '[38, 27, 43, 3] (L=0, mid=1, R=3)',
        right: '[9, 82, 10] (L=4, mid=5, R=6)',
        action: '分治二分递归深入',
      },
      {
        level: 'Sub-Division 二阶拆解',
        left: '[38, 27] → [38] & [27]  |  [43, 3] → [43] & [3]',
        right: '[9, 82] → [9] & [82]  |  [10] (单元素基底)',
        action: '达到原子基底（单元素长度为 1）',
      },
      {
        level: 'Bottom-Up 归并 Level 1',
        left: 'merge([38], [27]) → [27, 38]  |  merge([43], [3]) → [3, 43]',
        right: 'merge([9], [82]) → [9, 82]  |  [10]',
        action: '双指针两两合并完成',
      },
      {
        level: 'Bottom-Up 归并 Level 2',
        left: 'merge([27, 38], [3, 43]) → [3, 27, 38, 43]',
        right: 'merge([9, 82], [10]) → [9, 10, 82]',
        action: '四元组与三元组各自局部有序',
      },
      {
        level: 'Final Merge 全局归并',
        left: 'p1 指向 [3, 27, 38, 43], p2 指向 [9, 10, 82]',
        right: '交替提取：3 < 9 → 取3; 9 < 27 → 取9; 10 < 27 → 取10; 27 < 82 → 取27; ...',
        action: '全局写回原数组完成！',
      },
    ];

    const roundsHtml = divideAndConquerNodes
      .map((node, idx) =>
        DeductionBoardPrimitives.renderOuterRound({
          title: `分治演化阶段 ${idx + 1} (${node.level})`,
          subtitle: node.action,
          innerStepsHtml: DeductionBoardPrimitives.renderInnerStep({
            connector: '└──',
            label: `分治状态演进`,
            badgeHtml: `<span class="text-xs px-2 py-0.5 rounded bg-indigo-100 text-indigo-800 font-bold">${node.action}</span>`,
            detailLines: [
              `左半区分治: ${node.left}`,
              `右半区分治: ${node.right}`,
            ],
            fillLine: `阶段状态：${node.action}`,
          }),
        })
      )
      .join('');

    const loopSection = DeductionBoardPrimitives.renderLoopSection(
      roundsHtml,
      '分治树递归展开 · 双指针跨区有序归拢 · 稳定外排'
    );

    const finalReturn = DeductionBoardPrimitives.renderFinalReturn({
      returnCode: '[3, 9, 10, 27, 38, 43, 82]',
      answerDescription:
        '依据主定理 (Master Theorem)：T(N) = 2T(N/2) + O(N) = O(N log N)。即使在最坏情形下时间复杂度依然严格稳定在 O(N log N)，是外部排序与大规模数据处理的首选基石。',
      complexityStr: '时间复杂度: O(N log N) (最好/最坏恒定) | 空间复杂度: O(N)',
    });

    return DeductionBoardPrimitives.wrapBoard(`
      ${header}
      ${baseCases}
      ${loopSection}
      ${finalReturn}
    `);
  }
}
