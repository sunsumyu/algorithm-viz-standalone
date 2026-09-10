/**
 * 时间折跃·星际航道区间合并 (Warp Gate: Interval Merge Fleet)
 * 经典贪心区间算法（Interval Merging）、合并区间（LeetCode 56）与时空等离子融合多语言题解
 */

export const INTERVAL_WARP_CODE_LANGUAGES: Record<string, string[]> = {
  cpp: [
    '#include <iostream>',
    '#include <vector>',
    '#include <algorithm>',
    'using namespace std;',
    '',
    '// 经典贪心：合并重叠区间 (LeetCode 56)',
    'vector<vector<int>> merge(vector<vector<int>>& intervals) {',
    '    if (intervals.empty()) return {};',
    '',
    '    // 核心贪心第一步：按左端点升序排序',
    '    sort(intervals.begin(), intervals.end(), [](const vector<int>& a, const vector<int>& b) {',
    '        return a[0] < b[0];',
    '    });',
    '',
    '    vector<vector<int>> merged;',
    '    merged.push_back(intervals[0]);',
    '',
    '    // 核心贪心第二步：线性扫描拓展右边界',
    '    for (size_t i = 1; i < intervals.size(); i++) {',
    '        // 如果当前区间的左端点 <= 上一个区间的右端点，发生重叠，融合区间！',
    '        if (intervals[i][0] <= merged.back()[1]) {',
    '            merged.back()[1] = max(merged.back()[1], intervals[i][1]);',
    '        } else {',
    '            // 无重叠，开启全新独立航道',
    '            merged.push_back(intervals[i]);',
    '        }',
    '    }',
    '',
    '    return merged;',
    '}',
  ],
  java: [
    'import java.util.*;',
    '',
    'public class IntervalWarpMerge {',
    '    public int[][] merge(int[][] intervals) {',
    '        if (intervals.length <= 1) return intervals;',
    '',
    '        // 按起点贪心排序',
    '        Arrays.sort(intervals, (a, b) -> Integer.compare(a[0], b[0]));',
    '',
    '        List<int[]> merged = new ArrayList<>();',
    '        int[] current = intervals[0];',
    '        merged.add(current);',
    '',
    '        for (int i = 1; i < intervals.length; i++) {',
    '            if (intervals[i][0] <= current[1]) {',
    '                current[1] = Math.max(current[1], intervals[i][1]); // 拓展右边界',
    '            } else {',
    '                current = intervals[i];',
    '                merged.add(current);',
    '            }',
    '        }',
    '',
    '        return merged.toArray(new int[merged.size()][]);',
    '    }',
    '}',
  ],
  python: [
    'def merge_intervals(intervals: list[list[int]]) -> list[list[int]]:',
    '    """贪心排序 + 动态右边界合并"""',
    '    if not intervals:',
    '        return []',
    '    ',
    '    # 按起点升序排序',
    '    intervals.sort(key=lambda x: x[0])',
    '    merged = [intervals[0]]',
    '    ',
    '    for cur in intervals[1:]:',
    '        prev = merged[-1]',
    '        if cur[0] <= prev[1]:',
    '            prev[1] = max(prev[1], cur[1])  # 融合重叠区间',
    '        else:',
    '            merged.append(cur)',
    '            ',
    '    return merged',
  ],
  javascript: [
    'function mergeIntervals(intervals) {',
    '  if (!intervals.length) return [];',
    '  intervals.sort((a, b) => a[0] - b[0]);',
    '  const res = [intervals[0]];',
    '  for (let i = 1; i < intervals.length; i++) {',
    '    const prev = res[res.length - 1];',
    '    if (intervals[i][0] <= prev[1]) {',
    '      prev[1] = Math.max(prev[1], intervals[i][1]);',
    '    } else {',
    '      res.push(intervals[i]);',
    '    }',
    '  }',
    '  return res;',
    '}',
  ],
};

export const INTERVAL_WARP_PROBLEM_HTML = `
  <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; color: #1e293b; line-height: 1.6;">
    <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 10px;">
      <span style="font-size: 20px;">🛸</span>
      <h3 style="margin: 0; font-size: 15px; font-weight: 800; color: #0f172a;">时间折跃·星际航道区间合并 (Warp Gate Fleet)</h3>
      <span style="background: #eff6ff; color: #2563eb; font-size: 11px; font-weight: 700; padding: 2px 8px; border-radius: 999px; border: 1px solid #bfdbfe;">贪心区间 LeetCode 56</span>
    </div>

    <p style="font-size: 12.5px; color: #334155; margin-bottom: 10px;">
      深空宇宙中分布着多支超空间折跃舰队，各舰队占用特定的时空区间 $[start_i, end_i]$。当两条航道在时间线上发生<b>重叠或相交</b>时，强烈的等离子能量场将两航道<b>融合成一条超级跃迁通道 $[start_1, \\max(end_1, end_2)]$</b>！
    </p>

    <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 8px; margin-bottom: 12px;">
      <div style="background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 6px; padding: 8px;">
        <h4 style="margin: 0 0 4px 0; font-size: 11.5px; color: #0f172a;">🎮 星舰折跃玩法</h4>
        <ul style="margin: 0; padding-left: 16px; font-size: 11px; color: #475569;">
          <li><b>🛸 60 FPS 航道等离子融合</b>：重叠航道碰撞激发蓝色等离子光环与电弧；</li>
          <li><b>⏱️ 时间轴标尺透视</b>：实时在时间轴 $0 \\sim 20$ 上拖拽与观察航道；</li>
          <li><b>✨ 贪心扫描一键折跃</b>：自动执行起点排序并单调合并所有重叠区间！</li>
        </ul>
      </div>
      <div style="background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 6px; padding: 8px;">
        <h4 style="margin: 0 0 4px 0; font-size: 11.5px; color: #0f172a;">🧠 区间贪心精髓</h4>
        <ul style="margin: 0; padding-left: 16px; font-size: 11px; color: #475569;">
          <li><b>左端点排序为先</b>：排序后相邻区间的重叠关系具备了单调性；</li>
          <li><b>右端点贪心拓展</b>：若 $cur.start \\le prev.end$，则 $prev.end = \\max(prev.end, cur.end)$。</li>
        </ul>
      </div>
    </div>
  </div>
`;

export const INTERVAL_WARP_ANALYSIS_HTML = `
  <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; color: #1e293b; line-height: 1.6;">
    <h3 style="margin-top: 0; font-size: 14px; font-weight: 800; color: #0f172a;">区间贪心证明与时空复杂度</h3>

    <div style="margin-bottom: 10px;">
      <h4 style="margin: 0 0 4px 0; font-size: 12px; color: #2563eb;">1. 为什么必须先按左端点排序？</h4>
      <p style="font-size: 11.5px; color: #475569; margin: 0;">
        如果不排序，重叠的区间可能散落在数组的任意位置，无法在 $O(N)$ 线性时间内发现所有融合机会；先按左端点排序后，所有潜在能合并的区间必然在时间线上紧密相邻，只需单次遍历即可完成全局最优合并！
      </p>
    </div>
  </div>
`;
