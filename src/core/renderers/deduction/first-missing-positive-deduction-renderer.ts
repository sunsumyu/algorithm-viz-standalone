/**
 * 缺失的第一个正数 (First Missing Positive · LeetCode 41)
 * 全景推演树渲染策略 (FirstMissingPositiveDeductionRenderer)
 * 遵循 Matt Pocock 深模块设计模式与 IDeductionTreeRenderer 统一顶层抽象
 */

import { IDeductionTreeRenderer, StaticDeductionRenderOptions } from './types';
import { DeductionBoardPrimitives } from './deduction-board-primitives';

export class FirstMissingPositiveDeductionRenderer implements IDeductionTreeRenderer {
  public readonly id = 'first-missing-positive';

  public canHandle(modelId: string): boolean {
    return (
      modelId === 'first-missing-positive' ||
      modelId === '41' ||
      modelId === 'leetcode-41' ||
      modelId === 'first-missing-positive-in-place-hash'
    );
  }

  public render(_options: StaticDeductionRenderOptions): string {
    const header = DeductionBoardPrimitives.renderHeader({
      title: '力扣 41. 缺失的第一个正数 (First Missing Positive) · 全景推演树',
      badge: '鸽巢原理奠基 · 原地置换哈希桶排序 · 空间常数级 O(1) · 严格 O(N)',
      descriptionHtml: `
        核心目标：给你一个未排序的整数数组 <code>nums</code>，请你找出其中没有出现的最小的正整数。请你实现时间复杂度为 $O(N)$ 并且只使用常数级别额外空间 $O(1)$ 的解决方案。<br/>
        <strong>鸽巢原理与原地置换哈希桶排序核心教研范式：</strong><br/>
        1. <strong>鸽巢原理边界公理（Pigeonhole Principle Boundary）</strong>：<br/>
        对于长度为 $N$ 的数组，缺失的最小正整数<strong>必然落在闭区间 $[1, N + 1]$ 内</strong>！<br/>
        • 若 $1 \sim N$ 全员齐聚，答案必为 $N + 1$；<br/>
        • 否则答案必在 $1 \sim N$ 之间，即第一个不在对应位置上的数字！<br/>
        2. <strong>物理槽位物归原主规则（In-Place Hash Bucket Mapping）</strong>：<br/>
        将数组本身视为一个哈希表。对于数值 $x$（满足 $1 \le x \le N$），其唯一定居目标槽位是下标 <code>x - 1</code>（即满足 <code>nums[x - 1] == x</code>）；<br/>
        3. <strong>循环置换对调（Cycle Swap）</strong>：<br/>
        遍历每个槽位 <code>i</code>：若 <code>nums[i] > 0 && nums[i] <= N && nums[nums[i] - 1] != nums[i]</code>，将 <code>nums[i]</code> 与 <code>nums[nums[i] - 1]</code> 进行交换，送其归位。重复此过程直到当前位置不能再置换；<br/>
        4. <strong>终极扫描断言</strong>：置换完毕后，从左到右巡检首个满足 <code>nums[i] != i + 1</code> 的槽位，对应答案即为 <code>i + 1</code>。
      `,
      initialStateText: `置换入口：firstMissingPositive(nums) ➔ 遍历 i 从 0 到 N-1，原地 swap 送正整数归位。`,
    });

    const baseCase = DeductionBoardPrimitives.renderBaseCases([
      {
        prefix: '├───',
        label: '空数组特判 (Empty Guard)',
        valuesStr: 'nums == null || nums.length == 0 ➔ 缺失的最小正整数天然为 1',
      },
      {
        prefix: '└───',
        label: '全员归位满贯兜底 (Full Alignment)',
        valuesStr: '若 0 到 N-1 槽位全满足 nums[i] == i + 1 ➔ 缺失的最小正整数为 N + 1',
      },
    ]);

    const step1 = DeductionBoardPrimitives.renderInnerStep({
      connector: '├───',
      label: '阶段 1: 扫描槽位并循环置换合法正数归位 (In-Place Cycle Swapping)',
      badgeHtml: '<span class="px-1.5 py-0.5 rounded bg-blue-100 text-blue-800 font-mono text-[9px]">while Swap</span>',
      detailLines: [
        'for (int i = 0; i < n; i++) {',
        '  while (nums[i] > 0 && nums[i] <= n && nums[nums[i] - 1] != nums[i]) {',
        '    swap(nums, i, nums[i] - 1); // 将数值 x 送至目标槽位 x - 1',
        '  }',
        '}',
      ],
      fillLine: '物归原主：各得其所，将散落的正数置换至其天然下标槽位，不合法数原地被动容纳',
    });

    const step2 = DeductionBoardPrimitives.renderInnerStep({
      connector: '├───',
      label: '阶段 2: 线性巡检搜寻首个缺位槽位 (Inspect First Mismatched Slot)',
      badgeHtml: '<span class="px-1.5 py-0.5 rounded bg-amber-100 text-amber-800 font-mono text-[9px]">Probe i+1</span>',
      detailLines: [
        'for (int i = 0; i < n; i++) {',
        '  if (nums[i] != i + 1) {',
        '    return i + 1; // 捕获！该槽位期待 i+1 却缺失',
        '  }',
        '}',
      ],
      fillLine: '明察秋毫：第一个与槽位序号不匹配的索引 i，其期望填入的 i + 1 即为全场缺失最小正数',
    });

    const step3 = DeductionBoardPrimitives.renderInnerStep({
      connector: '└───',
      label: '阶段 3: 全员对齐满额交还 N + 1 (Full Range Fallback)',
      badgeHtml: '<span class="px-1.5 py-0.5 rounded bg-emerald-100 text-emerald-800 font-mono text-[9px]">return n + 1</span>',
      detailLines: [
        'return n + 1;',
      ],
      fillLine: '功德圆满：1 到 N 全员齐聚一堂无一遗漏，最小缺失正整数顺延为 n + 1',
    });

    const round = DeductionBoardPrimitives.renderOuterRound({
      title: '缺失正数原地哈希推演流 (In-Place Cycle Swap ➔ Inspect Mismatch ➔ Return Answer)',
      subtitle: 'LeetCode 41 First Missing Positive Masterclass',
      innerStepsHtml: step1 + step2 + step3,
    });

    const finalReturn = DeductionBoardPrimitives.renderFinalReturn({
      resultStr: '缺失的最小正整数 1 ~ N+1',
      complexityStr: '时间复杂度: O(N) 每个数最多参与一次成功归位交换 · 空间复杂度: O(1) 原地哈希零额外空间',
    });

    return header + baseCase + round + finalReturn;
  }
}
