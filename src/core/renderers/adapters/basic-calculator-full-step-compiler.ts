import { StepBase, HighlightTarget } from '../../step-visualizer';

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
  codeLine?: number | HighlightTarget;
  statusBadge?: { text: string; type: 'success' | 'warning' | 'danger' | 'info' };
  metrics?: Record<string, string | number>;
  ans?: string;
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
  let lastCalcStr = '等待触发';

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
    statusBadge: { text: '就绪', type: 'info' },
    metrics: {
      currentToken: 'START',
      numDepth: 0,
      opDepth: 0,
      lastEval: '等待触发',
    },
    ans: '-',
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
    lastCalcStr = `${a} ${op} ${b} = ${res}`;

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
      statusBadge: { text: `求值: ${res}`, type: 'warning' },
      metrics: {
        currentToken: op,
        numDepth: nums.length,
        opDepth: ops.length,
        lastEval: lastCalcStr,
      },
      ans: String(res),
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
        statusBadge: { text: `入栈: ${num}`, type: 'info' },
        metrics: {
          currentToken: String(num),
          numDepth: nums.length,
          opDepth: ops.length,
          lastEval: lastCalcStr,
        },
        ans: String(num),
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
        statusBadge: { text: '左括号 (', type: 'info' },
        metrics: {
          currentToken: '(',
          numDepth: nums.length,
          opDepth: ops.length,
          lastEval: lastCalcStr,
        },
        ans: nums.length > 0 ? String(nums[nums.length - 1]) : '-',
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
        statusBadge: { text: '收束括号 )', type: 'warning' },
        metrics: {
          currentToken: ')',
          numDepth: nums.length,
          opDepth: ops.length,
          lastEval: lastCalcStr,
        },
        ans: nums.length > 0 ? String(nums[nums.length - 1]) : '-',
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
          statusBadge: { text: '括号消除', type: 'success' },
          metrics: {
            currentToken: ')',
            numDepth: nums.length,
            opDepth: ops.length,
            lastEval: lastCalcStr,
          },
          ans: nums.length > 0 ? String(nums[nums.length - 1]) : '-',
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
          statusBadge: { text: '补 0', type: 'info' },
          metrics: {
            currentToken: `0${c}`,
            numDepth: nums.length,
            opDepth: ops.length,
            lastEval: lastCalcStr,
          },
          ans: nums.length > 0 ? String(nums[nums.length - 1]) : '-',
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
        statusBadge: { text: `入栈 op: ${c}`, type: 'info' },
        metrics: {
          currentToken: c,
          numDepth: nums.length,
          opDepth: ops.length,
          lastEval: lastCalcStr,
        },
        ans: nums.length > 0 ? String(nums[nums.length - 1]) : '-',
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
    result: finalResult,
    decision: `表达式全流程计算完毕，最终结果 = ${finalResult}`,
    message: `所有运算符已消化完毕，操作数栈顶元素即为最终表达式求值答案: ${finalResult}。`,
    log: `Finished. Result = ${finalResult}`,
    codeLine: 32,
    statusBadge: { text: `最终结果: ${finalResult}`, type: 'success' },
    metrics: {
      currentToken: 'END',
      numDepth: nums.length,
      opDepth: ops.length,
      lastEval: `最终结算: ${finalResult}`,
    },
    ans: String(finalResult),
  });

  return steps;
}
