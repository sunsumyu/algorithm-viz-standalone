/**
 * 电动车充放电分层图最短路 (Electric Vehicle Minimum Cost - Charge Layered Dijkstra)
 * 左程云算法通关课 Class 064 Code05 (LeetCode LCP 35)
 * 核心：状态空间 (u, charge)、原地充电转移与道路行驶转移、分层图 Dijkstra 优先队列
 */

export const EV_CHARGE_CODE_LANGUAGES: Record<string, string[]> = {
  cpp: [
    '#include <iostream>',
    '#include <vector>',
    '#include <queue>',
    'using namespace std;',
    '',
    '// 电动车游历城市最小费用 (LeetCode LCP 35 / 左程云 Class064 Code05)',
    '// 核心：(u, power) 二元状态空间，原地充电转移 + 行驶放电转移',
    'class Solution {',
    'public:',
    '    struct Node {',
    '        int city, power, cost;',
    '        bool operator>(const Node& other) const {',
    '            return cost > other.cost;',
    '        }',
    '    };',
    '    ',
    '    int electricCarPlan(vector<vector<int>>& paths, int cnt, int start, int end, vector<int>& charge) {',
    '        int n = charge.size();',
    '        vector<vector<pair<int, int>>> adj(n);',
    '        for (auto& p : paths) {',
    '            adj[p[0]].push_back({p[1], p[2]});',
    '            adj[p[1]].push_back({p[0], p[2]});',
    '        }',
    '        ',
    '        // dist[u][power] = 到达城市 u 且剩余电量为 power 的最小总时间/费用',
    '        vector<vector<int>> dist(n, vector<int>(cnt + 1, 1e9));',
    '        vector<vector<bool>> vis(n, vector<bool>(cnt + 1, false));',
    '        priority_queue<Node, vector<Node>, greater<Node>> pq;',
    '        ',
    '        dist[start][0] = 0;',
    '        pq.push({start, 0, 0});',
    '        ',
    '        while (!pq.empty()) {',
    '            Node cur = pq.top(); pq.pop();',
    '            int u = cur.city, p = cur.power, cost = cur.cost;',
    '            if (vis[u][p]) continue;',
    '            vis[u][p] = true;',
    '            if (u == end) return cost;',
    '            ',
    '            // 决策 1: 原地充 1 格电 (花费 charge[u] 单位时间)',
    '            if (p < cnt && !vis[u][p + 1] && cost + charge[u] < dist[u][p + 1]) {',
    '                dist[u][p + 1] = cost + charge[u];',
    '                pq.push({u, p + 1, cost + charge[u]});',
    '            }',
    '            ',
    '            // 决策 2: 驾车行驶到相邻城市 (耗电 w, 耗时 w)',
    '            for (auto& edge : adj[u]) {',
    '                int v = edge.first, w = edge.second;',
    '                if (p >= w && !vis[v][p - w] && cost + w < dist[v][p - w]) {',
    '                    dist[v][p - w] = cost + w;',
    '                    pq.push({v, p - w, cost + w});',
    '                }',
    '            }',
    '        }',
    '        return -1;',
    '    }',
    '};',
  ],
  java: [
    'package class064;',
    '',
    'import java.util.PriorityQueue;',
    '',
    '// 电动车游历城市最小费用 - 分层图 Dijkstra',
    'public class Code05_VisitCityMinCost {',
    '    public static int electricCarPlan(int[][] paths, int cnt, int start, int end, int[] charge) {',
    '        return 0;',
    '    }',
    '}',
  ],
  python: [
    'import heapq',
    '',
    'class Solution:',
    '    def electricCarPlan(self, paths: list[list[int]], cnt: int, start: int, end: int, charge: list[int]) -> int:',
    '        return 0',
  ],
  javascript: [
    '// 电动车游历城市 (JavaScript 版)',
    'function electricCarPlan(paths, cnt, start, end, charge) {',
    '  return 0;',
    '}',
  ],
};

export const EV_CHARGE_PROBLEM_HTML = `
  <div style="font-size: 13px; line-height: 1.6; color: #334155;">
    <h3 style="margin-top: 0; color: #0f172a; font-size: 15px; font-weight: 800;">⚡ 电动车游历城市最小费用 (Electric Car Plan)</h3>
    <p>
      小明驾驶一辆最大电池容量为 $\\text{cnt}$ 的电动车从城市 $\\text{start}$ 出发前往 $\\text{end}$。在每个城市 $u$ 每充 1 格电需要耗时 $\\text{charge}[u]$，在道路 $(u, v, w)$ 行驶消耗 $w$ 格电且耗时 $w$。求到达终点的最短总时间（左程云 Class064 Code05 / LeetCode LCP 35）。
    </p>

    <div style="background: #f8fafc; border-left: 4px solid #3b82f6; padding: 8px 12px; margin: 10px 0; border-radius: 0 6px 6px 0;">
      <div style="font-weight: 700; color: #1e40af; margin-bottom: 4px;">🔋 $(u, \\text{power})$ 状态图分层松弛</div>
      <div style="font-size: 11.5px; color: #334155;">
        1. <b>原地充电转移</b>：$(u, p) \\xrightarrow{+\\text{charge}[u]} (u, p+1)$；<br/>
        2. <b>道路行驶转移</b>：$(u, p) \\xrightarrow{+w} (v, p-w)$（要求 $p \\ge w$）。
      </div>
    </div>
  </div>
`;

export const EV_CHARGE_ANALYSIS_HTML = `
  <div style="font-size: 13px; line-height: 1.6; color: #334155;">
    <h3 style="margin-top: 0; color: #0f172a; font-size: 15px; font-weight: 800;">💡 分层图模型在资源约束下的泛化</h3>

    <div style="background: #eff6ff; border: 1px solid #bfdbfe; border-radius: 6px; padding: 10px; margin-bottom: 12px;">
      <div style="font-weight: 700; color: #1e3a8a; margin-bottom: 4px;">1. 状态空间几何展开</div>
      <div style="font-size: 12px; color: #1e40af;">
        将每个物理城市拓展为 $\\text{cnt}+1$ 层（分别对应电量 $0 \\dots \\text{cnt}$）。充电是层内垂直上升边，行驶是跨城市的斜向下降边，从而将复杂的充放电决策转化为纯粹的静态最短路！
      </div>
    </div>

    <div style="background: #f0fdf4; border: 1px solid #bbf7d0; border-radius: 6px; padding: 10px;">
      <div style="font-weight: 700; color: #166534; margin-bottom: 4px;">2. 复杂度精细评估</div>
      <div style="font-size: 12px; color: #15803d;">
        总状态数 $V = N \\times (\\text{cnt}+1)$，总边数 $E = N \\times \\text{cnt} + M \\times (\\text{cnt}+1)$，优先队列 Dijkstra 运行时间为 $O(E \\log V)$，极速收敛！
      </div>
    </div>
  </div>
`;
