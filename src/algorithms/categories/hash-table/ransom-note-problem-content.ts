/**
 * LeetCode 383: 赎金信 (Ransom Note)
 * 领域知识与题解精讲配置声明
 */

export const RANSOM_NOTE_PROBLEM_HTML = `
  <div style="display: flex; flex-direction: column; gap: 12px; color: #cbd5e1; font-size: 12px; line-height: 1.6;">
    <div style="display: flex; align-items: center; gap: 8px;">
      <span style="padding: 2px 6px; border-radius: 4px; background: rgba(59,130,246,0.2); color: #60a5fa; font-weight: 700; border: 1px solid rgba(59,130,246,0.3);">LeetCode 383</span>
      <span style="padding: 2px 6px; border-radius: 4px; background: rgba(16,185,129,0.2); color: #34d399; font-weight: 700; border: 1px solid rgba(16,185,129,0.3);">Easy</span>
      <h2 style="font-size: 14px; font-weight: 700; color: #ffffff; margin: 0;">赎金信 (Ransom Note)</h2>
    </div>
    <p style="margin: 0;">给你两个字符串：<code style="color: #fde047; font-family: monospace;">ransomNote</code> 和 <code style="color: #fde047; font-family: monospace;">magazine</code> ，判断 <code style="color: #fde047; font-family: monospace;">ransomNote</code> 能不能由 <code style="color: #fde047; font-family: monospace;">magazine</code> 里面的字符构成。</p>
    <p style="margin: 0;">如果可以，返回 <code style="color: #34d399; font-family: monospace;">true</code> ；否则返回 <code style="color: #f87171; font-family: monospace;">false</code> 。</p>
    <p style="margin: 0;"><code style="color: #fde047; font-family: monospace;">magazine</code> 中的每个字符只能在 <code style="color: #fde047; font-family: monospace;">ransomNote</code> 中使用一次。</p>
    <div style="padding: 10px; border-radius: 10px; background: #020617; border: 1px solid #1e293b; display: flex; flex-direction: column; gap: 6px; font-family: monospace; font-size: 11px;">
      <div style="color: #34d399; font-weight: 700;">示例 1:</div>
      <div>输入: ransomNote = "a", magazine = "b"</div>
      <div>输出: false</div>
    </div>
    <div style="padding: 10px; border-radius: 10px; background: #020617; border: 1px solid #1e293b; display: flex; flex-direction: column; gap: 6px; font-family: monospace; font-size: 11px;">
      <div style="color: #34d399; font-weight: 700;">示例 2:</div>
      <div>输入: ransomNote = "aa", magazine = "ab"</div>
      <div>输出: false</div>
    </div>
    <div style="padding: 10px; border-radius: 10px; background: #020617; border: 1px solid #1e293b; display: flex; flex-direction: column; gap: 6px; font-family: monospace; font-size: 11px;">
      <div style="color: #34d399; font-weight: 700;">示例 3:</div>
      <div>输入: ransomNote = "aa", magazine = "aab"</div>
      <div>输出: true</div>
    </div>
  </div>
`;

export const RANSOM_NOTE_ANALYSIS_HTML = `
  <div style="display: flex; flex-direction: column; gap: 12px; color: #cbd5e1; font-size: 12px; line-height: 1.6;">
    <h3 style="font-size: 14px; font-weight: 700; color: #ffffff; margin: 0; display: flex; align-items: center; gap: 6px;">
      <span>💡</span> 26 字符哈希计数：字符空间充足性校验
    </h3>
    <div style="display: flex; flex-direction: column; gap: 8px;">
      <div style="padding: 10px; border-radius: 10px; background: #020617; border: 1px solid #1e293b;">
        <div style="font-weight: 700; color: #60a5fa; margin-bottom: 4px;">① 字符供需关系与定长数组</div>
        <p style="margin: 0; color: #94a3b8;">
        magazine 是「字符供应库」，ransomNote 是「字符需求单」。<br/>
        因为只包含小写英文字母，用一个长度为 26 的整型数组 <code style="color: #38bdf8; font-family: monospace;">record[26]</code> 即可充当哈希表，相比 HashMap 更加轻量快速且没有哈希碰撞开销。
        </p>
      </div>
      <div style="padding: 10px; border-radius: 10px; background: #020617; border: 1px solid #1e293b;">
        <div style="font-weight: 700; color: #34d399; margin-bottom: 4px;">② 算法执行流程</div>
        <p style="margin: 0; color: #94a3b8;">
        1. 若 <code style="color: #f87171; font-family: monospace;">ransomNote.length > magazine.length</code>，供应库字符总数不足，直接返回 false；<br/>
        2. 遍历 <code style="color: #38bdf8; font-family: monospace;">magazine</code>，将字符对应的槽位加 1：<code style="color: #38bdf8; font-family: monospace;">record[c - 'a']++</code>；<br/>
        3. 遍历 <code style="color: #fbbf24; font-family: monospace;">ransomNote</code>，将字符对应的槽位减 1：<code style="color: #fbbf24; font-family: monospace;">record[c - 'a']--</code>；<br/>
        4. 只要减完后发现 <code style="color: #f87171; font-family: monospace;">record[c - 'a'] < 0</code>，说明供应不足（该字符透支），立即返回 false；<br/>
        5. 顺利完成全部字符扣减，说明能够构成赎金信，返回 true。
        </p>
      </div>
    </div>
  </div>
`;

export const RANSOM_NOTE_CODE_LANGUAGES: Record<string, string[]> = {
  java: [
    'public boolean canConstruct(String ransomNote, String magazine) {',
    '    if (ransomNote.length() > magazine.length()) return false;',
    '    int[] record = new int[26];',
    '    for (char c : magazine.toCharArray()) {',
    '        record[c - \'a\']++;',
    '    }',
    '    for (char c : ransomNote.toCharArray()) {',
    '        record[c - \'a\']--;',
    '        if (record[c - \'a\'] < 0) {',
    '            return false;',
    '        }',
    '    }',
    '    return true;',
    '}',
  ],
  cpp: [
    'class Solution {',
    'public:',
    '    bool canConstruct(string ransomNote, string magazine) {',
    '        if (ransomNote.size() > magazine.size()) return false;',
    '        int record[26] = {0};',
    '        for (char c : magazine) {',
    '            record[c - \'a\']++;',
    '        }',
    '        for (char c : ransomNote) {',
    '            record[c - \'a\']--;',
    '            if (record[c - \'a\'] < 0) return false;',
    '        }',
    '        return true;',
    '    }',
    '};',
  ],
  python: [
    'class Solution:',
    '    def canConstruct(self, ransomNote: str, magazine: str) -> bool:',
    '        if len(ransomNote) > len(magazine):',
    '            return False',
    '        record = Counter(magazine)',
    '        for c in ransomNote:',
    '            if record[c] <= 0:',
    '                return False',
    '            record[c] -= 1',
    '        return True',
  ],
  javascript: [
    'var canConstruct = function(ransomNote, magazine) {',
    '    if (ransomNote.length > magazine.length) return false;',
    '    const record = new Array(26).fill(0);',
    '    const base = "a".charCodeAt(0);',
    '    for (let i = 0; i < magazine.length; i++) {',
    '        record[magazine.charCodeAt(i) - base]++;',
    '    }',
    '    for (let i = 0; i < ransomNote.length; i++) {',
    '        const idx = ransomNote.charCodeAt(i) - base;',
    '        record[idx]--;',
    '        if (record[idx] < 0) return false;',
    '    }',
    '    return true;',
    '};',
  ],
};
