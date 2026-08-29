/**
 * 字符串迁移 / 循环移位判定 (Cyclic Shift Check / LC 796 旋转字符串)
 * 题目解析、算法精讲与四语言源码
 */

export const STRING_MIGRATION_PROBLEM_HTML = `
<div style="line-height: 1.7; font-size: 13.5px; color: #cbd5e1;">
  <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 12px;">
    <span style="font-weight: 800; font-size: 16px; color: #f8fafc;">力扣 796. 旋转字符串 / 字符串迁移</span>
    <span style="background: #065f46; color: #6ee7b7; font-size: 11px; font-weight: 700; padding: 2px 8px; border-radius: 4px;">简单 / Easy</span>
  </div>

  <p>给定两个字符串 <code>s</code> 和 <code>goal</code> ，只要在若干次 <strong>旋转操作</strong> 之后， <code>s</code> 能变成 <code>goal</code> ，那么返回 <code>true</code> 。</p>
  <p><code>s</code> 的 <strong>旋转操作</strong> 就是将 <code>s</code> 最左边的字符移动到最右边。 例如，若 <code>s = 'abcde'</code> ，在旋转一次之后结果就是 <code>'bcdea'</code> 。</p>

  <h4 style="color: #38bdf8; margin-top: 16px; margin-bottom: 8px;">示例 1：</h4>
  <pre style="background: #1e293b; padding: 10px; border-radius: 8px; font-size: 12px; color: #e2e8f0;"><strong>输入:</strong> s = "abcde", goal = "cdeab"
<strong>输出:</strong> true
<strong>解释:</strong> 经过 2 次左旋操作（偏移量 shift=2），"abcde" 变成 "cdeab"。</pre>
</div>
`;

export const STRING_MIGRATION_ANALYSIS_HTML = `
<div style="line-height: 1.7; font-size: 13.5px; color: #cbd5e1;">
  <h3 style="color: #38bdf8; margin-top: 0;">💡 核心思路：双倍拼接 (s + s) 与子串滑动窗口</h3>
  <p>判断一个字符串是否能通过旋转得到另一个字符串，经典的<strong>双倍拼接技巧</strong>极其高效：</p>

  <h4 style="color: #67e8f9; margin-top: 12px;">算法流程：</h4>
  <ol style="padding-left: 20px;">
    <li><strong>长度前提检查：</strong>如果 <code>s.length() != goal.length()</code>，则必然不可能通过旋转得到，直接返回 <code>false</code>。</li>
    <li><strong>双倍拼接：</strong>构建 <code>s + s</code>。由于 <code>s + s</code> 包含了 <code>s</code> 在所有可能旋转偏移量下的所有完整子串。</li>
    <li><strong>子串匹配：</strong>检查 <code>(s + s)</code> 中是否包含子串 <code>goal</code>（可通过滑动窗口单步可视化或 KMP 算法）：
      <ul>
        <li>若在下标 <code>i</code> 处匹配成功，说明 <code>goal</code> 为 <code>s</code> 经过左旋 <code>i</code> 步得到的字符串。</li>
        <li>若遍历结束未找到匹配，则返回 <code>false</code>。</li>
      </ul>
    </li>
  </ol>

  <h4 style="color: #67e8f9; margin-top: 12px;">复杂度分析</h4>
  <ul style="padding-left: 20px;">
    <li><strong>时间复杂度：</strong><code>O(N)</code>（使用 KMP 或内置 indexOf 算法）。</li>
    <li><strong>空间复杂度：</strong><code>O(N)</code>，用于保存拼接串 <code>s + s</code>。</li>
  </ul>
</div>
`;

export const STRING_MIGRATION_CODE_LANGUAGES: Record<string, string[]> = {
  java: [
    'class Solution {',
    '    public boolean rotateString(String s, String goal) {',
    '        if (s.length() != goal.length()) return false;',
    '        String concat = s + s;',
    '        return concat.contains(goal);',
    '    }',
    '}',
  ],
  cpp: [
    'class Solution {',
    'public:',
    '    bool rotateString(string s, string goal) {',
    '        return s.size() == goal.size() && (s + s).find(goal) != string::npos;',
    '    }',
    '};',
  ],
  python: [
    'class Solution:',
    '    def rotateString(self, s: str, goal: str) -> bool:',
    '        return len(s) == len(goal) and goal in (s + s)',
  ],
  javascript: [
    'var rotateString = function(s, goal) {',
    '    return s.length === goal.length && (s + s).includes(goal);',
    '};',
  ],
};
