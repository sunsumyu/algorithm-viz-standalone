/**
 * LeetCode 1047: 删除字符串中的所有相邻重复项 (Remove All Adjacent Duplicates In String)
 * 领域知识与题解精讲配置声明
 */

export const REMOVE_ADJACENT_DUPLICATES_PROBLEM_HTML = `
  <div style="display: flex; flex-direction: column; gap: 12px; color: #cbd5e1; font-size: 12px; line-height: 1.6;">
    <div style="display: flex; align-items: center; gap: 8px;">
      <span style="padding: 2px 6px; border-radius: 4px; background: rgba(59,130,246,0.2); color: #60a5fa; font-weight: 700; border: 1px solid rgba(59,130,246,0.3);">LeetCode 1047</span>
      <span style="padding: 2px 6px; border-radius: 4px; background: rgba(16,185,129,0.2); color: #34d399; font-weight: 700; border: 1px solid rgba(16,185,129,0.3);">Easy</span>
      <h2 style="font-size: 14px; font-weight: 700; color: #ffffff; margin: 0;">删除字符串中的所有相邻重复项</h2>
    </div>
    <p style="margin: 0;">给出由小写字母组成的字符串 <code style="color: #fde047; font-family: monospace;">s</code>，<strong>重复项删除操作</strong>会选择两个相邻且相同的字母，并删除它们。</p>
    <p style="margin: 0;">在 <code style="color: #fde047; font-family: monospace;">s</code> 上反复执行重复项删除操作，直到无法继续删除。</p>
    <p style="margin: 0;">在完成所有重复项删除操作后返回最终的字符串。答案保证唯一。</p>
    <div style="padding: 10px; border-radius: 10px; background: #020617; border: 1px solid #1e293b; display: flex; flex-direction: column; gap: 6px; font-family: monospace; font-size: 11px;">
      <div style="color: #34d399; font-weight: 700;">示例 1:</div>
      <div>输入: "abbaca"</div>
      <div>输出: "ca"</div>
      <div>解释: 例如，在 "abbaca" 中，我们可以删除 "bb" 由于两字母相邻且相同，这是此时唯一可以执行删除操作的重复项。之后我们得到字符串 "aaca"，其中又只有 "aa" 可以执行重复项删除操作，所以最后的字符串为 "ca"。</div>
    </div>
    <div style="padding: 10px; border-radius: 10px; background: #020617; border: 1px solid #1e293b; display: flex; flex-direction: column; gap: 6px; font-family: monospace; font-size: 11px;">
      <div style="color: #34d399; font-weight: 700;">示例 2:</div>
      <div>输入: "azxxzy"</div>
      <div>输出: "ay"</div>
    </div>
    <div style="display: flex; flex-direction: column; gap: 4px; color: #94a3b8; font-size: 11.5px;">
      <div style="font-weight: 700; color: #cbd5e1;">提示：</div>
      <div>• 1 &le; s.length &le; 10^5</div>
      <div>• s 仅由小写英文字母组成</div>
    </div>
  </div>
`;

export const REMOVE_ADJACENT_DUPLICATES_ANALYSIS_HTML = `
  <div style="display: flex; flex-direction: column; gap: 12px; color: #cbd5e1; font-size: 12px; line-height: 1.6;">
    <h3 style="font-size: 14px; font-weight: 700; color: #ffffff; margin: 0; display: flex; align-items: center; gap: 6px;">
      <span>💡</span> 消消乐原理：栈是存放“已扫描且尚未对消字符”的天然容器
    </h3>
    <div style="display: flex; flex-direction: column; gap: 8px;">
      <div style="padding: 10px; border-radius: 10px; background: #020617; border: 1px solid #1e293b;">
        <div style="font-weight: 700; color: #60a5fa; margin-bottom: 4px;">① 消除相邻重复项的本质</div>
        <p style="margin: 0; color: #94a3b8;">
        当两个相邻字符相同时，它们互相抵消消失。<br/>
        当中间的字符被消除后，原本不相邻的两个相同字符（如 <code style="color:#7dd3fc; font-family:monospace;">a(bb)a</code> 中的两个 <code style="color:#fbbf24; font-family:monospace;">'a'</code>）会瞬间变成新的相邻字符，再次触发连锁消除！
        </p>
      </div>
      <div style="padding: 10px; border-radius: 10px; background: #020617; border: 1px solid #1e293b;">
        <div style="font-weight: 700; color: #34d399; margin-bottom: 4px;">② 栈的操作过程</div>
        <p style="margin: 0; color: #94a3b8;">
        • 遍历字符串中的每个字符 <code style="color:#7dd3fc; font-family:monospace;">ch</code>；<br/>
        • 若栈不为空且栈顶元素等于 <code style="color:#7dd3fc; font-family:monospace;">ch</code>：说明找到了相邻重复对，直接将栈顶<strong>弹出 (pop)</strong>；<br/>
        • 否则：将 <code style="color:#7dd3fc; font-family:monospace;">ch</code> <strong>压入 (push)</strong> 栈顶；<br/>
        • 遍历结束后，栈内自底向上的字符即为最终化简后的答案！
        </p>
      </div>
    </div>
  </div>
`;

export const REMOVE_ADJACENT_DUPLICATES_CODE_LANGUAGES: Record<string, string[]> = {
  java: [
    'public String removeDuplicates(String s) {',
    '    StringBuilder sb = new StringBuilder();',
    '    for (char c : s.toCharArray()) {',
    '        if (sb.length() > 0 && sb.charAt(sb.length() - 1) == c) {',
    '            sb.deleteCharAt(sb.length() - 1);',
    '        } else {',
    '            sb.append(c);',
    '        }',
    '    }',
    '    return sb.toString();',
    '}',
  ],
  cpp: [
    'class Solution {',
    'public:',
    '    string removeDuplicates(string s) {',
    '        string result = "";',
    '        for (char c : s) {',
    '            if (!result.empty() && result.back() == c) {',
    '                result.pop_back();',
    '            } else {',
    '                result.push_back(c);',
    '            }',
    '        }',
    '        return result;',
    '    }',
    '};',
  ],
  python: [
    'class Solution:',
    '    def removeDuplicates(self, s: str) -> str:',
    '        stack = []',
    '        for ch in s:',
    '            if stack and stack[-1] == ch:',
    '                stack.pop()',
    '            else:',
    '                stack.append(ch)',
    '        return "".join(stack)',
  ],
  javascript: [
    'var removeDuplicates = function(s) {',
    '    const stack = [];',
    '    for (const ch of s) {',
    '        if (stack.length && stack[stack.length - 1] === ch) {',
    '            stack.pop();',
    '        } else {',
    '            stack.push(ch);',
    '        }',
    '    }',
    '    return stack.join(\'\');',
    '};',
  ],
};
