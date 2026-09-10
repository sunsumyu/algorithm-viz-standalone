/**
 * 朴素 Dijkstra 最短路径算法 (Dijkstra's Algorithm - Basic Matrix/Array)
 * 领域知识与题解精讲配置声明
 */

export const DIJKSTRA_BASIC_PROBLEM_HTML = `
  <div style="display: flex; flex-direction: column; gap: 12px; color: #cbd5e1; font-size: 12px; line-height: 1.6;">
    <div style="display: flex; align-items: center; gap: 8px;">
      <span style="padding: 2px 6px; border-radius: 4px; background: rgba(59,130,246,0.2); color: #60a5fa; font-weight: 700; border: 1px solid rgba(59,130,246,0.3);">Graph Theory</span>
      <span style="padding: 2px 6px; border-radius: 4px; background: rgba(245,158,11,0.2); color: #fbbf24; font-weight: 700; border: 1px solid rgba(245,158,11,0.3);">Medium</span>
      <h2 style="font-size: 14px; font-weight: 700; color: #ffffff; margin: 0;">朴素 Dijkstra 单源最短路径 (Dijkstra Basic)</h2>
    </div>
    <p style="margin: 0;">在带权有向无负权图 <code style="color: #38bdf8; font-family: monospace;">G = (V, E)</code> 中，给定源点 <code style="color: #fbbf24; font-family: monospace;">source</code>，计算从源点到图中每一个顶点的 <strong>最短路径长度</strong>。</p>
    <div style="padding: 10px; border-radius: 10px; background: #020617; border: 1px solid #1e293b; display: flex; flex-direction: column; gap: 6px; font-family: monospace; font-size: 11px;">
      <div style="color: #34d399; font-weight: 700;">核心规则:</div>
      <div>1. 贪心策略：每次从尚未确定最短路径的顶点集合中，选取当前 <code style="color: #38bdf8;">dist[u]</code> 最小的顶点 <code style="color: #38bdf8;">u</code> 标记为已访问；</div>
      <div>2. 松弛操作（Relaxation）：利用 <code style="color: #38bdf8;">u</code> 尝试更新其所有邻居 <code style="color: #fde047;">v</code> 的最短距离：<code style="color: #34d399;">dist[v] = min(dist[v], dist[u] + weight(u, v))</code>。</div>
    </div>
  </div>
`;

export const DIJKSTRA_BASIC_ANALYSIS_HTML = `
  <div style="display: flex; flex-direction: column; gap: 12px; color: #cbd5e1; font-size: 12px; line-height: 1.6;">
    <h3 style="font-size: 14px; font-weight: 700; color: #ffffff; margin: 0; display: flex; align-items: center; gap: 6px;">
      <span>💡</span> 贪心选择与三角不等式松弛
    </h3>
    <div style="display: flex; flex-direction: column; gap: 8px;">
      <div style="padding: 10px; border-radius: 10px; background: #020617; border: 1px solid #1e293b;">
        <div style="font-weight: 700; color: #60a5fa; margin-bottom: 4px;">① 朴素 Dijkstra 三步走</div>
        <p style="margin: 0; color: #94a3b8;">
        1. <strong>选点：</strong> 在所有 <code style="color: #60a5fa; font-family: monospace;">!visited[i]</code> 的点中找到 <code style="color: #fbbf24; font-family: monospace;">dist[u]</code> 最小者；<br/>
        2. <strong>锁定：</strong> 标记 <code style="color: #34d399; font-family: monospace;">visited[u] = true</code>，此时源点到 <code style="color: #38bdf8; font-family: monospace;">u</code> 的最短路已完全确定；<br/>
        3. <strong>松弛：</strong> 遍历 <code style="color: #38bdf8; font-family: monospace;">u</code> 出发的所有边 <code style="color: #fde047; font-family: monospace;">(u, v, w)</code>，若 <code style="color: #34d399; font-family: monospace;">dist[u] + w < dist[v]</code>，则更新 <code style="color: #34d399; font-family: monospace;">dist[v] = dist[u] + w</code>。
        </p>
      </div>
      <div style="padding: 10px; border-radius: 10px; background: #020617; border: 1px solid #1e293b;">
        <div style="font-weight: 700; color: #34d399; margin-bottom: 4px;">② 复杂度与适用场景</div>
        <p style="margin: 0; color: #94a3b8;">
        • 时间复杂度：<code style="color: #34d399; font-family: monospace;">O(V²)</code>，非常适合稠密图（Dense Graph，边数接近 V²）。<br/>
        • 空间复杂度：<code style="color: #60a5fa; font-family: monospace;">O(V)</code>。<br/>
        • ⚠️ 限制：<strong>不能包含负权边</strong>。
        </p>
      </div>
    </div>
  </div>
`;

export const DIJKSTRA_BASIC_CODE_LANGUAGES: Record<string, string[]> = {
  java: [
    'public class Solution {',
    '    public int[] dijkstra(int n, int[][] edges, int src) {',
    '        int[] dist = new int[n];',
    '        Arrays.fill(dist, Integer.MAX_VALUE / 2);',
    '        dist[src] = 0;',
    '        boolean[] visited = new boolean[n];',
    '        for (int i = 0; i < n; i++) {',
    '            int u = -1;',
    '            for (int j = 0; j < n; j++) {',
    '                if (!visited[j] && (u == -1 || dist[j] < dist[u])) u = j;',
    '            }',
    '            if (dist[u] == Integer.MAX_VALUE / 2) break;',
    '            visited[u] = true;',
    '            for (int[] edge : adj[u]) {',
    '                int v = edge[0], w = edge[1];',
    '                if (dist[u] + w < dist[v]) dist[v] = dist[u] + w;',
    '            }',
    '        }',
    '        return dist;',
    '    }',
    '}',
  ],
  cpp: [
    'vector<int> dijkstra(int n, vector<vector<pair<int, int>>>& adj, int src) {',
    '    vector<int> dist(n, INT_MAX / 2);',
    '    vector<bool> visited(n, false);',
    '    dist[src] = 0;',
    '    for (int i = 0; i < n; i++) {',
    '        int u = -1;',
    '        for (int j = 0; j < n; j++) {',
    '            if (!visited[j] && (u == -1 || dist[j] < dist[u])) u = j;',
    '        }',
    '        if (dist[u] == INT_MAX / 2) break;',
    '        visited[u] = true;',
    '        for (auto& [v, w] : adj[u]) {',
    '            if (dist[u] + w < dist[v]) dist[v] = dist[u] + w;',
    '        }',
    '    }',
    '    return dist;',
    '}',
  ],
  python: [
    'def dijkstra(n: int, adj: list[list[tuple[int, int]]], src: int) -> list[int]:',
    '    dist = [float("inf")] * n',
    '    visited = [False] * n',
    '    dist[src] = 0',
    '    for _ in range(n):',
    '        u = -1',
    '        for j in range(n):',
    '            if not visited[j] and (u == -1 or dist[j] < dist[u]):',
    '                u = j',
    '        if dist[u] == float("inf"): break',
    '        visited[u] = True',
    '        for v, w in adj[u]:',
    '            if dist[u] + w < dist[v]:',
    '                dist[v] = dist[u] + w',
    '    return dist',
  ],
  javascript: [
    'function dijkstra(n, adj, src) {',
    '    const dist = new Array(n).fill(Infinity);',
    '    const visited = new Array(n).fill(false);',
    '    dist[src] = 0;',
    '    for (let i = 0; i < n; i++) {',
    '        let u = -1;',
    '        for (let j = 0; j < n; j++) {',
    '            if (!visited[j] && (u === -1 || dist[j] < dist[u])) u = j;',
    '        }',
    '        if (dist[u] === Infinity) break;',
    '        visited[u] = true;',
    '        for (const [v, w] of adj[u]) {',
    '            if (dist[u] + w < dist[v]) dist[v] = dist[u] + w;',
    '        }',
    '    }',
    '    return dist;',
    '}',
  ],
};
