/**
 * 穿云神箭·极光引爆重叠气球 (Arrow Balloon Sniper: Greedy Interval Burst)
 * 经典贪心区间选点算法（LeetCode 452 用最少数量的箭引爆气球 & LeetCode 435 无重叠区间）
 * 多语言题解、证明推导与交互式关卡配置
 */

export const ARROW_BALLOON_CODE_LANGUAGES: Record<string, string[]> = {
  cpp: [
    '#include <iostream>',
    '#include <vector>',
    '#include <algorithm>',
    'using namespace std;',
    '',
    '// 经典贪心区间选点：用最少数量的箭引爆所有气球 (LeetCode 452)',
    'int findMinArrowShots(vector<vector<int>>& points) {',
    '    if (points.empty()) return 0;',
    '',
    '    // 核心贪心第一步：按右端点（x_end）升序排序',
    '    sort(points.begin(), points.end(), [](const vector<int>& a, const vector<int>& b) {',
    '        return a[1] < b[1];',
    '    });',
    '',
    '    int arrows = 1;              // 至少需要 1 支箭',
    '    int arrowPos = points[0][1]; // 第一支箭射在第一个气球的右边界',
    '',
    '    // 核心贪心第二步：线性扫描后续气球',
    '    for (size_t i = 1; i < points.size(); i++) {',
    '        // 如果当前气球的左端点 > 当前箭的位置，说明当前箭射不到它',
    '        if (points[i][0] > arrowPos) {',
    '            arrows++;               // 射出新的一支箭',
    '            arrowPos = points[i][1]; // 将新箭瞄准在当前气球的最右边界，尽可能覆盖更多后续气球',
    '        }',
    '        // 否则当前气球左端点 <= arrowPos，被同一支垂直激光一并引爆，无需加箭！',
    '    }',
    '',
    '    return arrows;',
    '}',
  ],
  java: [
    'import java.util.*;',
    '',
    'public class ArrowBalloonSniper {',
    '    public int findMinArrowShots(int[][] points) {',
    '        if (points.length == 0) return 0;',
    '',
    '        // 按照右端点升序排序（防止减法溢出使用 Integer.compare）',
    '        Arrays.sort(points, (a, b) -> Integer.compare(a[1], b[1]));',
    '',
    '        int arrows = 1;',
    '        int arrowPos = points[0][1];',
    '',
    '        for (int i = 1; i < points.length; i++) {',
    '            if (points[i][0] > arrowPos) {',
    '                arrows++;',
    '                arrowPos = points[i][1]; // 贪心选在右边界',
    '            }',
    '        }',
    '',
    '        return arrows;',
    '    }',
    '}',
  ],
  python: [
    'def find_min_arrow_shots(points: list[list[int]]) -> int:',
    '    """贪心右端点排序 + 激光单调穿透选点"""',
    '    if not points:',
    '        return 0',
    '    ',
    '    # 按右端点升序排序',
    '    points.sort(key=lambda x: x[1])',
    '    ',
    '    arrows = 1',
    '    arrow_pos = points[0][1]',
    '    ',
    '    for start, end in points[1:]:',
    '        # 左端点超出当前激光覆盖范围，必须射出新箭',
    '        if start > arrow_pos:',
    '            arrows += 1',
    '            arrow_pos = end  # 贪心选当前气球的最右边界',
    '            ',
    '    return arrows',
  ],
  javascript: [
    'function findMinArrowShots(points) {',
    '  if (!points.length) return 0;',
    '  ',
    '  // 按右端点升序排序',
    '  points.sort((a, b) => a[1] - b[1]);',
    '  ',
    '  let arrows = 1;',
    '  let arrowPos = points[0][1];',
    '  ',
    '  for (let i = 1; i < points.length; i++) {',
    '    if (points[i][0] > arrowPos) {',
    '      arrows++;',
    '      arrowPos = points[i][1];',
    '    }',
    '  }',
    '  ',
    '  return arrows;',
    '}',
  ],
};

export const ARROW_BALLOON_PROBLEM_HTML = `
  <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; color: #1e293b; line-height: 1.6;">
    <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 10px;">
      <span style="font-size: 20px;">🎯</span>
      <h3 style="margin: 0; font-size: 15px; font-weight: 800; color: #0f172a;">穿云神箭·激光引爆重叠气球 (Arrow Balloon Sniper)</h3>
      <span style="background: #eff6ff; color: #2563eb; font-size: 11px; font-weight: 700; padding: 2px 8px; border-radius: 999px; border: 1px solid #bfdbfe;">贪心区间选点 LeetCode 452</span>
    </div>

    <p style="font-size: 12.5px; color: #334155; margin-bottom: 10px;">
      在二维天空靶场中，漂浮着若干个水平跨度为 $[x_{start}, x_{end}]$ 的霓虹能量气球。一支垂直向上发射的极光穿云神箭在坐标 $x$ 处发射，能够<b>瞬间穿透并引爆所有满足 $x_{start} \\le x \\le x_{end}$ 的气球</b>！请计算引爆所有气球所需的<b>最少箭矢发射次数</b>。
    </p>

    <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 8px; margin-bottom: 12px;">
      <div style="background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 6px; padding: 8px;">
        <h4 style="margin: 0 0 4px 0; font-size: 11.5px; color: #0f172a;">🎮 极光神箭靶场玩法</h4>
        <ul style="margin: 0; padding-left: 16px; font-size: 11px; color: #475569;">
          <li><b>🏹 60 FPS 极光穿透射击</b>：点击画布或按空格发射极光，一箭穿透多重气球；</li>
          <li><b>💥 拟真粒子爆炸与连击音效</b>：Web Audio 合成激光蓄力、气球破裂与多重连击声；</li>
          <li><b>✨ 贪心单步推演与自动求解</b>：按右端点排序，直观展现区间交集选点奥秘！</li>
        </ul>
      </div>
      <div style="background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 6px; padding: 8px;">
        <h4 style="margin: 0 0 4px 0; font-size: 11.5px; color: #0f172a;">🧠 区间贪心选点精髓</h4>
        <ul style="margin: 0; padding-left: 16px; font-size: 11px; color: #475569;">
          <li><b>按右端点升序排序</b>：优先满足最先结束的气球，不给它逃脱的机会；</li>
          <li><b>贪心射在最右边界</b>：把箭射在该气球的最右端 $x_{end}$，留给后续气球最大的重叠命中概率！</li>
        </ul>
      </div>
    </div>
  </div>
`;

export const ARROW_BALLOON_ANALYSIS_HTML = `
  <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; color: #1e293b; line-height: 1.6;">
    <h3 style="margin-top: 0; font-size: 14px; font-weight: 800; color: #0f172a;">区间选点贪心算法正确性证明</h3>

    <div style="margin-bottom: 10px;">
      <h4 style="margin: 0 0 4px 0; font-size: 12px; color: #2563eb;">1. 为什么选择按右端点（End Coordinate）升序排序？</h4>
      <p style="font-size: 11.5px; color: #475569; margin: 0 0 6px 0;">
        考虑最先结束的气球 $B_1 = [start_1, end_1]$。为了引爆 $B_1$，我们发射的箭坐标 $x$ 必须落在 $[start_1, end_1]$ 范围内。为了尽可能多地“顺带”引爆后面的气球，我们应当把 $x$ 选得尽量靠右，即<b>贪心选择 $x = end_1$</b>。
      </p>
      <p style="font-size: 11.5px; color: #475569; margin: 0;">
        所有满足 $start_i \\le end_1$ 的后续气球由于 $end_i \\ge end_1$（排序保证），其区间必然包含 $end_1$，因此都被这一支箭一并引爆！一旦遇到 $start_k > end_1$，说明 $B_k$ 与之前所有气球无交集，必须开启新的一支箭并设新位置为 $end_k$。
      </p>
    </div>

    <div style="margin-bottom: 10px;">
      <h4 style="margin: 0 0 4px 0; font-size: 12px; color: #0891b2;">2. 复杂度分析与等价问题</h4>
      <p style="font-size: 11.5px; color: #475569; margin: 0;">
        <b>时间复杂度</b>：排序耗时 $O(N \\log N)$，单次线性扫描耗时 $O(N)$，总时间复杂度为 $O(N \\log N)$。<br/>
        <b>空间复杂度</b>：排序栈空间 $O(\\log N)$ 或 $O(N)$。<br/>
        <b>等价映射</b>：本题在数学上等价于 LeetCode 435《无重叠区间》，所需最少箭数即为“最大互不重叠区间集合”的大小！
      </p>
    </div>
  </div>
`;
