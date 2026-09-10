/**
 * LeetCode 202: 快乐数 (Happy Number)
 * 领域知识与题解精讲配置声明
 */

export const HAPPY_NUMBER_PROBLEM_HTML = `
  <div style="display: flex; flex-direction: column; gap: 12px; color: #cbd5e1; font-size: 12px; line-height: 1.6;">
    <div style="display: flex; align-items: center; gap: 8px;">
      <span style="padding: 2px 6px; border-radius: 4px; background: rgba(59,130,246,0.2); color: #60a5fa; font-weight: 700; border: 1px solid rgba(59,130,246,0.3);">LeetCode 202</span>
      <span style="padding: 2px 6px; border-radius: 4px; background: rgba(16,185,129,0.2); color: #34d399; font-weight: 700; border: 1px solid rgba(16,185,129,0.3);">Easy</span>
      <h2 style="font-size: 14px; font-weight: 700; color: #ffffff; margin: 0;">快乐数 (Happy Number)</h2>
    </div>
    <p style="margin: 0;">编写一个算法来判断一个数 <code style="color: #fde047; font-family: monospace;">n</code> 是不是快乐数。</p>
    <p style="margin: 0;"><strong>「快乐数」</strong> 定义为：</p>
    <p style="margin: 0;">• 对于一个正整数，每一次将该数替换为它每个位置上的数字的平方和。<br/>• 然后重复这个过程直到这个数变为 1，也可能是 <strong>无限循环</strong> 但始终变不到 1。<br/>• 如果这个过程 <strong>结果为 1</strong>，那么这个数就是快乐数。</p>
    <div style="padding: 10px; border-radius: 10px; background: #020617; border: 1px solid #1e293b; display: flex; flex-direction: column; gap: 6px; font-family: monospace; font-size: 11px;">
      <div style="color: #34d399; font-weight: 700;">示例 1:</div>
      <div>输入: n = 19</div>
      <div>输出: true</div>
      <div style="color: #94a3b8;">解释: 1² + 9² = 82 -> 8² + 2² = 68 -> 6² + 8² = 100 -> 1² + 0² + 0² = 1</div>
    </div>
    <div style="padding: 10px; border-radius: 10px; background: #020617; border: 1px solid #1e293b; display: flex; flex-direction: column; gap: 6px; font-family: monospace; font-size: 11px;">
      <div style="color: #34d399; font-weight: 700;">示例 2:</div>
      <div>输入: n = 2</div>
      <div>输出: false (会陷入 4 -> 16 -> 37 -> 58 -> 89 -> 145 -> 42 -> 20 -> 4 无限死循环)</div>
    </div>
  </div>
`;

export const HAPPY_NUMBER_ANALYSIS_HTML = `
  <div style="display: flex; flex-direction: column; gap: 12px; color: #cbd5e1; font-size: 12px; line-height: 1.6;">
    <h3 style="font-size: 14px; font-weight: 700; color: #ffffff; margin: 0; display: flex; align-items: center; gap: 6px;">
      <span>💡</span> 哈希集合 HashSet 检测循环判环
    </h3>
    <div style="display: flex; flex-direction: column; gap: 8px;">
      <div style="padding: 10px; border-radius: 10px; background: #020617; border: 1px solid #1e293b;">
        <div style="font-weight: 700; color: #60a5fa; margin-bottom: 4px;">① 为什么会陷入循环？</div>
        <p style="margin: 0; color: #94a3b8;">
        数字的各位平方和转换在有限步数内，要么收敛到 <code style="color: #34d399; font-family: monospace;">1</code>，要么<strong>必然会进入一个曾经出现过的数字形成死循环</strong>。<br/>
        因此，只要我们能够<strong>快速判断当前计算出的平方和之前是否已经出现过</strong>，就能确诊是否进入死循环。
        </p>
      </div>
      <div style="padding: 10px; border-radius: 10px; background: #020617; border: 1px solid #1e293b;">
        <div style="font-weight: 700; color: #34d399; margin-bottom: 4px;">② 哈希集合算法流程</div>
        <p style="margin: 0; color: #94a3b8;">
        1. 维护一个哈希集合 <code style="color: #a78bfa; font-family: monospace;">set</code> 记录所有遍历过的平方和历史；<br/>
        2. 循环条件：<code style="color: #fde047; font-family: monospace;">n != 1 && !set.contains(n)</code>；<br/>
        3. 将当前 <code style="color: #38bdf8; font-family: monospace;">n</code> 加入集合 <code style="color: #a78bfa; font-family: monospace;">set.add(n)</code>；<br/>
        4. 通过取模 <code style="color: #fbbf24; font-family: monospace;">n % 10</code> 和整除 <code style="color: #fbbf24; font-family: monospace;">n / 10</code> 逐位累加平方和，更新 <code style="color: #38bdf8; font-family: monospace;">n = getNext(n)</code>；<br/>
        5. 循环结束时，若 <code style="color: #34d399; font-family: monospace;">n == 1</code> 返回 true，否则说明检测到环返回 false。
        </p>
      </div>
    </div>
  </div>
`;

export const HAPPY_NUMBER_CODE_LANGUAGES: Record<string, string[]> = {
  java: [
    'public boolean isHappy(int n) {',
    '    Set<Integer> seen = new HashSet<>();',
    '    while (n != 1 && !seen.contains(n)) {',
    '        seen.add(n);',
    '        n = getNext(n);',
    '    }',
    '    return n == 1;',
    '}',
    '',
    'private int getNext(int n) {',
    '    int sum = 0;',
    '    while (n > 0) {',
    '        int d = n % 10;',
    '        sum += d * d;',
    '        n /= 10;',
    '    }',
    '    return sum;',
    '}',
  ],
  cpp: [
    'class Solution {',
    'public:',
    '    bool isHappy(int n) {',
    '        unordered_set<int> seen;',
    '        while (n != 1 && seen.find(n) == seen.end()) {',
    '            seen.insert(n);',
    '            n = getNext(n);',
    '        }',
    '        return n == 1;',
    '    }',
    'private:',
    '    int getNext(int n) {',
    '        int sum = 0;',
    '        while (n > 0) {',
    '            int d = n % 10;',
    '            sum += d * d;',
    '            n /= 10;',
    '        }',
    '        return sum;',
    '    }',
    '};',
  ],
  python: [
    'class Solution:',
    '    def isHappy(self, n: int) -> bool:',
    '        seen = set()',
    '        while n != 1 and n not in seen:',
    '            seen.add(n)',
    '            n = sum(int(d) ** 2 for d in str(n))',
    '        return n == 1',
  ],
  javascript: [
    'var isHappy = function(n) {',
    '    const seen = new Set();',
    '    const getNext = (num) => {',
    '        let sum = 0;',
    '        while (num > 0) {',
    '            const d = num % 10;',
    '            sum += d * d;',
    '            num = Math.floor(num / 10);',
    '        }',
    '        return sum;',
    '    };',
    '    while (n !== 1 && !seen.has(n)) {',
    '        seen.add(n);',
    '        n = getNext(n);',
    '    }',
    '    return n === 1;',
    '};',
  ],
};
