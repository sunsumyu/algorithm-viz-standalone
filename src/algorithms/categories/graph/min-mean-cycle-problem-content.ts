/**
 * 最小均值回路与分数规划 (Minimum Mean Weight Cycle - Karp's Algorithm)
 * 进阶图论: 0-1 分数规划、边权重赋权 w'(e) = w(e) - lambda、SPFA 负环判定、二分逼近 (洛谷 P2868)
 */

export const MIN_MEAN_CYCLE_CODE_LANGUAGES: Record<string, string[]> = {
  cpp: [
    '#include <iostream>',
    '#include <vector>',
    '#include <queue>',
    'using namespace std;',
    '',
    '// 最小均值回路 (0-1 分数规划 + SPFA 判负环)',
    '// 核心：二分均值 lambda，边权赋为 w - lambda，检测负权回路',
    'class MinMeanCycle {',
    'public:',
    '    struct Edge { int to; double w; };',
    '    int n;',
    '    vector<vector<Edge>> adj;',
    '    ',
    '    MinMeanCycle(int n) : n(n), adj(n + 1) {}',
    '    ',
    '    void addEdge(int u, int v, double w) {',
    '        adj[u].push_back({v, w});',
    '    }',
    '    ',
    '    // 检查当均值为 lambda 时是否存在负环',
    '    bool hasNegativeCycle(double lambda) {',
    '        vector<double> dist(n + 1, 0);',
    '        vector<int> count(n + 1, 0);',
    '        vector<bool> inQueue(n + 1, true);',
    '        queue<int> q;',
    '        ',
    '        for (int i = 1; i <= n; ++i) q.push(i);',
    '        ',
    '        while (!q.empty()) {',
    '            int u = q.front(); q.pop();',
    '            inQueue[u] = false;',
    '            ',
    '            for (const auto& edge : adj[u]) {',
    '                int v = edge.to;',
    '                double newW = edge.w - lambda;',
    '                if (dist[u] + newW < dist[v]) {',
    '                    dist[v] = dist[u] + newW;',
    '                    count[v] = count[u] + 1;',
    '                    if (count[v] >= n) return true; // 存在负环',
    '                    if (!inQueue[v]) {',
    '                        q.push(v);',
    '                        inQueue[v] = true;',
    '                    }',
    '                }',
    '            }',
    '        }',
    '        return false;',
    '    }',
    '    ',
    '    double findMinMeanCycle() {',
    '        double l = -1e4, r = 1e4;',
    '        for (int iter = 0; iter < 60; ++iter) {',
    '            double mid = (l + r) / 2.0;',
    '            if (hasNegativeCycle(mid)) {',
    '                r = mid; // 存在负环，说明最小均值 <= mid',
    '            } else {',
    '                l = mid;',
    '            }',
    '        }',
    '        return l;',
    '    }',
    '};',
  ],
  java: [
    'package advanced_graph;',
    '',
    'import java.util.*;',
    '',
    '// 最小均值回路 - 0-1分数规划',
    'public class Code01_MinMeanCycle {',
    '    public static double findMinMeanCycle(int n, double[][] edges) { return 0.0; }',
    '}',
  ],
  python: [
    '# 最小均值回路 (Python 版)',
    'def min_mean_cycle(n, edges):',
    '    return 0.0',
  ],
  javascript: [
    '// 最小均值回路 (JavaScript 版)',
    'function minMeanCycle(n, edges) {',
    '  return 0.0;',
    '}',
  ],
};

export const MIN_MEAN_CYCLE_PROBLEM_HTML = `
  <div style="font-size: 13px; line-height: 1.6; color: #334155;">
    <h3 style="margin-top: 0; color: #0f172a; font-size: 15px; font-weight: 800;">🔄 最小均值回路 (Minimum Mean Weight Cycle)</h3>
    <p>
      给定带权有向图 $G = (V, E)$，在图中寻找一个有向环 $C$，使其平均边权 $\\frac{\\sum_{e \\in C} w(e)}{|C|}$ 达到全局最小 $\\lambda^*$（0-1 分数规划 / 洛谷 P2868）。
    </p>

    <div style="background: #f8fafc; border-left: 4px solid #3b82f6; padding: 8px 12px; margin: 10px 0; border-radius: 0 6px 6px 0;">
      <div style="font-weight: 700; color: #1e40af; margin-bottom: 4px;">⚡ 0-1 分数规划转化</div>
      <div style="font-size: 11.5px; color: #334155;">
        $$\\frac{\\sum w(e)}{|C|} < \\lambda \\iff \\sum_{e \\in C} (w(e) - \\lambda) < 0$$
        将每条边的权值重新映射为 $w'(e) = w(e) - \\lambda$，原问题等价于判断新图上是否存在<b>负权回路（Negative Cycle）</b>！
      </div>
    </div>
  </div>
`;

export const MIN_MEAN_CYCLE_ANALYSIS_HTML = `
  <div style="font-size: 13px; line-height: 1.6; color: #334155;">
    <h3 style="margin-top: 0; color: #0f172a; font-size: 15px; font-weight: 800;">💡 二分单调性与负环收敛</h3>

    <div style="background: #eff6ff; border: 1px solid #bfdbfe; border-radius: 6px; padding: 10px; margin-bottom: 12px;">
      <div style="font-weight: 700; color: #1e3a8a; margin-bottom: 4px;">1. 单调判别性</div>
      <div style="font-size: 12px; color: #1e40af;">
        若当猜测值为 $\\lambda$ 时存在负环，说明图中必定存在平均权值更小的回路（$\\lambda^* < \\lambda$），于是将搜索上界收缩为 $\\lambda$；若无负环，则提高下界。
      </div>
    </div>

    <div style="background: #f0fdf4; border: 1px solid #bbf7d0; border-radius: 6px; padding: 10px;">
      <div style="font-weight: 700; color: #166534; margin-bottom: 4px;">2. 严格多项式 Karp 算法扩展</div>
      <div style="font-size: 12px; color: #15803d;">
        除了 0-1 分数规划二分外，Karp 算法利用动态规划记录 $k$ 条边的最短路矩阵 $F_k(v)$，可在严格 $O(V \\cdot E)$ 时间内精确求出最小均值回路。
      </div>
    </div>
  </div>
`;
