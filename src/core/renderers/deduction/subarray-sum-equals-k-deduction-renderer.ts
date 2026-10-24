/**
 * 和为 K 的子数组 (Subarray Sum Equals K · LeetCode 560 / Class 049 Code 01)
 * 全景推演树渲染策略 (SubarraySumEqualsKDeductionRenderer)
 * 遵循 Matt Pocock 深模块设计模式与 IDeductionTreeRenderer 统一顶层抽象
 */

import { IDeductionTreeRenderer, StaticDeductionRenderOptions } from './types';
import { DeductionBoardPrimitives } from './deduction-board-primitives';

export class SubarraySumEqualsKDeductionRenderer implements IDeductionTreeRenderer {
  public readonly id = 'subarray-sum-equals-k';

  public canHandle(modelId: string): boolean {
    return (
      modelId === 'subarray-sum-equals-k' ||
      modelId === '560' ||
      modelId === 'leetcode-560' ||
      modelId === 'subarray-sum-equals-k-560' ||
      modelId === 'prefix-sum-basic-049' ||
      modelId === 'class049' ||
      modelId === 'class049-code01' ||
      modelId === 'prefix-sum-k'
    );
  }

  public render(_options: StaticDeductionRenderOptions): string {
    const header = DeductionBoardPrimitives.renderHeader({
      title: '力扣 560 / 体系课 049. 和为 K 的子数组 (Subarray Sum Equals K) · 全景推演树',
      badge: '前缀和代数移项公理 · 哈希频次表 O(1) 追溯 · 零前缀虚拟哨兵 · 严格 O(N)',
      descriptionHtml: `
        核心目标：统计连续子数组和等于 <code>k</code> 的总个数。<br/>
        <strong>左神体系班 049 / 《代码随想录》前缀和 + 哈希经典教学范式：</strong><br/>
        1. <strong>前缀和公式代数移项公理（Prefix-Sum Transposition Axiom）</strong>：<br/>
        连续子区间 <code>[j..i]</code> 的元素和等价于两个前缀和之差：<code>sum(j..i) = preSum[i] - preSum[j-1]</code>。<br/>
        要求 <code>preSum[i] - preSum[j-1] == k</code>，移项可得：<br/>
        <code>preSum[j-1] == preSum[i] - k</code>！<br/>
        这意味着：<strong>遍历到下标 <code>i</code> 时，只需寻找在 <code>i</code> 之前出现过多少次值为 <code>preSum - k</code> 的前缀和！</strong><br/>
        2. <strong>虚拟零前缀哨兵奠基（Virtual Zero-Prefix Sentinel）</strong>：<br/>
        算法初始化阶段，<strong>必须预置 <code>map.put(0, 1)</code></strong>！代表“一个数都不选的前缀和为 0”天然发生过 1 次。<br/>
        若当前 <code>preSum == k</code>，则 <code>preSum - k = 0</code>，刚好能命中这个初始哨兵，使得从下标 0 开始的合法前缀子数组能够被正确计入；<br/>
        3. <strong>先查后存，严格杜绝自我消耗</strong>：<br/>
        每一轮必须<strong>先在哈希表中累加查询命中频次</strong> <code>count += map.getOrDefault(preSum - k, 0)</code>，<br/>
        <strong>随后再将当前 <code>preSum</code> 登记入哈希表</strong> <code>map.put(preSum, map.getOrDefault(preSum, 0) + 1)</code>，防止空区间出现自我抵消错误。
      `,
      initialStateText: `检索入口：subarraySum(nums, k) ➔ map.put(0, 1)，int preSum = 0, count = 0。`,
    });

    const baseCase = DeductionBoardPrimitives.renderBaseCases([
      {
        prefix: '├───',
        label: '虚拟零前缀初始化 (Zero-Prefix Sentinel)',
        valuesStr: 'map.put(0, 1) ➔ 关键奠基：前缀和为 0 预置出现 1 次，用于收敛从下标 0 起点的全覆盖区间',
      },
      {
        prefix: '└───',
        label: '数组尺寸特判 (Size Guard)',
        valuesStr: 'nums == null || nums.length == 0 ➔ 直接 return 0',
      },
    ]);

    const step1 = DeductionBoardPrimitives.renderInnerStep({
      connector: '├───',
      label: '阶段 1: 累加当前前缀和与求解需求差值 (Accumulate PreSum & Target)',
      badgeHtml: '<span class="px-1.5 py-0.5 rounded bg-blue-100 text-blue-800 font-mono text-[9px]">preSum += x</span>',
      detailLines: [
        'for (int x : nums) {',
        '  preSum += x;',
        '  int targetPre = preSum - k;',
      ],
      fillLine: '精准算差：若此前存在前缀和为 targetPre，则从其下一位到当前位的子数组之和必为 k',
    });

    const step2 = DeductionBoardPrimitives.renderInnerStep({
      connector: '├───',
      label: '阶段 2: 哈希瞬时反查与累计有效频次 (Lookup & Accumulate Count)',
      badgeHtml: '<span class="px-1.5 py-0.5 rounded bg-emerald-100 text-emerald-800 font-mono text-[9px]">count += freq</span>',
      detailLines: [
        '  if (map.containsKey(targetPre)) {',
        '    count += map.get(targetPre); // 累加此前所有合法前驱起点的频次',
        '  }',
      ],
      fillLine: '一网打尽：哈希表中记录了历史上所有等于 preSum - k 的前缀位置总数，直接 O(1) 瞬时收割',
    });

    const step3 = DeductionBoardPrimitives.renderInnerStep({
      connector: '└───',
      label: '阶段 3: 将当前前缀和更新登记入哈希表 (Record Current PreSum)',
      badgeHtml: '<span class="px-1.5 py-0.5 rounded bg-amber-100 text-amber-800 font-mono text-[9px]">map.put()</span>',
      detailLines: [
        '  map.put(preSum, map.getOrDefault(preSum, 0) + 1);',
        '}',
      ],
      fillLine: '先查后存：当前前缀和落盘入表，作为未来更长子数组的潜在前驱提供服务',
    });

    const round = DeductionBoardPrimitives.renderOuterRound({
      title: '和为 K 的子数组推演流 (Zero Sentinel ➔ Transposition Probe ➔ Record Entry)',
      subtitle: 'LeetCode 560 & Class 049 Prefix Sum Masterclass',
      innerStepsHtml: step1 + step2 + step3,
    });

    const finalReturn = DeductionBoardPrimitives.renderFinalReturn({
      resultStr: '和为 k 的子数组总个数 count',
      complexityStr: '时间复杂度: O(N) 单趟线性扫描 · 空间复杂度: O(N) 前缀和哈希表开销',
    });

    return header + baseCase + round + finalReturn;
  }
}
