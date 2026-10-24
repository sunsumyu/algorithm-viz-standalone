/**
 * 逆波兰表达式求值 (Evaluate Reverse Polish Notation · LeetCode 150)
 * 全景推演树渲染策略 (EvalRpnDeductionRenderer)
 * 遵循 Matt Pocock 深模块设计模式与 IDeductionTreeRenderer 统一顶层抽象
 */

import { IDeductionTreeRenderer, StaticDeductionRenderOptions } from './types';
import { DeductionBoardPrimitives } from './deduction-board-primitives';

export class EvalRpnDeductionRenderer implements IDeductionTreeRenderer {
  public readonly id = 'eval-rpn';

  public canHandle(modelId: string): boolean {
    return (
      modelId === 'eval-rpn' ||
      modelId === '150' ||
      modelId === 'leetcode-150' ||
      modelId === 'eval-rpn-150' ||
      modelId === 'evaluate-reverse-polish-notation'
    );
  }

  public render(_options: StaticDeductionRenderOptions): string {
    const header = DeductionBoardPrimitives.renderHeader({
      title: '力扣 150. 逆波兰表达式求值 (Evaluate RPN) · 全景推演树',
      badge: '代码随想录经典栈专题 · 后缀表达式天然免优先级判定 / 先出为右操作数 / 严格 O(N)',
      descriptionHtml: `
        核心目标：给你一个字符串数组 <code>tokens</code>，表示一个根据<strong>逆波兰表示法</strong>表示的算术表达式。请你计算该表达式，返回一个表示表达式值的整数。<br/>
        <strong>《代码随想录》核心教学范式——后缀表达式与操作数栈求值公理：</strong><br/>
        1. <strong>后缀表达式天然免括号特性</strong>：<br/>
        中缀表达式（如 <code>(a + b) * c</code>）需要括号或优先级规则来决定计算次序；而逆波兰（后缀）表达式（如 <code>a b + c *</code>）中，<strong>运算符严格紧跟在它的两个操作数之后</strong>，顺序即优先级！<br/>
        2. <strong>操作数出栈次序严格非对称性（先出为右，后出为左）</strong>：<br/>
        当遇到运算符（<code>+</code>、<code>-</code>、<code>*</code>、<code>/</code>）时，连续弹出栈顶两个操作数：<br/>
        • <strong>先弹出的为右操作数</strong>：<code>int b = stack.pop();</code>；<br/>
        • <strong>后弹出的为左操作数</strong>：<code>int a = stack.pop();</code>；<br/>
        • <strong>除法与减法不可逆</strong>：必须执行 <code>a - b</code> 与 <code>a / b</code>，绝不可颠倒次序！<br/>
        • 将运算结果重新压入栈中：<code>stack.push(result);</code>；<br/>
        3. <strong>单趟归约与最终交付</strong>：扫描完毕后，栈中必然且仅存留一个数字，即为全表达式的最终计算值。
      `,
      initialStateText: `求值入口：evalRPN(tokens) ➔ 初始化 Deque<Integer> stack = new ArrayDeque<>()。`,
    });

    const baseCase = DeductionBoardPrimitives.renderBaseCases([
      {
        prefix: '├───',
        label: '单操作数退化判定 (Single Token Expression)',
        valuesStr: 'tokens.length == 1 ➔ 无须计算，直接返回 Integer.parseInt(tokens[0])',
      },
      {
        prefix: '└───',
        label: '终止判定条件 (Termination Condition)',
        valuesStr: '所有 token 扫描归约完毕 ➔ 栈顶即最终求值结果，return stack.pop()',
      },
    ]);

    const step1 = DeductionBoardPrimitives.renderInnerStep({
      connector: '├───',
      label: '阶段 1: 操作数直接压栈暂存 (Push Operands into Stack)',
      badgeHtml: '<span class="px-1.5 py-0.5 rounded bg-blue-100 text-blue-800 font-mono text-[9px]">Push Number</span>',
      detailLines: [
        'if (!isOperator(token)) {',
        '  stack.push(Integer.parseInt(token)); // 遇到数值立即入栈待命',
        '}',
      ],
      fillLine: '积蓄力量：所有待计算的操作数按扫描次序压入操作数栈',
    });

    const step2 = DeductionBoardPrimitives.renderInnerStep({
      connector: '├───',
      label: '阶段 2: 运算符触发双出栈与有序求值 (Pop Right & Left ➔ Compute ➔ Push)',
      badgeHtml: '<span class="px-1.5 py-0.5 rounded bg-amber-100 text-amber-800 font-mono text-[9px]">Compute</span>',
      detailLines: [
        'int b = stack.pop(); // 先出者为右操作数',
        'int a = stack.pop(); // 后出者为左操作数',
        'if (token.equals("+")) stack.push(a + b);',
        'else if (token.equals("-")) stack.push(a - b); // 严格 a - b',
        'else if (token.equals("*")) stack.push(a * b);',
        'else if (token.equals("/")) stack.push(a / b); // 严格 a / b 向零截断',
      ],
      fillLine: '精准算术：严格区分左右操作数顺序，就地求值后将中间产物压回栈顶',
    });

    const step3 = DeductionBoardPrimitives.renderInnerStep({
      connector: '└───',
      label: '阶段 3: 栈顶最终结果交付 (Deliver Final Expression Value)',
      badgeHtml: '<span class="px-1.5 py-0.5 rounded bg-emerald-100 text-emerald-800 font-mono text-[9px]">Result</span>',
      detailLines: [
        'return stack.pop(); // 全串归约为唯一栈顶结果',
      ],
      fillLine: '完美收官：语法树节点逐级折叠归约，栈顶即为整条表达式的精确数值',
    });

    const round = DeductionBoardPrimitives.renderOuterRound({
      title: '逆波兰求值推演流 (Operand Ingestion ➔ Ordered Binary Reduction ➔ Top Delivery)',
      subtitle: 'LeetCode 150 Evaluate Reverse Polish Notation Masterclass',
      innerStepsHtml: step1 + step2 + step3,
    });

    const finalReturn = DeductionBoardPrimitives.renderFinalReturn({
      resultStr: '算术表达式最终计算结果',
      complexityStr: '时间复杂度: O(N) 线性单趟扫描 · 空间复杂度: O(N) 操作数栈上限',
    });

    return header + baseCase + round + finalReturn;
  }
}
