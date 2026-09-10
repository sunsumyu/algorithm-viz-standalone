/**
 * 大厂高频真题 03: 全功能表达式计算器 (Basic Calculator Full)
 * LeetCode 772 / 224 / 227 / 大厂高频真题
 * 双栈法 (双栈：操作数栈 + 操作符栈) 完整解析加减乘除与多层嵌套括号
 */

import { registerDeclarativeAlgorithm } from '../../../../core/declarative-algorithm-visualizer';
import { StepBase } from '../../../../core/step-visualizer';
import { renderFormulaCard } from '../../string/string-100-105/string-100-105-shared';

export interface CalculatorStep extends StepBase {
  expression: string;
  cursor: number;
  currentToken: string;
  numStack: number[];
  opsStack: string[];
  lastOpCalculated?: string;
  operandA?: number;
  operandB?: number;
  result?: number;
  decision: string;
  message: string;
  log: string;
  codeLine?: number;
  statusBadge?: { text: string; type: 'success' | 'warning' | 'danger' | 'info' };
}

export const BASIC_CALCULATOR_CODES = {
  java: `public class BasicCalculator {
    public int calculate(String s) {
        Deque<Integer> nums = new ArrayDeque<>();
        Deque<Character> ops = new ArrayDeque<>();
        s = s.replaceAll(" ", "");
        int n = s.length();
        for (int i = 0; i < n; i++) {
            char c = s.charAt(i);
            if (Character.isDigit(c)) {
                int num = 0;
                while (i < n && Character.isDigit(s.charAt(i))) {
                    num = num * 10 + (s.charAt(i) - '0');
                    i++;
                }
                i--;
                nums.push(num);
            } else if (c == '(') {
                ops.push(c);
            } else if (c == ')') {
                while (!ops.isEmpty() && ops.peek() != '(') {
                    eval(nums, ops);
                }
                ops.pop(); // 弹出 '('
            } else { // + - * /
                // 处理负数符号，如 (-3) 或 -5 开头
                if (i == 0 || s.charAt(i - 1) == '(') {
                    nums.push(0);
                }
                while (!ops.isEmpty() && ops.peek() != '(' && priority(ops.peek()) >= priority(c)) {
                    eval(nums, ops);
                }
                ops.push(c);
            }
        }
        while (!ops.isEmpty()) {
            eval(nums, ops);
        }
        return nums.peek();
    }
    void eval(Deque<Integer> nums, Deque<Character> ops) {
        if (nums.size() < 2 || ops.isEmpty()) return;
        int b = nums.pop(), a = nums.pop();
        char op = ops.pop();
        if (op == '+') nums.push(a + b);
        else if (op == '-') nums.push(a - b);
        else if (op == '*') nums.push(a * b);
        else if (op == '/') nums.push(a / b);
    }
    int priority(char op) {
        return (op == '*' || op == '/') ? 2 : 1;
    }
}`,
  cpp: `class Solution {
public:
    int calculate(string s) {
        stack<int> nums;
        stack<char> ops;
        string str = "";
        for (char c : s) if (c != ' ') str += c;
        int n = str.size();
        for (int i = 0; i < n; i++) {
            char c = str[i];
            if (isdigit(c)) {
                long num = 0;
                while (i < n && isdigit(str[i])) {
                    num = num * 10 + (str[i] - '0');
                    i++;
                }
                i--;
                nums.push(num);
            } else if (c == '(') {
                ops.push(c);
            } else if (c == ')') {
                while (!ops.empty() && ops.top() != '(') eval(nums, ops);
                ops.pop();
            } else {
                if (i == 0 || str[i - 1] == '(') nums.push(0);
                while (!ops.empty() && ops.top() != '(' && priority(ops.top()) >= priority(c)) {
                    eval(nums, ops);
                }
                ops.push(c);
            }
        }
        while (!ops.empty()) eval(nums, ops);
        return nums.top();
    }
private:
    void eval(stack<int>& nums, stack<char>& ops) {
        int b = nums.top(); nums.pop();
        int a = nums.top(); nums.pop();
        char op = ops.top(); ops.pop();
        if (op == '+') nums.push(a + b);
        else if (op == '-') nums.push(a - b);
        else if (op == '*') nums.push(a * b);
        else if (op == '/') nums.push(a / b);
    }
    int priority(char op) { return (op == '*' || op == '/') ? 2 : 1; }
};`,
  python: `class Solution:
    def calculate(self, s: str) -> int:
        s = s.replace(" ", "")
        nums, ops = [], []
        i, n = 0, len(s)
        
        def priority(op):
            return 2 if op in ('*', '/') else 1
            
        def eval_top():
            b, a = nums.pop(), nums.pop()
            op = ops.pop()
            if op == '+': nums.append(a + b)
            elif op == '-': nums.append(a - b)
            elif op == '*': nums.append(a * b)
            elif op == '/': nums.append(int(a / b))
            
        while i < n:
            c = s[i]
            if c.isdigit():
                num = 0
                while i < n and s[i].isdigit():
                    num = num * 10 + int(s[i])
                    i += 1
                nums.append(num)
                continue
            elif c == '(':
                ops.append(c)
            elif c == ')':
                while ops and ops[-1] != '(':
                    eval_top()
                ops.pop()
            else:
                if i == 0 or s[i - 1] == '(':
                    nums.append(0)
                while ops and ops[-1] != '(' and priority(ops[-1]) >= priority(c):
                    eval_top()
                ops.append(c)
            i += 1
            
        while ops:
            eval_top()
        return nums[-1]`,
  typescript: `function calculate(s: string): number {
  s = s.replace(/\\s+/g, '');
  const nums: number[] = [];
  const ops: string[] = [];
  const priority = (op: string) => (op === '*' || op === '/' ? 2 : 1);
  const evalTop = () => {
    const b = nums.pop()!;
    const a = nums.pop()!;
    const op = ops.pop()!;
    if (op === '+') nums.push(a + b);
    else if (op === '-') nums.push(a - b);
    else if (op === '*') nums.push(a * b);
    else if (op === '/') nums.push(Math.trunc(a / b));
  };

  let i = 0;
  while (i < s.length) {
    const c = s[i];
    if (/\\d/.test(c)) {
      let num = 0;
      while (i < s.length && /\\d/.test(s[i])) {
        num = num * 10 + Number(s[i]);
        i++;
      }
      nums.push(num);
      continue;
    } else if (c === '(') {
      ops.push(c);
    } else if (c === ')') {
      while (ops.length > 0 && ops[ops.length - 1] !== '(') evalTop();
      ops.pop();
    } else {
      if (i === 0 || s[i - 1] === '(') nums.push(0);
      while (ops.length > 0 && ops[ops.length - 1] !== '(' && priority(ops[ops.length - 1]) >= priority(c)) {
        evalTop();
      }
      ops.push(c);
    }
    i++;
  }
  while (ops.length > 0) evalTop();
  return nums[nums.length - 1];
}`
};

export function generateCalculatorSteps(rawExpr: string): CalculatorStep[] {
  const steps: CalculatorStep[] = [];
  const s = rawExpr.replace(/\s+/g, '');
  const nums: number[] = [];
  const ops: string[] = [];
  const priority = (op: string) => (op === '*' || op === '/' ? 2 : 1);

  const snapshotNums = () => [...nums];
  const snapshotOps = () => [...ops];

  steps.push({
    expression: s,
    cursor: -1,
    currentToken: 'START',
    numStack: snapshotNums(),
    opsStack: snapshotOps(),
    decision: '解析器初始化',
    message: `准备解析算式: "${s}"。操作数栈与操作符栈初始化完毕。`,
    log: `Init calculator with "${s}"`,
    codeLine: 4,
    statusBadge: { text: '就绪', type: 'info' }
  });

  const evalTop = (contextMsg: string): void => {
    if (nums.length < 2 || ops.length === 0) return;
    const b = nums.pop()!;
    const a = nums.pop()!;
    const op = ops.pop()!;
    let res = 0;
    if (op === '+') res = a + b;
    else if (op === '-') res = a - b;
    else if (op === '*') res = a * b;
    else if (op === '/') res = Math.trunc(a / b);
    nums.push(res);

    steps.push({
      expression: s,
      cursor: -1,
      currentToken: op,
      numStack: snapshotNums(),
      opsStack: snapshotOps(),
      lastOpCalculated: op,
      operandA: a,
      operandB: b,
      result: res,
      decision: `弹栈求值: ${a} ${op} ${b} = ${res}`,
      message: `${contextMsg}：弹出数字 ${a} 与 ${b}，应用运算符 '${op}' 计算得 ${res}，将结果压入数栈。`,
      log: `Eval: ${a} ${op} ${b} -> ${res}`,
      codeLine: 33,
      statusBadge: { text: `求值: ${res}`, type: 'warning' }
    });
  };

  let i = 0;
  while (i < s.length) {
    const c = s[i];
    if (/\d/.test(c)) {
      let num = 0;
      const startIdx = i;
      while (i < s.length && /\d/.test(s[i])) {
        num = num * 10 + Number(s[i]);
        i++;
      }
      nums.push(num);
      steps.push({
        expression: s,
        cursor: startIdx,
        currentToken: String(num),
        numStack: snapshotNums(),
        opsStack: snapshotOps(),
        decision: `解析多位数字 ${num} 压入操作数栈`,
        message: `扫描到数值 ${num}，直接压入操作数栈。当前操作数栈深: ${nums.length}。`,
        log: `Push num: ${num}`,
        codeLine: 14,
        statusBadge: { text: `入栈: ${num}`, type: 'info' }
      });
      continue;
    } else if (c === '(') {
      ops.push(c);
      steps.push({
        expression: s,
        cursor: i,
        currentToken: '(',
        numStack: snapshotNums(),
        opsStack: snapshotOps(),
        decision: `左括号 '(' 压入操作符栈，开启新嵌套层级`,
        message: `遇到左括号 '('，压入操作符栈作为子表达式计算屏障。`,
        log: `Push '('`,
        codeLine: 16,
        statusBadge: { text: '左括号 (', type: 'info' }
      });
    } else if (c === ')') {
      steps.push({
        expression: s,
        cursor: i,
        currentToken: ')',
        numStack: snapshotNums(),
        opsStack: snapshotOps(),
        decision: `遇到右括号 ')'，开始清空当前括号内所有运算`,
        message: `遇到右括号 ')'，连续弹出运算符求值，直到遇到配对的左括号 '('。`,
        log: `Encounter ')'`,
        codeLine: 18,
        statusBadge: { text: '收束括号 )', type: 'warning' }
      });
      while (ops.length > 0 && ops[ops.length - 1] !== '(') {
        evalTop('括号内部运算');
      }
      if (ops.length > 0 && ops[ops.length - 1] === '(') {
        ops.pop();
        steps.push({
          expression: s,
          cursor: i,
          currentToken: ')',
          numStack: snapshotNums(),
          opsStack: snapshotOps(),
          decision: `括号配对消除完成，弹出 '('`,
          message: `成功配对并闭合子表达式，弹出栈顶的 '('。`,
          log: `Pop '(' matching ')'`,
          codeLine: 21,
          statusBadge: { text: '括号消除', type: 'success' }
        });
      }
    } else {
      if (i === 0 || s[i - 1] === '(') {
        nums.push(0);
        steps.push({
          expression: s,
          cursor: i,
          currentToken: `0${c}`,
          numStack: snapshotNums(),
          opsStack: snapshotOps(),
          decision: `前置符号特判：补 0 入数栈以支持一元正负号`,
          message: `运算符 '${c}' 出现在开头或左括号后，补 0 进入操作数栈，转为双目运算。`,
          log: `Push 0 for unary ${c}`,
          codeLine: 25,
          statusBadge: { text: '补 0', type: 'info' }
        });
      }
      while (
        ops.length > 0 &&
        ops[ops.length - 1] !== '(' &&
        priority(ops[ops.length - 1]) >= priority(c)
      ) {
        evalTop(`栈顶 '${ops[ops.length - 1]}' 优先级 >= 当前 '${c}'，先执行`);
      }
      ops.push(c);
      steps.push({
        expression: s,
        cursor: i,
        currentToken: c,
        numStack: snapshotNums(),
        opsStack: snapshotOps(),
        decision: `运算符 '${c}' 压入操作符栈`,
        message: `更高/同等优先级运算已处理完毕，运算符 '${c}' 入栈等待后续右操作数。`,
        log: `Push op: ${c}`,
        codeLine: 29,
        statusBadge: { text: `入栈 op: ${c}`, type: 'info' }
      });
    }
    i++;
  }

  while (ops.length > 0) {
    evalTop('扫描结束，清空栈中剩余运算符');
  }

  const finalResult = nums[nums.length - 1] ?? 0;
  steps.push({
    expression: s,
    cursor: s.length,
    currentToken: 'END',
    numStack: snapshotNums(),
    opsStack: snapshotOps(),
    decision: `表达式全流程计算完毕，最终结果 = ${finalResult}`,
    message: `所有运算符已消化完毕，操作数栈顶元素即为最终表达式求值答案: ${finalResult}。`,
    log: `Finished. Result = ${finalResult}`,
    codeLine: 32,
    statusBadge: { text: `最终结果: ${finalResult}`, type: 'success' }
  });

  return steps;
}

export function renderCalculatorSandbox(step: CalculatorStep): string {
  const exprChars = step.expression.split('').map((ch, idx) => {
    const isCur = idx === step.cursor;
    const isPassed = idx < step.cursor;
    return `
      <span style="
        display: inline-block;
        padding: 2px 6px;
        margin: 1px;
        border-radius: 4px;
        font-weight: 700;
        font-family: monospace;
        background: ${isCur ? '#fef3c7' : isPassed ? '#f1f5f9' : '#ffffff'};
        color: ${isCur ? '#b45309' : isPassed ? '#64748b' : '#0f172a'};
        border: 1px solid ${isCur ? '#f59e0b' : '#e2e8f0'};
      ">${ch}</span>
    `;
  }).join('');

  const numStackItems = step.numStack.length === 0
    ? '<div style="color: #64748b; font-style: italic; padding: 12px; text-align: center;">操作数栈为空</div>'
    : step.numStack.map((n, idx) => {
        const isTop = idx === step.numStack.length - 1;
        return `
          <div style="background: ${isTop ? '#dcfce7' : '#ffffff'}; color: ${isTop ? '#15803d' : '#0f172a'}; font-weight: 700; padding: 6px 12px; margin-bottom: 4px; border-radius: 6px; text-align: center; border: 1px solid ${isTop ? '#86efac' : '#e2e8f0'};">
            ${n} ${isTop ? '<span style="font-size: 10px; background: #22c55e; color: #fff; padding: 1px 4px; border-radius: 3px; margin-left: 6px;">TOP</span>' : ''}
          </div>
        `;
      }).reverse().join('');

  const opsStackItems = step.opsStack.length === 0
    ? '<div style="color: #64748b; font-style: italic; padding: 12px; text-align: center;">操作符栈为空</div>'
    : step.opsStack.map((op, idx) => {
        const isTop = idx === step.opsStack.length - 1;
        return `
          <div style="background: ${isTop ? '#e0e7ff' : '#ffffff'}; color: ${isTop ? '#4338ca' : '#0f172a'}; font-weight: 800; padding: 6px 12px; margin-bottom: 4px; border-radius: 6px; text-align: center; border: 1px solid ${isTop ? '#a5b4fc' : '#e2e8f0'};">
            '${op}' ${isTop ? '<span style="font-size: 10px; background: #6366f1; color: #fff; padding: 1px 4px; border-radius: 3px; margin-left: 6px;">TOP</span>' : ''}
          </div>
        `;
      }).reverse().join('');

  return `
    <div style="display: flex; flex-direction: column; gap: 12px; font-family: inherit;">
      <!-- Card 1: 扫描指示器 -->
      <div style="background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 10px; padding: 14px;">
        <div style="font-size: 12px; color: #64748b; margin-bottom: 6px;">
          🔤 表达式扫描序列 (Cursor = ${step.cursor >= 0 ? step.cursor : '准备/结算'})
        </div>
        <div style="overflow-x: auto; white-space: nowrap; padding-bottom: 6px;">
          ${exprChars}
        </div>
      </div>

      <!-- Card 2: 双栈视效 -->
      <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 12px;">
        <div style="background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 10px; padding: 12px;">
          <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px;">
            <span style="font-weight: 700; color: #15803d; font-size: 13px;">🔢 操作数栈 (Nums)</span>
            <span style="font-size: 11px; color: #64748b;">深度: ${step.numStack.length}</span>
          </div>
          <div style="max-height: 180px; overflow-y: auto; display: flex; flex-direction: column;">
            ${numStackItems}
          </div>
        </div>

        <div style="background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 10px; padding: 12px;">
          <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px;">
            <span style="font-weight: 700; color: #4338ca; font-size: 13px;">➕ 操作符栈 (Ops)</span>
            <span style="font-size: 11px; color: #64748b;">深度: ${step.opsStack.length}</span>
          </div>
          <div style="max-height: 180px; overflow-y: auto; display: flex; flex-direction: column;">
            ${opsStackItems}
          </div>
        </div>
      </div>

      <!-- Card 3: 运算指标 -->
      <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 10px; background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 10px; padding: 12px;">
        <div style="text-align: center;">
          <div style="font-size: 11px; color: #64748b;">当前 Token</div>
          <div style="font-size: 16px; font-weight: 800; color: #d97706;">${step.currentToken}</div>
        </div>
        <div style="text-align: center;">
          <div style="font-size: 11px; color: #64748b;">最近求值</div>
          <div style="font-size: 14px; font-weight: 700; color: #0284c7;">
            ${step.lastOpCalculated ? `${step.operandA} ${step.lastOpCalculated} ${step.operandB} = ${step.result}` : '等待触发'}
          </div>
        </div>
        <div style="text-align: center;">
          <div style="font-size: 11px; color: #64748b;">数栈顶当前值</div>
          <div style="font-size: 16px; font-weight: 800; color: #15803d;">
            ${step.numStack.length > 0 ? step.numStack[step.numStack.length - 1] : '-'}
          </div>
        </div>
      </div>

      ${renderFormulaCard(
        '算术表达式双栈通用解法',
        '乘除优先级高于加减；遇到左括号进栈阻隔；遇到右括号结算直至左括号；当前运算符入栈前清算更高/同级算符',
        step.decision,
        step.statusBadge
      )}
    </div>
  `;
}

export const basicCalculatorVisualizer = registerDeclarativeAlgorithm<CalculatorStep>({
  id: 'basic-calculator-full',
  name: '大厂高频真题: 全功能表达式计算器 (Basic Calculator)',
  category: 'stack',
  icon: '🧮',
  difficulty: 3,
  levelOrder: 772,
  learningGoal: '掌握双栈法（操作数栈 + 操作符栈）在 O(N) 时间内解析含加减乘除与括号的复杂表达式',
  problemHtml: `
    <div style="line-height: 1.6;">
      <h3>题目描述 (LeetCode 772)</h3>
      <p>实现一个全功能表达式计算器。表达式字符串包含非负整数、<code>+</code>、<code>-</code>、<code>*</code>、<code>/</code> 运算符以及圆括号 <code>(</code> 和 <code>)</code>。</p>
      <p>注意：整数除法仅保留整数部分。</p>
    </div>
  `,
  codeLanguages: BASIC_CALCULATOR_CODES,
  inputs: [
    {
      id: 'expression',
      label: '算术表达式',
      type: 'text',
      defaultValue: '(2 + 6 * 3) / (4 - 2) + 5',
    },
  ],
  generateSteps: (input) => {
    const expr = String(input.expression || '(2 + 6 * 3) / (4 - 2) + 5');
    return generateCalculatorSteps(expr);
  },
  renderCanvas: (container, step) => {
    container.innerHTML = `
      <div style="padding: 16px; background: #ffffff; border-radius: 12px;">
        ${renderCalculatorSandbox(step)}
      </div>
    `;
  },
});
