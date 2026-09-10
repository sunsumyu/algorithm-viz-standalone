/**
 * 力扣 787. K 站中转内最便宜的航班 (Cheapest Flights Within K Stops) / 有限最短路
 * 题目解析、算法精讲与四语言源码
 */

export const LIMITED_SHORTEST_PATH_PROBLEM_HTML = `
<div style="line-height: 1.7; font-size: 13.5px; color: #cbd5e1;">
  <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 12px;">
    <span style="font-weight: 800; font-size: 16px; color: #f8fafc;">787. K 站中转内最便宜的航班</span>
    <span style="background: #854d0e; color: #fde047; font-size: 11px; font-weight: 700; padding: 2px 8px; border-radius: 4px;">中等 / Medium</span>
  </div>

  <p>有 <code>n</code> 个城市通过一些航班连接。给你一个数组 <code>flights</code> ，其中 <code>flights[i] = [from_i, to_i, price_i]</code> ，表示该航班的价格。</p>
  <p>现在给定所有的城市和航班，以及出发城市 <code>src</code> 和目的地 <code>dst</code>，你的任务是找到出一条最多经过 <code>k</code> 站中转（即最多走 <code>k + 1</code> 条边）的从 <code>src</code> 到 <code>dst</code> 的 <strong>最便宜价格</strong> 。 如果不存在这样的路线，则输出 <code>-1</code>。</p>

  <h4 style="color: #38bdf8; margin-top: 16px; margin-bottom: 8px;">示例 1：</h4>
  <pre style="background: #1e293b; padding: 10px; border-radius: 8px; font-size: 12px; color: #e2e8f0;"><strong>输入:</strong> n = 4, flights = [[0,1,100],[1,2,100],[2,0,100],[1,3,600],[2,3,200]], src = 0, dst = 3, k = 1
<strong>输出:</strong> 700
<strong>解释:</strong> 0 -> 1 -> 3 经过 1 站中转，价格为 100 + 600 = 700。注意 0 -> 1 -> 2 -> 3 虽然更便宜 (400)，但经过了 2 站中转，超过了 k=1 的限制。</pre>
</div>
`;

export const LIMITED_SHORTEST_PATH_ANALYSIS_HTML = `
<div style="line-height: 1.7; font-size: 13.5px; color: #cbd5e1;">
  <h3 style="color: #38bdf8; margin-top: 0;">💡 核心思路：Bellman-Ford 边数限制松弛 (DP 状态备份)</h3>
  <p>限制最多经过 <code>k + 1</code> 条边的最短路问题，本质是 Bellman-Ford 算法的绝佳应用场景：</p>

  <h4 style="color: #67e8f9; margin-top: 12px;">算法流程：</h4>
  <ol style="padding-left: 20px;">
    <li><strong>外层循环限制次数：</strong>Bellman-Ford 算法第 <code>i</code> 轮迭代得到的正是<strong>最多经过 <code>i</code> 条边</strong>的最短距离。因此只需迭代 <code>k + 1</code> 轮。</li>
    <li><strong>关键点：必须备份上一轮的 <code>dist</code> 数组 (clone)！</strong>
      <ul>
        <li>若直接在原数组上更新，本轮松弛可能会发生“串联效应”（同一轮迭代连续沿多条边松弛，导致单轮使用了超过 1 条边）。</li>
        <li>使用备份数组 <code>clone = dist.clone()</code>，松弛公式为：<code>dist[v] = min(dist[v], clone[u] + w)</code>。</li>
      </ul>
    </li>
    <li><strong>迭代结束返回：</strong><code>dist[dst] == INF ? -1 : dist[dst]</code>。</li>
  </ol>

  <h4 style="color: #67e8f9; margin-top: 12px;">复杂度分析</h4>
  <ul style="padding-left: 20px;">
    <li><strong>时间复杂度：</strong><code>O((K + 1) × E)</code>，迭代 <code>K + 1</code> 轮，每轮遍历所有 <code>E</code> 条边。</li>
    <li><strong>空间复杂度：</strong><code>O(V)</code>，仅需维护距离数组与备份数组。</li>
  </ul>
</div>
`;

export const LIMITED_SHORTEST_PATH_CODE_LANGUAGES: Record<string, string[]> = {
  java: [
    'class Solution {',
    '    public int findCheapestPrice(int n, int[][] flights, int src, int dst, int k) {',
    '        int[] dist = new int[n];',
    '        Arrays.fill(dist, Integer.MAX_VALUE / 2);',
    '        dist[src] = 0;',
    '        for (int i = 0; i <= k; i++) {',
    '            int[] clone = dist.clone(); // 备份上一轮状态，避免单轮多步串联',
    '            for (int[] f : flights) {',
    '                int u = f[0], v = f[1], w = f[2];',
    '                dist[v] = Math.min(dist[v], clone[u] + w);',
    '            }',
    '        }',
    '        return dist[dst] >= Integer.MAX_VALUE / 2 ? -1 : dist[dst];',
    '    }',
    '}',
  ],
  cpp: [
    'class Solution {',
    'public:',
    '    int findCheapestPrice(int n, vector<vector<int>>& flights, int src, int dst, int k) {',
    '        const int INF = 1e9;',
    '        vector<int> dist(n, INF);',
    '        dist[src] = 0;',
    '        for (int i = 0; i <= k; ++i) {',
    '            vector<int> clone = dist;',
    '            for (const auto& f : flights) {',
    '                int u = f[0], v = f[1], w = f[2];',
    '                if (clone[u] != INF && clone[u] + w < dist[v]) {',
    '                    dist[v] = clone[u] + w;',
    '                }',
    '            }',
    '        }',
    '        return dist[dst] >= INF ? -1 : dist[dst];',
    '    }',
    '};',
  ],
  python: [
    'class Solution:',
    '    def findCheapestPrice(self, n: int, flights: List[List[int]], src: int, dst: int, k: int) -> int:',
    '        dist = [float("inf")] * n',
    '        dist[src] = 0',
    '        for _ in range(k + 1):',
    '            clone = list(dist) # 备份状态',
    '            for u, v, w in flights:',
    '                if clone[u] + w < dist[v]:',
    '                    dist[v] = clone[u] + w',
    '        return dist[dst] if dist[dst] != float("inf") else -1',
  ],
  javascript: [
    'var findCheapestPrice = function(n, flights, src, dst, k) {',
    '    const INF = 1e9;',
    '    let dist = new Array(n).fill(INF);',
    '    dist[src] = 0;',
    '    for (let i = 0; i <= k; i++) {',
    '        const clone = [...dist];',
    '        for (const [u, v, w] of flights) {',
    '            if (clone[u] !== INF && clone[u] + w < dist[v]) {',
    '                dist[v] = clone[u] + w;',
    '            }',
    '        }',
    '    }',
    '    return dist[dst] >= INF ? -1 : dist[dst];',
    '};',
  ],
};
