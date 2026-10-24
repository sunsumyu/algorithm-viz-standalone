/**
 * 四数之和 (4Sum · LeetCode 18)
 * 全景推演树渲染策略 (FourSumDeductionRenderer)
 * 遵循 Matt Pocock 深模块设计模式与 IDeductionTreeRenderer 统一顶层抽象
 */

import { IDeductionTreeRenderer, StaticDeductionRenderOptions } from './types';
import { DeductionBoardPrimitives } from './deduction-board-primitives';

export class FourSumDeductionRenderer implements IDeductionTreeRenderer {
  public readonly id = 'four-sum';

  public canHandle(modelId: string): boolean {
    return (
      modelId === 'four-sum' ||
      modelId === '18' ||
      modelId === 'leetcode-18' ||
      modelId === 'four-sum-two-pointers'
    );
  }

  public render(_options: StaticDeductionRenderOptions): string {
    const header = DeductionBoardPrimitives.renderHeader({
      title: '力扣 18. 四数之和 (4Sum) · 全景推演树',
      badge: '双重外层循环固定 · 内层双指针夹逼 · 四级去重与 64 位溢出防护 · O(N³)',
      descriptionHtml: `
        核心目标：在数组中找出所有和为 <code>target</code> 且不重复的四元组 <code>[nums[i], nums[j], nums[left], nums[right]]</code>。<br/>
        <strong>《代码随想录》核心教研范式——两级基准降维 + 双指针夹逼与溢出防护：</strong><br/>
        1. <strong>64 位溢出防护（Long Overflow Protection）</strong>：<br/>
        当数组数值极端（如 $10^9$）时，四个整数直接相加会超出 32 位整型范围，必须强制转换为 <code>long</code> 计算和进行比较；<br/>
        2. <strong>第一级基准 i 去重与剪枝</strong>：<br/>
        • <strong>剪枝</strong>：当 <code>target >= 0 && nums[i] > target</code> 时，后续元素只会更大，可直接 <code>break</code>；<br/>
        • <strong>去重</strong>：若 <code>i > 0 && nums[i] == nums[i-1]</code>，说明该数作为四元组第一项已被穷尽，<code>continue</code> 跳过；<br/>
        3. <strong>第二级基准 j 去重与剪枝</strong>：<br/>
        • <strong>剪枝</strong>：当 <code>target >= 0 && nums[i] + nums[j] > target</code> 时，后续和只会更大，可 <code>break</code>；<br/>
        • <strong>去重</strong>：若 <code>j > i + 1 && nums[j] == nums[j-1]</code>，跳过第二项重复值；<br/>
        4. <strong>内层双指针左右夹逼与双向去重</strong>：<br/>
        设定 <code>left = j + 1, right = n - 1</code>。命中后对 <code>left</code> 和 <code>right</code> 进行循环去重后同时收缩。
      `,
      initialStateText: `求解入口：fourSum(nums, target) ➔ Arrays.sort(nums)，双层循环固定 (i, j)，内层双指针夹逼。`,
    });

    const baseCase = DeductionBoardPrimitives.renderBaseCases([
      {
        prefix: '├───',
        label: '数组尺寸特判 (Size Guard)',
        valuesStr: 'nums == null || nums.length < 4 ➔ 无法构成四元组，直接返回空列表 []',
      },
      {
        prefix: '└───',
        label: '极端整型溢出拦截 (Overflow Guard)',
        valuesStr: '使用 (long) 强制类型提升计算 sum，防止加法溢出产生错误符号反转',
      },
    ]);

    const step1 = DeductionBoardPrimitives.renderInnerStep({
      connector: '├───',
      label: '阶段 1: 第一级基准 i 固定与去重剪枝 (Anchor i & Deduplicate)',
      badgeHtml: '<span class="px-1.5 py-0.5 rounded bg-blue-100 text-blue-800 font-mono text-[9px]">Anchor i</span>',
      detailLines: [
        'for (int i = 0; i < nums.length - 3; i++) {',
        '  if (target >= 0 && nums[i] > target) break;',
        '  if (i > 0 && nums[i] == nums[i - 1]) continue; // 第一级去重',
      ],
      fillLine: '稳固首位：固定第一项基准，跳过重复前驱，奠定四元组第一个位置的唯一性',
    });

    const step2 = DeductionBoardPrimitives.renderInnerStep({
      connector: '├───',
      label: '阶段 2: 第二级基准 j 固定与两数去重 (Anchor j & Deduplicate)',
      badgeHtml: '<span class="px-1.5 py-0.5 rounded bg-indigo-100 text-indigo-800 font-mono text-[9px]">Anchor j</span>',
      detailLines: [
        '  for (int j = i + 1; j < nums.length - 2; j++) {',
        '    if (target >= 0 && nums[i] + nums[j] > target) break;',
        '    if (j > i + 1 && nums[j] == nums[j - 1]) continue; // 第二级去重',
        '    int left = j + 1, right = nums.length - 1;',
      ],
      fillLine: '降维三元：固定第二项基准，消除二重重复，将问题成功降维为关于 left 和 right 的经典双指针',
    });

    const step3 = DeductionBoardPrimitives.renderInnerStep({
      connector: '└───',
      label: '阶段 3: 内层双指针夹逼与双向循环去重 (Squeeze & Collect)',
      badgeHtml: '<span class="px-1.5 py-0.5 rounded bg-emerald-100 text-emerald-800 font-mono text-[9px]">Squeeze & Trim</span>',
      detailLines: [
        '    while (left < right) {',
        '      long sum = (long) nums[i] + nums[j] + nums[left] + nums[right];',
        '      if (sum > target) right--;',
        '      else if (sum < target) left++;',
        '      else {',
        '        res.add(Arrays.asList(nums[i], nums[j], nums[left], nums[right]));',
        '        while (left < right && nums[left] == nums[left + 1]) left++;',
        '        while (left < right && nums[right] == nums[right - 1]) right--;',
        '        left++; right--;',
        '      }',
        '    }',
      ],
      fillLine: '最终收割：指针跨越重复元素后同时向内收缩，确保当前基准下所有组合解均唯一且完整',
    });

    const round = DeductionBoardPrimitives.renderOuterRound({
      title: '四数之和多层降维推演流 (Anchor i ➔ Anchor j ➔ Two-Pointer Squeeze)',
      subtitle: 'LeetCode 18 4Sum Masterclass',
      innerStepsHtml: step1 + step2 + step3,
    });

    const finalReturn = DeductionBoardPrimitives.renderFinalReturn({
      resultStr: '所有不重复四元组列表 List<List<Integer>>',
      complexityStr: '时间复杂度: O(N³) 双重外层循环与内层双指针 · 空间复杂度: O(log N) 排序系统栈',
    });

    return header + baseCase + round + finalReturn;
  }
}
