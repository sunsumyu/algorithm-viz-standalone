/**
 * LeetCode 242: 有效的字母异位词 (Valid Anagram)
 * 领域知识与题解精讲配置声明
 */

export const ANAGRAM_PROBLEM_HTML = `
  <div style="display: flex; flex-direction: column; gap: 12px; color: #cbd5e1; font-size: 12px; line-height: 1.6;">
    <div style="display: flex; align-items: center; gap: 8px;">
      <span style="padding: 2px 6px; border-radius: 4px; background: rgba(59,130,246,0.2); color: #60a5fa; font-weight: 700; border: 1px solid rgba(59,130,246,0.3);">LeetCode 242</span>
      <span style="padding: 2px 6px; border-radius: 4px; background: rgba(16,185,129,0.2); color: #34d399; font-weight: 700; border: 1px solid rgba(16,185,129,0.3);">Easy</span>
      <h2 style="font-size: 14px; font-weight: 700; color: #ffffff; margin: 0;">有效的字母异位词 (Valid Anagram)</h2>
    </div>
    <p style="margin: 0;">给定两个字符串 <code style="color: #fde047; font-family: monospace;">s</code> 和 <code style="color: #fde047; font-family: monospace;">t</code> ，编写一个函数来判断 <code style="color: #fde047; font-family: monospace;">t</code> 是否是 <code style="color: #fde047; font-family: monospace;">s</code> 的 <strong>字母异位词</strong>。</p>
    <p style="margin: 0;"><strong>字母异位词</strong> 是通过重新排列源单词的所有字母（每个字母恰好只用一次）而得到的新单词。</p>
    <div style="padding: 10px; border-radius: 10px; background: #020617; border: 1px solid #1e293b; display: flex; flex-direction: column; gap: 6px; font-family: monospace; font-size: 11px;">
      <div style="color: #34d399; font-weight: 700;">示例 1:</div>
      <div>输入: s = "anagram", t = "nagaram"</div>
      <div>输出: true</div>
    </div>
    <div style="padding: 10px; border-radius: 10px; background: #020617; border: 1px solid #1e293b; display: flex; flex-direction: column; gap: 6px; font-family: monospace; font-size: 11px;">
      <div style="color: #34d399; font-weight: 700;">示例 2:</div>
      <div>输入: s = "rat", t = "car"</div>
      <div>输出: false</div>
    </div>
  </div>
`;

export const ANAGRAM_ANALYSIS_HTML = `
  <div style="display: flex; flex-direction: column; gap: 12px; color: #cbd5e1; font-size: 12px; line-height: 1.6;">
    <h3 style="font-size: 14px; font-weight: 700; color: #ffffff; margin: 0; display: flex; align-items: center; gap: 6px;">
      <span>💡</span> 数组哈希表计数：以 26 个字母定长数组代替 HashMap
    </h3>
    <div style="display: flex; flex-direction: column; gap: 8px;">
      <div style="padding: 10px; border-radius: 10px; background: #020617; border: 1px solid #1e293b;">
        <div style="font-weight: 700; color: #60a5fa; margin-bottom: 4px;">① 字符哈希的基本原理</div>
        <p style="margin: 0; color: #94a3b8;">
        由于题目只包含小写英文字母 'a' ~ 'z'，我们可以使用一个长度为 26 的整型数组 <code style="color: #38bdf8; font-family: monospace;">record[26]</code> 作为精简哈希表。<br/>
        字符与索引的映射关系为：<code style="color: #fde047; font-family: monospace;">index = char - 'a'</code>。
        </p>
      </div>
      <div style="padding: 10px; border-radius: 10px; background: #020617; border: 1px solid #1e293b;">
        <div style="font-weight: 700; color: #34d399; margin-bottom: 4px;">② 统计与相互抵消</div>
        <p style="margin: 0; color: #94a3b8;">
        1. 首先检查两个字符串长度，若 <code style="color: #f87171; font-family: monospace;">s.length != t.length</code> 直接返回 false；<br/>
        2. 遍历字符串 <code style="color: #38bdf8; font-family: monospace;">s</code>，将对应字符频次加 1：<code style="color: #38bdf8; font-family: monospace;">record[s[i] - 'a']++</code>；<br/>
        3. 遍历字符串 <code style="color: #fbbf24; font-family: monospace;">t</code>，将对应字符频次减 1：<code style="color: #fbbf24; font-family: monospace;">record[t[i] - 'a']--</code>；<br/>
        4. 最后遍历 <code style="color: #a78bfa; font-family: monospace;">record</code> 数组，若所有元素均为 0，则说明两字符串字符完全匹配，互为字母异位词。
        </p>
      </div>
    </div>
  </div>
`;

export const ANAGRAM_CODE_LANGUAGES: Record<string, string[]> = {
  java: [
    'public boolean isAnagram(String s, String t) {',
    '    if (s.length() != t.length()) return false;',
    '    int[] record = new int[26];',
    '    for (int i = 0; i < s.length(); i++) {',
    '        record[s.charAt(i) - \'a\']++;',
    '    }',
    '    for (int i = 0; i < t.length(); i++) {',
    '        record[t.charAt(i) - \'a\']--;',
    '    }',
    '    for (int count : record) {',
    '        if (count != 0) return false;',
    '    }',
    '    return true;',
    '}',
  ],
  cpp: [
    'class Solution {',
    'public:',
    '    bool isAnagram(string s, string t) {',
    '        if (s.size() != t.size()) return false;',
    '        int record[26] = {0};',
    '        for (char c : s) record[c - \'a\']++;',
    '        for (char c : t) record[c - \'a\']--;',
    '        for (int i = 0; i < 26; i++) {',
    '            if (record[i] != 0) return false;',
    '        }',
    '        return true;',
    '    }',
    '};',
  ],
  python: [
    'class Solution:',
    '    def isAnagram(self, s: str, t: str) -> bool:',
    '        if len(s) != len(t):',
    '            return False',
    '        record = [0] * 26',
    '        for c in s:',
    '            record[ord(c) - ord("a")] += 1',
    '        for c in t:',
    '            record[ord(c) - ord("a")] -= 1',
    '        return all(x == 0 for x in record)',
  ],
  javascript: [
    'var isAnagram = function(s, t) {',
    '    if (s.length !== t.length) return false;',
    '    const record = new Array(26).fill(0);',
    '    const base = "a".charCodeAt(0);',
    '    for (let i = 0; i < s.length; i++) {',
    '        record[s.charCodeAt(i) - base]++;',
    '    }',
    '    for (let i = 0; i < t.length; i++) {',
    '        record[t.charCodeAt(i) - base]--;',
    '    }',
    '    return record.every(x => x === 0);',
    '};',
  ],
};
