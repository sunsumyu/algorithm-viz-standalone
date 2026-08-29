/**
 * LeetCode 344: 反转字符串 (Reverse String)
 * 领域知识与题解精讲配置声明
 */

export const REVERSE_STRING_PROBLEM_HTML = `
  <div style="display: flex; flex-direction: column; gap: 12px; color: #cbd5e1; font-size: 12px; line-height: 1.6;">
    <div style="display: flex; align-items: center; gap: 8px;">
      <span style="padding: 2px 6px; border-radius: 4px; background: rgba(59,130,246,0.2); color: #60a5fa; font-weight: 700; border: 1px solid rgba(59,130,246,0.3);">LeetCode 344</span>
      <span style="padding: 2px 6px; border-radius: 4px; background: rgba(16,185,129,0.2); color: #34d399; font-weight: 700; border: 1px solid rgba(16,185,129,0.3);">Easy</span>
      <h2 style="font-size: 14px; font-weight: 700; color: #ffffff; margin: 0;">反转字符串 (Reverse String)</h2>
    </div>
    <p style="margin: 0;">编写一个函数，其作用是将输入的字符串反转过来。输入字符串以字符数组 <code style="color: #fde047; font-family: monospace;">s</code> 的形式给出。</p>
    <p style="margin: 0;">不要给另外的数组分配额外的空间，你必须 <strong>原地修改输入数组</strong>、使用 <code style="color: #34d399; font-family: monospace;">O(1)</code> 的额外空间解决这一问题。</p>
    <div style="padding: 10px; border-radius: 10px; background: #020617; border: 1px solid #1e293b; display: flex; flex-direction: column; gap: 6px; font-family: monospace; font-size: 11px;">
      <div style="color: #34d399; font-weight: 700;">示例 1:</div>
      <div>输入: s = ["h","e","l","l","o"]</div>
      <div>输出: ["o","l","l","e","h"]</div>
    </div>
    <div style="padding: 10px; border-radius: 10px; background: #020617; border: 1px solid #1e293b; display: flex; flex-direction: column; gap: 6px; font-family: monospace; font-size: 11px;">
      <div style="color: #34d399; font-weight: 700;">示例 2:</div>
      <div>输入: s = ["H","a","n","n","a","h"]</div>
      <div>输出: ["h","a","n","n","a","H"]</div>
    </div>
  </div>
`;

export const REVERSE_STRING_ANALYSIS_HTML = `
  <div style="display: flex; flex-direction: column; gap: 12px; color: #cbd5e1; font-size: 12px; line-height: 1.6;">
    <h3 style="font-size: 14px; font-weight: 700; color: #ffffff; margin: 0; display: flex; align-items: center; gap: 6px;">
      <span>💡</span> 首尾对撞双指针：最纯粹的原地反转模型
    </h3>
    <div style="display: flex; flex-direction: column; gap: 8px;">
      <div style="padding: 10px; border-radius: 10px; background: #020617; border: 1px solid #1e293b;">
        <div style="font-weight: 700; color: #60a5fa; margin-bottom: 4px;">① 双指针向中心对撞</div>
        <p style="margin: 0; color: #94a3b8;">
        1. 定义左指针 <code style="color: #38bdf8; font-family: monospace;">left = 0</code>，右指针 <code style="color: #fbbf24; font-family: monospace;">right = s.length - 1</code>；<br/>
        2. 当 <code style="color: #34d399; font-family: monospace;">left < right</code> 时，交换 <code style="color: #38bdf8; font-family: monospace;">s[left]</code> 和 <code style="color: #fbbf24; font-family: monospace;">s[right]</code>；<br/>
        3. 左指针右移 <code style="color: #38bdf8; font-family: monospace;">left++</code>，右指针左移 <code style="color: #fbbf24; font-family: monospace;">right--</code>；<br/>
        4. 循环直至双指针相遇或交错，原地完成反转。
        </p>
      </div>
      <div style="padding: 10px; border-radius: 10px; background: #020617; border: 1px solid #1e293b;">
        <div style="font-weight: 700; color: #f472b6; margin-bottom: 4px;">② 复杂度分析</div>
        <p style="margin: 0; color: #94a3b8;">
        • 时间复杂度：<code style="color: #60a5fa; font-family: monospace;">O(n)</code>，一共执行 n/2 次字符交换。<br/>
        • 空间复杂度：<code style="color: #34d399; font-family: monospace;">O(1)</code>，仅使用常数个指针变量。
        </p>
      </div>
    </div>
  </div>
`;

export const REVERSE_STRING_CODE_LANGUAGES: Record<string, string[]> = {
  java: [
    'public void reverseString(char[] s) {',
    '    int left = 0, right = s.length - 1;',
    '    while (left < right) {',
    '        char temp = s[left];',
    '        s[left] = s[right];',
    '        s[right] = temp;',
    '        left++;',
    '        right--;',
    '    }',
    '}',
  ],
  cpp: [
    'class Solution {',
    'public:',
    '    void reverseString(vector<char>& s) {',
    '        int left = 0, right = s.size() - 1;',
    '        while (left < right) {',
    '            swap(s[left], s[right]);',
    '            left++;',
    '            right--;',
    '        }',
    '    }',
    '};',
  ],
  python: [
    'class Solution:',
    '    def reverseString(self, s: List[str]) -> None:',
    '        left, right = 0, len(s) - 1',
    '        while left < right:',
    '            s[left], s[right] = s[right], s[left]',
    '            left += 1',
    '            right -= 1',
  ],
  javascript: [
    'var reverseString = function(s) {',
    '    let left = 0, right = s.length - 1;',
    '    while (left < right) {',
    '        const temp = s[left];',
    '        s[left] = s[right];',
    '        s[right] = temp;',
    '        left++;',
    '        right--;',
    '    }',
    '};',
  ],
};
