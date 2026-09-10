/**
 * LeetCode 435: 无重叠区间 (Non-overlapping Intervals)
 * 领域知识与题解精讲配置声明
 */

export const NON_OVERLAPPING_PROBLEM_HTML = `
  <div style="display: flex; flex-direction: column; gap: 12px; color: #cbd5e1; font-size: 12px; line-height: 1.6;">
    <div style="display: flex; align-items: center; gap: 8px;">
      <span style="padding: 2px 6px; border-radius: 4px; background: rgba(59,130,246,0.2); color: #60a5fa; font-weight: 700; border: 1px solid rgba(59,130,246,0.3);">LeetCode 435</span>
      <span style="padding: 2px 6px; border-radius: 4px; background: rgba(245,158,11,0.2); color: #fbbf24; font-weight: 700; border: 1px solid rgba(245,158,11,0.3);">Medium</span>
      <h2 style="font-size: 14px; font-weight: 700; color: #ffffff; margin: 0;">无重叠区间 (Non-overlapping Intervals)</h2>
    </div>
    <p style="margin: 0;">给定一个区间的集合 <code style="color: #fde047; font-family: monospace;">intervals</code> ，其中 <code style="color: #fde047; font-family: monospace;">intervals[i] = [start_i, end_i]</code> 。返回 <em>需要移除区间的最小数量，使剩余区间互不重叠</em> 。</p>
    <div style="padding: 10px; border-radius: 10px; background: #020617; border: 1px solid #1e293b; display: flex; flex-direction: column; gap: 6px; font-family: monospace; font-size: 11px;">
      <div style="color: #34d399; font-weight: 700;">示例 1:</div>
      <div>输入: intervals = [[1,2],[2,3],[3,4],[1,3]]</div>
      <div>输出: 1</div>
      <div>解释: 移除 [1,3] 后，剩下的区间没有重叠。</div>
    </div>
    <div style="padding: 10px; border-radius: 10px; background: #020617; border: 1px solid #1e293b; display: flex; flex-direction: column; gap: 6px; font-family: monospace; font-size: 11px;">
      <div style="color: #34d399; font-weight: 700;">示例 2:</div>
      <div>输入: intervals = [[1,2],[1,2],[1,2]]</div>
      <div>输出: 2</div>
      <div>解释: 你需要移除两个 [1,2] 来使剩下的区间没有重叠。</div>
    </div>
    <div style="padding: 10px; border-radius: 10px; background: #020617; border: 1px solid #1e293b; display: flex; flex-direction: column; gap: 6px; font-family: monospace; font-size: 11px;">
      <div style="color: #34d399; font-weight: 700;">示例 3:</div>
      <div>输入: intervals = [[1,2],[2,3]]</div>
      <div>输出: 0</div>
      <div>解释: 你不需要移除任何区间，因为它们已经是无重叠的了。</div>
    </div>
    <div style="display: flex; flex-direction: column; gap: 4px; color: #94a3b8; font-size: 11.5px;">
      <div style="font-weight: 700; color: #cbd5e1;">提示：</div>
      <div>• 1 &le; intervals.length &le; 10^5</div>
      <div>• intervals[i].length == 2</div>
      <div>• -5 * 10^4 &le; start_i &lt; end_i &le; 5 * 10^4</div>
    </div>
  </div>
`;

export const NON_OVERLAPPING_ANALYSIS_HTML = `
  <div style="display: flex; flex-direction: column; gap: 12px; color: #cbd5e1; font-size: 12px; line-height: 1.6;">
    <h3 style="font-size: 14px; font-weight: 700; color: #ffffff; margin: 0; display: flex; align-items: center; gap: 6px;">
      <span>💡</span> 贪心核心：优先保留右端点最小的区间，腾出后续空间
    </h3>
    <div style="display: flex; flex-direction: column; gap: 8px;">
      <div style="padding: 10px; border-radius: 10px; background: #020617; border: 1px solid #1e293b;">
        <div style="font-weight: 700; color: #60a5fa; margin-bottom: 4px;">① 等价转化为「最大不重叠区间数」</div>
        <p style="margin: 0; color: #94a3b8;">求移除的最少区间数，等价于<strong>求最多能选出多少个互不重叠的区间</strong>。总区间数减去最大不重叠区间数即为最少删除数。</p>
      </div>
      <div style="padding: 10px; border-radius: 10px; background: #020617; border: 1px solid #1e293b;">
        <div style="font-weight: 700; color: #34d399; margin-bottom: 4px;">② 重叠时的贪心淘汰策略</div>
        <p style="margin: 0; color: #94a3b8;">按左边界排序后遍历：<br/>
        • 若 <code style="color: #fb7185; font-family: monospace;">intervals[i][0] < intervals[i - 1][1]</code>：发生重叠！必须删除其中一个。为了给后面留出更多空间，<strong>贪心删除右端点较大的区间</strong>（保留右端点小的，即 <code style="color: #34d399; font-family: monospace;">intervals[i][1] = Math.min(intervals[i][1], intervals[i - 1][1])</code>），删除计数 <code style="color: #fb7185; font-family: monospace;">count++</code>。<br/>
        • 否则不重叠，两区间均保留。</p>
      </div>
      <div style="padding: 10px; border-radius: 10px; background: #020617; border: 1px solid #1e293b;">
        <div style="font-weight: 700; color: #f472b6; margin-bottom: 4px;">③ 与 LC 452 射气球的天然映射</div>
        <p style="margin: 0; color: #94a3b8;">LC 452 射气球是求重叠组数，而本题是求重叠淘汰数。两者更新右边界的代码逻辑几乎完全一致！</p>
      </div>
    </div>
  </div>
`;

export const NON_OVERLAPPING_CODE_LANGUAGES: Record<string, string[]> = {
  java: [
    'public int eraseOverlapIntervals(int[][] intervals) {',
    '    if (intervals.length == 0) return 0;',
    '    // 按左边界升序排序',
    '    Arrays.sort(intervals, (a, b) -> Integer.compare(a[0], b[0]));',
    '    int count = 0; // 记录重叠区间数量（需移除的数量）',
    '    for (int i = 1; i < intervals.length; i++) {',
    '        if (intervals[i][0] < intervals[i - 1][1]) {',
    '            count++; // 发生重叠，必须移除一个区间',
    '            // 贪心：保留右边界更小的区间，为后面的区间腾出更多空间',
    '            intervals[i][1] = Math.min(intervals[i - 1][1], intervals[i][1]);',
    '        }',
    '    }',
    '    return count;',
    '}',
  ],
  cpp: [
    'class Solution {',
    'public:',
    '    int eraseOverlapIntervals(vector<vector<int>>& intervals) {',
    '        if (intervals.empty()) return 0;',
    '        sort(intervals.begin(), intervals.end(), [](const vector<int>& a, const vector<int>& b) {',
    '            return a[0] < b[0];',
    '        });',
    '        int count = 0;',
    '        for (int i = 1; i < intervals.size(); i++) {',
    '            if (intervals[i][0] < intervals[i - 1][1]) {',
    '                count++;',
    '                intervals[i][1] = min(intervals[i - 1][1], intervals[i][1]);',
    '            }',
    '        }',
    '        return count;',
    '    }',
    '};',
  ],
  python: [
    'class Solution:',
    '    def eraseOverlapIntervals(self, intervals: List[List[int]]) -> int:',
    '        if not intervals:',
    '            return 0',
    '        intervals.sort(key=lambda x: x[0])',
    '        count = 0',
    '        for i in range(1, len(intervals)):',
    '            if intervals[i][0] < intervals[i - 1][1]:',
    '                count += 1',
    '                intervals[i][1] = min(intervals[i - 1][1], intervals[i][1])',
    '        return count',
  ],
  javascript: [
    'var eraseOverlapIntervals = function(intervals) {',
    '    if (intervals.length === 0) return 0;',
    '    intervals.sort((a, b) => a[0] - b[0]);',
    '    let count = 0;',
    '    for (let i = 1; i < intervals.length; i++) {',
    '        if (intervals[i][0] < intervals[i - 1][1]) {',
    '            count++;',
    '            intervals[i][1] = Math.min(intervals[i - 1][1], intervals[i][1]);',
    '        }',
    '    }',
    '    return count;',
    '};',
  ],
};
