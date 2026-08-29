/**
 * LeetCode 14: 最长公共前缀 (Longest Common Prefix)
 * 领域知识与题解精讲配置声明
 */

export const LONGEST_COMMON_PREFIX_PROBLEM_HTML = `
  <div style="display: flex; flex-direction: column; gap: 12px; color: #cbd5e1; font-size: 12px; line-height: 1.6;">
    <div style="display: flex; align-items: center; gap: 8px;">
      <span style="padding: 2px 6px; border-radius: 4px; background: rgba(59,130,246,0.2); color: #60a5fa; font-weight: 700; border: 1px solid rgba(59,130,246,0.3);">LeetCode 14</span>
      <span style="padding: 2px 6px; border-radius: 4px; background: rgba(16,185,129,0.2); color: #34d399; font-weight: 700; border: 1px solid rgba(16,185,129,0.3);">Easy</span>
      <h2 style="font-size: 14px; font-weight: 700; color: #ffffff; margin: 0;">最长公共前缀 (Longest Common Prefix)</h2>
    </div>
    <p style="margin: 0;">编写一个函数来查找字符串数组中的最长公共前缀。如果不存在公共前缀，返回空字符串 <code style="color: #fde047; font-family: monospace;">""</code>。</p>
    <div style="padding: 10px; border-radius: 10px; background: #020617; border: 1px solid #1e293b; display: flex; flex-direction: column; gap: 6px; font-family: monospace; font-size: 11px;">
      <div style="color: #34d399; font-weight: 700;">示例 1:</div>
      <div>输入: strs = ["flower","flow","flight"]</div>
      <div>输出: "fl"</div>
    </div>
    <div style="padding: 10px; border-radius: 10px; background: #020617; border: 1px solid #1e293b; display: flex; flex-direction: column; gap: 6px; font-family: monospace; font-size: 11px;">
      <div style="color: #34d399; font-weight: 700;">示例 2:</div>
      <div>输入: strs = ["dog","racecar","car"]</div>
      <div>输出: "" (输入不存在公共前缀)</div>
    </div>
  </div>
`;

export const LONGEST_COMMON_PREFIX_ANALYSIS_HTML = `
  <div style="display: flex; flex-direction: column; gap: 12px; color: #cbd5e1; font-size: 12px; line-height: 1.6;">
    <h3 style="font-size: 14px; font-weight: 700; color: #ffffff; margin: 0; display: flex; align-items: center; gap: 6px;">
      <span>💡</span> 纵向逐列扫描法（Vertical Scanning）
    </h3>
    <div style="display: flex; flex-direction: column; gap: 8px;">
      <div style="padding: 10px; border-radius: 10px; background: #020617; border: 1px solid #1e293b;">
        <div style="font-weight: 700; color: #60a5fa; margin-bottom: 4px;">① 纵向扫描策略</div>
        <p style="margin: 0; color: #94a3b8;">
        以第一个字符串 <code style="color: #38bdf8; font-family: monospace;">strs[0]</code> 作为基准，逐列比对每一列字符：<br/>
        1. 遍历基准串第 <code style="color: #fbbf24; font-family: monospace;">col</code> 列字符 <code style="color: #38bdf8; font-family: monospace;">char c = strs[0][col]</code>；<br/>
        2. 遍历其他每个字符串 <code style="color: #a855f7; font-family: monospace;">strs[row]</code>：<br/>
        &nbsp;&nbsp;• 若 <code style="color: #f87171; font-family: monospace;">col == strs[row].length</code>（到达某字符串末尾）；<br/>
        &nbsp;&nbsp;• 或 <code style="color: #f87171; font-family: monospace;">strs[row][col] != c</code>（字符不一致）；<br/>
        &nbsp;&nbsp;• 则说明公共前缀终止，直接截取 <code style="color: #34d399; font-family: monospace;">strs[0].substring(0, col)</code> 返回；<br/>
        3. 若完整扫描完毕，返回基准串 <code style="color: #38bdf8; font-family: monospace;">strs[0]</code>。
        </p>
      </div>
      <div style="padding: 10px; border-radius: 10px; background: #020617; border: 1px solid #1e293b;">
        <div style="font-weight: 700; color: #34d399; margin-bottom: 4px;">② 优势对比</div>
        <p style="margin: 0; color: #94a3b8;">
        相比横向扫描两两求前缀，纵向扫描在最坏情况下性能一致，但在<strong>存在很短的字符串或者早期失配</strong>时能够极大提前退出，避免无效比对。
        </p>
      </div>
    </div>
  </div>
`;

export const LONGEST_COMMON_PREFIX_CODE_LANGUAGES: Record<string, string[]> = {
  java: [
    'public String longestCommonPrefix(String[] strs) {',
    '    if (strs == null || strs.length == 0) return "";',
    '    for (int col = 0; col < strs[0].length(); col++) {',
    '        char c = strs[0].charAt(col);',
    '        for (int row = 1; row < strs.length; row++) {',
    '            if (col == strs[row].length() || strs[row].charAt(col) != c) {',
    '                return strs[0].substring(0, col);',
    '            }',
    '        }',
    '    }',
    '    return strs[0];',
    '}',
  ],
  cpp: [
    'class Solution {',
    'public:',
    '    string longestCommonPrefix(vector<string>& strs) {',
    '        if (strs.empty()) return "";',
    '        for (int col = 0; col < strs[0].size(); col++) {',
    '            char c = strs[0][col];',
    '            for (int row = 1; row < strs.size(); row++) {',
    '                if (col == strs[row].size() || strs[row][col] != c) {',
    '                    return strs[0].substr(0, col);',
    '                }',
    '            }',
    '        }',
    '        return strs[0];',
    '    }',
    '};',
  ],
  python: [
    'class Solution:',
    '    def longestCommonPrefix(self, strs: List[str]) -> str:',
    '        if not strs: return ""',
    '        for col, chars in enumerate(zip(*strs)):',
    '            if len(set(chars)) > 1:',
    '                return strs[0][:col]',
    '        return min(strs, key=len)',
  ],
  javascript: [
    'var longestCommonPrefix = function(strs) {',
    '    if (!strs.length) return "";',
    '    for (let col = 0; col < strs[0].length; col++) {',
    '        const c = strs[0][col];',
    '        for (let row = 1; row < strs.length; row++) {',
    '            if (col === strs[row].length || strs[row][col] !== c) {',
    '                return strs[0].slice(0, col);',
    '            }',
    '        }',
    '    }',
    '    return strs[0];',
    '};',
  ],
};
