/**
 * 每日温度 (Daily Temperatures · LeetCode 739 / Class 052)
 * 全景推演树渲染策略 (DailyTemperaturesDeductionRenderer)
 * 遵循 Matt Pocock 深模块设计模式与 IDeductionTreeRenderer 统一顶层抽象
 */

import { IDeductionTreeRenderer, StaticDeductionRenderOptions } from './types';
import { DeductionBoardPrimitives } from './deduction-board-primitives';

export class DailyTemperaturesDeductionRenderer implements IDeductionTreeRenderer {
  public readonly id = 'daily-temperatures';

  public canHandle(modelId: string): boolean {
    return (
      modelId === 'daily-temperatures' ||
      modelId === '739' ||
      modelId === 'leetcode-739' ||
      modelId === 'daily-temperatures-052' ||
      modelId === 'class052-code03'
    );
  }

  public render(_options: StaticDeductionRenderOptions): string {
    const header = DeductionBoardPrimitives.renderHeader({
      title: '力扣 739. 每日温度 (Daily Temperatures) · 全景推演树',
      badge: '代码随想录 & 左程云 Class 052 · 单调递减栈 (自底向上递减) / 右侧首个更大元素跨度结算 / 严格 O(N) 线性摊销',
      descriptionHtml: `
        核心目标：给定一个整数数组 <code>temperatures</code>，表示每天的温度，返回一个数组 <code>answer</code>，其中 <code>answer[i]</code> 是指对于第 <code>i</code> 天，下一个更高温度出现在几天后。如果气温在这之后都不会升高，请在该位置用 <code>0</code> 来代替。<br/>
        <strong>单调栈（Monotonic Stack）经典母题核心规约与结算公理：</strong><br/>
        1. <strong>单调栈性质（单调递减栈维护未决日）</strong>：<br/>
        • 栈内存储<strong>天数下标 index</strong>，栈底到栈顶对应温度<strong>单调递减</strong>（即栈内记录的是当前还没有找到更高温度的那些天）；<br/>
        • <strong>遇小入栈，遇大结算</strong>：当新一天气温 <code>T[i]</code> 较小时，直接压栈等待；一旦出现 <code>T[i] &gt; T[stack.top()]</code>，说明第 <code>i</code> 天就是栈顶那一天苦苦等待的<strong>右侧第一个更暖日</strong>！<br/>
        2. <strong>跨度结算与循环出栈（消除暴力双重遍历）</strong>：<br/>
        • 弹出栈顶 <code>prevIndex = stack.pop()</code>；<br/>
        • 结算天数跨度：<code>ans[prevIndex] = i - prevIndex</code>；<br/>
        • 循环比较，直到栈空或当前温度不再大于栈顶为止，随后将当天下标 <code>i</code> 压入栈中；<br/>
        3. <strong>O(N) 线性时间证明</strong>：每个天数下标最多进栈一次、出栈一次，总操作次数 $\le 2N$。
      `,
      initialStateText: `分析入口：dailyTemperatures(temperatures) ➔ 初始化 int[] ans = new int[N], stack = []。`,
    });

    const baseCase = DeductionBoardPrimitives.renderBaseCases([
      {
        prefix: '├───',
        label: '边界退化判定 (Empty or Single Day)',
        valuesStr: 'temperatures.length <= 1 ➔ 无未来可言，直接 return new int[]{0}',
      },
      {
        prefix: '└───',
        label: '终止判定条件 (Termination Condition)',
        valuesStr: '全数组遍历完成 ➔ 栈内残留元素无更暖日，默认保持 0，直接返回 ans',
      },
    ]);

    const step1 = DeductionBoardPrimitives.renderInnerStep({
      connector: '├───',
      label: '阶段 1: 遇降温压栈等待 (Monotonic Invariant Push)',
      badgeHtml: '<span class="px-1.5 py-0.5 rounded bg-blue-100 text-blue-800 font-mono text-[9px]">Push Stack</span>',
      detailLines: [
        'if (stack.isEmpty() || T[i] <= T[stack.peek()]) {',
        '  stack.push(i); // 温度不高于栈顶，压入栈等待未来救赎',
        '}',
      ],
      fillLine: '潜伏积累：栈内保持严格从栈底到栈顶降序，下标递增',
    });

    const step2 = DeductionBoardPrimitives.renderInnerStep({
      connector: '├───',
      label: '阶段 2: 破纪录连续出栈结算 (Pop & Settle Span)',
      badgeHtml: '<span class="px-1.5 py-0.5 rounded bg-amber-100 text-amber-800 font-mono text-[9px]">Settle i - prev</span>',
      detailLines: [
        'while (!stack.isEmpty() && T[i] > T[stack.peek()]) {',
        '  int prev = stack.pop();',
        '  ans[prev] = i - prev; // 结算等待天数跨度',
        '}',
      ],
      fillLine: '破局清算：当前较高温度瞬间打破先前若干天的等待记录',
    });

    const step3 = DeductionBoardPrimitives.renderInnerStep({
      connector: '└───',
      label: '阶段 3: 当天入栈与最终交付 (Push Current & Result)',
      badgeHtml: '<span class="px-1.5 py-0.5 rounded bg-emerald-100 text-emerald-800 font-mono text-[9px]">O(N) Total</span>',
      detailLines: [
        'stack.push(i); // 清算完毕后，将当天 i 压栈',
        '// 遍历结束后栈中剩余下标的 ans 默认保留 0',
        'return ans;',
      ],
      fillLine: '交替推进：每一个元素仅出入栈各一次，整体严格 O(N) 线性复杂度',
    });

    const round = DeductionBoardPrimitives.renderOuterRound({
      title: '每日温度推演流 (Monotonic Stack ➔ Right Greater Settle ➔ Day Span Resolution)',
      subtitle: 'LeetCode 739 & Zuoshen Class 052 Monotonic Stack Paradigms',
      innerStepsHtml: step1 + step2 + step3,
    });

    const finalReturn = DeductionBoardPrimitives.renderFinalReturn({
      resultStr: '等待升温天数数组 int[] ans',
      complexityStr: '时间复杂度: O(N) 严格单调栈线性扫描 · 空间复杂度: O(N) 仅单调栈空间',
    });

    return header + baseCase + round + finalReturn;
  }
}
