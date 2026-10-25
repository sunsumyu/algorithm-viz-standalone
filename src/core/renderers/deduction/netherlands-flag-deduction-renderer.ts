/**
 * 荷兰国旗问题 全景推演树渲染策略 (NetherlandsFlagDeductionRenderer)
 * 纯静态无状态，展示小于区/等于区/大于区三向切分指针演化推导过程 (LeetCode 75)
 */

import { IDeductionTreeRenderer, StaticDeductionRenderOptions } from './types';
import { DeductionBoardPrimitives } from './deduction-board-primitives';

export class NetherlandsFlagDeductionRenderer implements IDeductionTreeRenderer {
  public readonly id = 'netherlands-flag-deduction';

  public canHandle(modelId: string): boolean {
    return (
      modelId === 'netherlands-flag-024' ||
      modelId === 'netherlands-flag' ||
      modelId === 'dutch-national-flag' ||
      modelId === 'sort-colors-75' ||
      modelId === 'sort-colors' ||
      modelId === '75' ||
      modelId === 'leetcode-75'
    );
  }

  public render(_options: StaticDeductionRenderOptions): string {
    const rawArr = [3, 5, 2, 6, 3, 1, 7, 3, 4];
    const target = 3;
    const n = rawArr.length;

    const header = DeductionBoardPrimitives.renderHeader({
      title: '荷兰国旗三向切分全景推演展板 (Netherlands Flag 3-Way Partition)',
      badge: 'O(N) 线性单趟 · O(1) 原地空间 · 经典颜色分类 (LC 75)',
      descriptionHtml:
        '由 Dijkstra 提出的三向切分算法：给定基准值 <code>target</code>，在仅扫描一趟（单次循环）且不使用额外空间的前提下，将数组原地重排为小于区 <code>[&lt; target]</code>、等于区 <code>[== target]</code> 与大于区 <code>[&gt; target]</code> 三大连续块。',
      initialStateText: `输入数组 A = [${rawArr.join(', ')}], 划分基准 target = ${target}`,
    });

    const baseCases = DeductionBoardPrimitives.renderBaseCases([
      { prefix: '├───', label: '边界指针初始化', valuesStr: 'less = -1 (小于区右界), more = N (大于区左界), i = 0 (当前探针)' },
      { prefix: '├───', label: '终止判定', valuesStr: '循环在探针 i 与大于区左界相遇时立即终止：while (i < more)' },
      { prefix: '└───', label: '三大推演动作', valuesStr: '1. A[i] < target: swap(++less, i++); 2. A[i] == target: i++; 3. A[i] > target: swap(--more, i)' },
    ]);

    const steps = [
      {
        step: '探针 i = 0',
        val: 3,
        cond: 'A[0] == target(3)',
        action: '无需交换，元素自然属于等于区，探针 i++ 前进至 1',
        snapshot: 'less = -1, more = 9, i = 1 | 数组: [3, 5, 2, 6, 3, 1, 7, 3, 4]',
      },
      {
        step: '探针 i = 1',
        val: 5,
        cond: 'A[1] > target(3)',
        action: '大于基准，swap(--more, i) 与末位 A[8]=4 交换，more 缩至 8。换上来的 4 尚未检验，i 仍保持 1！',
        snapshot: 'less = -1, more = 8, i = 1 | 数组: [3, 4, 2, 6, 3, 1, 7, 3, 5]',
      },
      {
        step: '探针 i = 1 (重检换入值)',
        val: 4,
        cond: 'A[1] > target(3)',
        action: '换上来的 4 仍大于 3，再次 swap(--more, i) 与 A[7]=3 交换，more 缩至 7，i 保持 1！',
        snapshot: 'less = -1, more = 7, i = 1 | 数组: [3, 3, 2, 6, 3, 1, 7, 4, 5]',
      },
      {
        step: '探针 i = 1 (再检换入值)',
        val: 3,
        cond: 'A[1] == target(3)',
        action: '等于基准，归入等于区，探针 i++ 前进至 2',
        snapshot: 'less = -1, more = 7, i = 2 | 数组: [3, 3, 2, 6, 3, 1, 7, 4, 5]',
      },
      {
        step: '探针 i = 2',
        val: 2,
        cond: 'A[2] < target(3)',
        action: '小于基准，swap(++less, i++) 与小于区下一位 A[0]=3 交换，less 扩展至 0，i 前进至 3',
        snapshot: 'less = 0, more = 7, i = 3 | 数组: [2, 3, 3, 6, 3, 1, 7, 4, 5]',
      },
      {
        step: '后续扫描快照',
        val: 1,
        cond: '连续处理 6, 3, 1, 7',
        action: '6 与 7 甩入大于区，1 换入小于区，等于区继续扩容收纳 3',
        snapshot: '最终状态: less = 1, more = 5, i = 5 (i == more 终止)',
      },
    ];

    const roundsHtml = steps
      .map(s =>
        DeductionBoardPrimitives.renderOuterRound({
          title: `${s.step} (数值 ${s.val})`,
          subtitle: s.cond,
          innerStepsHtml: DeductionBoardPrimitives.renderInnerStep({
            connector: '└──',
            label: s.action,
            badgeHtml: `<span class="text-xs px-2 py-0.5 rounded bg-amber-100 text-amber-800 font-mono">${s.cond}</span>`,
            detailLines: [
              `条件分支判断: ${s.cond}`,
              `执行指针重整: ${s.action}`,
            ],
            fillLine: `分区状态快照: ${s.snapshot}`,
          }),
        })
      )
      .join('');

    const loopSection = DeductionBoardPrimitives.renderLoopSection(
      roundsHtml,
      '双边界对向逼近 · 三向原地腾挪 · 单趟全排列就位'
    );

    const finalReturn = DeductionBoardPrimitives.renderFinalReturn({
      returnCode: '小于区 [2, 1] | 等于区 [3, 3, 3] | 大于区 [7, 6, 4, 5]',
      answerDescription:
        '单次扫描以严格 O(N) 时间和 O(1) 原地空间完成划分。如果输入是仅包含 0、1、2 的颜色分类数组 (LeetCode 75)，以 1 为基准划分即可在单趟内实现整体排序。',
      complexityStr: '时间复杂度: O(N) | 空间复杂度: O(1)',
    });

    return DeductionBoardPrimitives.wrapBoard(`
      ${header}
      ${baseCases}
      ${loopSection}
      ${finalReturn}
    `);
  }
}
