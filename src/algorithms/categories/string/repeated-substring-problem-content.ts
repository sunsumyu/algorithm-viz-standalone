/**
 * LeetCode 459: 重复的子字符串 (Repeated Substring Pattern)
 * 领域知识与题解精讲配置声明
 */

export const REPEATED_SUBSTRING_PROBLEM_HTML = `
  <div style="display: flex; flex-direction: column; gap: 12px; color: #cbd5e1; font-size: 12px; line-height: 1.6;">
    <div style="display: flex; align-items: center; gap: 8px;">
      <span style="padding: 2px 6px; border-radius: 4px; background: rgba(59,130,246,0.2); color: #60a5fa; font-weight: 700; border: 1px solid rgba(59,130,246,0.3);">LeetCode 459</span>
      <span style="padding: 2px 6px; border-radius: 4px; background: rgba(16,185,129,0.2); color: #34d399; font-weight: 700; border: 1px solid rgba(16,185,129,0.3);">Easy</span>
      <h2 style="font-size: 14px; font-weight: 700; color: #ffffff; margin: 0;">重复的子字符串 (Repeated Substring Pattern)</h2>
    </div>
    <p style="margin: 0;">给定一个非空的字符串 <code style="color: #fde047; font-family: monospace;">s</code> ，检查是否可以通过由它的一个子串重复多次构成。</p>
    <div style="padding: 10px; border-radius: 10px; background: #020617; border: 1px solid #1e293b; display: flex; flex-direction: column; gap: 6px; font-family: monospace; font-size: 11px;">
      <div style="color: #34d399; font-weight: 700;">示例 1:</div>
      <div>输入: s = "abab"</div>
      <div>输出: true (可由子串 "ab" 重复两次构成)</div>
    </div>
    <div style="padding: 10px; border-radius: 10px; background: #020617; border: 1px solid #1e293b; display: flex; flex-direction: column; gap: 6px; font-family: monospace; font-size: 11px;">
      <div style="color: #34d399; font-weight: 700;">示例 2:</div>
      <div>输入: s = "aba"</div>
      <div>输出: false</div>
    </div>
    <div style="padding: 10px; border-radius: 10px; background: #020617; border: 1px solid #1e293b; display: flex; flex-direction: column; gap: 6px; font-family: monospace; font-size: 11px;">
      <div style="color: #34d399; font-weight: 700;">示例 3:</div>
      <div>输入: s = "abcabcabcabc"</div>
      <div>输出: true (可由子串 "abc" 重复四次构成)</div>
    </div>
  </div>
`;

export const REPEATED_SUBSTRING_ANALYSIS_HTML = `
  <div style="display: flex; flex-direction: column; gap: 12px; color: #cbd5e1; font-size: 12px; line-height: 1.6;">
    <h3 style="font-size: 14px; font-weight: 700; color: #ffffff; margin: 0; display: flex; align-items: center; gap: 6px;">
      <span>💡</span> KMP 前缀表的数论之美：最小重复子串周期判定
    </h3>
    <div style="display: flex; flex-direction: column; gap: 8px;">
      <div style="padding: 10px; border-radius: 10px; background: #020617; border: 1px solid #1e293b;">
        <div style="font-weight: 700; color: #60a5fa; margin-bottom: 4px;">① 最长相等前后缀与最小周期</div>
        <p style="margin: 0; color: #94a3b8;">
        如果一个长度为 <code style="color: #38bdf8; font-family: monospace;">n</code> 的字符串由重复子串构成，那么它的<strong>最长相等前后缀</strong>不包含的那个部分（即前缀表中未被覆盖的前段）就是该字符串的<strong>最小重复单元</strong>！<br/>
        其最小重复子串长度为：<code style="color: #fde047; font-family: monospace;">patternLen = n - next[n - 1]</code>。
        </p>
      </div>
      <div style="padding: 10px; border-radius: 10px; background: #020617; border: 1px solid #1e293b;">
        <div style="font-weight: 700; color: #34d399; margin-bottom: 4px;">② 判定充要条件</div>
        <p style="margin: 0; color: #94a3b8;">
        1. <code style="color: #38bdf8; font-family: monospace;">next[n - 1] > 0</code>（说明存在非空的最长相等前后缀）；<br/>
        2. <code style="color: #34d399; font-family: monospace;">n % (n - next[n - 1]) == 0</code>（说明整串长度能够被最小周期长度整除）。<br/>
        满足上述两个条件即为 true，否则为 false。时间复杂度仅为 <code style="color: #60a5fa; font-family: monospace;">O(n)</code>！
        </p>
      </div>
    </div>
  </div>
`;

export const REPEATED_SUBSTRING_CODE_LANGUAGES: Record<string, string[]> = {
  java: [
    'public boolean repeatedSubstringPattern(String s) {',
    '    if (s.length() <= 1) return false;',
    '    int n = s.length();',
    '    int[] next = new int[n];',
    '    getNext(next, s);',
    '    // 最长相等前后缀长度',
    '    int maxLPS = next[n - 1];',
    '    // 周期长度',
    '    int patternLen = n - maxLPS;',
    '    return maxLPS > 0 && n % patternLen == 0;',
    '}',
    '',
    'private void getNext(int[] next, String s) {',
    '    int j = 0;',
    '    next[0] = 0;',
    '    for (int i = 1; i < s.length(); i++) {',
    '        while (j > 0 && s.charAt(i) != s.charAt(j)) j = next[j - 1];',
    '        if (s.charAt(i) == s.charAt(j)) j++;',
    '        next[i] = j;',
    '    }',
    '}',
  ],
  cpp: [
    'class Solution {',
    'public:',
    '    bool repeatedSubstringPattern(string s) {',
    '        if (s.size() <= 1) return false;',
    '        int n = s.size();',
    '        vector<int> next(n, 0);',
    '        getNext(next, s);',
    '        int maxLPS = next[n - 1];',
    '        int patternLen = n - maxLPS;',
    '        return maxLPS > 0 && n % patternLen == 0;',
    '    }',
    'private:',
    '    void getNext(vector<int>& next, const string& s) {',
    '        int j = 0;',
    '        next[0] = 0;',
    '        for (int i = 1; i < s.size(); i++) {',
    '            while (j > 0 && s[i] != s[j]) j = next[j - 1];',
    '            if (s[i] == s[j]) j++;',
    '            next[i] = j;',
    '        }',
    '    }',
    '};',
  ],
  python: [
    'class Solution:',
    '    def repeatedSubstringPattern(self, s: str) -> bool:',
    '        # KMP Next 前缀表解法',
    '        n = len(s)',
    '        if n <= 1: return False',
    '        nxt = [0] * n',
    '        j = 0',
    '        for i in range(1, n):',
    '            while j > 0 and s[i] != s[j]:',
    '                j = nxt[j - 1]',
    '            if s[i] == s[j]:',
    '                j += 1',
    '            nxt[i] = j',
    '        max_lps = nxt[-1]',
    '        pattern_len = n - max_lps',
    '        return max_lps > 0 and n % pattern_len == 0',
  ],
  javascript: [
    'var repeatedSubstringPattern = function(s) {',
    '    const n = s.length;',
    '    if (n <= 1) return false;',
    '    const next = new Array(n).fill(0);',
    '    let j = 0;',
    '    for (let i = 1; i < n; i++) {',
    '        while (j > 0 && s[i] !== s[j]) j = next[j - 1];',
    '        if (s[i] === s[j]) j++;',
    '        next[i] = j;',
    '    }',
    '    const maxLPS = next[n - 1];',
    '    const patternLen = n - maxLPS;',
    '    return maxLPS > 0 && n % patternLen === 0;',
    '};',
  ],
};
