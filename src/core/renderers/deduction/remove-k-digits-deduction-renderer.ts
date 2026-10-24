/**
 * 移掉 K 位数字 (Remove K Digits · LeetCode 402 / Class 053)
 * 全景推演树渲染策略 (RemoveKDigitsDeductionRenderer)
 * 遵循 Matt Pocock 深模块设计模式与 IDeductionTreeRenderer 统一顶层抽象
 */

import { IDeductionTreeRenderer, StaticDeductionRenderOptions } from './types';
import { DeductionBoardPrimitives } from './deduction-board-primitives';

export class RemoveKDigitsDeductionRenderer implements IDeductionTreeRenderer {
  public readonly id = 'remove-k-digits';

  public canHandle(modelId: string): boolean {
    return (
      modelId === 'remove-k-digits' ||
      modelId === '402' ||
      modelId === 'leetcode-402' ||
      modelId === 'remove-k-digits-053' ||
      modelId === 'class053-code03'
    );
  }

  public render(_options: StaticDeductionRenderOptions): string {
    const header = DeductionBoardPrimitives.renderHeader({
      title: '力扣 402. 移掉 K 位数字 (Remove K Digits) · 全景推演树',
      badge: '代码随想录 & 左程云 Class 053 · 单调递增栈贪心剔除高位逆序 / 剩余 k 尾部截断 / 剥离前导零 / 严格 O(N)',
      descriptionHtml: `
        核心目标：给你一个以字符串表示的非负整数 <code>num</code> 和一个整数 <code>k</code> ，移除这个数中的 <code>k</code> 位数字，使得剩下的数字最小。请你以字符串形式返回这个最小的数字。<br/>
        <strong>贪心与单调栈数学本质——高位权值绝对支配公理：</strong><br/>
        1. <strong>高位决定性公理（逆序对消除）</strong>：<br/>
        对于两个位数相同的十进制数，高位数值对整体大小具有决定性支配权重（如 <code>143...</code> 移除 <code>4</code> 变为 <code>13...</code> 远小于移除 <code>3</code> 变成的 <code>14...</code>）；<br/>
        因此，只要发现<strong>前一个数字大于当前数字（逆序拐点）</strong>，移除前一个数字必然使整体数值变小！<br/>
        2. <strong>单调递增栈贪心剔除工作流</strong>：<br/>
        • 顺序遍历数字字符，维护栈内字符<strong>单调不降（递增）</strong>；<br/>
        • 若 <code>k &gt; 0</code> 且 <code>stack.top() &gt; c</code>，则果断执行 <code>stack.pop(); k--;</code>；<br/>
        • <strong>尾部截断特判</strong>：若遍历完毕后 <code>k &gt; 0</code>（例如原数字已天然单调递增 <code>12345</code>），从栈顶直接弹出末尾剩余的 <code>k</code> 个最大数！<br/>
        3. <strong>前导零剥离与空串兜底</strong>：构造最终字符串时，跳过开头所有的 <code>'0'</code>；若清空后为空串，直接返回 <code>"0"</code>。
      `,
      initialStateText: `剔除入口：removeKdigits(num, k) ➔ 启动单调栈逆序监测器，初始可剔除额度 k。`,
    });

    const baseCase = DeductionBoardPrimitives.renderBaseCases([
      {
        prefix: '├───',
        label: '全员剔除退化 (k >= num.length())',
        valuesStr: 'k >= num.length() ➔ 数字全部被删光，直接 return "0"',
      },
      {
        prefix: '└───',
        label: '终止判定条件 (Termination Condition)',
        valuesStr: '遍历结束 + 尾部截断 + 前导零清洗 ➔ 组装最小有效整数串返回',
      },
    ]);

    const step1 = DeductionBoardPrimitives.renderInnerStep({
      connector: '├───',
      label: '阶段 1: 扫描并贪心剔除高位逆序峰值 (Greedy Pop High Peaks)',
      badgeHtml: '<span class="px-1.5 py-0.5 rounded bg-blue-100 text-blue-800 font-mono text-[9px]">Pop if top > c</span>',
      detailLines: [
        'for (char c : num.toCharArray()) {',
        '  while (k > 0 && !stack.isEmpty() && stack.peek() > c) {',
        '    stack.pop(); // 弹出高位大数，保留更小的 c',
        '    k--;',
        '  }',
        '  stack.push(c);',
        '}',
      ],
      fillLine: '消峰保小：高位只要出现逆序凹陷，立刻用较小数字替换原高位大数',
    });

    const step2 = DeductionBoardPrimitives.renderInnerStep({
      connector: '├───',
      label: '阶段 2: 额度未尽从尾部截断 (Truncate Tail Remaining k)',
      badgeHtml: '<span class="px-1.5 py-0.5 rounded bg-amber-100 text-amber-800 font-mono text-[9px]">Tail Pop</span>',
      detailLines: [
        'while (k > 0 && !stack.isEmpty()) {',
        '  stack.pop(); // 单调递增时末尾数值最大，从栈顶弹出',
        '  k--;',
        '}',
      ],
      fillLine: '尾部削顶：对于 12345 这种单调序列，移除末位是缩小数值的唯一正解',
    });

    const step3 = DeductionBoardPrimitives.renderInnerStep({
      connector: '└───',
      label: '阶段 3: 剥离前导零与边界交付 (Strip Leading Zeros)',
      badgeHtml: '<span class="px-1.5 py-0.5 rounded bg-emerald-100 text-emerald-800 font-mono text-[9px]">O(N) Result</span>',
      detailLines: [
        'StringBuilder sb = new StringBuilder();',
        '// 跳过所有前导零',
        'while (idx < len && chars[idx] == \'0\') idx++;',
        'return sb.length() == 0 ? "0" : sb.toString();',
      ],
      fillLine: '规范输出：消除如 "0200" 中的无效前导零，保留纯粹合规正整数或 "0"',
    });

    const round = DeductionBoardPrimitives.renderOuterRound({
      title: '移掉 K 位数字推演流 (Peak Elimination ➔ Tail Truncation ➔ Leading Zero Strip)',
      subtitle: 'LeetCode 402 & Zuoshen Class 053 Monotonic Greedy Synthesis',
      innerStepsHtml: step1 + step2 + step3,
    });

    const finalReturn = DeductionBoardPrimitives.renderFinalReturn({
      resultStr: '最小数字字符表示 (String minNum)',
      complexityStr: '时间复杂度: O(N) 仅经历单趟栈操作与清洗 · 空间复杂度: O(N) 栈与字符串构建',
    });

    return header + baseCase + round + finalReturn;
  }
}
