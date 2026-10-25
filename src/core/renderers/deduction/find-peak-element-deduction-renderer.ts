/**
 * 寻找峰值 (Find Peak Element · LeetCode 162)
 * 全景推演树渲染策略 (FindPeakElementDeductionRenderer)
 * 遵循 Matt Pocock 深模块设计模式与 IDeductionTreeRenderer 统一顶层抽象
 */

import { IDeductionTreeRenderer, StaticDeductionRenderOptions } from './types';
import { DeductionBoardPrimitives } from './deduction-board-primitives';

export class FindPeakElementDeductionRenderer implements IDeductionTreeRenderer {
  public readonly id = 'find-peak-element';

  public canHandle(modelId: string): boolean {
    return modelId === 'find-peak-element' || modelId === '162' || modelId === 'leetcode-162';
  }

  public render(_options: StaticDeductionRenderOptions): string {
    const header = DeductionBoardPrimitives.renderHeader({
      title: '力扣 162. 寻找峰值 (Find Peak Element) · 全景推演树',
      badge: '往高处走必有峰 · 左闭右开收缩 · 无需有序 · O(log N)',
      descriptionHtml: `
        核心目标：数组相邻元素互不相等，视 <code>nums[-1] = nums[n] = -∞</code>，返回任意一个峰值下标。<br/>
        <strong>上坡必达峰公理：</strong><br/>
        • 若 <code>nums[mid] &lt; nums[mid + 1]</code>：mid 处于上坡，沿右侧一直走，最坏走到 <code>n-1</code> 也因右邻为 -∞ 而成峰 ⇒ 峰值必在 <code>[mid + 1, right]</code>；<br/>
        • 否则 <code>nums[mid] &gt; nums[mid + 1]</code>：mid 处于下坡或就是峰 ⇒ 峰值必在 <code>[left, mid]</code>（mid 不能丢）。<br/>
        采用 <code>while (left &lt; right)</code>，收敛于 <code>left == right</code> 即峰值。
      `,
      initialStateText: `寻峰入口：findPeakElement(nums) ➔ left = 0, right = n - 1。`,
    });

    const baseCase = DeductionBoardPrimitives.renderBaseCases([
      {
        prefix: '├───',
        label: '单元素 (Single)',
        valuesStr: 'n == 1 ➔ 两侧均为 -∞，下标 0 即峰值',
      },
      {
        prefix: '└───',
        label: '收敛终止 (Converge)',
        valuesStr: 'left == right ➔ 区间仅剩一个候选，必为峰值，return left',
      },
    ]);

    const step1 = DeductionBoardPrimitives.renderInnerStep({
      connector: '├───',
      label: '阶段 1: 取中点并观察坡向 (Probe Slope)',
      badgeHtml: '<span class="px-1.5 py-0.5 rounded bg-blue-100 text-blue-800 font-mono text-[9px]">mid vs mid+1</span>',
      detailLines: [
        'while (left < right) {',
        '  int mid = left + ((right - left) >> 1);',
      ],
      fillLine: '局部导数：只需比较 mid 与右邻，就能判断当前处于上坡还是下坡',
    });

    const step2 = DeductionBoardPrimitives.renderInnerStep({
      connector: '├───',
      label: '阶段 2: 朝上坡方向收缩 (Climb Uphill)',
      badgeHtml: '<span class="px-1.5 py-0.5 rounded bg-amber-100 text-amber-800 font-mono text-[9px]">Uphill</span>',
      detailLines: [
        '  if (nums[mid] < nums[mid + 1]) left = mid + 1; // 上坡，峰在右',
        '  else right = mid;                              // 下坡，峰在左（含 mid）',
        '}',
      ],
      fillLine: '保留峰值：下坡分支 right = mid 而非 mid - 1，因为 mid 本身可能就是峰',
    });

    const step3 = DeductionBoardPrimitives.renderInnerStep({
      connector: '└───',
      label: '阶段 3: 收敛点即峰值 (Return Peak)',
      badgeHtml: '<span class="px-1.5 py-0.5 rounded bg-emerald-100 text-emerald-800 font-mono text-[9px]">left</span>',
      detailLines: ['return left;'],
      fillLine: '区间坍缩：left 与 right 重合处同时满足左右邻居都更小',
    });

    const round = DeductionBoardPrimitives.renderOuterRound({
      title: '寻峰推演流 (Probe Slope ➔ Climb Uphill ➔ Converge)',
      subtitle: 'LeetCode 162 Find Peak Element Masterclass',
      innerStepsHtml: step1 + step2 + step3,
    });

    const finalReturn = DeductionBoardPrimitives.renderFinalReturn({
      resultStr: '任意峰值下标 left',
      complexityStr: '时间复杂度: O(log N) · 空间复杂度: O(1)',
    });

    return header + baseCase + round + finalReturn;
  }
}
