/**
 * LeetCode 455: 分发饼干 (Assign Cookies)
 * 领域知识与题解精讲配置声明
 */

export const ASSIGN_COOKIES_PROBLEM_HTML = `
  <div style="display: flex; flex-direction: column; gap: 12px; color: #cbd5e1; font-size: 12px; line-height: 1.6;">
    <div style="display: flex; align-items: center; gap: 8px;">
      <span style="padding: 2px 6px; border-radius: 4px; background: rgba(59,130,246,0.2); color: #60a5fa; font-weight: 700; border: 1px solid rgba(59,130,246,0.3);">LeetCode 455</span>
      <span style="padding: 2px 6px; border-radius: 4px; background: rgba(16,185,129,0.2); color: #34d399; font-weight: 700; border: 1px solid rgba(16,185,129,0.3);">Easy</span>
      <h2 style="font-size: 14px; font-weight: 700; color: #ffffff; margin: 0;">分发饼干 (Assign Cookies)</h2>
    </div>
    <p style="margin: 0;">假设你是一位很棒的家长，想要给你的孩子们一些小饼干。但是，每个孩子最多只能给一块饼干。</p>
    <p style="margin: 0;">对每个孩子 <code style="color: #fde047; font-family: monospace;">i</code>，都有一个胃口值 <code style="color: #fde047; font-family: monospace;">g[i]</code> ，这是能让孩子们满足胃口的饼干的最小尺寸；并且每块饼干 <code style="color: #fde047; font-family: monospace;">j</code> ，都有一个尺寸 <code style="color: #fde047; font-family: monospace;">s[j]</code> 。如果 <code style="color: #fde047; font-family: monospace;">s[j] >= g[i]</code>，我们可以将这个饼干 <code style="color: #fde047; font-family: monospace;">j</code> 分配给孩子 <code style="color: #fde047; font-family: monospace;">i</code> ，这个孩子会得到满足。你的目标是尽可能满足越多数量的孩子，并输出这个最大数值。</p>
    <div style="padding: 10px; border-radius: 10px; background: #020617; border: 1px solid #1e293b; display: flex; flex-direction: column; gap: 6px; font-family: monospace; font-size: 11px;">
      <div style="color: #34d399; font-weight: 700;">示例 1:</div>
      <div>输入: g = [1,2,3], s = [1,1]</div>
      <div>输出: 1</div>
      <div>解释: 你有三个孩子和两块小饼干，3个孩子的胃口值分别是：1,2,3。虽然你有两块小饼干，由于他们的尺寸都是1，你只能让胃口值是1的孩子满足。</div>
    </div>
    <div style="padding: 10px; border-radius: 10px; background: #020617; border: 1px solid #1e293b; display: flex; flex-direction: column; gap: 6px; font-family: monospace; font-size: 11px;">
      <div style="color: #34d399; font-weight: 700;">示例 2:</div>
      <div>输入: g = [1,2], s = [1,2,3]</div>
      <div>输出: 2</div>
      <div>解释: 你有两个孩子和三块小饼干，2个孩子的胃口值分别是1,2。拥有的饼干数量和尺寸都足以让所有孩子满足。</div>
    </div>
    <div style="display: flex; flex-direction: column; gap: 4px; color: #94a3b8; font-size: 11.5px;">
      <div style="font-weight: 700; color: #cbd5e1;">提示：</div>
      <div>• 1 &le; g.length &le; 3 * 10^4</div>
      <div>• 0 &le; s.length &le; 3 * 10^4</div>
      <div>• 1 &le; g[i], s[j] &le; 2^31 - 1</div>
    </div>
  </div>
`;

export const ASSIGN_COOKIES_ANALYSIS_HTML = `
  <div style="display: flex; flex-direction: column; gap: 12px; color: #cbd5e1; font-size: 12px; line-height: 1.6;">
    <h3 style="font-size: 14px; font-weight: 700; color: #ffffff; margin: 0; display: flex; align-items: center; gap: 6px;">
      <span>💡</span> 贪心策略：优先满足最小胃口的孩子
    </h3>
    <div style="display: flex; flex-direction: column; gap: 8px;">
      <div style="padding: 10px; border-radius: 10px; background: #020617; border: 1px solid #1e293b;">
        <div style="font-weight: 700; color: #60a5fa; margin-bottom: 4px;">① 局部最优推导全局最优</div>
        <p style="margin: 0; color: #94a3b8;">为了尽可能满足更多的孩子，大饼干应该尽量留给胃口大的孩子，或者说：<strong>用尽量小的饼干去满足胃口尽量小的孩子</strong>，充分利用饼干的剩余价值，不造成大饼干的浪费。</p>
      </div>
      <div style="padding: 10px; border-radius: 10px; background: #020617; border: 1px solid #1e293b;">
        <div style="font-weight: 700; color: #34d399; margin-bottom: 4px;">② 排序 + 双指针扫描</div>
        <p style="margin: 0; color: #94a3b8;">将孩子胃口数组 <code style="color: #7dd3fc; font-family: monospace;">g</code> 和饼干尺寸数组 <code style="color: #7dd3fc; font-family: monospace;">s</code> 都按<strong>升序排序</strong>。<br/>
        用双指针分别指向两数组起始位置：<br/>
        • 若当前饼干 <code style="color: #fbbf24; font-family: monospace;">s[cookieIndex] >= g[childIndex]</code>，则匹配成功，两指针均后移一位。<br/>
        • 若饼干太小无法满足当前孩子，则说明该饼干更无法满足后续孩子，饼干指针后移尝试下一块。</p>
      </div>
      <div style="padding: 10px; border-radius: 10px; background: #020617; border: 1px solid #1e293b;">
        <div style="font-weight: 700; color: #f472b6; margin-bottom: 4px;">③ 复杂度分析</div>
        <p style="margin: 0; color: #94a3b8;">• 时间复杂度: <code style="color: #7dd3fc; font-family: monospace;">O(M log M + N log N)</code>，排序耗时为主导，双指针线性扫描只需 <code style="color: #34d399; font-family: monospace;">O(M + N)</code>。<br/>
        • 空间复杂度: <code style="color: #7dd3fc; font-family: monospace;">O(log M + log N)</code>（排序栈空间）。</p>
      </div>
    </div>
  </div>
`;

export const ASSIGN_COOKIES_CODE_LANGUAGES: Record<string, string[]> = {
  java: [
    'public int findContentChildren(int[] g, int[] s) {',
    '    Arrays.sort(g); // 孩子胃口从小到大排序',
    '    Arrays.sort(s); // 饼干尺寸从小到大排序',
    '    int childIndex = 0;',
    '    int cookieIndex = 0;',
    '    while (childIndex < g.length && cookieIndex < s.length) {',
    '        // 贪心：如果当前小饼干能满足当前最小胃口的孩子',
    '        if (s[cookieIndex] >= g[childIndex]) {',
    '            childIndex++; // 满足一个孩子，看下一个孩子',
    '        }',
    '        cookieIndex++; // 无论是否满足，该饼干都已被消耗或跳过',
    '    }',
    '    return childIndex; // 已满足的孩子总数',
    '}',
  ],
  cpp: [
    'class Solution {',
    'public:',
    '    int findContentChildren(vector<int>& g, vector<int>& s) {',
    '        sort(g.begin(), g.end());',
    '        sort(s.begin(), s.end());',
    '        int childIndex = 0;',
    '        int cookieIndex = 0;',
    '        while (childIndex < g.size() && cookieIndex < s.size()) {',
    '            if (s[cookieIndex] >= g[childIndex]) {',
    '                childIndex++;',
    '            }',
    '            cookieIndex++;',
    '        }',
    '        return childIndex;',
    '    }',
    '};',
  ],
  python: [
    'class Solution:',
    '    def findContentChildren(self, g: List[int], s: List[int]) -> int:',
    '        g.sort()',
    '        s.sort()',
    '        child_idx, cookie_idx = 0, 0',
    '        while child_idx < len(g) and cookie_idx < len(s):',
    '            if s[cookie_idx] >= g[child_idx]:',
    '                child_idx += 1',
    '            cookie_idx += 1',
    '        return child_idx',
  ],
  javascript: [
    'var findContentChildren = function(g, s) {',
    '    g.sort((a, b) => a - b);',
    '    s.sort((a, b) => a - b);',
    '    let childIndex = 0;',
    '    let cookieIndex = 0;',
    '    while (childIndex < g.length && cookieIndex < s.length) {',
    '        if (s[cookieIndex] >= g[childIndex]) {',
    '            childIndex++;',
    '        }',
    '        cookieIndex++;',
    '    }',
    '    return childIndex;',
    '};',
  ],
};
