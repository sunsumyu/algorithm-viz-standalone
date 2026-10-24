/**
 * 表现良好的最长时间段 (Longest Well-Performing Interval · LeetCode 1124 / Class 053)
 * 全景推演树渲染策略 (LongestWellPerformingIntervalDeductionRenderer)
 * 遵循 Matt Pocock 深模块设计模式与 IDeductionTreeRenderer 统一顶层抽象
 */

import { IDeductionTreeRenderer, StaticDeductionRenderOptions } from './types';
import { DeductionBoardPrimitives } from './deduction-board-primitives';

export class LongestWellPerformingIntervalDeductionRenderer implements IDeductionTreeRenderer {
  public readonly id = 'longest-well-performing-interval';

  public canHandle(modelId: string): boolean {
    return (
      modelId === 'longest-well-performing-interval' ||
      modelId === 'longest-well-performing-interval-053' ||
      modelId === '1124' ||
      modelId === 'leetcode-1124' ||
      modelId === '表现良好的最长时间段' ||
      modelId === 'class053-code05'
    );
  }

  public render(_options: StaticDeductionRenderOptions): string {
    const header = DeductionBoardPrimitives.renderHeader({
      title: '力扣 1124. 表现良好的最长时间段 · 全景推演树',
      badge: '左程云 Class 053 & LeetCode 1124 · +1/-1 差值前缀和归一化 / 单调递减栈维护最优左端点 / 倒序贪心消除 O(N)',
      descriptionHtml: `
        核心目标：给你一份工作时间表 <code>hours</code>，工作大于 8 小时为劳累天（得分 +1），否则为平淡天（得分 -1）。返回劳累天数严格大于不劳累天数的<strong>最长良好工作时间段</strong>的长度。<br/>
        <strong>左程云算法体系教学核心——差值归一化与单调栈双向倒序贪心公理：</strong><br/>
        1. <strong>+1 / -1 差值前缀和归一化</strong>：<br/>
        • 劳累日记为 <code>+1</code>，非劳累日记为 <code>-1</code>；<br/>
        • 构造前缀和数组 <code>s[0..n]</code>，其中 <code>s[0] = 0</code>；<br/>
        • 区间 <code>[j, i - 1]</code> 是良好时间段的充要条件为：<strong><code>s[i] - s[j] &gt; 0 ⟹ s[j] &lt; s[i]</code></strong>，且目标是极大化跨度 <code>i - j</code>！<br/>
        2. <strong>单调递减栈维护最优候选左端点 j</strong>：<br/>
        • 从 <code>0</code> 到 <code>n</code> 扫描前缀和，只有当 <code>s[k] &lt; s[stack.top()]</code> 时才压入栈中；<br/>
        • <strong>贪心支配性</strong>：若后面的位置前缀和更大，下标既靠后数值又大，在作为左端点时被前面的元素完全<strong>劣势淘汰</strong>！<br/>
        3. <strong>右端点 i 从后往前逆向贪心消除</strong>：<br/>
        • 让右端点 <code>i</code> 从 <code>n</code> 倒序向前扫描；<br/>
        • <code>while (!stack.isEmpty() && s[i] &gt; s[stack.peek()])</code>：<br/>
          弹出 <code>j = stack.pop()</code>，更新 <code>maxLen = Math.max(maxLen, i - j)</code>！<br/>
        • <strong>为什么弹出 j 后无需放回？</strong> 因为当前 <code>i</code> 是倒序扫描的最大右端点，对于更靠前的 <code>i' &lt; i</code>，即使满足条件，跨度 <code>i' - j</code> 也绝不可能超过 <code>i - j</code>！
      `,
      initialStateText: `建模入口：longestWPI(hours) ➔ 转化 +1/-1 前缀和，构建单调递减栈。`,
    });

    const baseCase = DeductionBoardPrimitives.renderBaseCases([
      {
        prefix: '├───',
        label: '前缀和归一化构建 (Prefix +1/-1 Invariant)',
        valuesStr: 'int[] s = new int[n + 1]; s[0] = 0; s[i] = s[i-1] + (hours[i-1] > 8 ? 1 : -1);',
      },
      {
        prefix: '└───',
        label: '终止判定条件 (Termination Condition)',
        valuesStr: '右端点倒序遍历至 0 或栈空 ➔ 返回全局最大跨度 maxLen',
      },
    ]);

    const step1 = DeductionBoardPrimitives.renderInnerStep({
      connector: '├───',
      label: '阶段 1: 扫描前缀和构建单调递减左端点栈 (Build Decreasing Stack)',
      badgeHtml: '<span class="px-1.5 py-0.5 rounded bg-blue-100 text-blue-800 font-mono text-[9px]">Push if s[i] < top</span>',
      detailLines: [
        'for (int i = 0; i <= n; i++) {',
        '  if (stack.isEmpty() || s[i] < s[stack.peek()]) {',
        '    stack.push(i); // 记录潜在最优左端点',
        '  }',
        '}',
      ],
      fillLine: '单调沉降：栈内前缀和严格单调递减，保证左边界候选者既小又靠左',
    });

    const step2 = DeductionBoardPrimitives.renderInnerStep({
      connector: '├───',
      label: '阶段 2: 右端点倒序贪心消除出栈 (Reverse Scan i & Pop j)',
      badgeHtml: '<span class="px-1.5 py-0.5 rounded bg-amber-100 text-amber-800 font-mono text-[9px]">i - j Maximize</span>',
      detailLines: [
        'for (int i = n; i >= 0; i--) {',
        '  while (!stack.isEmpty() && s[i] > s[stack.peek()]) {',
        '    int j = stack.pop();',
        '    maxLen = Math.max(maxLen, i - j);',
        '  }',
        '}',
      ],
      fillLine: '跨度最大化：从最远右端点开始击穿左端点，弹出即可永久锁定最长记录',
    });

    const step3 = DeductionBoardPrimitives.renderInnerStep({
      connector: '└───',
      label: '阶段 3: 严格 O(N) 线性交付 (Deliver Max Length)',
      badgeHtml: '<span class="px-1.5 py-0.5 rounded bg-emerald-100 text-emerald-800 font-mono text-[9px]">O(N) Total</span>',
      detailLines: [
        'return maxLen;',
      ],
      fillLine: '降维打击：将传统 O(N^2) 区间极值问题化解为单调栈单趟双向扫描',
    });

    const round = DeductionBoardPrimitives.renderOuterRound({
      title: '表现良好时间段推演流 (+1/-1 Transform ➔ Left Decreasing Stack ➔ Reverse Scan Maximization)',
      subtitle: 'LeetCode 1124 & Zuoshen Class 053 Longest WPI Synthesis',
      innerStepsHtml: step1 + step2 + step3,
    });

    const finalReturn = DeductionBoardPrimitives.renderFinalReturn({
      resultStr: '表现良好的最长连续工作天数 maxLen',
      complexityStr: '时间复杂度: O(N) 单趟前缀和与单调栈扫描 · 空间复杂度: O(N) 前缀和与栈',
    });

    return header + baseCase + round + finalReturn;
  }
}
