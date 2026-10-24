/**
 * 三数之和 (3Sum · LeetCode 15)
 * 全景推演树渲染策略 (ThreeSumDeductionRenderer)
 * 遵循 Matt Pocock 深模块设计模式与 IDeductionTreeRenderer 统一顶层抽象
 */

import { IDeductionTreeRenderer, StaticDeductionRenderOptions } from './types';
import { DeductionBoardPrimitives } from './deduction-board-primitives';

export class ThreeSumDeductionRenderer implements IDeductionTreeRenderer {
  public readonly id = 'three-sum';

  public canHandle(modelId: string): boolean {
    return (
      modelId === 'three-sum' ||
      modelId === '15' ||
      modelId === 'leetcode-15' ||
      modelId === 'three-sum-two-pointers'
    );
  }

  public render(_options: StaticDeductionRenderOptions): string {
    const header = DeductionBoardPrimitives.renderHeader({
      title: '力扣 15. 三数之和 (3Sum) · 全景推演树',
      badge: '升序排序奠基 · 双指针左右夹逼 · 外层与双指针三向去重 · O(N²)',
      descriptionHtml: `
        核心目标：在包含可能重复元素的数组中，找出所有和为 0 且不重复的三元组 <code>[nums[i], nums[left], nums[right]]</code>。<br/>
        <strong>《代码随想录》核心教研范式——排序 + 双指针左右夹逼与双重剪枝去重：</strong><br/>
        1. <strong>升序排序（Pre-sorting）</strong>：<br/>
        先对数组执行升序排序 <code>Arrays.sort(nums)</code>。若首项 <code>nums[i] > 0</code>，因数组单调递增，后续三数和必大于 0，直接 <code>break</code> 终止；<br/>
        2. <strong>外层基准去重（Outer Deduplication）</strong>：<br/>
        固定第一个数 <code>nums[i]</code>。若 <code>i > 0 && nums[i] == nums[i-1]</code>，必须 <code>continue</code> 跳过！绝不能写成 <code>nums[i] == nums[i+1]</code>（否则会漏掉像 <code>[-1, -1, 2]</code> 这样的合法三元组）；<br/>
        3. <strong>双指针夹逼与双向循环去重（Two-Pointers Squeeze & Deduplication）</strong>：<br/>
        设定 <code>left = i + 1</code>, <code>right = n - 1</code>：<br/>
        • <code>sum > 0</code> ➔ 右指针左移 <code>right--</code>（缩和小数）；<br/>
        • <code>sum < 0</code> ➔ 左指针右移 <code>left++</code>（放大数值）；<br/>
        • <code>sum == 0</code> ➔ 命中三元组！收集结果后，必须双向跳过连续重复值：<br/>
        <code>while (left < right && nums[left] == nums[left+1]) left++;</code><br/>
        <code>while (left < right && nums[right] == nums[right-1]) right--;</code><br/>
        最后同步内缩 <code>left++, right--</code>。
      `,
      initialStateText: `求解入口：threeSum(nums) ➔ 先 Arrays.sort(nums)，再遍历 i 从 0 到 n-3 固定基准。`,
    });

    const baseCase = DeductionBoardPrimitives.renderBaseCases([
      {
        prefix: '├───',
        label: '数组尺寸特判 (Size Guard)',
        valuesStr: 'nums == null || nums.length < 3 ➔ 无法构成三元组，直接返回空列表 []',
      },
      {
        prefix: '└───',
        label: '基准正数提前剪枝 (Positive Pruning)',
        valuesStr: 'nums[i] > 0 ➔ 排序后后续元素均大于0，不可能相加为0，直接 break 退出主循环',
      },
    ]);

    const step1 = DeductionBoardPrimitives.renderInnerStep({
      connector: '├───',
      label: '阶段 1: 外层基准固定与历史去重 (Anchor i & Deduplicate)',
      badgeHtml: '<span class="px-1.5 py-0.5 rounded bg-blue-100 text-blue-800 font-mono text-[9px]">Anchor i</span>',
      detailLines: [
        'for (int i = 0; i < nums.length - 2; i++) {',
        '  if (nums[i] > 0) break;',
        '  if (i > 0 && nums[i] == nums[i - 1]) continue; // 关键去重：不与已结算的前驱重复',
        '  int left = i + 1, right = nums.length - 1;',
      ],
      fillLine: '定海神针：固定基准下标 i，跳过所有与历史前驱相同的重复值，确保三元组第一个元素唯一',
    });

    const step2 = DeductionBoardPrimitives.renderInnerStep({
      connector: '├───',
      label: '阶段 2: 双指针动态左右夹逼 (Two Pointers Dynamic Squeeze)',
      badgeHtml: '<span class="px-1.5 py-0.5 rounded bg-amber-100 text-amber-800 font-mono text-[9px]">Squeeze</span>',
      detailLines: [
        '  while (left < right) {',
        '    int sum = nums[i] + nums[left] + nums[right];',
        '    if (sum > 0) right--;',
        '    else if (sum < 0) left++;',
        '    else { // sum == 0 命中解！',
      ],
      fillLine: '双向逼近：借助单调递增性，大则缩右，小则增左，将 O(N²) 暴力二维内循环降为 O(N) 夹逼',
    });

    const step3 = DeductionBoardPrimitives.renderInnerStep({
      connector: '└───',
      label: '阶段 3: 收集三元组并双向彻底去重 (Collect & Skip Duplicates)',
      badgeHtml: '<span class="px-1.5 py-0.5 rounded bg-emerald-100 text-emerald-800 font-mono text-[9px]">Collect & Trim</span>',
      detailLines: [
        '      res.add(Arrays.asList(nums[i], nums[left], nums[right]));',
        '      while (left < right && nums[left] == nums[left + 1]) left++; // 去重左边连续值',
        '      while (left < right && nums[right] == nums[right - 1]) right--; // 去重右边连续值',
        '      left++; right--;',
        '    }',
        '  }',
      ],
      fillLine: '斩草除根：命中后必须将指针跨越所有连续重复值，再同时向内移动，彻底阻绝重复元组产生',
    });

    const round = DeductionBoardPrimitives.renderOuterRound({
      title: '三数之和双指针推演流 (Sort ➔ Anchor Deduplication ➔ Squeeze & Clean)',
      subtitle: 'LeetCode 15 3Sum Masterclass',
      innerStepsHtml: step1 + step2 + step3,
    });

    const finalReturn = DeductionBoardPrimitives.renderFinalReturn({
      resultStr: '所有不重复三元组列表 List<List<Integer>>',
      complexityStr: '时间复杂度: O(N²) 外层循环乘内层双指针夹逼 · 空间复杂度: O(log N) 排序系统栈',
    });

    return header + baseCase + round + finalReturn;
  }
}
