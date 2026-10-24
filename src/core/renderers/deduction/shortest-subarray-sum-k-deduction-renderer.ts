/**
 * 和至少为 K 的最短子数组 (Shortest Subarray with Sum at Least K · LeetCode 862 / Class 055)
 * 全景推演树渲染策略 (ShortestSubarraySumKDeductionRenderer)
 * 遵循 Matt Pocock 深模块设计模式与 IDeductionTreeRenderer 统一顶层抽象
 */

import { IDeductionTreeRenderer, StaticDeductionRenderOptions } from './types';
import { DeductionBoardPrimitives } from './deduction-board-primitives';

export class ShortestSubarraySumKDeductionRenderer implements IDeductionTreeRenderer {
  public readonly id = 'shortest-subarray-sum-k';

  public canHandle(modelId: string): boolean {
    return (
      modelId === 'shortest-subarray-sum-k' ||
      modelId === 'shortest-subarray-sum-k-055' ||
      modelId === '862' ||
      modelId === 'leetcode-862' ||
      modelId === 'shortest-subarray-862' ||
      modelId === 'class055-code01'
    );
  }

  public render(_options: StaticDeductionRenderOptions): string {
    const header = DeductionBoardPrimitives.renderHeader({
      title: '力扣 862. 和至少为 K 的最短子数组 · 全景推演树',
      badge: '大厂压轴 Hard 级神题 & 左程云 Class 055 · 克服负数非单调困境 / 前缀和 + 单调双端队列头尾双向弹出 / 严格 O(N)',
      descriptionHtml: `
        核心目标：给你一个整数数组 <code>nums</code> 和一个整数 <code>k</code> ，找出 <code>nums</code> 中和至少为 <code>k</code> 的<strong>最短非空子数组</strong>，并返回该子数组的长度。如果不存在，返回 <code>-1</code>。<br/>
        <strong>左程云算法体系教学核心——负数破坏滑窗单调性与单调队列双向弹出公理：</strong><br/>
        1. <strong>为什么普通双指针滑窗彻底失效？</strong><br/>
        数组中包含负数！右边界右移时累加和可能<strong>减小</strong>，左边界右移时区间和可能<strong>增大</strong>，贪心单调性完全瓦解！<br/>
        2. <strong>前缀和建模与极小化距离转化</strong>：<br/>
        • 构造前缀和 <code>sum[0..n]</code>，子数组 <code>(j, i]</code> 的和为 <code>sum[i] - sum[j]</code>；<br/>
        • 目标：寻找 <code>j &lt; i</code> 满足 <code>sum[i] - sum[j] &ge; k</code>，且极大化压缩跨度 <code>i - j</code>（求最小值）；<br/>
        3. <strong>单调双端队列头尾双向弹出神级法则</strong>：<br/>
        • <strong>法则 ①（队头达标永久结算 · pollFirst）</strong>：<br/>
          若 <code>sum[i] - sum[deque.peekFirst()] &ge; k</code>，当前跨度 <code>i - deque.peekFirst()</code> 达标！<br/>
          <strong>果断从队头永久弹出</strong>！因为未来的右边界 <code>i' &gt; i</code> 即使与它配对，距离 <code>i' - j</code> 也必然大于当前长度，绝不可能产生更短答案！<br/>
        • <strong>法则 ②（队尾劣质大值降维淘汰 · pollLast）</strong>：<br/>
          若 <code>sum[i] &le; sum[deque.peekLast()]</code>：当前 <code>i</code> 比队尾更靠右（离未来更近、距离更短），且数值更小（更容易满足减法差值 $\ge k$），队尾元素被全方位碾压淘汰！
      `,
      initialStateText: `入队入口：shortestSubarray(nums, k) ➔ 构建前缀和 sum，初始化单调双端队列 deque = []。`,
    });

    const baseCase = DeductionBoardPrimitives.renderBaseCases([
      {
        prefix: '├───',
        label: '前缀和数组初始化 (Prefix Sum 64-bit)',
        valuesStr: 'long[] sum = new long[n + 1]; sum[0] = 0; for (i=0..n-1) sum[i+1] = sum[i] + nums[i];',
      },
      {
        prefix: '└───',
        label: '终止判定条件 (Termination Condition)',
        valuesStr: '遍历 i == n 结束 ➔ 若 minLen == ∞ 返回 -1，否则返回 minLen',
      },
    ]);

    const step1 = DeductionBoardPrimitives.renderInnerStep({
      connector: '├───',
      label: '阶段 1: 队头达标永久结算出队 (Head Eviction & Settle minLen)',
      badgeHtml: '<span class="px-1.5 py-0.5 rounded bg-blue-100 text-blue-800 font-mono text-[9px]">pollFirst()</span>',
      detailLines: [
        'while (!deque.isEmpty() && sum[i] - sum[deque.peekFirst()] >= k) {',
        '  minLen = Math.min(minLen, i - deque.pollFirst()); // 永久记录并弹出',
        '}',
      ],
      fillLine: '立功即退：达标后立即出队，后续更远的右端点绝对不会制造更短的区间',
    });

    const step2 = DeductionBoardPrimitives.renderInnerStep({
      connector: '├───',
      label: '阶段 2: 队尾劣质大值降维淘汰 (Tail Eviction on sum[i] <= tail)',
      badgeHtml: '<span class="px-1.5 py-0.5 rounded bg-amber-100 text-amber-800 font-mono text-[9px]">pollLast()</span>',
      detailLines: [
        'while (!deque.isEmpty() && sum[i] <= sum[deque.peekLast()]) {',
        '  deque.pollLast(); // 弹出既远又大的无用队尾',
        '}',
        'deque.offerLast(i); // 维持前缀和单调严格递增',
      ],
      fillLine: '降维碾压：新前缀和更小且更靠后，未来必能比队尾劣质者给出更短更优解',
    });

    const step3 = DeductionBoardPrimitives.renderInnerStep({
      connector: '└───',
      label: '阶段 3: 全局最短长度交付 (Deliver Shortest Subarray Length)',
      badgeHtml: '<span class="px-1.5 py-0.5 rounded bg-emerald-100 text-emerald-800 font-mono text-[9px]">O(N) Total</span>',
      detailLines: [
        'return minLen == Integer.MAX_VALUE ? -1 : minLen;',
      ],
      fillLine: '破局收官：每个前缀和下标进出双端队列至多一次，严格 O(N) 线性时空',
    });

    const round = DeductionBoardPrimitives.renderOuterRound({
      title: '和至少为 K 最短子数组推演流 (Prefix Sum ➔ Head Optimal Eviction ➔ Tail Superiority Domination)',
      subtitle: 'LeetCode 862 & Zuoshen Class 055 Monotonic Deque Dual-Eviction Masterclass',
      innerStepsHtml: step1 + step2 + step3,
    });

    const finalReturn = DeductionBoardPrimitives.renderFinalReturn({
      resultStr: '最短子数组长度 minLen 或 -1',
      complexityStr: '时间复杂度: O(N) 单趟双端单调队列 · 空间复杂度: O(N) 前缀和与队列',
    });

    return header + baseCase + round + finalReturn;
  }
}
