/**
 * 两数之和 (Two Sum · LeetCode 1)
 * 全景推演树渲染策略 (TwoSumDeductionRenderer)
 * 遵循 Matt Pocock 深模块设计模式与 IDeductionTreeRenderer 统一顶层抽象
 */

import { IDeductionTreeRenderer, StaticDeductionRenderOptions } from './types';
import { DeductionBoardPrimitives } from './deduction-board-primitives';

export class TwoSumDeductionRenderer implements IDeductionTreeRenderer {
  public readonly id = 'two-sum';

  public canHandle(modelId: string): boolean {
    return (
      modelId === 'two-sum' ||
      modelId === '1' ||
      modelId === 'leetcode-1' ||
      modelId === 'two-sum-hash'
    );
  }

  public render(_options: StaticDeductionRenderOptions): string {
    const header = DeductionBoardPrimitives.renderHeader({
      title: '力扣 1. 两数之和 (Two Sum) · 全景推演树',
      badge: '空间换时间公理 · 哈希表 O(1) 补数反查 · 一次遍历即时落盘 · 严格 O(N)',
      descriptionHtml: `
        核心目标：在无序数组中找到和为目标值 <code>target</code> 的两个不同元素下标 <code>[i, j]</code>。<br/>
        <strong>《代码随想录》核心教研范式——“补数登记与即时相认”公理：</strong><br/>
        1. <strong>补数反求（Complement Seeking）</strong>：<br/>
        遍历到当前元素 <code>nums[i]</code> 时，求取所需补数 <code>complement = target - nums[i]</code>。<br/>
        • <strong>立即查找</strong>：如果哈希表中已存在 <code>complement</code>，说明前半段已经出现过配对伴侣！两数瞬间相认，直接返回 <code>[map.get(complement), i]</code>；<br/>
        2. <strong>未雨绸缪落盘登记（Record for the Future）</strong>：<br/>
        若哈希表中尚未出现补数，绝不回头重新循环，而是将当前数值与下标作为信物压入哈希表 <code>map.put(nums[i], i)</code>，静候后续元素来认领；<br/>
        3. <strong>时空复杂度降维打击</strong>：<br/>
        通过哈希表的 $O(1)$ 快速索引，将双层嵌套暴力循环的 $O(N^2)$ 降维至严格 $O(N)$ 一次单向遍历。
      `,
      initialStateText: `检索入口：twoSum(nums, target) ➔ 初始化 Map<Integer, Integer> map = new HashMap<>()。`,
    });

    const baseCase = DeductionBoardPrimitives.renderBaseCases([
      {
        prefix: '├───',
        label: '数组尺寸特判 (Size Guard)',
        valuesStr: 'nums == null || nums.length < 2 ➔ 无法构成数对，直接返回空数组 []',
      },
      {
        prefix: '└───',
        label: '穷尽无解兜底 (Fallback Return)',
        valuesStr: '单趟遍历完毕仍未碰撞成功 ➔ 返回空数组 [] (或抛出 IllegalArgumentException)',
      },
    ]);

    const step1 = DeductionBoardPrimitives.renderInnerStep({
      connector: '├───',
      label: '阶段 1: 扫描当前元素并计算期待补数 (Compute Complement)',
      badgeHtml: '<span class="px-1.5 py-0.5 rounded bg-blue-100 text-blue-800 font-mono text-[9px]">Complement</span>',
      detailLines: [
        'for (int i = 0; i < nums.length; i++) {',
        '  int complement = target - nums[i];',
      ],
      fillLine: '精准算差：当前数为 nums[i]，其唯一合法伴侣的数值必须恰好等于 target - nums[i]',
    });

    const step2 = DeductionBoardPrimitives.renderInnerStep({
      connector: '├───',
      label: '阶段 2: 哈希瞬时反查与命中认领 (Instant Hash Probe)',
      badgeHtml: '<span class="px-1.5 py-0.5 rounded bg-emerald-100 text-emerald-800 font-mono text-[9px]">Match O(1)</span>',
      detailLines: [
        '  if (map.containsKey(complement)) {',
        '    return new int[] { map.get(complement), i }; // 命中！伴侣此前已先行登记',
        '  }',
      ],
      fillLine: '一触即发：哈希表中若有补数存在，即刻收割两者下标并光速返回结果',
    });

    const step3 = DeductionBoardPrimitives.renderInnerStep({
      connector: '└───',
      label: '阶段 3: 未中信物登记入表 (Record Pending Number)',
      badgeHtml: '<span class="px-1.5 py-0.5 rounded bg-amber-100 text-amber-800 font-mono text-[9px]">map.put()</span>',
      detailLines: [
        '  map.put(nums[i], i); // 留存印记，等待后续同伴召唤',
        '}',
      ],
      fillLine: '积少成多：将当前数值 nums[i] 映射到其下标 i 存入哈希字典，为后序元素铺路',
    });

    const round = DeductionBoardPrimitives.renderOuterRound({
      title: '两数之和哈希推演流 (Compute Complement ➔ Hash Probe ➔ Record Entry)',
      subtitle: 'LeetCode 1 Two Sum Masterclass',
      innerStepsHtml: step1 + step2 + step3,
    });

    const finalReturn = DeductionBoardPrimitives.renderFinalReturn({
      resultStr: '双元素下标数组 [index1, index2]',
      complexityStr: '时间复杂度: O(N) 单趟哈希检索 · 空间复杂度: O(N) 哈希表缓存开销',
    });

    return header + baseCase + round + finalReturn;
  }
}
