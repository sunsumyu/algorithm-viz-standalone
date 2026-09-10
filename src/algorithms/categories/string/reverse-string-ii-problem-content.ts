/**
 * LeetCode 541: 反转字符串 II (Reverse String II)
 * 领域知识与题解精讲配置声明
 */

export const REVERSE_STRING_II_PROBLEM_HTML = `
  <div style="display: flex; flex-direction: column; gap: 12px; color: #cbd5e1; font-size: 12px; line-height: 1.6;">
    <div style="display: flex; align-items: center; gap: 8px;">
      <span style="padding: 2px 6px; border-radius: 4px; background: rgba(59,130,246,0.2); color: #60a5fa; font-weight: 700; border: 1px solid rgba(59,130,246,0.3);">LeetCode 541</span>
      <span style="padding: 2px 6px; border-radius: 4px; background: rgba(16,185,129,0.2); color: #34d399; font-weight: 700; border: 1px solid rgba(16,185,129,0.3);">Easy</span>
      <h2 style="font-size: 14px; font-weight: 700; color: #ffffff; margin: 0;">反转字符串 II (Reverse String II)</h2>
    </div>
    <p style="margin: 0;">给定一个字符串 <code style="color: #fde047; font-family: monospace;">s</code> 和一个整数 <code style="color: #fde047; font-family: monospace;">k</code>，从字符串开头算起，每计数至 <code style="color: #60a5fa; font-family: monospace;">2k</code> 个字符，就反转这 <code style="color: #60a5fa; font-family: monospace;">2k</code> 字符中的前 <code style="color: #34d399; font-family: monospace;">k</code> 个字符。</p>
    <p style="margin: 0;">• 如果剩余字符少于 <code style="color: #34d399; font-family: monospace;">k</code> 个，则将剩余字符全部反转。<br/>• 如果剩余字符小于 <code style="color: #60a5fa; font-family: monospace;">2k</code> 但大于或等于 <code style="color: #34d399; font-family: monospace;">k</code> 个，则反转前 <code style="color: #34d399; font-family: monospace;">k</code> 个字符，其余字符保持原样。</p>
    <div style="padding: 10px; border-radius: 10px; background: #020617; border: 1px solid #1e293b; display: flex; flex-direction: column; gap: 6px; font-family: monospace; font-size: 11px;">
      <div style="color: #34d399; font-weight: 700;">示例 1:</div>
      <div>输入: s = "abcdefg", k = 2</div>
      <div>输出: "bacdfeg"</div>
    </div>
    <div style="padding: 10px; border-radius: 10px; background: #020617; border: 1px solid #1e293b; display: flex; flex-direction: column; gap: 6px; font-family: monospace; font-size: 11px;">
      <div style="color: #34d399; font-weight: 700;">示例 2:</div>
      <div>输入: s = "abcd", k = 2</div>
      <div>输出: "bacd"</div>
    </div>
  </div>
`;

export const REVERSE_STRING_II_ANALYSIS_HTML = `
  <div style="display: flex; flex-direction: column; gap: 12px; color: #cbd5e1; font-size: 12px; line-height: 1.6;">
    <h3 style="font-size: 14px; font-weight: 700; color: #ffffff; margin: 0; display: flex; align-items: center; gap: 6px;">
      <span>💡</span> 分段步长 2k 跃迁 + 边界安全双指针
    </h3>
    <div style="display: flex; flex-direction: column; gap: 8px;">
      <div style="padding: 10px; border-radius: 10px; background: #020617; border: 1px solid #1e293b;">
        <div style="font-weight: 700; color: #60a5fa; margin-bottom: 4px;">① 2k 步长遍历模式</div>
        <p style="margin: 0; color: #94a3b8;">
        很多同学会试图一个字符一个字符遍历计数，这样写逻辑繁琐且容易越界。<br/>
        最佳解法是<strong>直接以 2k 为循环步长</strong>：<code style="color: #fde047; font-family: monospace;">for (int i = 0; i < n; i += 2 * k)</code>。<br/>
        对于每个起点 <code style="color: #38bdf8; font-family: monospace;">i</code>，待反转的前 k 个字符区间为 <code style="color: #34d399; font-family: monospace;">[i, min(i + k - 1, n - 1)]</code>。
        </p>
      </div>
      <div style="padding: 10px; border-radius: 10px; background: #020617; border: 1px solid #1e293b;">
        <div style="font-weight: 700; color: #34d399; margin-bottom: 4px;">② 统一边界处理</div>
        <p style="margin: 0; color: #94a3b8;">
        通过 <code style="color: #fbbf24; font-family: monospace;">Math.min(i + k - 1, n - 1)</code> 计算右边界：<br/>
        • 若剩余 &ge; k 个字符，<code style="color: #38bdf8; font-family: monospace;">i + k - 1 &le; n - 1</code>，精确反转前 k 个；<br/>
        • 若剩余 < k 个字符，右边界自动落到 <code style="color: #f87171; font-family: monospace;">n - 1</code>，将剩余所有字符全反转。<br/>
        两种分支完美统一，无需任何冗余 if-else！
        </p>
      </div>
    </div>
  </div>
`;

export const REVERSE_STRING_II_CODE_LANGUAGES: Record<string, string[]> = {
  java: [
    'public String reverseStr(String s, int k) {',
    '    char[] ch = s.toCharArray();',
    '    for (int i = 0; i < ch.length; i += 2 * k) {',
    '        int left = i;',
    '        int right = Math.min(ch.length - 1, i + k - 1);',
    '        while (left < right) {',
    '            char temp = ch[left];',
    '            ch[left] = ch[right];',
    '            ch[right] = temp;',
    '            left++;',
    '            right--;',
    '        }',
    '    }',
    '    return new String(ch);',
    '}',
  ],
  cpp: [
    'class Solution {',
    'public:',
    '    string reverseStr(string s, int k) {',
    '        for (int i = 0; i < s.size(); i += (2 * k)) {',
    '            // 1. 每隔 2k 个字符的前 k 个字符进行反转',
    '            // 2. 剩余字符小于 2k 但大于或等于 k 个，则反转前 k 个',
    '            if (i + k <= s.size()) {',
    '                reverse(s.begin() + i, s.begin() + i + k);',
    '            } else {',
    '                // 3. 剩余字符少于 k 个，全部反转',
    '                reverse(s.begin() + i, s.end());',
    '            }',
    '        }',
    '        return s;',
    '    }',
    '};',
  ],
  python: [
    'class Solution:',
    '    def reverseStr(self, s: str, k: int) -> str:',
    '        chars = list(s)',
    '        for i in range(0, len(chars), 2 * k):',
    '            chars[i:i+k] = reversed(chars[i:i+k])',
    '        return "".join(chars)',
  ],
  javascript: [
    'var reverseStr = function(s, k) {',
    '    const chars = s.split("");',
    '    for (let i = 0; i < chars.length; i += 2 * k) {',
    '        let left = i;',
    '        let right = Math.min(chars.length - 1, i + k - 1);',
    '        while (left < right) {',
    '            const temp = chars[left];',
    '            chars[left] = chars[right];',
    '            chars[right] = temp;',
    '            left++;',
    '            right--;',
    '        }',
    '    }',
    '    return chars.join("");',
    '};',
  ],
};
