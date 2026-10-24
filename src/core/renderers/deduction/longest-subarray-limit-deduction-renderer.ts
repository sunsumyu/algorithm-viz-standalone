/**
 * 绝对差不超过限制的最长连续子数组 (Longest Continuous Subarray With Absolute Diff Less Than or Equal to Limit · LeetCode 1438 / Class 054)
 * 全景推演树渲染策略 (LongestSubarrayLimitDeductionRenderer)
 * 遵循 Matt Pocock 深模块设计模式与 IDeductionTreeRenderer 统一顶层抽象
 */

import { IDeductionTreeRenderer, StaticDeductionRenderOptions } from './types';
import { DeductionBoardPrimitives } from './deduction-board-primitives';

export class LongestSubarrayLimitDeductionRenderer implements IDeductionTreeRenderer {
  public readonly id = 'longest-subarray-limit';

  public canHandle(modelId: string): boolean {
    return (
      modelId === 'longest-subarray-limit' ||
      modelId === 'longest-subarray-limit-054' ||
      modelId === '1438' ||
      modelId === 'leetcode-1438' ||
      modelId === 'longest-subarray-limit-1438' ||
      modelId === 'class054-code02' ||
      modelId === 'valid-subarray-limit-055'
    );
  }

  public render(_options: StaticDeductionRenderOptions): string {
    const header = DeductionBoardPrimitives.renderHeader({
      title: '力扣 1438. 绝对差不超过限制的最长连续子数组 · 全景推演树',
      badge: '双单调双端队列协同 & 左程云 Class 054 · maxQ(递减)+minQ(递增) / 动态瞬时极差维护 / 严格 O(N)',
      descriptionHtml: `
        核心目标：给你一个整数数组 <code>nums</code> 和一个表示限制的整数 <code>limit</code>，请返回最长连续子数组的长度，该子数组中的任意两元素之间的绝对差必须 <code>&le; limit</code>。<br/>
        <strong>左程云算法体系教学核心——双单调双端队列极差协同维护公理：</strong><br/>
        1. <strong>极差约束本质</strong>：<br/>
        区间 <code>[l..r]</code> 内任意两元素绝对差 $\le$ limit，等价于区间最大值与最小值的差值：<br/>
        <code>max(nums[l..r]) - min(nums[l..r]) &le; limit</code>。<br/>
        2. <strong>双单调队列极值镜像分工</strong>：<br/>
        • <strong>maxDeque（单调递减）</strong>：队头维护当前窗口最大值，入队时淘汰队尾较小劣质元素；<br/>
        • <strong>minDeque（单调递增）</strong>：队头维护当前窗口最小值，入队时淘汰队尾较大劣质元素；<br/>
        3. <strong>弹性双指针窗口推进与收缩</strong>：<br/>
        • <strong>扩展右边界</strong>：<code>r</code> 右移，将 <code>r</code> 分别纳入 <code>maxDeque</code> 与 <code>minDeque</code>；<br/>
        • <strong>收缩左边界</strong>：若 <code>nums[maxDeque.peekFirst()] - nums[minDeque.peekFirst()] &gt; limit</code>，窗口超限，<code>l++</code> 收缩；<br/>
        • <strong>过期剔除</strong>：若队首下标已经滑出左边界 <code>&lt; l</code>，分别从两队列头部弹出；<br/>
        • <strong>常数摊销</strong>：每个下标进出两队列至多各一次，总时间复杂度严格为 $O(N)$。
      `,
      initialStateText: `滑窗入口：longestSubarray(nums, limit) ➔ 初始化 maxDeque = [], minDeque = [], l = 0, r = 0。`,
    });

    const baseCase = DeductionBoardPrimitives.renderBaseCases([
      {
        prefix: '├───',
        label: '单元素边界退化 (Single Element Case)',
        valuesStr: 'nums.length <= 1 ➔ 极差恒为 0 <= limit，直接返回 nums.length',
      },
      {
        prefix: '└───',
        label: '终止判定条件 (Termination Condition)',
        valuesStr: '右指针 r 抵达数组末尾 n ➔ 窗口探索完毕，返回全局最大跨度 ans',
      },
    ]);

    const step1 = DeductionBoardPrimitives.renderInnerStep({
      connector: '├───',
      label: '阶段 1: 双单调队列同步吸纳与队尾淘汰 (Dual Tail Eviction & Push)',
      badgeHtml: '<span class="px-1.5 py-0.5 rounded bg-blue-100 text-blue-800 font-mono text-[9px]">Push r</span>',
      detailLines: [
        'while (!maxQ.isEmpty() && nums[r] >= nums[maxQ.peekLast()]) maxQ.pollLast();',
        'while (!minQ.isEmpty() && nums[r] <= nums[minQ.peekLast()]) minQ.pollLast();',
        'maxQ.offerLast(r); minQ.offerLast(r);',
      ],
      fillLine: '双雄并进：新元素同时入驻极大与极小队列，瞬时刷新两端极值',
    });

    const step2 = DeductionBoardPrimitives.renderInnerStep({
      connector: '├───',
      label: '阶段 2: 极差超限左边界收缩与队首过期 (Contract Window on Diff > Limit)',
      badgeHtml: '<span class="px-1.5 py-0.5 rounded bg-amber-100 text-amber-800 font-mono text-[9px]">Shrink l</span>',
      detailLines: [
        'while (nums[maxQ.peekFirst()] - nums[minQ.peekFirst()] > limit) {',
        '  if (maxQ.peekFirst() == l) maxQ.pollFirst();',
        '  if (minQ.peekFirst() == l) minQ.pollFirst();',
        '  l++; // 左边界被迫右移收缩',
        '}',
      ],
      fillLine: '适者生存：极差破表时收缩左指针，并逐出滑出窗口范围的过期队首',
    });

    const step3 = DeductionBoardPrimitives.renderInnerStep({
      connector: '└───',
      label: '阶段 3: 合法窗口跨度结算 (Update Max Window Length)',
      badgeHtml: '<span class="px-1.5 py-0.5 rounded bg-emerald-100 text-emerald-800 font-mono text-[9px]">ans = Math.max</span>',
      detailLines: [
        'ans = Math.max(ans, r - l + 1);',
        'return ans;',
      ],
      fillLine: '稳步递增：当前 [l..r] 必为合法子数组，记录历史最长合法跨度',
    });

    const round = DeductionBoardPrimitives.renderOuterRound({
      title: '双单调队列极差维护推演流 (Dual Queue Ingestion ➔ Diff Check & Shrink ➔ Ans Settle)',
      subtitle: 'LeetCode 1438 & Zuoshen Class 054 Monotonic Deque Masterclass',
      innerStepsHtml: step1 + step2 + step3,
    });

    const finalReturn = DeductionBoardPrimitives.renderFinalReturn({
      resultStr: '极差 <= limit 的最长子数组长度 ans',
      complexityStr: '时间复杂度: O(N) 线性双指针双队列摊销 · 空间复杂度: O(N) 队列存储',
    });

    return header + baseCase + round + finalReturn;
  }
}
