/**
 * LeetCode 151: 翻转字符串里的单词 (Reverse Words in a String)
 * 领域知识与题解精讲配置声明
 */

export const REVERSE_WORDS_PROBLEM_HTML = `
  <div style="display: flex; flex-direction: column; gap: 12px; color: #cbd5e1; font-size: 12px; line-height: 1.6;">
    <div style="display: flex; align-items: center; gap: 8px;">
      <span style="padding: 2px 6px; border-radius: 4px; background: rgba(59,130,246,0.2); color: #60a5fa; font-weight: 700; border: 1px solid rgba(59,130,246,0.3);">LeetCode 151</span>
      <span style="padding: 2px 6px; border-radius: 4px; background: rgba(245,158,11,0.2); color: #fbbf24; font-weight: 700; border: 1px solid rgba(245,158,11,0.3);">Medium</span>
      <h2 style="font-size: 14px; font-weight: 700; color: #ffffff; margin: 0;">翻转字符串里的单词 (Reverse Words)</h2>
    </div>
    <p style="margin: 0;">给你一个字符串 <code style="color: #fde047; font-family: monospace;">s</code> ，请你反转字符串中 <strong>单词</strong> 的顺序。</p>
    <p style="margin: 0;">• <strong>单词</strong> 是由非空格字符组成的字符串。<code style="color: #fde047; font-family: monospace;">s</code> 中使用至少一个空格将单词分隔开。<br/>• 返回 <strong>单词顺序反转</strong> 且 <strong>单词之间用单个空格连接</strong> 的结果字符串。<br/>• 注意：输入字符串 <code style="color: #fde047; font-family: monospace;">s</code> 中可能会存在前导空格、尾随空格或者单词间的多个连续空格。返回的结果字符串中，单词间应当仅用单个空格分隔，且不包含任何额外的空格。</p>
    <div style="padding: 10px; border-radius: 10px; background: #020617; border: 1px solid #1e293b; display: flex; flex-direction: column; gap: 6px; font-family: monospace; font-size: 11px;">
      <div style="color: #34d399; font-weight: 700;">示例 1:</div>
      <div>输入: s = "the sky is blue"</div>
      <div>输出: "blue is sky the"</div>
    </div>
    <div style="padding: 10px; border-radius: 10px; background: #020617; border: 1px solid #1e293b; display: flex; flex-direction: column; gap: 6px; font-family: monospace; font-size: 11px;">
      <div style="color: #34d399; font-weight: 700;">示例 2:</div>
      <div>输入: s = "  hello world  "</div>
      <div>输出: "world hello" (去除了首尾空格)</div>
    </div>
  </div>
`;

export const REVERSE_WORDS_ANALYSIS_HTML = `
  <div style="display: flex; flex-direction: column; gap: 12px; color: #cbd5e1; font-size: 12px; line-height: 1.6;">
    <h3 style="font-size: 14px; font-weight: 700; color: #ffffff; margin: 0; display: flex; align-items: center; gap: 6px;">
      <span>💡</span> 经典三步原地反转法 (O(1) 额外空间模式)
    </h3>
    <div style="display: flex; flex-direction: column; gap: 8px;">
      <div style="padding: 10px; border-radius: 10px; background: #020617; border: 1px solid #1e293b;">
        <div style="font-weight: 700; color: #60a5fa; margin-bottom: 4px;">① 三步处理流程</div>
        <p style="margin: 0; color: #94a3b8;">
        1. <strong>快慢双指针移除多余空格：</strong> 清除前导空格、尾随空格以及单词间的多余空格；<br/>
        2. <strong>反转整个字符串：</strong> 将所有字符全部倒序（此时单词内部也是倒的）；<br/>
        3. <strong>逐个反转每个单词：</strong> 识别每个单词的起点和终点，单独将其反转恢复正常语序。
        </p>
      </div>
      <div style="padding: 10px; border-radius: 10px; background: #020617; border: 1px solid #1e293b;">
        <div style="font-weight: 700; color: #34d399; margin-bottom: 4px;">② 图解变换全过程</div>
        <p style="margin: 0; color: #94a3b8; font-family: monospace;">
        原串: "  the  sky  is  blue  "<br/>
        Step 1 (去空格): "the sky is blue"<br/>
        Step 2 (整体反转): "eulb si yks eht"<br/>
        Step 3 (单词反转): "blue is sky the"
        </p>
      </div>
    </div>
  </div>
`;

export const REVERSE_WORDS_CODE_LANGUAGES: Record<string, string[]> = {
  java: [
    'public String reverseWords(String s) {',
    '    // 1. 移除多余空格',
    '    StringBuilder sb = removeExtraSpaces(s);',
    '    // 2. 反转整个字符串',
    '    reverseString(sb, 0, sb.length() - 1);',
    '    // 3. 逐个反转每个单词',
    '    reverseEachWord(sb);',
    '    return sb.toString();',
    '}',
    '',
    'private StringBuilder removeExtraSpaces(String s) {',
    '    int start = 0, end = s.length() - 1;',
    '    while (s.charAt(start) == \' \') start++;',
    '    while (s.charAt(end) == \' \') end--;',
    '    StringBuilder sb = new StringBuilder();',
    '    while (start <= end) {',
    '        char c = s.charAt(start);',
    '        if (c != \' \' || sb.charAt(sb.length() - 1) != \' \') sb.append(c);',
    '        start++;',
    '    }',
    '    return sb;',
    '}',
  ],
  cpp: [
    'class Solution {',
    'public:',
    '    string reverseWords(string s) {',
    '        // 1. 双指针移除空格',
    '        int slow = 0;',
    '        for (int fast = 0; fast < s.size(); fast++) {',
    '            if (s[fast] != \' \') {',
    '                if (slow != 0) s[slow++] = \' \';',
    '                while (fast < s.size() && s[fast] != \' \') {',
    '                    s[slow++] = s[fast++];',
    '                }',
    '            }',
    '        }',
    '        s.resize(slow);',
    '        // 2. 整体反转',
    '        reverse(s.begin(), s.end());',
    '        // 3. 单词反转',
    '        for (int i = 0; i < s.size(); ) {',
    '            int j = i;',
    '            while (j < s.size() && s[j] != \' \') j++;',
    '            reverse(s.begin() + i, s.begin() + j);',
    '            i = j + 1;',
    '        }',
    '        return s;',
    '    }',
    '};',
  ],
  python: [
    'class Solution:',
    '    def reverseWords(self, s: str) -> str:',
    '        # Python API 解法：split 自动过滤多余空格，reversed 倒序',
    '        return " ".join(reversed(s.split()))',
  ],
  javascript: [
    'var reverseWords = function(s) {',
    '    // 1. 过滤多余空格并拆分为单词数组',
    '    const words = s.trim().split(/\\s+/);',
    '    // 2. 双指针倒序',
    '    let left = 0, right = words.length - 1;',
    '    while (left < right) {',
    '        [words[left], words[right]] = [words[right], words[left]];',
    '        left++;',
    '        right--;',
    '    }',
    '    return words.join(" ");',
    '};',
  ],
};
