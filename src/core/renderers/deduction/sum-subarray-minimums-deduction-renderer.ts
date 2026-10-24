/**
 * 子数组的最小值之和 (Sum of Subarray Minimums · LeetCode 907 / Class 052)
 * 全景推演树渲染策略 (SumSubarrayMinimumsDeductionRenderer)
 * 遵循 Matt Pocock 深模块设计模式与 IDeductionTreeRenderer 统一顶层抽象
 */

import { IDeductionTreeRenderer, StaticDeductionRenderOptions } from './types';
import { DeductionBoardPrimitives } from './deduction-board-primitives';

export class SumSubarrayMinimumsDeductionRenderer implements IDeductionTreeRenderer {
  public readonly id = 'sum-subarray-minimums';

  public canHandle(modelId: string): boolean {
    return (
      modelId === 'sum-subarray-minimums' ||
      modelId === 'sum-subarray-minimums-052' ||
      modelId === '907' ||
      modelId === 'leetcode-907' ||
      modelId === 'class052-code04'
    );
  }

  public render(_options: StaticDeductionRenderOptions): string {
    const header = DeductionBoardPrimitives.renderHeader({
      title: '力扣 907. 子数组的最小值之和 (Sum of Subarray Minimums) · 全景推演树',
      badge: '左程云 Class 052 & 代码随想录 · 贡献法逆向思维 / 单调递增栈辐射范围 (i - left) * (right - i) / 严格防重开闭界',
      descriptionHtml: `
        核心目标：给定一个整数数组 <code>arr</code>，找到 <code>min(b)</code> 的总和，其中 <code>b</code> 的范围为 <code>arr</code> 的每个连续子数组。结果对 <code>10^9 + 7</code> 取模。<br/>
        <strong>左程云算法体系教学核心——贡献法逆向思维与开闭区间防重公理：</strong><br/>
        1. <strong>贡献法逆向思维（由子数组找最值 ➔ 转化为最值找辐射范围）</strong>：<br/>
        正向枚举所有子数组需要 <code>O(N^2)</code>，绝对超时！<br/>
        逆向思考：对于每个元素 <code>arr[i]</code>，究竟有多少个连续子数组以它为<strong>最小值</strong>？<br/>
        • 寻找 <code>arr[i]</code> 左边第一个<strong>小于</strong>它的位置 <code>left</code>；<br/>
        • 寻找 <code>arr[i]</code> 右边第一个<strong>小于等于</strong>它的位置 <code>right</code>；<br/>
        • 以 <code>arr[i]</code> 为最小值的子数组起点有 <code>i - left</code> 种选择，终点有 <code>right - i</code> 种选择；<br/>
        • <strong>总贡献公式</strong>：<code>Count(i) = (i - left) * (right - i)</code>，该元素贡献值 <code>arr[i] * Count(i)</code>！<br/>
        2. <strong>开闭原则防重公理（解决重复数值边界）</strong>：<br/>
        当数组中存在相同数值时（如 <code>[2, 2, 2]</code>），若两边都取“严格小于”，会出现漏算；若两边都取“小于等于”，同一子数组会被重复统计！<br/>
        <strong>黄金防重法则</strong>：规定一侧<strong>严格小于（开）</strong>，另一侧<strong>小于等于（闭）</strong>，保证每个子数组的最小值有且仅被唯一定位一次！
      `,
      initialStateText: `贡献入口：sumSubarrayMins(arr) ➔ 启动单调递增栈，维护元素辐射区间，ans = 0。`,
    });

    const baseCase = DeductionBoardPrimitives.renderBaseCases([
      {
        prefix: '├───',
        label: '边界判空退化 (Null Check)',
        valuesStr: 'arr == null || arr.length == 0 ➔ 贡献为 0，直接 return 0',
      },
      {
        prefix: '└───',
        label: '终止判定条件 (Termination Condition)',
        valuesStr: '全数组元素辐射范围结算完毕 ➔ (ans % 1000000007) 交付',
      },
    ]);

    const step1 = DeductionBoardPrimitives.renderInnerStep({
      connector: '├───',
      label: '阶段 1: 单调递增栈界定辐射左右边界 (Monotonic Stack Bounding)',
      badgeHtml: '<span class="px-1.5 py-0.5 rounded bg-blue-100 text-blue-800 font-mono text-[9px]">Stack Bounding</span>',
      detailLines: [
        'while (!stack.isEmpty() && arr[i] <= arr[stack.peek()]) {',
        '  int cur = stack.pop(); // 弹出待结算元素',
        '  int left = stack.isEmpty() ? -1 : stack.peek(); // 左侧首个严格更小',
        '  int right = i; // 右侧首个更小或相等',
        '  long count = (long)(cur - left) * (right - cur);',
        '  ans = (ans + arr[cur] * count) % MOD;',
        '}',
        'stack.push(i);',
      ],
      fillLine: '双向辐射：弹出栈顶瞬间，当前 i 即为右边界，新栈顶即为左边界',
    });

    const step2 = DeductionBoardPrimitives.renderInnerStep({
      connector: '├───',
      label: '阶段 2: 清算栈内残留柱辐射至右无穷 (Flush to Right Infinity)',
      badgeHtml: '<span class="px-1.5 py-0.5 rounded bg-amber-100 text-amber-800 font-mono text-[9px]">Right Infinity</span>',
      detailLines: [
        'while (!stack.isEmpty()) {',
        '  int cur = stack.pop();',
        '  int left = stack.isEmpty() ? -1 : stack.peek();',
        '  int right = n; // 右侧无更小值，辐射直达数组末尾',
        '  long count = (long)(cur - left) * (right - cur);',
        '  ans = (ans + arr[cur] * count) % MOD;',
        '}',
      ],
      fillLine: '清仓结算：栈中未被弹出的元素，其右侧辐射边界直接延伸至整个数组尽头 n',
    });

    const step3 = DeductionBoardPrimitives.renderInnerStep({
      connector: '└───',
      label: '阶段 3: 严格取模与最终答案交付 (Modulo Output)',
      badgeHtml: '<span class="px-1.5 py-0.5 rounded bg-emerald-100 text-emerald-800 font-mono text-[9px]">Modulo 1e9+7</span>',
      detailLines: [
        'return (int) ans;',
      ],
      fillLine: '线性闭环：每个元素仅出入栈各一次，整体严格 O(N) 线性高效求解',
    });

    const round = DeductionBoardPrimitives.renderOuterRound({
      title: '子数组最小值之和推演流 (Contribution Math ➔ Monotonic Bounding ➔ Deduplication Invariant)',
      subtitle: 'LeetCode 907 & Zuoshen Class 052 Contribution Paradigm',
      innerStepsHtml: step1 + step2 + step3,
    });

    const finalReturn = DeductionBoardPrimitives.renderFinalReturn({
      resultStr: '子数组最小值之和 (ans % 1000000007)',
      complexityStr: '时间复杂度: O(N) 单趟单调栈 · 空间复杂度: O(N) 单调栈空间',
    });

    return header + baseCase + round + finalReturn;
  }
}
