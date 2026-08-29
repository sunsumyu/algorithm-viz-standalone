/**
 * LeetCode 28: 找出字符串中第一个匹配项的下标 (KMP 算法)
 * 领域知识与题解精讲配置声明
 */

export const STR_STR_PROBLEM_HTML = `
  <div style="display: flex; flex-direction: column; gap: 12px; color: #cbd5e1; font-size: 12px; line-height: 1.6;">
    <div style="display: flex; align-items: center; gap: 8px;">
      <span style="padding: 2px 6px; border-radius: 4px; background: rgba(59,130,246,0.2); color: #60a5fa; font-weight: 700; border: 1px solid rgba(59,130,246,0.3);">LeetCode 28</span>
      <span style="padding: 2px 6px; border-radius: 4px; background: rgba(245,158,11,0.2); color: #fbbf24; font-weight: 700; border: 1px solid rgba(245,158,11,0.3);">Medium</span>
      <h2 style="font-size: 14px; font-weight: 700; color: #ffffff; margin: 0;">实现 strStr() (KMP 字符串匹配)</h2>
    </div>
    <p style="margin: 0;">给你两个字符串 <code style="color: #fde047; font-family: monospace;">haystack</code> 和 <code style="color: #fde047; font-family: monospace;">needle</code> ，请你在 <code style="color: #fde047; font-family: monospace;">haystack</code> 字符串中找出 <code style="color: #fde047; font-family: monospace;">needle</code> 字符串的第一个匹配项的下标（下标从 0 开始）。</p>
    <p style="margin: 0;">如果 <code style="color: #fde047; font-family: monospace;">needle</code> 不是 <code style="color: #fde047; font-family: monospace;">haystack</code> 的一部分，则返回 <code style="color: #f87171; font-family: monospace;">-1</code> 。</p>
    <div style="padding: 10px; border-radius: 10px; background: #020617; border: 1px solid #1e293b; display: flex; flex-direction: column; gap: 6px; font-family: monospace; font-size: 11px;">
      <div style="color: #34d399; font-weight: 700;">示例 1:</div>
      <div>输入: haystack = "sadbutsad", needle = "sad"</div>
      <div>输出: 0</div>
    </div>
    <div style="padding: 10px; border-radius: 10px; background: #020617; border: 1px solid #1e293b; display: flex; flex-direction: column; gap: 6px; font-family: monospace; font-size: 11px;">
      <div style="color: #34d399; font-weight: 700;">示例 2:</div>
      <div>输入: haystack = "leetcode", needle = "leeto"</div>
      <div>输出: -1</div>
    </div>
  </div>
`;

export const STR_STR_ANALYSIS_HTML = `
  <div style="display: flex; flex-direction: column; gap: 12px; color: #cbd5e1; font-size: 12px; line-height: 1.6;">
    <h3 style="font-size: 14px; font-weight: 700; color: #ffffff; margin: 0; display: flex; align-items: center; gap: 6px;">
      <span>💡</span> KMP 算法核心：前缀表（next 数组）与无回溯主串扫描
    </h3>
    <div style="display: flex; flex-direction: column; gap: 8px;">
      <div style="padding: 10px; border-radius: 10px; background: #020617; border: 1px solid #1e293b;">
        <div style="font-weight: 700; color: #60a5fa; margin-bottom: 4px;">① 前缀表 (next 数组) 的物理意义</div>
        <p style="margin: 0; color: #94a3b8;">
        前缀表记录了模式串 needle 中<strong>以各位置结尾的子串的最长相等前后缀长度</strong>。<br/>
        当模式串在下标 <code style="color: #fbbf24; font-family: monospace;">j</code> 处与主串失配时，<strong>主串指针 i 绝不回退</strong>，模式串指针只需回退到 <code style="color: #38bdf8; font-family: monospace;">j = next[j - 1]</code>，直接跳过已知的最长重复前缀！
        </p>
      </div>
      <div style="padding: 10px; border-radius: 10px; background: #020617; border: 1px solid #1e293b;">
        <div style="font-weight: 700; color: #34d399; margin-bottom: 4px;">② 算法执行两部曲</div>
        <p style="margin: 0; color: #94a3b8;">
        1. <strong>getNext(needle)：</strong> 计算前缀表 next[0..m-1]；<br/>
        2. <strong>主串匹配：</strong> 遍历主串 <code style="color: #38bdf8; font-family: monospace;">i = 0..n-1</code>，若 <code style="color: #f87171; font-family: monospace;">haystack[i] != needle[j]</code>，通过循环回退 <code style="color: #fbbf24; font-family: monospace;">j = next[j - 1]</code>；若匹配则 <code style="color: #34d399; font-family: monospace;">j++</code>；当 <code style="color: #34d399; font-family: monospace;">j == needle.length</code> 时命中，返回 <code style="color: #34d399; font-family: monospace;">i - m + 1</code>。
        </p>
      </div>
    </div>
  </div>
`;

export const STR_STR_CODE_LANGUAGES: Record<string, string[]> = {
  java: [
    'public int strStr(String haystack, String needle) {',
    '    if (needle.length() == 0) return 0;',
    '    int[] next = new int[needle.length()];',
    '    getNext(next, needle);',
    '    int j = 0;',
    '    for (int i = 0; i < haystack.length(); i++) {',
    '        while (j > 0 && haystack.charAt(i) != needle.charAt(j)) {',
    '            j = next[j - 1]; // 模式串回退',
    '        }',
    '        if (haystack.charAt(i) == needle.charAt(j)) j++;',
    '        if (j == needle.length()) {',
    '            return i - needle.length() + 1; // 成功匹配',
    '        }',
    '    }',
    '    return -1;',
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
    '    int strStr(string haystack, string needle) {',
    '        if (needle.empty()) return 0;',
    '        vector<int> next(needle.size());',
    '        getNext(next, needle);',
    '        int j = 0;',
    '        for (int i = 0; i < haystack.size(); i++) {',
    '            while (j > 0 && haystack[i] != needle[j]) {',
    '                j = next[j - 1];',
    '            }',
    '            if (haystack[i] == needle[j]) j++;',
    '            if (j == needle.size()) return i - needle.size() + 1;',
    '        }',
    '        return -1;',
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
    '    def strStr(self, haystack: str, needle: str) -> int:',
    '        if not needle: return 0',
    '        # KMP Next 前缀表',
    '        nxt = [0] * len(needle)',
    '        j = 0',
    '        for i in range(1, len(needle)):',
    '            while j > 0 and needle[i] != needle[j]:',
    '                j = nxt[j - 1]',
    '            if needle[i] == needle[j]:',
    '                j += 1',
    '            nxt[i] = j',
    '        j = 0',
    '        for i in range(len(haystack)):',
    '            while j > 0 and haystack[i] != needle[j]:',
    '                j = nxt[j - 1]',
    '            if haystack[i] == needle[j]:',
    '                j += 1',
    '            if j == len(needle):',
    '                return i - len(needle) + 1',
    '        return -1',
  ],
  javascript: [
    'var strStr = function(haystack, needle) {',
    '    if (!needle.length) return 0;',
    '    const next = new Array(needle.length).fill(0);',
    '    let j = 0;',
    '    for (let i = 1; i < needle.length; i++) {',
    '        while (j > 0 && needle[i] !== needle[j]) j = next[j - 1];',
    '        if (needle[i] === needle[j]) j++;',
    '        next[i] = j;',
    '    }',
    '    j = 0;',
    '    for (let i = 0; i < haystack.length; i++) {',
    '        while (j > 0 && haystack[i] !== needle[j]) j = next[j - 1];',
    '        if (haystack[i] === needle[j]) j++;',
    '        if (j === needle.length) return i - needle.length + 1;',
    '    }',
    '    return -1;',
    '};',
  ],
};
