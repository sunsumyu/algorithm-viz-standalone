/**
 * 逆波兰表达式求值 (Evaluate Reverse Polish Notation) - 步进编译器
 * LeetCode 150
 */

import { HighlightTarget } from '../../../core/renderers/dark-code-terminal-presenter';

export interface RPNStep {
  tokens: string[];
  currentIndex: number;
  currentToken: string | null;
  stack: number[];
  operandA: number | null;
  operandB: number | null;
  operator: string | null;
  calcResult: number | null;
  action: 'init' | 'push_number' | 'compute' | 'done';
  message: string;
  codeLine: HighlightTarget;
}

export function buildEvalRPNSteps(rawTokens: string[]): RPNStep[] {
  const steps: RPNStep[] = [];
  const tokens = rawTokens.map((t) => t.trim()).filter(Boolean);
  const n = tokens.length;

  const lines = {
    init:       { java: 2,  cpp: 4,  python: 3,  javascript: 2 },
    compute:    { java: 7,  cpp: 7,  python: 6,  javascript: 5 },
    pushNumber: { java: 15, cpp: 14, python: 12, javascript: 12 },
    done:       { java: 18, cpp: 17, python: 13, javascript: 15 },
  };

  if (n === 0) {
    steps.push({
      tokens: [],
      currentIndex: -1,
      currentToken: null,
      stack: [],
      operandA: null,
      operandB: null,
      operator: null,
      calcResult: null,
      action: 'done',
      message: 'Token 列表为空，表达式值为 0',
      codeLine: lines.done,
    });
    return steps;
  }

  const stack: number[] = [];

  steps.push({
    tokens: [...tokens],
    currentIndex: -1,
    currentToken: null,
    stack: [],
    operandA: null,
    operandB: null,
    operator: null,
    calcResult: null,
    action: 'init',
    message: `初始化：共 ${n} 个 Token 待处理，使用操作数栈自左向右依次求值`,
    codeLine: lines.init,
  });

  for (let i = 0; i < n; i++) {
    const token = tokens[i];

    if (token === '+' || token === '-' || token === '*' || token === '/') {
      const b = stack.pop()!;
      const a = stack.pop()!;
      let res = 0;

      if (token === '+') {
        res = a + b;
      } else if (token === '-') {
        res = a - b;
      } else if (token === '*') {
        res = a * b;
      } else if (token === '/') {
        res = Math.trunc(a / b);
      }

      stack.push(res);

      steps.push({
        tokens: [...tokens],
        currentIndex: i,
        currentToken: token,
        stack: [...stack],
        operandA: a,
        operandB: b,
        operator: token,
        calcResult: res,
        action: 'compute',
        message: `⚡ 遇运算符 '${token}'：弹出右操作数 ${b} 与左操作数 ${a}，计算 ${a} ${token} ${b} = ${res}，将 ${res} 压入栈顶`,
        codeLine: lines.compute,
      });
    } else {
      const num = parseInt(token, 10);
      stack.push(num);

      steps.push({
        tokens: [...tokens],
        currentIndex: i,
        currentToken: token,
        stack: [...stack],
        operandA: null,
        operandB: null,
        operator: null,
        calcResult: null,
        action: 'push_number',
        message: `📥 遇数字操作数 ${num}：直接压入数值栈顶。当前栈: [${stack.join(', ')}]`,
        codeLine: lines.pushNumber,
      });
    }
  }

  const finalVal = stack.length > 0 ? stack[0] : 0;
  steps.push({
    tokens: [...tokens],
    currentIndex: n,
    currentToken: null,
    stack: [...stack],
    operandA: null,
    operandB: null,
    operator: null,
    calcResult: finalVal,
    action: 'done',
    message: `🎉 逆波兰表达式求值完毕！栈顶剩余唯一最终结果为: ${finalVal}`,
    codeLine: lines.done,
  });

  return steps;
}
