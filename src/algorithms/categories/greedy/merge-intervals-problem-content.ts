/**
 * LeetCode 56: 合并区间 (Merge Intervals)
 * 领域知识与题解精讲配置声明
 */

export const MERGE_INTERVALS_PROBLEM_HTML = `
  <div style="display: flex; flex-direction: column; gap: 12px; color: #cbd5e1; font-size: 12px; line-height: 1.6;">
    <div style="display: flex; align-items: center; gap: 8px;">
      <span style="padding: 2px 6px; border-radius: 4px; background: rgba(59,130,246,0.2); color: #60a5fa; font-weight: 700; border: 1px solid rgba(59,130,246,0.3);">LeetCode 56</span>
      <span style="padding: 2px 6px; border-radius: 4px; background: rgba(245,158,11,0.2); color: #fbbf24; font-weight: 700; border: 1px solid rgba(245,158,11,0.3);">Medium</span>
      <h2 style="font-size: 14px; font-weight: 700; color: #ffffff; margin: 0;">合并区间 (Merge Intervals)</h2>
    </div>
    <p style="margin: 0;">以数组 <code style="color: #fde047; font-family: monospace;">intervals</code> 表示若干个区间的集合，其中单个区间为 <code style="color: #fde047; font-family: monospace;">intervals[i] = [start_i, end_i]</code> 。</p>
    <p style="margin: 0;">请你合并所有重叠的区间，并返回 <em>一个不重叠的区间数组，该数组需恰好覆盖输入中的所有区间</em> 。</p>
    <div style="padding: 10px; border-radius: 10px; background: #020617; border: 1px solid #1e293b; display: flex; flex-direction: column; gap: 6px; font-family: monospace; font-size: 11px;">
      <div style="color: #34d399; font-weight: 700;">示例 1:</div>
      <div>输入: intervals = [[1,3],[2,6],[8,10],[15,18]]</div>
      <div>输出: [[1,6],[8,10],[15,18]]</div>
      <div>解释: 区间 [1,3] 和 [2,6] 重叠, 将它们合并为 [1,6].</div>
    </div>
    <div style="padding: 10px; border-radius: 10px; background: #020617; border: 1px solid #1e293b; display: flex; flex-direction: column; gap: 6px; font-family: monospace; font-size: 11px;">
      <div style="color: #34d399; font-weight: 700;">示例 2:</div>
      <div>输入: intervals = [[1,4],[4,5]]</div>
      <div>输出: [[1,5]]</div>
      <div>解释: 区间 [1,4] 和 [4,5] 可被视为重叠区间。</div>
    </div>
    <div style="display: flex; flex-direction: column; gap: 4px; color: #94a3b8; font-size: 11.5px;">
      <div style="font-weight: 700; color: #cbd5e1;">提示：</div>
      <div>• 1 &le; intervals.length &le; 10^4</div>
      <div>• intervals[i].length == 2</div>
      <div>• 0 &le; start_i &le; end_i &le; 10^4</div>
    </div>
  </div>
`;

export const MERGE_INTERVALS_ANALYSIS_HTML = `
  <div style="display: flex; flex-direction: column; gap: 12px; color: #cbd5e1; font-size: 12px; line-height: 1.6;">
    <h3 style="font-size: 14px; font-weight: 700; color: #ffffff; margin: 0; display: flex; align-items: center; gap: 6px;">
      <span>💡</span> 贪心核心：按左端点排序后，动态扩展末尾重叠右边界
    </h3>
    <div style="display: flex; flex-direction: column; gap: 8px;">
      <div style="padding: 10px; border-radius: 10px; background: #020617; border: 1px solid #1e293b;">
        <div style="font-weight: 700; color: #60a5fa; margin-bottom: 4px;">① 按左边界升序排序</div>
        <p style="margin: 0; color: #94a3b8;">使可能重叠的区间在数组中紧邻出现。先将排序后的第一个区间放入结果数组 <code style="color: #7dd3fc; font-family: monospace;">merged</code> 中。</p>
      </div>
      <div style="padding: 10px; border-radius: 10px; background: #020617; border: 1px solid #1e293b;">
        <div style="font-weight: 700; color: #34d399; margin-bottom: 4px;">② 重叠合并 vs 不重叠追加</div>
        <p style="margin: 0; color: #94a3b8;">从第二个区间开始遍历：<br/>
        • 若 <code style="color: #34d399; font-family: monospace;">intervals[i][0] <= merged.last[1]</code>：说明当前区间的起点落在上一区间的覆盖范围内（发生重叠），<strong>贪心扩充右边界</strong>：<code style="color: #34d399; font-family: monospace;">merged.last[1] = Math.max(merged.last[1], intervals[i][1])</code>。<br/>
        • 否则（<code style="color: #fbbf24; font-family: monospace;">intervals[i][0] > merged.last[1]</code>）：无重叠，直接将当前新区间追加进 <code style="color: #7dd3fc; font-family: monospace;">merged</code>。</p>
      </div>
      <div style="padding: 10px; border-radius: 10px; background: #020617; border: 1px solid #1e293b;">
        <div style="font-weight: 700; color: #f472b6; margin-bottom: 4px;">③ 复杂度分析</div>
        <p style="margin: 0; color: #94a3b8;">• 时间复杂度: <code style="color: #7dd3fc; font-family: monospace;">O(N log N)</code>（排序）+ <code style="color: #34d399; font-family: monospace;">O(N)</code>（单次扫描遍历）。<br/>
        • 空间复杂度: <code style="color: #7dd3fc; font-family: monospace;">O(N)</code> 用于存储合并后的结果集合。</p>
      </div>
    </div>
  </div>
`;

export const MERGE_INTERVALS_CODE_LANGUAGES: Record<string, string[]> = {
  java: [
    'public int[][] merge(int[][] intervals) {',
    '    if (intervals.length <= 1) return intervals;',
    '    // 1. 按左边界从小到大排序',
    '    Arrays.sort(intervals, (a, b) -> Integer.compare(a[0], b[0]));',
    '    List<int[]> res = new ArrayList<>();',
    '    res.add(intervals[0]);',
    '    // 2. 从第二个区间开始遍历',
    '    for (int i = 1; i < intervals.length; i++) {',
    '        int[] last = res.get(res.size() - 1);',
    '        if (intervals[i][0] <= last[1]) { // 发现重叠，合并并更新右边界',
    '            last[1] = Math.max(last[1], intervals[i][1]);',
    '        } else { // 无重叠，追加新区间',
    '            res.add(intervals[i]);',
    '        }',
    '    }',
    '    return res.toArray(new int[res.size()][]);',
    '}',
  ],
  cpp: [
    'class Solution {',
    'public:',
    '    vector<vector<int>> merge(vector<vector<int>>& intervals) {',
    '        if (intervals.size() <= 1) return intervals;',
    '        sort(intervals.begin(), intervals.end());',
    '        vector<vector<int>> result;',
    '        result.push_back(intervals[0]);',
    '        for (int i = 1; i < intervals.size(); i++) {',
    '            if (intervals[i][0] <= result.back()[1]) {',
    '                result.back()[1] = max(result.back()[1], intervals[i][1]);',
    '            } else {',
    '                result.push_back(intervals[i]);',
    '            }',
    '        }',
    '        return result;',
    '    }',
    '};',
  ],
  python: [
    'class Solution:',
    '    def merge(self, intervals: List[List[int]]) -> List[List[int]]:',
    '        if len(intervals) <= 1:',
    '            return intervals',
    '        intervals.sort(key=lambda x: x[0])',
    '        merged = [intervals[0]]',
    '        for current in intervals[1:]:',
    '            last = merged[-1]',
    '            if current[0] <= last[1]:',
    '                last[1] = max(last[1], current[1])',
    '            else:',
    '                merged.append(current)',
    '        return merged',
  ],
  javascript: [
    'var merge = function(intervals) {',
    '    if (intervals.length <= 1) return intervals;',
    '    intervals.sort((a, b) => a[0] - b[0]);',
    '    const res = [intervals[0]];',
    '    for (let i = 1; i < intervals.length; i++) {',
    '        const last = res[res.length - 1];',
    '        if (intervals[i][0] <= last[1]) {',
    '            last[1] = Math.max(last[1], intervals[i][1]);',
    '        } else {',
    '            res.push(intervals[i]);',
    '        }',
    '    }',
    '    return res;',
    '};',
  ],
};
