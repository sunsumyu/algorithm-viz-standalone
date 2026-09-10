/**
 * Bellman-Ford 负权回路检测 (Negative Cycle Detection)
 * 题目解析、算法精讲与四语言源码
 */

export const NEGATIVE_CYCLE_PROBLEM_HTML = `
<div style="line-height: 1.7; font-size: 13.5px; color: #cbd5e1;">
  <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 12px;">
    <span style="font-weight: 800; font-size: 16px; color: #f8fafc;">Bellman-Ford 负权回路检测</span>
    <span style="background: #991b1b; color: #fca5a5; font-size: 11px; font-weight: 700; padding: 2px 8px; border-radius: 4px;">困难 / Hard</span>
  </div>

  <p>给定一个包含 <code>n</code> 个节点和 <code>m</code> 条有向带权边的图，边的权重可以为 <strong>负数</strong>。</p>
  <p>如果图中存在一个环路，且环上所有边的权重之和为 <strong>负数</strong>，则称为 <strong>负权回路（Negative Cycle）</strong>。</p>
  <p>在存在负权回路的图中，沿着该回路无限绕圈可使最短路径无限缩小至 <code>-∞</code>，导致最短路无解。请判断图中是否存在从源点可达的负权回路。</p>

  <h4 style="color: #38bdf8; margin-top: 16px; margin-bottom: 8px;">示例：</h4>
  <pre style="background: #1e293b; padding: 10px; border-radius: 8px; font-size: 12px; color: #e2e8f0;"><strong>输入:</strong> n = 5, edges = [[0,1,2],[1,2,-3],[2,3,1],[3,1,-1],[0,3,5],[3,4,2]], src = 0
<strong>输出:</strong> true (检测到负权回路: 1 -> 2 -> 3 -> 1，权重和 = -3 + 1 - 1 = -3 < 0)</pre>
</div>
`;

export const NEGATIVE_CYCLE_ANALYSIS_HTML = `
<div style="line-height: 1.7; font-size: 13.5px; color: #cbd5e1;">
  <h3 style="color: #38bdf8; margin-top: 0;">💡 核心思路：第 N 轮额外松弛判定法则</h3>
  <p>在没有负权回路的 <code>V</code> 顶点有向图中，任意两个顶点之间的简单最短路径最多只包含 <code>V - 1</code> 条边：</p>

  <h4 style="color: #67e8f9; margin-top: 12px;">算法流程：</h4>
  <ol style="padding-left: 20px;">
    <li><strong>前 V-1 轮常规松弛：</strong>每轮遍历全图所有 <code>E</code> 条边，执行三角不等式松弛：<code>dist[v] = min(dist[v], dist[u] + w)</code>。正常情况下，第 <code>V - 1</code> 轮后所有点的最短距离必定收敛。</li>
    <li><strong>第 V 轮额外检查：</strong>在第 <code>V</code> 轮再次遍历所有边：
      <ul>
        <li>如果仍然存在某条边 <code>(u, v, w)</code> 满足 <code>dist[u] + w < dist[v]</code>，则<strong>必然存在负权回路</strong>！</li>
        <li>因为只有在负权回路中无限绕圈，距离才能持续不断地被无限减小。</li>
      </ul>
    </li>
  </ol>

  <h4 style="color: #67e8f9; margin-top: 12px;">复杂度分析</h4>
  <ul style="padding-left: 20px;">
    <li><strong>时间复杂度：</strong><code>O(V × E)</code>，共进行 <code>V</code> 轮松弛扫描。</li>
    <li><strong>空间复杂度：</strong><code>O(V)</code>，维护距离数组 <code>dist</code>。</li>
  </ul>
</div>
`;

export const NEGATIVE_CYCLE_CODE_LANGUAGES: Record<string, string[]> = {
  java: [
    'class Solution {',
    '    public boolean hasNegativeCycle(int n, int[][] edges, int src) {',
    '        int[] dist = new int[n];',
    '        Arrays.fill(dist, Integer.MAX_VALUE / 2);',
    '        dist[src] = 0;',
    '        // 1. 进行 n - 1 轮常规松弛',
    '        for (int i = 1; i <= n - 1; i++) {',
    '            for (int[] e : edges) {',
    '                int u = e[0], v = e[1], w = e[2];',
    '                if (dist[u] != Integer.MAX_VALUE / 2 && dist[u] + w < dist[v]) {',
    '                    dist[v] = dist[u] + w;',
    '                }',
    '            }',
    '        }',
    '        // 2. 第 n 轮额外检测',
    '        for (int[] e : edges) {',
    '            int u = e[0], v = e[1], w = e[2];',
    '            if (dist[u] != Integer.MAX_VALUE / 2 && dist[u] + w < dist[v]) {',
    '                return true; // 依然能被松弛，说明存在负权回路',
    '            }',
    '        }',
    '        return false;',
    '    }',
    '}',
  ],
  cpp: [
    'class Solution {',
    'public:',
    '    bool hasNegativeCycle(int n, vector<vector<int>>& edges, int src) {',
    '        const int INF = 1e9;',
    '        vector<int> dist(n, INF);',
    '        dist[src] = 0;',
    '        for (int i = 1; i <= n - 1; ++i) {',
    '            for (const auto& e : edges) {',
    '                int u = e[0], v = e[1], w = e[2];',
    '                if (dist[u] != INF && dist[u] + w < dist[v]) {',
    '                    dist[v] = dist[u] + w;',
    '                }',
    '            }',
    '        }',
    '        for (const auto& e : edges) {',
    '            int u = e[0], v = e[1], w = e[2];',
    '            if (dist[u] != INF && dist[u] + w < dist[v]) {',
    '                return true;',
    '            }',
    '        }',
    '        return false;',
    '    }',
    '};',
  ],
  python: [
    'class Solution:',
    '    def hasNegativeCycle(self, n: int, edges: List[List[int]], src: int) -> bool:',
    '        dist = [float("inf")] * n',
    '        dist[src] = 0',
    '        for _ in range(n - 1):',
    '            for u, v, w in edges:',
    '                if dist[u] != float("inf") and dist[u] + w < dist[v]:',
    '                    dist[v] = dist[u] + w',
    '        for u, v, w in edges:',
    '            if dist[u] != float("inf") and dist[u] + w < dist[v]:',
    '                return True',
    '        return False',
  ],
  javascript: [
    'var hasNegativeCycle = function(n, edges, src) {',
    '    const INF = 1e9;',
    '    const dist = new Array(n).fill(INF);',
    '    dist[src] = 0;',
    '    for (let i = 1; i <= n - 1; i++) {',
    '        for (const [u, v, w] of edges) {',
    '            if (dist[u] !== INF && dist[u] + w < dist[v]) {',
    '                dist[v] = dist[u] + w;',
    '            }',
    '        }',
    '    }',
    '    for (const [u, v, w] of edges) {',
    '        if (dist[u] !== INF && dist[u] + w < dist[v]) {',
    '            return true;',
    '        }',
    '    }',
    '    return false;',
    '};',
  ],
};
