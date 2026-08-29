/**
 * KamaCoder 55: 右旋转字符串 (Right Rotate String)
 * 领域知识与题解精讲配置声明
 */

export const RIGHT_ROTATE_STRING_PROBLEM_HTML = `
  <div style="display: flex; flex-direction: column; gap: 12px; color: #cbd5e1; font-size: 12px; line-height: 1.6;">
    <div style="display: flex; align-items: center; gap: 8px;">
      <span style="padding: 2px 6px; border-radius: 4px; background: rgba(59,130,246,0.2); color: #60a5fa; font-weight: 700; border: 1px solid rgba(59,130,246,0.3);">KamaCoder 55</span>
      <span style="padding: 2px 6px; border-radius: 4px; background: rgba(16,185,129,0.2); color: #34d399; font-weight: 700; border: 1px solid rgba(16,185,129,0.3);">Easy</span>
      <h2 style="font-size: 14px; font-weight: 700; color: #ffffff; margin: 0;">右旋转字符串 (Right Rotate String)</h2>
    </div>
    <p style="margin: 0;">字符串的右旋转操作是把字符串尾部的若干个字符转移到字符串的前面。给定一个字符串 <code style="color: #fde047; font-family: monospace;">s</code> 和一个正整数 <code style="color: #fde047; font-family: monospace;">k</code>，请你实现一个函数，将字符串中的字符向右旋转 <code style="color: #38bdf8; font-family: monospace;">k</code> 个位置。</p>
    <div style="padding: 10px; border-radius: 10px; background: #020617; border: 1px solid #1e293b; display: flex; flex-direction: column; gap: 6px; font-family: monospace; font-size: 11px;">
      <div style="color: #34d399; font-weight: 700;">示例 1:</div>
      <div>输入: s = "abcdefg", k = 2</div>
      <div>输出: "fgabcde"</div>
    </div>
    <div style="padding: 10px; border-radius: 10px; background: #020617; border: 1px solid #1e293b; display: flex; flex-direction: column; gap: 6px; font-family: monospace; font-size: 11px;">
      <div style="color: #34d399; font-weight: 700;">示例 2:</div>
      <div>输入: s = "lrloseumgh", k = 6</div>
      <div>输出: "umghlrlose"</div>
    </div>
  </div>
`;

export const RIGHT_ROTATE_STRING_ANALYSIS_HTML = `
  <div style="display: flex; flex-direction: column; gap: 12px; color: #cbd5e1; font-size: 12px; line-height: 1.6;">
    <h3 style="font-size: 14px; font-weight: 700; color: #ffffff; margin: 0; display: flex; align-items: center; gap: 6px;">
      <span>💡</span> 巧妙的三次反转法（O(1) 辅助空间）
    </h3>
    <div style="display: flex; flex-direction: column; gap: 8px;">
      <div style="padding: 10px; border-radius: 10px; background: #020617; border: 1px solid #1e293b;">
        <div style="font-weight: 700; color: #60a5fa; margin-bottom: 4px;">① 三次反转推导</div>
        <p style="margin: 0; color: #94a3b8;">
        为了在不申请新数组的情况下实现 <code style="color: #34d399; font-family: monospace;">O(1)</code> 空间旋转：<br/>
        1. <strong>反转整个字符串：</strong> 将所有字符全部倒序；<br/>
        2. <strong>反转前 k 个字符：</strong> 让原本尾部的 k 个字符恢复原内部语序并停留在前部；<br/>
        3. <strong>反转剩余 n - k 个字符：</strong> 让原本前部的字符恢复原内部语序并停留在后部。
        </p>
      </div>
      <div style="padding: 10px; border-radius: 10px; background: #020617; border: 1px solid #1e293b;">
        <div style="font-weight: 700; color: #34d399; margin-bottom: 4px;">② 演进示例 (s = "abcdefg", k = 2)</div>
        <p style="margin: 0; color: #94a3b8; font-family: monospace;">
        原字符串: [a b c d e] [f g]<br/>
        Step 1 (整体反转): [g f] [e d c b a]<br/>
        Step 2 (反转前 2 个): [f g] [e d c b a]<br/>
        Step 3 (反转后 5 个): [f g] [a b c d e] -> "fgabcde"
        </p>
      </div>
    </div>
  </div>
`;

export const RIGHT_ROTATE_STRING_CODE_LANGUAGES: Record<string, string[]> = {
  java: [
    'public String rightRotate(String s, int k) {',
    '    int n = s.length();',
    '    k = k % n;',
    '    char[] ch = s.toCharArray();',
    '    // 1. 反转全部',
    '    reverse(ch, 0, n - 1);',
    '    // 2. 反转前 k 个',
    '    reverse(ch, 0, k - 1);',
    '    // 3. 反转剩余 n - k 个',
    '    reverse(ch, k, n - 1);',
    '    return new String(ch);',
    '}',
    '',
    'private void reverse(char[] ch, int left, int right) {',
    '    while (left < right) {',
    '        char temp = ch[left];',
    '        ch[left] = ch[right];',
    '        ch[right] = temp;',
    '        left++;',
    '        right--;',
    '    }',
    '}',
  ],
  cpp: [
    '#include <iostream>',
    '#include <algorithm>',
    'using namespace std;',
    '',
    'string rightRotate(string s, int k) {',
    '    int n = s.size();',
    '    k = k % n;',
    '    // 1. 反转全部',
    '    reverse(s.begin(), s.end());',
    '    // 2. 反转前 k 个',
    '    reverse(s.begin(), s.begin() + k);',
    '    // 3. 反转剩余部分',
    '    reverse(s.begin() + k, s.end());',
    '    return s;',
    '}',
  ],
  python: [
    'def rightRotate(s: str, k: int) -> str:',
    '    n = len(s)',
    '    k = k % n',
    '    return s[-k:] + s[:-k]',
  ],
  javascript: [
    'var rightRotate = function(s, k) {',
    '    const chars = s.split("");',
    '    const n = chars.length;',
    '    k = k % n;',
    '    const reverse = (l, r) => {',
    '        while (l < r) {',
    '            [chars[l], chars[r]] = [chars[r], chars[l]];',
    '            l++; r--;',
    '        }',
    '    };',
    '    reverse(0, n - 1);',
    '    reverse(0, k - 1);',
    '    reverse(k, n - 1);',
    '    return chars.join("");',
    '};',
  ],
};
