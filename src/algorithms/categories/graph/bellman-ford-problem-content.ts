/**
 * Bellman-Ford 最短路径算法 (Bellman-Ford Algorithm)
 * 领域知识与题解精讲配置声明
 */

export const BELLMAN_FORD_PROBLEM_HTML = `
  <div style="display: flex; flex-direction: column; gap: 12px; color: #cbd5e1; font-size: 12px; line-height: 1.6;">
    <div style="display: flex; align-items: center; gap: 8px;">
      <span style="padding: 2px 6px; border-radius: 4px; background: rgba(59,130,246,0.2); color: #60a5fa; font-weight: 700; border: 1px solid rgba(59,130,246,0.3);">Graph Theory</span>
      <span style="padding: 2px 6px; border-radius: 4px; background: rgba(245,158,11,0.2); color: #fbbf24; font-weight: 700; border: 1px solid rgba(245,158,11,0.3);">Medium</span>
      <h2 style="font-size: 14px; font-weight: 700; color: #ffffff; margin: 0;">Bellman-Ford 负权最短路径算法</h2>
    </div>
    <p style="margin: 0;">在包含 <strong>负权边</strong> 的有向图 <code style="color: #38bdf8; font-family: monospace;">G = (V, E)</code> 中，计算从给定源点 <code style="color: #fbbf24; font-family: monospace;">source</code> 到所有顶点的最短距离，并具备 <strong>检测负权回路（Negative Cycle）</strong> 的能力。</p>
    <div style="padding: 10px; border-radius: 10px; background: #020617; border: 1px solid #1e293b; display: flex; flex-direction: column; gap: 6px; font-family: monospace; font-size: 11px;">
      <div style="color: #34d399; font-weight: 700;">核心原理:</div>
      <div>1. 最短路径最多包含 <code style="color: #38bdf8;">V - 1</code> 条边；</div>
      <div>2. 对图中全部 <code style="color: #fbbf24;">E</code> 条边进行 <code style="color: #38bdf8;">V - 1</code> 轮松弛迭代；</div>
      <div>3. 负权环检测：若第 <code style="color: #f87171;">V</code> 轮仍能松弛某条边，说明图中存在负权回路。</div>
    </div>
  </div>
`;

export const BELLMAN_FORD_ANALYSIS_HTML = `
  <div style="display: flex; flex-direction: column; gap: 12px; color: #cbd5e1; font-size: 12px; line-height: 1.6;">
    <h3 style="font-size: 14px; font-weight: 700; color: #ffffff; margin: 0; display: flex; align-items: center; gap: 6px;">
      <span>💡</span> V-1 轮全边松弛与负权环判定
    </h3>
    <div style="display: flex; flex-direction: column; gap: 8px;">
      <div style="padding: 10px; border-radius: 10px; background: #020617; border: 1px solid #1e293b;">
        <div style="font-weight: 700; color: #60a5fa; margin-bottom: 4px;">① 算法运行步骤</div>
        <p style="margin: 0; color: #94a3b8;">
        1. <strong>初始化：</strong> <code style="color: #38bdf8; font-family: monospace;">dist[src] = 0;</code> 其余节点距离均为正无穷；<br/>
        2. <strong>循环 V - 1 轮：</strong> 每一轮遍历图中所有有向边 <code style="color: #fbbf24; font-family: monospace;">(u, v, w)</code>：<br/>
        &nbsp;&nbsp;• 若 <code style="color: #34d399; font-family: monospace;">dist[u] != INF && dist[u] + w < dist[v]</code>，更新 <code style="color: #34d399; font-family: monospace;">dist[v] = dist[u] + w</code>；<br/>
        3. <strong>早停优化：</strong> 若某一轮遍历中未发生任何松弛，算法可提前结束；<br/>
        4. <strong>第 V 轮检测：</strong> 若仍有边可松弛，返回 <code style="color: #f87171; font-family: monospace;">false</code>（存在负权回路）。
        </p>
      </div>
      <div style="padding: 10px; border-radius: 10px; background: #020617; border: 1px solid #1e293b;">
        <div style="font-weight: 700; color: #34d399; margin-bottom: 4px;">② 复杂度分析</div>
        <p style="margin: 0; color: #94a3b8;">
        • 时间复杂度：<code style="color: #34d399; font-family: monospace;">O(V × E)</code>。<br/>
        • 空间复杂度：<code style="color: #60a5fa; font-family: monospace;">O(V)</code>。
        </p>
      </div>
    </div>
  </div>
`;

export const BELLMAN_FORD_CODE_LANGUAGES: Record<string, string[]> = {
  java: [
    'public class Solution {',
    '    public int[] bellmanFord(int n, int[][] edges, int src) {',
    '        int[] dist = new int[n];',
    '        Arrays.fill(dist, Integer.MAX_VALUE / 2);',
    '        dist[src] = 0;',
    '        for (int i = 1; i <= n - 1; i++) {',
    '            boolean updated = false;',
    '            for (int[] edge : edges) {',
    '                int u = edge[0], v = edge[1], w = edge[2];',
    '                if (dist[u] + w < dist[v]) {',
    '                    dist[v] = dist[u] + w;',
    '                    updated = true;',
    '                }',
    '            }',
    '            if (!updated) break; // 提前早停',
    '        }',
    '        return dist;',
    '    }',
    '}',
  ],
  cpp: [
    'vector<int> bellmanFord(int n, vector<vector<int>>& edges, int src) {',
    '    vector<int> dist(n, INT_MAX / 2);',
    '    dist[src] = 0;',
    '    for (int i = 1; i <= n - 1; i++) {',
    '        bool updated = false;',
    '        for (auto& edge : edges) {',
    '            int u = edge[0], v = edge[1], w = edge[2];',
    '            if (dist[u] + w < dist[v]) {',
    '                dist[v] = dist[u] + w;',
    '                updated = true;',
    '            }',
    '        }',
    '        if (!updated) break;',
    '    }',
    '    return dist;',
    '}',
  ],
  python: [
    'def bellman_ford(n: int, edges: list[tuple[int, int, int]], src: int) -> list[int]:',
    '    dist = [float("inf")] * n',
    '    dist[src] = 0',
    '    for _ in range(n - 1):',
    '        updated = False',
    '        for u, v, w in edges:',
    '            if dist[u] + w < dist[v]:',
    '                dist[v] = dist[u] + w',
    '                updated = True',
    '        if not updated: break',
    '    return dist',
  ],
  javascript: [
    'function bellmanFord(n, edges, src) {',
    '    const dist = new Array(n).fill(Infinity);',
    '    dist[src] = 0;',
    '    for (let i = 1; i <= n - 1; i++) {',
    '        let updated = false;',
    '        for (const [u, v, w] of edges) {',
    '            if (dist[u] + w < dist[v]) {',
    '                dist[v] = dist[u] + w;',
    '                updated = true;',
    '            }',
    '        }',
    '        if (!updated) break;',
    '    }',
    '    return dist;',
    '}',
  ],
};
