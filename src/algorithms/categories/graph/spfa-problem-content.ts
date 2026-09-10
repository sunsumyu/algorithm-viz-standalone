/**
 * SPFA 最短路径算法 (Shortest Path Faster Algorithm · 队列优化 Bellman-Ford)
 * 领域知识与题解精讲配置声明
 */

export const SPFA_PROBLEM_HTML = `
  <div style="display: flex; flex-direction: column; gap: 12px; color: #cbd5e1; font-size: 12px; line-height: 1.6;">
    <div style="display: flex; align-items: center; gap: 8px;">
      <span style="padding: 2px 6px; border-radius: 4px; background: rgba(59,130,246,0.2); color: #60a5fa; font-weight: 700; border: 1px solid rgba(59,130,246,0.3);">Graph Theory</span>
      <span style="padding: 2px 6px; border-radius: 4px; background: rgba(245,158,11,0.2); color: #fbbf24; font-weight: 700; border: 1px solid rgba(245,158,11,0.3);">Medium</span>
      <h2 style="font-size: 14px; font-weight: 700; color: #ffffff; margin: 0;">SPFA 队列优化最短路径算法</h2>
    </div>
    <p style="margin: 0;">SPFA（Shortest Path Faster Algorithm）是 Bellman-Ford 算法的 <strong>队列优化版本</strong>。只有距离被成功缩短的顶点，它的邻居距离才可能被进一步缩短。因此使用队列动态维护“距离刚刚被更新的顶点”，避免全图无意义的边扫描。</p>
    <div style="padding: 10px; border-radius: 10px; background: #020617; border: 1px solid #1e293b; display: flex; flex-direction: column; gap: 6px; font-family: monospace; font-size: 11px;">
      <div style="color: #34d399; font-weight: 700;">核心机制:</div>
      <div>1. <code style="color: #38bdf8;">inQueue[u]</code> 数组防止顶点重复入队；</div>
      <div>2. 只有被成功松弛的点 <code style="color: #fbbf24;">v</code>，且不在队列中时，才执行 <code style="color: #34d399;">queue.offer(v)</code>；</div>
      <div>3. 节点入队次数 <code style="color: #f87171;">count[u] >= V</code> 时判定存在负权回路。</div>
    </div>
  </div>
`;

export const SPFA_ANALYSIS_HTML = `
  <div style="display: flex; flex-direction: column; gap: 12px; color: #cbd5e1; font-size: 12px; line-height: 1.6;">
    <h3 style="font-size: 14px; font-weight: 700; color: #ffffff; margin: 0; display: flex; align-items: center; gap: 6px;">
      <span>💡</span> 队列动态驱动与在队标记
    </h3>
    <div style="display: flex; flex-direction: column; gap: 8px;">
      <div style="padding: 10px; border-radius: 10px; background: #020617; border: 1px solid #1e293b;">
        <div style="font-weight: 700; color: #60a5fa; margin-bottom: 4px;">① SPFA 迭代流</div>
        <p style="margin: 0; color: #94a3b8;">
        1. <strong>入队源点：</strong> <code style="color: #38bdf8; font-family: monospace;">queue.offer(src); inQueue[src] = true; dist[src] = 0;</code>；<br/>
        2. <strong>出队并清除标记：</strong> <code style="color: #fbbf24; font-family: monospace;">int u = queue.poll(); inQueue[u] = false;</code>；<br/>
        3. <strong>松弛出边：</strong> 若 <code style="color: #34d399; font-family: monospace;">dist[u] + w < dist[v]</code>：<br/>
        &nbsp;&nbsp;• 更新 <code style="color: #34d399; font-family: monospace;">dist[v] = dist[u] + w;</code>；<br/>
        &nbsp;&nbsp;• 若 <code style="color: #60a5fa; font-family: monospace;">!inQueue[v]</code>，将 <code style="color: #60a5fa; font-family: monospace;">v</code> 入队并标记 <code style="color: #60a5fa; font-family: monospace;">inQueue[v] = true;</code>。
        </p>
      </div>
      <div style="padding: 10px; border-radius: 10px; background: #020617; border: 1px solid #1e293b;">
        <div style="font-weight: 700; color: #34d399; margin-bottom: 4px;">② 复杂度分析</div>
        <p style="margin: 0; color: #94a3b8;">
        • 平均时间复杂度：<code style="color: #34d399; font-family: monospace;">O(k × E)</code>（k 通常在 2~4 之间，速度极快）。<br/>
        • 最坏时间复杂度：特殊构造图（网格菊花图）退化至 <code style="color: #f87171; font-family: monospace;">O(V × E)</code>。<br/>
        • 空间复杂度：<code style="color: #60a5fa; font-family: monospace;">O(V)</code>。
        </p>
      </div>
    </div>
  </div>
`;

export const SPFA_CODE_LANGUAGES: Record<string, string[]> = {
  java: [
    'public class Solution {',
    '    public int[] spfa(int n, List<int[]>[] adj, int src) {',
    '        int[] dist = new int[n];',
    '        Arrays.fill(dist, Integer.MAX_VALUE / 2);',
    '        dist[src] = 0;',
    '        boolean[] inQueue = new boolean[n];',
    '        Queue<Integer> queue = new LinkedList<>();',
    '        queue.offer(src);',
    '        inQueue[src] = true;',
    '        while (!queue.isEmpty()) {',
    '            int u = queue.poll();',
    '            inQueue[u] = false;',
    '            for (int[] edge : adj[u]) {',
    '                int v = edge[0], w = edge[1];',
    '                if (dist[u] + w < dist[v]) {',
    '                    dist[v] = dist[u] + w;',
    '                    if (!inQueue[v]) {',
    '                        queue.offer(v);',
    '                        inQueue[v] = true;',
    '                    }',
    '                }',
    '            }',
    '        }',
    '        return dist;',
    '    }',
    '}',
  ],
  cpp: [
    'vector<int> spfa(int n, vector<vector<pair<int, int>>>& adj, int src) {',
    '    vector<int> dist(n, INT_MAX / 2);',
    '    vector<bool> inQueue(n, false);',
    '    dist[src] = 0;',
    '    queue<int> q;',
    '    q.push(src);',
    '    inQueue[src] = true;',
    '    while (!q.empty()) {',
    '        int u = q.front(); q.pop();',
    '        inQueue[u] = false;',
    '        for (auto& [v, w] : adj[u]) {',
    '            if (dist[u] + w < dist[v]) {',
    '                dist[v] = dist[u] + w;',
    '                if (!inQueue[v]) {',
    '                    q.push(v);',
    '                    inQueue[v] = true;',
    '                }',
    '            }',
    '        }',
    '    }',
    '    return dist;',
    '}',
  ],
  python: [
    'def spfa(n: int, adj: list[list[tuple[int, int]]], src: int) -> list[int]:',
    '    dist = [float("inf")] * n',
    '    in_queue = [False] * n',
    '    dist[src] = 0',
    '    queue = collections.deque([src])',
    '    in_queue[src] = True',
    '    while queue:',
    '        u = queue.popleft()',
    '        in_queue[u] = False',
    '        for v, w in adj[u]:',
    '            if dist[u] + w < dist[v]:',
    '                dist[v] = dist[u] + w',
    '                if not in_queue[v]:',
    '                    queue.append(v)',
    '                    in_queue[v] = True',
    '    return dist',
  ],
  javascript: [
    'function spfa(n, adj, src) {',
    '    const dist = new Array(n).fill(Infinity);',
    '    const inQueue = new Array(n).fill(false);',
    '    dist[src] = 0;',
    '    const queue = [src];',
    '    inQueue[src] = true;',
    '    while (queue.length > 0) {',
    '        const u = queue.shift();',
    '        inQueue[u] = false;',
    '        for (const [v, w] of adj[u]) {',
    '            if (dist[u] + w < dist[v]) {',
    '                dist[v] = dist[u] + w;',
    '                if (!inQueue[v]) {',
    '                    queue.push(v);',
    '                    inQueue[v] = true;',
    '                }',
    '            }',
    '        }',
    '    }',
    '    return dist;',
    '}',
  ],
};
