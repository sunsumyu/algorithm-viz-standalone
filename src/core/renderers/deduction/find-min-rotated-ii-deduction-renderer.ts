/**
 * 寻找旋转排序数组中的最小值 II (LeetCode 154)
 * 全景推演树渲染策略 (FindMinRotatedIIDeductionRenderer)
 * 遵循 Matt Pocock 深模块设计模式与 IDeductionTreeRenderer 统一顶层抽象
 */

import { IDeductionTreeRenderer, StaticDeductionRenderOptions } from './types';
import { DeductionBoardPrimitives } from './deduction-board-primitives';

export class FindMinRotatedIIDeductionRenderer implements IDeductionTreeRenderer {
  public readonly id = 'find-min-rotated-sorted-array-ii';

  public canHandle(modelId: string): boolean {
    return (
      modelId === 'find-min-rotated-sorted-array-ii' ||
      modelId === '154' ||
      modelId === 'leetcode-154'
    );
  }

  public render(_options: StaticDeductionRenderOptions): string {
    const header = DeductionBoardPrimitives.renderHeader({
      title: '力扣 154. 寻找旋转排序数组中的最小值 II · 全景推演树',
      badge: '与右端点比较 · 三分支决策 · 相等时 right-- 平缓降级 · 均摊 O(log N) / 最坏 O(N)',
      descriptionHtml: `
        核心目标：升序数组（<strong>可能含重复</strong>）被旋转若干次，求最小值。<br/>
        <strong>为何与 nums[right] 而非 nums[left] 比较：</strong>最小值是“右段”的起点，右端点永远属于右段，比较结果能无歧义地判定 mid 在哪一段。<br/>
        1. <code>nums[mid] &lt; nums[right]</code>：mid 在右段，最小值在 <code>[left, mid]</code> ⇒ <code>right = mid</code>；<br/>
        2. <code>nums[mid] &gt; nums[right]</code>：mid 在左段，最小值在 <code>[mid + 1, right]</code> ⇒ <code>left = mid + 1</code>；<br/>
        3. <code>nums[mid] == nums[right]</code>：<strong>无法判定</strong>（如 [3,3,1,3] 与 [3,1,3,3]）。但 right 有 mid 作“替身”，丢掉 right 不会丢失最小值 ⇒ <code>right--</code>。<br/>
        第 3 分支使最坏情况（全相等）退化为 O(N)。
      `,
      initialStateText: `求最小入口：findMin(nums) ➔ left = 0, right = n - 1。`,
    });

    const baseCase = DeductionBoardPrimitives.renderBaseCases([
      {
        prefix: '├───',
        label: '单元素 (Single)',
        valuesStr: 'n == 1 ➔ 直接 return nums[0]',
      },
      {
        prefix: '└───',
        label: '收敛终止 (Converge)',
        valuesStr: 'left == right ➔ return nums[left]',
      },
    ]);

    const step1 = DeductionBoardPrimitives.renderInnerStep({
      connector: '├───',
      label: '阶段 1: 中点与右端点比较 (Compare with Right)',
      badgeHtml: '<span class="px-1.5 py-0.5 rounded bg-blue-100 text-blue-800 font-mono text-[9px]">mid vs right</span>',
      detailLines: [
        'while (left < right) {',
        '  int mid = left + ((right - left) >> 1);',
      ],
      fillLine: '锚定右段：右端点必属于含最小值的右段，是唯一无歧义参照物',
    });

    const step2 = DeductionBoardPrimitives.renderInnerStep({
      connector: '├───',
      label: '阶段 2: 三分支决策收缩 (Three-Way Decision)',
      badgeHtml: '<span class="px-1.5 py-0.5 rounded bg-amber-100 text-amber-800 font-mono text-[9px]">3-Way</span>',
      detailLines: [
        '  if (nums[mid] < nums[right]) right = mid;',
        '  else if (nums[mid] > nums[right]) left = mid + 1;',
        '  else right--; // 相等：无法判定段归属，安全丢弃 right',
        '}',
      ],
      fillLine: '平缓降级：相等时只削掉一个元素，牺牲效率换取正确性',
    });

    const step3 = DeductionBoardPrimitives.renderInnerStep({
      connector: '└───',
      label: '阶段 3: 返回收敛点 (Return Minimum)',
      badgeHtml: '<span class="px-1.5 py-0.5 rounded bg-emerald-100 text-emerald-800 font-mono text-[9px]">nums[left]</span>',
      detailLines: ['return nums[left];'],
      fillLine: '区间坍缩：唯一剩余元素即旋转点处的最小值',
    });

    const round = DeductionBoardPrimitives.renderOuterRound({
      title: '旋转数组寻最小推演流 (Compare Right ➔ 3-Way Shrink ➔ Converge)',
      subtitle: 'LeetCode 154 Find Minimum in Rotated Sorted Array II Masterclass',
      innerStepsHtml: step1 + step2 + step3,
    });

    const finalReturn = DeductionBoardPrimitives.renderFinalReturn({
      resultStr: '最小值 nums[left]',
      complexityStr: '时间复杂度: 平均 O(log N)，全相等时最坏 O(N) · 空间复杂度: O(1)',
    });

    return header + baseCase + round + finalReturn;
  }
}
