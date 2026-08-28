/**
 * LeetCode 738: 单调递增的数字 (Monotone Increasing Digits)
 * 领域知识与题解精讲配置声明
 */

export const MONOTONE_DIGITS_PROBLEM_HTML = `
  <div style="display: flex; flex-direction: column; gap: 12px; color: #cbd5e1; font-size: 12px; line-height: 1.6;">
    <div style="display: flex; align-items: center; gap: 8px;">
      <span style="padding: 2px 6px; border-radius: 4px; background: rgba(59,130,246,0.2); color: #60a5fa; font-weight: 700; border: 1px solid rgba(59,130,246,0.3);">LeetCode 738</span>
      <span style="padding: 2px 6px; border-radius: 4px; background: rgba(245,158,11,0.2); color: #fbbf24; font-weight: 700; border: 1px solid rgba(245,158,11,0.3);">Medium</span>
      <h2 style="font-size: 14px; font-weight: 700; color: #ffffff; margin: 0;">单调递增的数字 (Monotone Increasing Digits)</h2>
    </div>
    <p style="margin: 0;">当且仅当每个相邻位数上的数字 <code style="color: #fde047; font-family: monospace;">x</code> 和 <code style="color: #fde047; font-family: monospace;">y</code> 满足 <code style="color: #fde047; font-family: monospace;">x &le; y</code> 时，我们称这个整数是<strong>单调递增</strong>的。</p>
    <p style="margin: 0;">给定一个整数 <code style="color: #fde047; font-family: monospace;">n</code> ，返回 <em>小于或等于 <code style="color: #fde047; font-family: monospace;">n</code> 的最大整数，且该整数各数字单调递增</em> 。</p>
    <div style="padding: 10px; border-radius: 10px; background: #020617; border: 1px solid #1e293b; display: flex; flex-direction: column; gap: 6px; font-family: monospace; font-size: 11px;">
      <div style="color: #34d399; font-weight: 700;">示例 1:</div>
      <div>输入: n = 10</div>
      <div>输出: 9</div>
    </div>
    <div style="padding: 10px; border-radius: 10px; background: #020617; border: 1px solid #1e293b; display: flex; flex-direction: column; gap: 6px; font-family: monospace; font-size: 11px;">
      <div style="color: #34d399; font-weight: 700;">示例 2:</div>
      <div>输入: n = 1234</div>
      <div>输出: 1234</div>
    </div>
    <div style="padding: 10px; border-radius: 10px; background: #020617; border: 1px solid #1e293b; display: flex; flex-direction: column; gap: 6px; font-family: monospace; font-size: 11px;">
      <div style="color: #34d399; font-weight: 700;">示例 3:</div>
      <div>输入: n = 332</div>
      <div>输出: 299</div>
    </div>
    <div style="display: flex; flex-direction: column; gap: 4px; color: #94a3b8; font-size: 11.5px;">
      <div style="font-weight: 700; color: #cbd5e1;">提示：</div>
      <div>• 0 &le; n &le; 10^9</div>
    </div>
  </div>
`;

export const MONOTONE_DIGITS_ANALYSIS_HTML = `
  <div style="display: flex; flex-direction: column; gap: 12px; color: #cbd5e1; font-size: 12px; line-height: 1.6;">
    <h3 style="font-size: 14px; font-weight: 700; color: #ffffff; margin: 0; display: flex; align-items: center; gap: 6px;">
      <span>💡</span> 贪心核心：从右向左扫描，高位借位减 1，低位全变为 9
    </h3>
    <div style="display: flex; flex-direction: column; gap: 8px;">
      <div style="padding: 10px; border-radius: 10px; background: #020617; border: 1px solid #1e293b;">
        <div style="font-weight: 700; color: #60a5fa; margin-bottom: 4px;">① 为什么必须「从右向左」扫描？</div>
        <p style="margin: 0; color: #94a3b8;">如果从左向右扫描，例如 <code style="color: #fb7185; font-family: monospace;">332</code>：比较 3 和 3 递增无误，但比较 3 和 2 时将 3 减为 2 变成 <code style="color: #fbbf24; font-family: monospace;">329</code>，依然不是单调递增！<br/>
        而<strong>从右向左扫描</strong>可以利用前面修改的结果：3 和 2 比较使高位 3 变成 2（变 322），接着前一位 3 和 2 比较又使最高位 3 变成 2（变 222），最后把标记位后的所有数字全变成 9，得到最优解 <code style="color: #34d399; font-family: monospace;">299</code>！</p>
      </div>
      <div style="padding: 10px; border-radius: 10px; background: #020617; border: 1px solid #1e293b;">
        <div style="font-weight: 700; color: #34d399; margin-bottom: 4px;">② 贪心策略：高位减 1 + 低位填 9</div>
        <p style="margin: 0; color: #94a3b8;">若 <code style="color: #fb7185; font-family: monospace;">str[i - 1] > str[i]</code>：<br/>
        • 贪心减小高位：<code style="color: #34d399; font-family: monospace;">str[i - 1]--</code>；<br/>
        • 记录变 9 起始标记：<code style="color: #7dd3fc; font-family: monospace;">flag = i</code>。<br/>
        扫描结束后，统一将 <code style="color: #7dd3fc; font-family: monospace;">[flag .. len-1]</code> 的所有数字赋值为 <code style="color: #34d399; font-family: monospace;">'9'</code>（9 是最大的数字，能使数值最大化！）。</p>
      </div>
      <div style="padding: 10px; border-radius: 10px; background: #020617; border: 1px solid #1e293b;">
        <div style="font-weight: 700; color: #f472b6; margin-bottom: 4px;">③ 复杂度分析</div>
        <p style="margin: 0; color: #94a3b8;">• 时间复杂度: <code style="color: #7dd3fc; font-family: monospace;">O(log₁₀ N)</code>，与数字位数成线性关系。<br/>
        • 空间复杂度: <code style="color: #7dd3fc; font-family: monospace;">O(log₁₀ N)</code> 字符数组存储。</p>
      </div>
    </div>
  </div>
`;

export const MONOTONE_DIGITS_CODE_LANGUAGES: Record<string, string[]> = {
  java: [
    'public int monotoneIncreasingDigits(int n) {',
    '    String s = String.valueOf(n);',
    '    char[] chars = s.toCharArray();',
    '    int flag = s.length(); // 记录需要变成 9 的起始位置',
    '    // 从右往左遍历',
    '    for (int i = s.length() - 1; i > 0; i--) {',
    '        if (chars[i - 1] > chars[i]) {',
    '            chars[i - 1]--;',
    '            flag = i;',
    '        }',
    '    }',
    '    // 将 flag 之后的数字全部置为 9',
    '    for (int i = flag; i < s.length(); i++) {',
    '        chars[i] = \'9\';',
    '    }',
    '    return Integer.parseInt(String.valueOf(chars));',
    '}',
  ],
  cpp: [
    'class Solution {',
    'public:',
    '    int monotoneIncreasingDigits(int n) {',
    '        string strNum = to_string(n);',
    '        int flag = strNum.size();',
    '        for (int i = strNum.size() - 1; i > 0; i--) {',
    '            if (strNum[i - 1] > strNum[i]) {',
    '                flag = i;',
    '                strNum[i - 1]--;',
    '            }',
    '        }',
    '        for (int i = flag; i < strNum.size(); i++) {',
    '            strNum[i] = \'9\';',
    '        }',
    '        return stoi(strNum);',
    '    }',
    '};',
  ],
  python: [
    'class Solution:',
    '    def monotoneIncreasingDigits(self, n: int) -> int:',
    '        a = list(str(n))',
    '        flag = len(a)',
    '        for i in range(len(a) - 1, 0, -1):',
    '            if int(a[i - 1]) > int(a[i]):',
    '                a[i - 1] = str(int(a[i - 1]) - 1)',
    '                flag = i',
    '        for i in range(flag, len(a)):',
    '            a[i] = \'9\'',
    '        return int(\'\'.join(a))',
  ],
  javascript: [
    'var monotoneIncreasingDigits = function(n) {',
    '    let strNum = n.toString().split(\'\').map(Number);',
    '    let flag = strNum.length;',
    '    for (let i = strNum.length - 1; i > 0; i--) {',
    '        if (strNum[i - 1] > strNum[i]) {',
    '            strNum[i - 1]--;',
    '            flag = i;',
    '        }',
    '    }',
    '    for (let i = flag; i < strNum.length; i++) {',
    '        strNum[i] = 9;',
    '    }',
    '    return parseInt(strNum.join(\'\'));',
    '};',
  ],
};
