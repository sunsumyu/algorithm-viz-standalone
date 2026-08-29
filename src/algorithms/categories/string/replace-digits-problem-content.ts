/**
 * KamaCoder 54: 替换数字 (Replace Digits)
 * 领域知识与题解精讲配置声明
 */

export const REPLACE_DIGITS_PROBLEM_HTML = `
  <div style="display: flex; flex-direction: column; gap: 12px; color: #cbd5e1; font-size: 12px; line-height: 1.6;">
    <div style="display: flex; align-items: center; gap: 8px;">
      <span style="padding: 2px 6px; border-radius: 4px; background: rgba(59,130,246,0.2); color: #60a5fa; font-weight: 700; border: 1px solid rgba(59,130,246,0.3);">KamaCoder 54</span>
      <span style="padding: 2px 6px; border-radius: 4px; background: rgba(16,185,129,0.2); color: #34d399; font-weight: 700; border: 1px solid rgba(16,185,129,0.3);">Easy</span>
      <h2 style="font-size: 14px; font-weight: 700; color: #ffffff; margin: 0;">替换数字 (Replace Digits)</h2>
    </div>
    <p style="margin: 0;">给定一个字符串 <code style="color: #fde047; font-family: monospace;">s</code>，它包含小写字母和数字字符，请编写一个函数，将字符串中的每个数字字符替换成 <code style="color: #38bdf8; font-family: monospace;">"number"</code>。</p>
    <div style="padding: 10px; border-radius: 10px; background: #020617; border: 1px solid #1e293b; display: flex; flex-direction: column; gap: 6px; font-family: monospace; font-size: 11px;">
      <div style="color: #34d399; font-weight: 700;">示例 1:</div>
      <div>输入: s = "a1b2c"</div>
      <div>输出: "anumberbnumberc"</div>
    </div>
    <div style="padding: 10px; border-radius: 10px; background: #020617; border: 1px solid #1e293b; display: flex; flex-direction: column; gap: 6px; font-family: monospace; font-size: 11px;">
      <div style="color: #34d399; font-weight: 700;">示例 2:</div>
      <div>输入: s = "123"</div>
      <div>输出: "numbernumbernumber"</div>
    </div>
  </div>
`;

export const REPLACE_DIGITS_ANALYSIS_HTML = `
  <div style="display: flex; flex-direction: column; gap: 12px; color: #cbd5e1; font-size: 12px; line-height: 1.6;">
    <h3 style="font-size: 14px; font-weight: 700; color: #ffffff; margin: 0; display: flex; align-items: center; gap: 6px;">
      <span>💡</span> 预扩容 + 从后向前双指针（避免 O(n²) 元素搬移）
    </h3>
    <div style="display: flex; flex-direction: column; gap: 8px;">
      <div style="padding: 10px; border-radius: 10px; background: #020617; border: 1px solid #1e293b;">
        <div style="font-weight: 700; color: #60a5fa; margin-bottom: 4px;">① 为什么从后向前？</div>
        <p style="margin: 0; color: #94a3b8;">
        如果在原数组中从前往后替换，每遇到一个数字就要将后面所有字符向后挪动 5 位，产生 <code style="color: #f87171; font-family: monospace;">O(n²)</code> 的时间复杂度。<br/>
        <strong>经典解法：</strong><br/>
        1. 遍历统计数字个数 <code style="color: #38bdf8; font-family: monospace;">count</code>；<br/>
        2. 将原数组扩容 <code style="color: #38bdf8; font-family: monospace;">count * 5</code> 个位置（1 个数字变 6 个字符）；<br/>
        3. 双指针从后向前填充：<code style="color: #a855f7; font-family: monospace;">oldIndex</code> 指向旧末尾，<code style="color: #fbbf24; font-family: monospace;">newIndex</code> 指向新末尾。
        </p>
      </div>
      <div style="padding: 10px; border-radius: 10px; background: #020617; border: 1px solid #1e293b;">
        <div style="font-weight: 700; color: #34d399; margin-bottom: 4px;">② 复杂度分析</div>
        <p style="margin: 0; color: #94a3b8;">
        • 时间复杂度：<code style="color: #60a5fa; font-family: monospace;">O(n)</code>，每个字符仅被读取和写入一次。<br/>
        • 空间复杂度：<code style="color: #34d399; font-family: monospace;">O(1)</code>（在支持可变字符串的语言中，如 C++ 原地扩容）。
        </p>
      </div>
    </div>
  </div>
`;

export const REPLACE_DIGITS_CODE_LANGUAGES: Record<string, string[]> = {
  java: [
    'public String replaceDigits(String s) {',
    '    StringBuilder sb = new StringBuilder();',
    '    for (int i = 0; i < s.length(); i++) {',
    '        char c = s.charAt(i);',
    '        if (Character.isDigit(c)) {',
    '            sb.append("number");',
    '        } else {',
    '            sb.append(c);',
    '        }',
    '    }',
    '    return sb.toString();',
    '}',
  ],
  cpp: [
    '// C++ 原地扩容 + 从后向前双指针',
    'string replaceDigits(string s) {',
    '    int count = 0;',
    '    int oldSize = s.size();',
    '    for (char c : s) {',
    '        if (c >= \'0\' && c <= \'9\') count++;',
    '    }',
    '    s.resize(oldSize + count * 5); // 扩容',
    '    int newSize = s.size();',
    '    for (int i = oldSize - 1, j = newSize - 1; i < j; i--, j--) {',
    '        if (s[i] < \'0\' || s[i] > \'9\') {',
    '            s[j] = s[i];',
    '        } else {',
    '            s[j--] = \'r\'; s[j--] = \'e\'; s[j--] = \'b\';',
    '            s[j--] = \'m\'; s[j--] = \'u\'; s[j] = \'n\';',
    '        }',
    '    }',
    '    return s;',
    '}',
  ],
  python: [
    'def replaceDigits(s: str) -> str:',
    '    res = []',
    '    for c in s:',
    '        if c.isdigit():',
    '            res.append("number")',
    '        else:',
    '            res.append(c)',
    '    return "".join(res)',
  ],
  javascript: [
    'var replaceDigits = function(s) {',
    '    let res = "";',
    '    for (let i = 0; i < s.length; i++) {',
    '        const c = s[i];',
    '        if (c >= "0" && c <= "9") {',
    '            res += "number";',
    '        } else {',
    '            res += c;',
    '        }',
    '    }',
    '    return res;',
    '};',
  ],
};
