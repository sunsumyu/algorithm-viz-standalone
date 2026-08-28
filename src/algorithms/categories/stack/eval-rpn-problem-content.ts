/**
 * LeetCode 150: 逆波兰表达式求值 (Evaluate Reverse Polish Notation)
 * 领域知识与题解精讲配置声明
 */

export const EVAL_RPN_PROBLEM_HTML = `
  <div style="display: flex; flex-direction: column; gap: 12px; color: #cbd5e1; font-size: 12px; line-height: 1.6;">
    <div style="display: flex; align-items: center; gap: 8px;">
      <span style="padding: 2px 6px; border-radius: 4px; background: rgba(59,130,246,0.2); color: #60a5fa; font-weight: 700; border: 1px solid rgba(59,130,246,0.3);">LeetCode 150</span>
      <span style="padding: 2px 6px; border-radius: 4px; background: rgba(245,158,11,0.2); color: #fbbf24; font-weight: 700; border: 1px solid rgba(245,158,11,0.3);">Medium</span>
      <h2 style="font-size: 14px; font-weight: 700; color: #ffffff; margin: 0;">逆波兰表达式求值 (Evaluate RPN)</h2>
    </div>
    <p style="margin: 0;">给你一个字符串数组 <code style="color: #fde047; font-family: monospace;">tokens</code> ，表示一个根据 <strong>逆波兰表示法</strong> 表示的算术表达式。</p>
    <p style="margin: 0;">请你计算该表达式。返回一个表示表达式值的整数。</p>
    <div style="display: flex; flex-direction: column; gap: 4px; color: #94a3b8; font-size: 11.5px;">
      <div>• 有效的算符为 <code style="color: #7dd3fc; font-family: monospace;">'+'</code>、<code style="color: #7dd3fc; font-family: monospace;">'-'</code>、<code style="color: #7dd3fc; font-family: monospace;">'*'</code> 和 <code style="color: #7dd3fc; font-family: monospace;">'/'</code> 。</div>
      <div>• 每个操作数可以是整数或另一个表达式。</div>
      <div>• 两个整数之间的除法总是 <strong>向零截断</strong> （即 8 / 3 = 2, -7 / 3 = -2）。</div>
      <div>• 表达式中不包含除零运算。</div>
    </div>
    <div style="padding: 10px; border-radius: 10px; background: #020617; border: 1px solid #1e293b; display: flex; flex-direction: column; gap: 6px; font-family: monospace; font-size: 11px;">
      <div style="color: #34d399; font-weight: 700;">示例 1:</div>
      <div>输入: tokens = ["2","1","+","3","*"]</div>
      <div>输出: 9</div>
      <div>解释: 该算式转化为常见的中缀算术表达式为：((2 + 1) * 3) = 9</div>
    </div>
    <div style="padding: 10px; border-radius: 10px; background: #020617; border: 1px solid #1e293b; display: flex; flex-direction: column; gap: 6px; font-family: monospace; font-size: 11px;">
      <div style="color: #34d399; font-weight: 700;">示例 2:</div>
      <div>输入: tokens = ["4","13","5","/","+"]</div>
      <div>输出: 6</div>
      <div>解释: 该算式转化为常见的中缀算术表达式为：(4 + (13 / 5)) = 6</div>
    </div>
  </div>
`;

export const EVAL_RPN_ANALYSIS_HTML = `
  <div style="display: flex; flex-direction: column; gap: 12px; color: #cbd5e1; font-size: 12px; line-height: 1.6;">
    <h3 style="font-size: 14px; font-weight: 700; color: #ffffff; margin: 0; display: flex; align-items: center; gap: 6px;">
      <span>💡</span> 逆波兰表达式（后缀表达式）与栈的天然契合
    </h3>
    <div style="display: flex; flex-direction: column; gap: 8px;">
      <div style="padding: 10px; border-radius: 10px; background: #020617; border: 1px solid #1e293b;">
        <div style="font-weight: 700; color: #60a5fa; margin-bottom: 4px;">① 什么是逆波兰表达式？</div>
        <p style="margin: 0; color: #94a3b8;">
        逆波兰记法是一种没有括号的后缀表示法，运算符写在操作数的后面。<br/>
        计算机无需解析复杂的括号优先级，只需<strong>从左到右单向扫描</strong>并配合一个栈即可完成求值！
        </p>
      </div>
      <div style="padding: 10px; border-radius: 10px; background: #020617; border: 1px solid #1e293b;">
        <div style="font-weight: 700; color: #34d399; margin-bottom: 4px;">② 操作数先后顺序至关重要（注意减法与除法）</div>
        <p style="margin: 0; color: #94a3b8;">
        当遇到运算符时，连续从栈顶弹出两个操作数：<br/>
        • <strong>先弹出的</strong>是<strong>右操作数 b</strong>；<br/>
        • <strong>后弹出的</strong>是<strong>左操作数 a</strong>；<br/>
        • 计算结果为 <code style="color: #34d399; font-family: monospace;">a op b</code>（注意不是 b op a！例如对于 '-'，结果是 a - b），然后将结果压回栈中！
        </p>
      </div>
    </div>
  </div>
`;

export const EVAL_RPN_CODE_LANGUAGES: Record<string, string[]> = {
  java: [
    'public int evalRPN(String[] tokens) {',
    '    Stack<Integer> stack = new Stack<>();',
    '    for (String token : tokens) {',
    '        if (token.equals("+")) {',
    '            stack.push(stack.pop() + stack.pop());',
    '        } else if (token.equals("-")) {',
    '            int b = stack.pop(), a = stack.pop();',
    '            stack.push(a - b);',
    '        } else if (token.equals("*")) {',
    '            stack.push(stack.pop() * stack.pop());',
    '        } else if (token.equals("/")) {',
    '            int b = stack.pop(), a = stack.pop();',
    '            stack.push(a / b);',
    '        } else {',
    '            stack.push(Integer.parseInt(token));',
    '        }',
    '    }',
    '    return stack.pop();',
    '}',
  ],
  cpp: [
    'class Solution {',
    'public:',
    '    int evalRPN(vector<string>& tokens) {',
    '        stack<long long> st;',
    '        for (const string& s : tokens) {',
    '            if (s == "+" || s == "-" || s == "*" || s == "/") {',
    '                long long num2 = st.top(); st.pop();',
    '                long long num1 = st.top(); st.pop();',
    '                if (s == "+") st.push(num1 + num2);',
    '                if (s == "-") st.push(num1 - num2);',
    '                if (s == "*") st.push(num1 * num2);',
    '                if (s == "/") st.push(num1 / num2);',
    '            } else {',
    '                st.push(stoll(s));',
    '            }',
    '        }',
    '        return st.top();',
    '    }',
    '};',
  ],
  python: [
    'class Solution:',
    '    def evalRPN(self, tokens: List[str]) -> int:',
    '        stack = []',
    '        for token in tokens:',
    '            if token in "+-*/":',
    '                b, a = stack.pop(), stack.pop()',
    '                if token == "+": stack.append(a + b)',
    '                elif token == "-": stack.append(a - b)',
    '                elif token == "*": stack.append(a * b)',
    '                elif token == "/": stack.append(int(a / b))',
    '            else:',
    '                stack.append(int(token))',
    '        return stack.pop()',
  ],
  javascript: [
    'var evalRPN = function(tokens) {',
    '    const stack = [];',
    '    for (const token of tokens) {',
    '        if (token === \'+\' || token === \'-\' || token === \'*\' || token === \'/\') {',
    '            const b = stack.pop();',
    '            const a = stack.pop();',
    '            if (token === \'+\') stack.push(a + b);',
    '            else if (token === \'-\') stack.push(a - b);',
    '            else if (token === \'*\') stack.push(a * b);',
    '            else if (token === \'/\') stack.push(Math.trunc(a / b));',
    '        } else {',
    '            stack.push(Number(token));',
    '        }',
    '    }',
    '    return stack.pop();',
    '};',
  ],
};
