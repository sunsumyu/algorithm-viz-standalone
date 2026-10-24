/**
 * 移除元素 (Remove Element · LeetCode 27)
 * 全景推演树渲染策略 (RemoveElementDeductionRenderer)
 * 遵循 Matt Pocock 深模块设计模式与 IDeductionTreeRenderer 统一顶层抽象
 */

import { IDeductionTreeRenderer, StaticDeductionRenderOptions } from './types';
import { DeductionBoardPrimitives } from './deduction-board-primitives';

export class RemoveElementDeductionRenderer implements IDeductionTreeRenderer {
  public readonly id = 'remove-element';

  public canHandle(modelId: string): boolean {
    return (
      modelId === 'remove-element' ||
      modelId === '27' ||
      modelId === 'leetcode-27' ||
      modelId === 'remove-element-fast-slow'
    );
  }

  public render(_options: StaticDeductionRenderOptions): string {
    const header = DeductionBoardPrimitives.renderHeader({
      title: '力扣 27. 移除元素 (Remove Element) · 全景推演树',
      badge: '快慢双指针原地覆写 · 零额外辅助数组 · 严格单趟 O(N) 线性推演',
      descriptionHtml: `
        核心目标：给你一个数组 <code>nums</code> 和一个值 <code>val</code>，你需要<strong>原地</strong>移除所有数值等于 <code>val</code> 的元素，并返回移除后数组的新长度。<br/>
        <strong>《代码随想录》核心教研范式——快慢指针原地覆写公理：</strong><br/>
        1. <strong>快指针（Fast Pointer）——探路寻宝</strong>：<br/>
        快指针 <code>fast</code> 负责快速遍历原数组，寻找新数组中所需要保留的合法元素（即 <code>nums[fast] != val</code> 的元素）；<br/>
        2. <strong>慢指针（Slow Pointer）——守门落盘</strong>：<br/>
        慢指针 <code>slow</code> 锚定新数组的待写入槽位。只有快指针找到非 <code>val</code> 元素时，才覆写到 <code>nums[slow]</code> 并自增 <code>slow++</code>；<br/>
        3. <strong>空间压缩公理</strong>：<br/>
        当 <code>nums[fast] == val</code> 时，慢指针原地驻留，快指针单步跳过，从而以 $O(1)$ 额外空间彻底取代 $O(N^2)$ 的数组整体平移。
      `,
      initialStateText: `覆写入口：removeElement(nums, val) ➔ 初始化 int slow = 0, fast = 0。`,
    });

    const baseCase = DeductionBoardPrimitives.renderBaseCases([
      {
        prefix: '├───',
        label: '空数组特判 (Empty Guard)',
        valuesStr: 'nums == null || nums.length == 0 ➔ 数组无元素，直接返回 0',
      },
      {
        prefix: '└───',
        label: '有效前缀保真 (Prefix Integrity)',
        valuesStr: '算法结束时区间 [0, slow - 1] 保证包含所有不等于 val 的保留元素',
      },
    ]);

    const step1 = DeductionBoardPrimitives.renderInnerStep({
      connector: '├───',
      label: '阶段 1: 快指针高速巡检当前元素 (Fast Probe)',
      badgeHtml: '<span class="px-1.5 py-0.5 rounded bg-blue-100 text-blue-800 font-mono text-[9px]">fast Loop</span>',
      detailLines: [
        'for (int fast = 0; fast < nums.length; fast++) {',
        '  if (nums[fast] != val) { // 发现需要保留的有效元素',
      ],
      fillLine: '寻真甄别：快指针逐位扫描，一旦发现不等于 val 的有效元素，立即唤醒慢指针覆写',
    });

    const step2 = DeductionBoardPrimitives.renderInnerStep({
      connector: '├───',
      label: '阶段 2: 慢指针槽位原地覆写并前移 (In-Place Overwrite)',
      badgeHtml: '<span class="px-1.5 py-0.5 rounded bg-emerald-100 text-emerald-800 font-mono text-[9px]">slow++</span>',
      detailLines: [
        '    nums[slow] = nums[fast]; // 原地覆写到新数组位置',
        '    slow++; // 慢指针推进一位',
        '  }',
        '}',
      ],
      fillLine: '移花接木：将合法值复制到 slow 处，自动吞噬历史冗余垃圾值，新数组边界扩展',
    });

    const step3 = DeductionBoardPrimitives.renderInnerStep({
      connector: '└───',
      label: '阶段 3: 返回新数组有效逻辑长度 (Return Valid Length)',
      badgeHtml: '<span class="px-1.5 py-0.5 rounded bg-purple-100 text-purple-800 font-mono text-[9px]">return slow</span>',
      detailLines: [
        'return slow; // slow 的值即为新数组长度',
      ],
      fillLine: '尘埃落定：slow 恰好停留在最后一个有效元素之后，其标量数值等于有效长度',
    });

    const round = DeductionBoardPrimitives.renderOuterRound({
      title: '移除元素快慢双指针推演流 (Fast Probe ➔ Overwrite at slow ➔ Return slow)',
      subtitle: 'LeetCode 27 Remove Element Masterclass',
      innerStepsHtml: step1 + step2 + step3,
    });

    const finalReturn = DeductionBoardPrimitives.renderFinalReturn({
      resultStr: '新数组有效长度 slow',
      complexityStr: '时间复杂度: O(N) 快指针单趟遍历 · 空间复杂度: O(1) 原地覆写零额外开销',
    });

    return header + baseCase + round + finalReturn;
  }
}
