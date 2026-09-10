/**
 * LeetCode 452: 用最少数量的箭引爆气球 (Minimum Number of Arrows to Burst Balloons)
 * 领域知识与题解精讲配置声明
 */

export const MIN_ARROWS_PROBLEM_HTML = `
  <div style="display: flex; flex-direction: column; gap: 12px; color: #cbd5e1; font-size: 12px; line-height: 1.6;">
    <div style="display: flex; align-items: center; gap: 8px;">
      <span style="padding: 2px 6px; border-radius: 4px; background: rgba(59,130,246,0.2); color: #60a5fa; font-weight: 700; border: 1px solid rgba(59,130,246,0.3);">LeetCode 452</span>
      <span style="padding: 2px 6px; border-radius: 4px; background: rgba(245,158,11,0.2); color: #fbbf24; font-weight: 700; border: 1px solid rgba(245,158,11,0.3);">Medium</span>
      <h2 style="font-size: 14px; font-weight: 700; color: #ffffff; margin: 0;">用最少数量的箭引爆气球 (Minimum Number of Arrows to Burst Balloons)</h2>
    </div>
    <p style="margin: 0;">有一些球形气球贴在一堵用 XY 平面表示的墙面上。墙面上的气球记录在整数数组 <code style="color: #fde047; font-family: monospace;">points</code> ，其中 <code style="color: #fde047; font-family: monospace;">points[i] = [x_start, x_end]</code> 表示水平直径在 <code style="color: #fde047; font-family: monospace;">x_start</code> 和 <code style="color: #fde047; font-family: monospace;">x_end</code> 之间的气球。</p>
    <p style="margin: 0;">一支弓箭可以沿着 x 轴从不同点 <strong>完全垂直地</strong> 向上射出。在坐标 <code style="color: #fde047; font-family: monospace;">x</code> 处射出一支箭，若气球满足 <code style="color: #fde047; font-family: monospace;">x_start &le; x &le; x_end</code> ，则该气球会被引爆。求引爆所有气球所必须射出的 <strong>最小弓箭数</strong> 。</p>
    <div style="padding: 10px; border-radius: 10px; background: #020617; border: 1px solid #1e293b; display: flex; flex-direction: column; gap: 6px; font-family: monospace; font-size: 11px;">
      <div style="color: #34d399; font-weight: 700;">示例 1:</div>
      <div>输入: points = [[10,16],[2,8],[1,6],[7,12]]</div>
      <div>输出: 2</div>
      <div>解释: 气球可以用 2 支箭引爆: 在 x = 6 处射出箭，引爆气球 [2,8] 和 [1,6]；在 x = 11 处射出箭，引爆气球 [10,16] 和 [7,12]。</div>
    </div>
    <div style="padding: 10px; border-radius: 10px; background: #020617; border: 1px solid #1e293b; display: flex; flex-direction: column; gap: 6px; font-family: monospace; font-size: 11px;">
      <div style="color: #34d399; font-weight: 700;">示例 2:</div>
      <div>输入: points = [[1,2],[3,4],[5,6],[7,8]]</div>
      <div>输出: 4</div>
    </div>
    <div style="display: flex; flex-direction: column; gap: 4px; color: #94a3b8; font-size: 11.5px;">
      <div style="font-weight: 700; color: #cbd5e1;">提示：</div>
      <div>• 1 &le; points.length &le; 10^5</div>
      <div>• points[i].length == 2</div>
      <div>• -2^31 &le; x_start &lt; x_end &le; 2^31 - 1</div>
    </div>
  </div>
`;

export const MIN_ARROWS_ANALYSIS_HTML = `
  <div style="display: flex; flex-direction: column; gap: 12px; color: #cbd5e1; font-size: 12px; line-height: 1.6;">
    <h3 style="font-size: 14px; font-weight: 700; color: #ffffff; margin: 0; display: flex; align-items: center; gap: 6px;">
      <span>💡</span> 贪心核心：寻找最大公共重叠区间，一箭多穿
    </h3>
    <div style="display: flex; flex-direction: column; gap: 8px;">
      <div style="padding: 10px; border-radius: 10px; background: #020617; border: 1px solid #1e293b;">
        <div style="font-weight: 700; color: #60a5fa; margin-bottom: 4px;">① 按左边界排序</div>
        <p style="margin: 0; color: #94a3b8;">让所有气球按左边界 <code style="color: #7dd3fc; font-family: monospace;">points[i][0]</code> 升序排序，使可能重叠的气球紧密排在一起。</p>
      </div>
      <div style="padding: 10px; border-radius: 10px; background: #020617; border: 1px solid #1e293b;">
        <div style="font-weight: 700; color: #34d399; margin-bottom: 4px;">② 重叠气球的右边界更新机制</div>
        <p style="margin: 0; color: #94a3b8;">• 若 <code style="color: #fb7185; font-family: monospace;">points[i][0] > points[i-1][1]</code>：说明当前气球与上一个重叠组完全无交集，<strong>必须消耗一支新箭</strong>（<code style="color: #fb7185; font-family: monospace;">result++</code>）。<br/>
        • 否则说明有重叠，可以同用一支箭！此时将当前重叠边界收紧：<br/>
        <code style="color: #34d399; font-family: monospace;">points[i][1] = Math.min(points[i][1], points[i-1][1])</code>，作为下一个气球判断能否一起被引爆的标准。</p>
      </div>
      <div style="padding: 10px; border-radius: 10px; background: #020617; border: 1px solid #1e293b;">
        <div style="font-weight: 700; color: #f472b6; margin-bottom: 4px;">③ 注意比较防溢出</div>
        <p style="margin: 0; color: #94a3b8;">在 Java/C++ 中，坐标可能达到 <code style="color: #fde047; font-family: monospace;">-2^31 ~ 2^31 - 1</code>，排序时不可直接使用 <code style="color: #fb7185; font-family: monospace;">a[0] - b[0]</code>（会整型溢出），应用 <code style="color: #7dd3fc; font-family: monospace;">Integer.compare(a[0], b[0])</code>。</p>
      </div>
    </div>
  </div>
`;

export const MIN_ARROWS_CODE_LANGUAGES: Record<string, string[]> = {
  java: [
    'public int findMinArrowShots(int[][] points) {',
    '    if (points.length == 0) return 0;',
    '    // 按左边界升序排序（防溢出）',
    '    Arrays.sort(points, (a, b) -> Integer.compare(a[0], b[0]));',
    '    int count = 1; // points 不为空至少需要一支箭',
    '    for (int i = 1; i < points.length; i++) {',
    '        if (points[i][0] > points[i - 1][1]) {',
    '            count++; // 气球 i 和气球 i-1 不挨着，必须加一支箭',
    '        } else {',
    '            // 气球 i 和气球 i-1 挨着，更新重叠气球最小右边界',
    '            points[i][1] = Math.min(points[i - 1][1], points[i][1]);',
    '        }',
    '    }',
    '    return count;',
    '}',
  ],
  cpp: [
    'class Solution {',
    'public:',
    '    int findMinArrowShots(vector<vector<int>>& points) {',
    '        if (points.empty()) return 0;',
    '        sort(points.begin(), points.end(), [](const vector<int>& a, const vector<int>& b) {',
    '            return a[0] < b[0];',
    '        });',
    '        int count = 1;',
    '        for (int i = 1; i < points.size(); i++) {',
    '            if (points[i][0] > points[i - 1][1]) {',
    '                count++;',
    '            } else {',
    '                points[i][1] = min(points[i - 1][1], points[i][1]);',
    '            }',
    '        }',
    '        return count;',
    '    }',
    '};',
  ],
  python: [
    'class Solution:',
    '    def findMinArrowShots(self, points: List[List[int]]) -> int:',
    '        if not points:',
    '            return 0',
    '        points.sort(key=lambda x: x[0])',
    '        count = 1',
    '        for i in range(1, len(points)):',
    '            if points[i][0] > points[i - 1][1]:',
    '                count += 1',
    '            else:',
    '                points[i][1] = min(points[i - 1][1], points[i][1])',
    '        return count',
  ],
  javascript: [
    'var findMinArrowShots = function(points) {',
    '    if (points.length === 0) return 0;',
    '    points.sort((a, b) => a[0] - b[0]);',
    '    let count = 1;',
    '    for (let i = 1; i < points.length; i++) {',
    '        if (points[i][0] > points[i - 1][1]) {',
    '            count++;',
    '        } else {',
    '            points[i][1] = Math.min(points[i - 1][1], points[i][1]);',
    '        }',
    '    }',
    '    return count;',
    '};',
  ],
};
