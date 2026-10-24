/**
 * 有效的括号 (Valid Parentheses · LeetCode 20)
 * 全景推演树渲染策略 (BracketDeductionRenderer)
 * 遵循 Matt Pocock 深模块设计模式与 IDeductionTreeRenderer 统一顶层抽象
 */

import { IDeductionTreeRenderer, StaticDeductionRenderOptions } from './types';
import { DeductionBoardPrimitives } from './deduction-board-primitives';

export class BracketDeductionRenderer implements IDeductionTreeRenderer {
  public readonly id = 'bracket';

  public canHandle(modelId: string): boolean {
    return (
      modelId === 'bracket' ||
      modelId === '20' ||
      modelId === 'leetcode-20' ||
      modelId === 'valid-parentheses' ||
      modelId === 'valid-parentheses-20'
    );
  }

  public render(_options: StaticDeductionRenderOptions): string {
    const header = DeductionBoardPrimitives.renderHeader({
      title: '力扣 20. 有效的括号 (Valid Parentheses) · 全景推演树',
      badge: '代码随想录经典栈专题 · 遇左压右神级映射 / 栈顶即时 O(1) 比对 / 三大失配红线拦截 / 严格 O(N)',
      descriptionHtml: `
        核心目标：给定一个只包括 <code>'('</code>，<code>')'</code>，<code>'{'</code>，<code>'}'</code>，<code>'['</code>，<code>']'</code> 的字符串 <code>s</code>，判断字符串是否有效。<br/>
        <strong>《代码随想录》核心教学范式——“遇左压右”对称消除公理：</strong><br/>
        1. <strong>遇左压右（Invert-and-Push）</strong>：<br/>
        扫描到左括号时，<strong>不是压入自身，而是压入对应的期望右括号</strong>！<br/>
        • 遇到 <code>'('</code> ➔ 压入 <code>')'</code>；<br/>
        • 遇到 <code>'['</code> ➔ 压入 <code>']'</code>；<br/>
        • 遇到 <code>'{'</code> ➔ 压入 <code>'}'</code>；<br/>
        这样在后续遇到右括号时，<strong>只需要拿当前字符与栈顶 <code>stack.peek()</code> 直接相等比对</strong>，相等即出栈，省去所有映射查找与嵌套分支！<br/>
        2. <strong>三大失配红线拦截法</strong>：<br/>
        • <strong>红线 ①（右多左少）</strong>：遇到右括号时栈已空（无期待闭合符），直接判定 <code>false</code>；<br/>
        • <strong>红线 ②（类型失配）</strong>：遇到右括号与栈顶不相等（如期待 <code>]</code> 却来了 <code>)</code>），直接判定 <code>false</code>；<br/>
        • <strong>红线 ③（左多右少）</strong>：全串扫描完毕后，栈内仍有未消除的期待闭合符（<code>!stack.isEmpty()</code>），直接判定 <code>false</code>；<br/>
        • 只有三条红线全避开且最终 <code>stack.isEmpty()</code>，才合法判定为 <code>true</code>。
      `,
      initialStateText: `匹配入口：isValid(s) ➔ 初始化 Deque<Character> stack = new ArrayDeque<>()。`,
    });

    const baseCase = DeductionBoardPrimitives.renderBaseCases([
      {
        prefix: '├───',
        label: '奇数长度奇偶性特判 (Odd Length Parity)',
        valuesStr: 's.length % 2 != 0 ➔ 括号必然无法两两配对成双，直接 return false',
      },
      {
        prefix: '└───',
        label: '终止判定条件 (Termination Condition)',
        valuesStr: '扫描指针抵达串尾 ➔ 返回 stack.isEmpty() (栈空则全配对成功)',
      },
    ]);

    const step1 = DeductionBoardPrimitives.renderInnerStep({
      connector: '├───',
      label: '阶段 1: 遇左括号压入对应右括号 (Push Expected Closing Bracket)',
      badgeHtml: '<span class="px-1.5 py-0.5 rounded bg-blue-100 text-blue-800 font-mono text-[9px]">Push Right</span>',
      detailLines: [
        'if (c == \'(\') stack.push(\')\');',
        'else if (c == \'[\') stack.push(\']\');',
        'else if (c == \'{\') stack.push(\'}\');',
      ],
      fillLine: '未雨绸缪：将期望闭合字符作为信物押入栈中，静候后方同伴',
    });

    const step2 = DeductionBoardPrimitives.renderInnerStep({
      connector: '├───',
      label: '阶段 2: 遇右括号即时对消与失配拦截 (Instant Pop on Match or Reject)',
      badgeHtml: '<span class="px-1.5 py-0.5 rounded bg-amber-100 text-amber-800 font-mono text-[9px]">Pop / Reject</span>',
      detailLines: [
        'else if (stack.isEmpty() || stack.peek() != c) {',
        '  return false; // 触发红线 ① (空栈) 或红线 ② (字符失配)',
        '} else {',
        '  stack.pop(); // 信物吻合，抵消一对闭合区间',
        '}',
      ],
      fillLine: '立判真伪：当前右括号必须精准迎合栈顶期许，否则立即告警断言失配',
    });

    const step3 = DeductionBoardPrimitives.renderInnerStep({
      connector: '└───',
      label: '阶段 3: 栈空清白判定与最终布尔交付 (Verify Clean Stack)',
      badgeHtml: '<span class="px-1.5 py-0.5 rounded bg-emerald-100 text-emerald-800 font-mono text-[9px]">stack.isEmpty()</span>',
      detailLines: [
        'return stack.isEmpty(); // 红线 ③：若仍有残留左括号则返回 false',
      ],
      fillLine: '最终审判：所有欠下的期待全部消解归零，方为完全合法匹配',
    });

    const round = DeductionBoardPrimitives.renderOuterRound({
      title: '括号对消推演流 (Invert-and-Push ➔ Instant Match/Reject ➔ Stack Clean Verification)',
      subtitle: 'LeetCode 20 Valid Parentheses Masterclass',
      innerStepsHtml: step1 + step2 + step3,
    });

    const finalReturn = DeductionBoardPrimitives.renderFinalReturn({
      resultStr: '有效布尔值 true / false',
      complexityStr: '时间复杂度: O(N) 单趟扫描 · 空间复杂度: O(N) 最坏全左括号栈空间',
    });

    return header + baseCase + round + finalReturn;
  }
}
