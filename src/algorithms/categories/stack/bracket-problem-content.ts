/**
 * LeetCode 20: 有效的括号 (Valid Parentheses)
 * 领域知识与题解精讲配置声明
 */

export const BRACKET_PROBLEM_HTML = `
  <div style="display: flex; flex-direction: column; gap: 12px; color: #cbd5e1; font-size: 12px; line-height: 1.6;">
    <div style="display: flex; align-items: center; gap: 8px;">
      <span style="padding: 2px 6px; border-radius: 4px; background: rgba(59,130,246,0.2); color: #60a5fa; font-weight: 700; border: 1px solid rgba(59,130,246,0.3);">LeetCode 20</span>
      <span style="padding: 2px 6px; border-radius: 4px; background: rgba(16,185,129,0.2); color: #34d399; font-weight: 700; border: 1px solid rgba(16,185,129,0.3);">Easy</span>
      <h2 style="font-size: 14px; font-weight: 700; color: #ffffff; margin: 0;">有效的括号 (Valid Parentheses)</h2>
    </div>
    <p style="margin: 0;">给定一个只包括 <code style="color: #fde047; font-family: monospace;">'('</code>，<code style="color: #fde047; font-family: monospace;">')'</code>，<code style="color: #fde047; font-family: monospace;">'{'</code>，<code style="color: #fde047; font-family: monospace;">'}'</code>，<code style="color: #fde047; font-family: monospace;">'['</code>，<code style="color: #fde047; font-family: monospace;">']'</code> 的字符串 <code style="color: #fde047; font-family: monospace;">s</code> ，判断字符串是否有效。</p>
    <p style="margin: 0;">有效字符串需满足：</p>
    <div style="display: flex; flex-direction: column; gap: 4px; padding-left: 8px; color: #94a3b8;">
      <div>1. 左括号必须用相同类型的右括号闭合。</div>
      <div>2. 左括号必须以正确的顺序闭合。</div>
      <div>3. 每个右括号都有一个对应的相同类型的左括号。</div>
    </div>
    <div style="padding: 10px; border-radius: 10px; background: #020617; border: 1px solid #1e293b; display: flex; flex-direction: column; gap: 6px; font-family: monospace; font-size: 11px;">
      <div style="color: #34d399; font-weight: 700;">示例 1:</div>
      <div>输入: s = "()"</div>
      <div>输出: true</div>
    </div>
    <div style="padding: 10px; border-radius: 10px; background: #020617; border: 1px solid #1e293b; display: flex; flex-direction: column; gap: 6px; font-family: monospace; font-size: 11px;">
      <div style="color: #34d399; font-weight: 700;">示例 2:</div>
      <div>输入: s = "()[]{}"</div>
      <div>输出: true</div>
    </div>
    <div style="padding: 10px; border-radius: 10px; background: #020617; border: 1px solid #1e293b; display: flex; flex-direction: column; gap: 6px; font-family: monospace; font-size: 11px;">
      <div style="color: #f87171; font-weight: 700;">示例 3:</div>
      <div>输入: s = "(]"</div>
      <div>输出: false</div>
    </div>
    <div style="display: flex; flex-direction: column; gap: 4px; color: #94a3b8; font-size: 11.5px;">
      <div style="font-weight: 700; color: #cbd5e1;">提示：</div>
      <div>• 1 &le; s.length &le; 10^4</div>
      <div>• s 仅由括号 '()[]{}' 组成</div>
    </div>
  </div>
`;

export const BRACKET_ANALYSIS_HTML = `
  <div style="display: flex; flex-direction: column; gap: 12px; color: #cbd5e1; font-size: 12px; line-height: 1.6;">
    <h3 style="font-size: 14px; font-weight: 700; color: #ffffff; margin: 0; display: flex; align-items: center; gap: 6px;">
      <span>💡</span> 巧妙技巧：遇到左括号入栈对应的「右括号」，比对只需一步！
    </h3>
    <div style="display: flex; flex-direction: column; gap: 8px;">
      <div style="padding: 10px; border-radius: 10px; background: #020617; border: 1px solid #1e293b;">
        <div style="font-weight: 700; color: #60a5fa; margin-bottom: 4px;">① 三种括号不匹配情况分析</div>
        <p style="margin: 0; color: #94a3b8;">
        1. <strong>第一种情况</strong>：字符串里左括号多余，遍历完后栈不为空（如 <code style="color:#7dd3fc; font-family:monospace;">(()</code>）；<br/>
        2. <strong>第二种情况</strong>：括号没有多余，但括号类型匹配不上（如 <code style="color:#f87171; font-family:monospace;">(]</code>）；<br/>
        3. <strong>第三种情况</strong>：字符串里右括号多余，栈已提前为空（如 <code style="color:#f87171; font-family:monospace;">())</code>）。
        </p>
      </div>
      <div style="padding: 10px; border-radius: 10px; background: #020617; border: 1px solid #1e293b;">
        <div style="font-weight: 700; color: #34d399; margin-bottom: 4px;">② 为什么入栈对应的右括号？</div>
        <p style="margin: 0; color: #94a3b8;">
        在遇到左括号时，将对应的<strong>右括号</strong>入栈：<br/>
        • 遇到 <code style="color:#fbbf24; font-family:monospace;">'('</code> &rarr; 压入 <code style="color:#34d399; font-family:monospace;">')'</code>；<br/>
        • 遇到 <code style="color:#fbbf24; font-family:monospace;">'['</code> &rarr; 压入 <code style="color:#34d399; font-family:monospace;">']'</code>；<br/>
        • 遇到 <code style="color:#fbbf24; font-family:monospace;">'{'</code> &rarr; 压入 <code style="color:#34d399; font-family:monospace;">'}'</code>。<br/>
        这样当遍历到右括号时，只需判断当前字符是否等于栈顶元素 <code style="color:#34d399; font-family:monospace;">stack.pop() === c</code>，代码极度优雅！
        </p>
      </div>
    </div>
  </div>
`;

export const BRACKET_CODE_LANGUAGES: Record<string, string[]> = {
  java: [
    'public boolean isValid(String s) {',
    '    if (s.length() % 2 != 0) return false;',
    '    Stack<Character> stack = new Stack<>();',
    '    for (int i = 0; i < s.length(); i++) {',
    '        char c = s.charAt(i);',
    '        if (c == \'(\') stack.push(\')\');',
    '        else if (c == \'[\') stack.push(\']\');',
    '        else if (c == \'{\') stack.push(\'}\');',
    '        else if (stack.isEmpty() || stack.pop() != c) return false;',
    '    }',
    '    return stack.isEmpty();',
    '}',
  ],
  cpp: [
    'class Solution {',
    'public:',
    '    bool isValid(string s) {',
    '        if (s.size() % 2 != 0) return false;',
    '        stack<char> st;',
    '        for (char c : s) {',
    '            if (c == \'(\') st.push(\')\');',
    '            else if (c == \'[\') st.push(\']\');',
    '            else if (c == \'{\') st.push(\'}\');',
    '            else if (st.empty() || st.top() != c) return false;',
    '            else st.pop();',
    '        }',
    '        return st.empty();',
    '    }',
    '};',
  ],
  python: [
    'class Solution:',
    '    def isValid(self, s: str) -> bool:',
    '        if len(s) % 2 != 0:',
    '            return False',
    '        stack = []',
    '        mapping = {"(": ")", "[": "]", "{": "}"}',
    '        for char in s:',
    '            if char in mapping:',
    '                stack.append(mapping[char])',
    '            elif not stack or stack.pop() != char:',
    '                return False',
    '        return not stack',
  ],
  javascript: [
    'var isValid = function(s) {',
    '    if (s.length % 2 !== 0) return false;',
    '    const stack = [];',
    '    for (const c of s) {',
    '        if (c === \'(\') stack.push(\')\');',
    '        else if (c === \'[\') stack.push(\']\');',
    '        else if (c === \'{\') stack.push(\'}\');',
    '        else if (!stack.length || stack.pop() !== c) return false;',
    '    }',
    '    return stack.length === 0;',
    '};',
  ],
};
