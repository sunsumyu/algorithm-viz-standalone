/**
 * 子数组最小乘积的最大值 (Maximum Subarray Min-Product · LeetCode 1856 / Class 053)
 * 全景推演树渲染策略 (MaximumSubarrayMinProductDeductionRenderer)
 * 遵循 Matt Pocock 深模块设计模式与 IDeductionTreeRenderer 统一顶层抽象
 */

import { IDeductionTreeRenderer, StaticDeductionRenderOptions } from './types';
import { DeductionBoardPrimitives } from './deduction-board-primitives';

export class MaximumSubarrayMinProductDeductionRenderer implements IDeductionTreeRenderer {
  public readonly id = 'maximum-subarray-min-product';

  public canHandle(modelId: string): boolean {
    return (
      modelId === 'maximum-subarray-min-product' ||
      modelId === 'maximum-subarray-min-product-053' ||
      modelId === '1856' ||
      modelId === 'leetcode-1856' ||
      modelId === 'class053-code06'
    );
  }

  public render(_options: StaticDeductionRenderOptions): string {
    const header = DeductionBoardPrimitives.renderHeader({
      title: '力扣 1856. 子数组最小乘积的最大值 · 全景推演树',
      badge: '左程云 Class 053 & LeetCode 1856 · 正数数组贪心最大延展 / 单调递增栈求辐射边界 / 前缀和 O(1) 提取区间和',
      descriptionHtml: `
        核心目标：一个数组的<strong>最小乘积</strong>定义为这个数组中<strong>最小值</strong>乘以数组的<strong>和</strong>。给你一个正整数数组 <code>nums</code>，请你返回 <code>nums</code> 的任意非空子数组的<strong>最大最小乘积</strong>对 <code>10^9 + 7</code> 取模的结果。<br/>
        <strong>左程云算法体系教学核心——正数延展单调性与单调栈前缀和融合公理：</strong><br/>
        1. <strong>贪心最大延展公理（全正数数组的天然性质）</strong>：<br/>
        因为数组中所有元素全为正整数（<code>nums[i] &ge; 1</code>），区间越宽，累加和严格单调递增！<br/>
        如果固定以 <code>nums[i]</code> 作为子数组的<strong>瓶颈最小值</strong>，为了让乘积 <code>nums[i] * sum</code> 达到极大值，子数组的边界<strong>必须向左右尽可能远地贪心扩展</strong>，直到遇到第一个比 <code>nums[i]</code> 更小的元素被阻断为止！<br/>
        2. <strong>单调递增栈与前缀和联合加速</strong>：<br/>
        • 预处理前缀和数组 <code>prefix[i] = prefix[i - 1] + nums[i - 1]</code>，使得任意闭区间 <code>[L, R]</code> 的和可在 <code>O(1)</code> 提取：<code>prefix[R + 1] - prefix[L]</code>；<br/>
        • 维护<strong>单调递增栈</strong>，寻找元素 <code>cur</code> 的左侧首个更小位置 <code>left</code> 与右侧首个更小位置 <code>right</code>；<br/>
        • 以 <code>nums[cur]</code> 为最小值的最大有效开区间为 <code>(left, right)</code>，对应闭区间 <code>[left + 1, right - 1]</code>；<br/>
        • 乘积：<code>prod = (long) nums[cur] * (prefix[right] - prefix[left + 1])</code>；<br/>
        • <strong>注意</strong>：必须使用 <code>long</code> 全程保留未取模的真实最大值比较，仅在最终交付时对 <code>10^9 + 7</code> 取模！
      `,
      initialStateText: `乘积入口：maxSumMinProduct(nums) ➔ 构建前缀和 prefix，启动单调递增栈。`,
    });

    const baseCase = DeductionBoardPrimitives.renderBaseCases([
      {
        prefix: '├───',
        label: '前缀和预处理 (Prefix Sum Invariant)',
        valuesStr: 'long[] sum = new long[n + 1]; for (i=0..n-1) sum[i+1] = sum[i] + nums[i];',
      },
      {
        prefix: '└───',
        label: '终止判定条件 (Termination Condition)',
        valuesStr: '所有元素辐射乘积结算完成 ➔ (maxProd % 1000000007) 交付',
      },
    ]);

    const step1 = DeductionBoardPrimitives.renderInnerStep({
      connector: '├───',
      label: '阶段 1: 单调栈界定贪心最大跨度 (Bilateral Monotonic Bounding)',
      badgeHtml: '<span class="px-1.5 py-0.5 rounded bg-blue-100 text-blue-800 font-mono text-[9px]">Stack Boundary</span>',
      detailLines: [
        'while (!stack.isEmpty() && nums[i] <= nums[stack.peek()]) {',
        '  int cur = stack.pop();',
        '  int left = stack.isEmpty() ? -1 : stack.peek();',
        '  int right = i; // 当前位置即为右边界',
        '  long rangeSum = prefix[right] - prefix[left + 1];',
        '  maxProd = Math.max(maxProd, nums[cur] * rangeSum);',
        '}',
        'stack.push(i);',
      ],
      fillLine: '最大包容：左右两侧遇矮停止，中间全是不小于当前元素的高地',
    });

    const step2 = DeductionBoardPrimitives.renderInnerStep({
      connector: '├───',
      label: '阶段 2: 栈底残余辐射至末尾 (Flush to Array End n)',
      badgeHtml: '<span class="px-1.5 py-0.5 rounded bg-amber-100 text-amber-800 font-mono text-[9px]">Right = n</span>',
      detailLines: [
        'while (!stack.isEmpty()) {',
        '  int cur = stack.pop();',
        '  int left = stack.isEmpty() ? -1 : stack.peek();',
        '  int right = n;',
        '  long rangeSum = prefix[right] - prefix[left + 1];',
        '  maxProd = Math.max(maxProd, nums[cur] * rangeSum);',
        '}',
      ],
      fillLine: '通达无阻：右侧无更小阻挡者直接延展至末尾 n，获取最大区间和',
    });

    const step3 = DeductionBoardPrimitives.renderInnerStep({
      connector: '└───',
      label: '阶段 3: 严格 64 位防溢出与模运算 (64-bit Modulo Safe)',
      badgeHtml: '<span class="px-1.5 py-0.5 rounded bg-emerald-100 text-emerald-800 font-mono text-[9px]">Modulo Mod</span>',
      detailLines: [
        'return (int) (maxProd % 1000000007);',
      ],
      fillLine: '数值稳健：比较过程杜绝提前取模导致大小倒挂，最终交付对模收敛',
    });

    const round = DeductionBoardPrimitives.renderOuterRound({
      title: '子数组最小乘积推演流 (Prefix Sum ➔ Greedy Extension ➔ Monotonic Bounding ➔ Min-Product)',
      subtitle: 'LeetCode 1856 & Zuoshen Class 053 Maximum Min-Product Synthesis',
      innerStepsHtml: step1 + step2 + step3,
    });

    const finalReturn = DeductionBoardPrimitives.renderFinalReturn({
      resultStr: '最大最小乘积 (maxProd % 1000000007)',
      complexityStr: '时间复杂度: O(N) 线性单调栈与前缀和 · 空间复杂度: O(N) 前缀和与栈',
    });

    return header + baseCase + round + finalReturn;
  }
}
