/**
 * 堆优化 Dijkstra 最短路径算法 (Dijkstra's Algorithm - Min-Heap / Priority Queue)
 * 领域知识与题解精讲配置声明
 */

export const DIJKSTRA_HEAP_PROBLEM_HTML = `
  <div style="display: flex; flex-direction: column; gap: 12px; color: #cbd5e1; font-size: 12px; line-height: 1.6;">
    <div style="display: flex; align-items: center; gap: 8px;">
      <span style="padding: 2px 6px; border-radius: 4px; background: rgba(59,130,246,0.2); color: #60a5fa; font-weight: 700; border: 1px solid rgba(59,130,246,0.3);">Graph Theory</span>
      <span style="padding: 2px 6px; border-radius: 4px; background: rgba(245,158,11,0.2); color: #fbbf24; font-weight: 700; border: 1px solid rgba(245,158,11,0.3);">Medium</span>
      <h2 style="font-size: 14px; font-weight: 700; color: #ffffff; margin: 0;">堆优化 Dijkstra 单源最短路径 (Dijkstra Heap)</h2>
    </div>
    <p style="margin: 0;">在稀疏带权有向图中，利用 <strong>优先队列（小顶堆 Min-Heap）</strong> 动态维护当前距离最小的顶点，将选点时间复杂度从 <code style="color: #f87171; font-family: monospace;">O(V)</code> 骤降至 <code style="color: #34d399; font-family: monospace;">O(log V)</code>。</p>
    <div style="padding: 10px; border-radius: 10px; background: #020617; border: 1px solid #1e293b; display: flex; flex-direction: column; gap: 6px; font-family: monospace; font-size: 11px;">
      <div style="color: #34d399; font-weight: 700;">核心优化:</div>
      <div>1. 堆中存储二元组 <code style="color: #38bdf8;">(d, u)</code>，堆顶即为当前离源点最近的节点；</div>
      <div>2. 懒惰删除（Lazy Deletion）：弹出如果发现 <code style="color: #fde047;">d > dist[u]</code>，说明是过期的冗余历史记录，直接跳过。</div>
    </div>
  </div>
`;

export const DIJKSTRA_HEAP_ANALYSIS_HTML = `
  <div style="display: flex; flex-direction: column; gap: 12px; color: #cbd5e1; font-size: 12px; line-height: 1.6;">
    <h3 style="font-size: 14px; font-weight: 700; color: #ffffff; margin: 0; display: flex; align-items: center; gap: 6px;">
      <span>💡</span> 小顶堆加速与稀疏图性能飞跃
    </h3>
    <div style="display: flex; flex-direction: column; gap: 8px;">
      <div style="padding: 10px; border-radius: 10px; background: #020617; border: 1px solid #1e293b;">
        <div style="font-weight: 700; color: #60a5fa; margin-bottom: 4px;">① 堆优化核心逻辑</div>
        <p style="margin: 0; color: #94a3b8;">
        1. <strong>入堆起点：</strong> <code style="color: #38bdf8; font-family: monospace;">pq.offer(new int[]{0, src}); dist[src] = 0;</code>；<br/>
        2. <strong>弹出最小值：</strong> <code style="color: #fbbf24; font-family: monospace;">int[] cur = pq.poll(); int d = cur[0], u = cur[1];</code>；<br/>
        3. <strong>惰性跳过：</strong> <code style="color: #f87171; font-family: monospace;">if (d > dist[u]) continue;</code>；<br/>
        4. <strong>邻接松弛：</strong> 遍历 <code style="color: #38bdf8; font-family: monospace;">u</code> 的边，若 <code style="color: #34d399; font-family: monospace;">dist[u] + w < dist[v]</code>，更新 <code style="color: #34d399; font-family: monospace;">dist[v]</code> 并将 <code style="color: #34d399; font-family: monospace;">(dist[v], v)</code> 入堆。
        </p>
      </div>
      <div style="padding: 10px; border-radius: 10px; background: #020617; border: 1px solid #1e293b;">
        <div style="font-weight: 700; color: #34d399; margin-bottom: 4px;">② 复杂度分析</div>
        <p style="margin: 0; color: #94a3b8;">
        • 时间复杂度：<code style="color: #34d399; font-family: monospace;">O(E log V)</code>，在稀疏图上远优于 <code style="color: #f87171; font-family: monospace;">O(V²)</code>。<br/>
        • 空间复杂度：<code style="color: #60a5fa; font-family: monospace;">O(V + E)</code>（邻接表与优先队列）。
        </p>
      </div>
    </div>
  </div>
`;

export const DIJKSTRA_HEAP_CODE_LANGUAGES: Record<string, string[]> = {
  java: [
    'public class Solution {',
    '    public int[] dijkstraHeap(int n, List<int[]>[] adj, int src) {',
    '        int[] dist = new int[n];',
    '        Arrays.fill(dist, Integer.MAX_VALUE);',
    '        dist[src] = 0;',
    '        PriorityQueue<int[]> pq = new PriorityQueue<>((a, b) -> a[0] - b[0]);',
    '        pq.offer(new int[]{0, src});',
    '        while (!pq.isEmpty()) {',
    '            int[] cur = pq.poll();',
    '            int d = cur[0], u = cur[1];',
    '            if (d > dist[u]) continue; // 惰性丢弃过期距离',
    '            for (int[] edge : adj[u]) {',
    '                int v = edge[0], w = edge[1];',
    '                if (dist[u] + w < dist[v]) {',
    '                    dist[v] = dist[u] + w;',
    '                    pq.offer(new int[]{dist[v], v});',
    '                }',
    '            }',
    '        }',
    '        return dist;',
    '    }',
    '}',
  ],
  cpp: [
    'vector<int> dijkstraHeap(int n, vector<vector<pair<int, int>>>& adj, int src) {',
    '    vector<int> dist(n, INT_MAX);',
    '    dist[src] = 0;',
    '    priority_queue<pair<int, int>, vector<pair<int, int>>, greater<>> pq;',
    '    pq.push({0, src});',
    '    while (!pq.empty()) {',
    '        auto [d, u] = pq.top(); pq.pop();',
    '        if (d > dist[u]) continue;',
    '        for (auto& [v, w] : adj[u]) {',
    '            if (dist[u] + w < dist[v]) {',
    '                dist[v] = dist[u] + w;',
    '                pq.push({dist[v], v});',
    '            }',
    '        }',
    '    }',
    '    return dist;',
    '}',
  ],
  python: [
    'def dijkstra_heap(n: int, adj: list[list[tuple[int, int]]], src: int) -> list[int]:',
    '    dist = [float("inf")] * n',
    '    dist[src] = 0',
    '    pq = [(0, src)]',
    '    while pq:',
    '        d, u = heapq.heappop(pq)',
    '        if d > dist[u]:',
    '            continue',
    '        for v, w in adj[u]:',
    '            if dist[u] + w < dist[v]:',
    '                dist[v] = dist[u] + w',
    '                heapq.heappush(pq, (dist[v], v))',
    '    return dist',
  ],
  javascript: [
    'function dijkstraHeap(n, adj, src) {',
    '    const dist = new Array(n).fill(Infinity);',
    '    dist[src] = 0;',
    '    const pq = [[0, src]]; // 优先队列',
    '    while (pq.length > 0) {',
    '        pq.sort((a, b) => a[0] - b[0]);',
    '        const [d, u] = pq.shift();',
    '        if (d > dist[u]) continue;',
    '        for (const [v, w] of adj[u]) {',
    '            if (dist[u] + w < dist[v]) {',
    '                dist[v] = dist[u] + w;',
    '                pq.push([dist[v], v]);',
    '            }',
    '        }',
    '    }',
    '    return dist;',
    '}',
  ],
};
