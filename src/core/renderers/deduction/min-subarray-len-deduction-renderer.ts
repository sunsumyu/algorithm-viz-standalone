/**
 * 长度最小的子数组 (Minimum Size Subarray Sum · LeetCode 209)
 * 全景推演树渲染策略 (MinSubarrayLenDeductionRenderer)
 * 遵循 Matt Pocock 深模块设计模式与 IDeductionTreeRenderer 统一顶层抽象
 */

import { IDeductionTreeRenderer, StaticDeductionRenderOptions } from './types';
import { DeductionBoardPrimitives } from './deduction-board-primitives';

export class MinSubarrayLenDeductionRenderer implements IDeductionTreeRenderer {
  public readonly id = 'min-subarray-len';

  public canHandle(modelId: string): boolean {
    return (
      modelId === 'min-subarray-len' ||
      modelId === '209' ||
      modelId === 'leetcode-209' ||
      modelId === 'minimum-size-subarray-sum'
    );
  }

  public render(_options: StaticDeductionRenderOptions): string {
    const header = DeductionBoardPrimitives.renderHeader({
      title: '力扣 209. 长度最小的子数组 (Minimum Size Subarray Sum) · 全景推演树',
      badge: '经典滑动窗口动态伸缩 · 右界扩张加累积 · 左界追逐破下限 · 严格 O(N)',
      descriptionHtml: `
        核心目标：给定一个含有 <code>n</code> 个正整数的数组和一个正整数 <code>target</code>，找出该数组中满足其总和大于等于 <code>target</code> 的长度最小的连续子数组，并返回其长度。若不存在返回 0。<br/>
        <strong>《代码随想录》核心教研范式——滑动窗口右扩左缩单调收敛机制：</strong><br/>
        1. <strong>右界扩张（Expand Right）</strong>：<br/>
        右指针 <code>right</code> 负责主导窗口向右扩张，不断吃进新数字并累加到窗口总和 <code>sum += nums[right]</code>；<br/>
        2. <strong>左界动态追逐收缩（Contract Left While sum >= target）</strong>：<br/>
        当 <code>sum >= target</code> 满足条件时，说明当前窗口 <code>[left, right]</code> 已经构成可行解！<br/>
        • <strong>记录极值</strong>：<code>minLen = Math.min(minLen, right - left + 1)</code>；<br/>
        • <strong>左界吐出</strong>：从左端移出元素 <code>sum -= nums[left++]</code>，以探测更短的合法窗口可行性；<br/>
        3. <strong>严密单调性与 O(N) 证明</strong>：<br/>
        由于所有元素均为正数，窗口和具有严格的单调增减性。每个元素最多进窗口 1 次、出窗口 1 次，总指针位移至多 $2N$ 次，时间复杂度严格收敛为 $O(N)$。
      `,
      initialStateText: `滑动入口：minSubArrayLen(target, nums) ➔ 初始化 int left = 0, sum = 0, minLen = Integer.MAX_VALUE。`,
    });

    const baseCase = DeductionBoardPrimitives.renderBaseCases([
      {
        prefix: '├───',
        label: '空数组特判 (Empty Guard)',
        valuesStr: 'nums == null || nums.length == 0 ➔ 数组无元素，直接返回 0',
      },
      {
        prefix: '└───',
        label: '全量和不足兜底 (Sum Shortage)',
        valuesStr: '若扫描完毕 minLen 仍为初始 MAX_VALUE ➔ 说明全数组和亦无法满足 target，返回 0',
      },
    ]);

    const step1 = DeductionBoardPrimitives.renderInnerStep({
      connector: '├───',
      label: '阶段 1: 右指针向前推进窗口纳新 (Expand Window Right)',
      badgeHtml: '<span class="px-1.5 py-0.5 rounded bg-blue-100 text-blue-800 font-mono text-[9px]">right++</span>',
      detailLines: [
        'for (int right = 0; right < nums.length; right++) {',
        '  sum += nums[right]; // 窗口纳新',
      ],
      fillLine: '向右开拓：不断吸收新元素，推动窗口总和向目标阈值 target 逼近',
    });

    const step2 = DeductionBoardPrimitives.renderInnerStep({
      connector: '├───',
      label: '阶段 2: 阈值达标即时收缩并刷新最短长度 (Contract While Satisfied)',
      badgeHtml: '<span class="px-1.5 py-0.5 rounded bg-amber-100 text-amber-800 font-mono text-[9px]">while sum >= target</span>',
      detailLines: [
        '  while (sum >= target) {',
        '    minLen = Math.min(minLen, right - left + 1); // 记录更短长度',
        '    sum -= nums[left++]; // 左边界吐出元素，探索极致',
        '  }',
        '}',
      ],
      fillLine: '精益求精：达标后持续从左侧剔除冗余前缀，直到 sum 跌破 target，锁定当前最小窗口',
    });

    const step3 = DeductionBoardPrimitives.renderInnerStep({
      connector: '└───',
      label: '阶段 3: 交付最小子数组长度 (Deliver Minimum Length)',
      badgeHtml: '<span class="px-1.5 py-0.5 rounded bg-emerald-100 text-emerald-800 font-mono text-[9px]">return minLen</span>',
      detailLines: [
        'return minLen == Integer.MAX_VALUE ? 0 : minLen;',
      ],
      fillLine: '圆满结算：若成功更新则交付实际极小值，否则安全交还 0 表示无解',
    });

    const round = DeductionBoardPrimitives.renderOuterRound({
      title: '滑动窗口极小长度推演流 (Expand Right ➔ Contract Left While sum >= target ➔ Settle minLen)',
      subtitle: 'LeetCode 209 Minimum Size Subarray Sum Masterclass',
      innerStepsHtml: step1 + step2 + step3,
    });

    const finalReturn = DeductionBoardPrimitives.renderFinalReturn({
      resultStr: '最小子数组长度 minLen',
      complexityStr: '时间复杂度: O(N) 每个元素至多入窗与出窗各一次 · 空间复杂度: O(1) 仅用双指针',
    });

    return header + baseCase + round + finalReturn;
  }
}
