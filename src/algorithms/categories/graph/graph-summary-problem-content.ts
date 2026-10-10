/**
 * 图论总结篇 (Graph Theory Summary & Knowledge Map) — 讲义与四语言代码
 */

export const GRAPH_SUMMARY_CODE_LANGUAGES: Record<string, string[]> = {
  java: [
    '// === 图论全景知识体系速查 (Java) ===',
    'public class GraphSummary {',
    '    // 1. 遍历搜索：递归 DFS / 队列 BFS + visited 数组防止重复',
    '    void traversal(int u, boolean[] vis) { vis[u] = true; for (int v : adj[u]) if (!vis[v]) traversal(v, vis); }',
    '    // 2. 并查集：find 路径压缩 + union 按秩合并，O(α(n)) 维护不相交集',
    '    int find(int i) { return parent[i] == i ? i : (parent[i] = find(parent[i])); }',
    '    // 3. 最小生成树：Kruskal 边权排序贪心加边 / Prim 割定理加点，O(E log E)',
    '    int kruskal(int[][] edges) { Arrays.sort(edges, (a, b) -> a[2] - b[2]); /* 并查集判环加边 */ return total; }',
    '    // 4. 拓扑排序：Kahn 算法基于入度数组入队削减，DAG 判环与任务调度',
    '    void topoSort(int[] inDegree) { Queue<Integer> q = new LinkedList<>(); /* 削减入度输出拓扑序 */ }',
    '    // 5. 最短路径：Dijkstra 堆优化 O((V+E)logV) / Bellman-Ford / Floyd O(V^3)',
    '    int dijkstra(int s, int t) { PriorityQueue<int[]> pq = new PriorityQueue<>((a, b) -> a[1] - b[1]); return dist[t]; }',
    '}',
  ],
  cpp: [
    '// === 图论全景知识体系速查 (C++) ===',
    'class GraphSummary {',
    '    // 1. 遍历搜索：递归 DFS / 队列 BFS + visited 数组',
    '    void traversal(int u, vector<bool>& vis) { vis[u] = true; for (int v : adj[u]) if (!vis[v]) traversal(v, vis); }',
    '    // 2. 并查集：find 路径压缩 + union 按秩合并',
    '    int find(int i) { return parent[i] == i ? i : parent[i] = find(parent[i]); }',
    '    // 3. 最小生成树：Kruskal 贪心加边 / Prim 节点扩展',
    '    int kruskal(vector<vector<int>>& edges) { sort(edges.begin(), edges.end(), cmp); return total; }',
    '    // 4. 拓扑排序：Kahn 算法削减入度 / 深度优先逆后序',
    '    void topoSort(vector<int>& inDegree) { queue<int> q; /* 剥洋葱削减入度 */ }',
    '    // 5. 最短路径：Dijkstra 堆优化 / SPFA 队列优化 / Floyd',
    '    int dijkstra(int s, int t) { priority_queue<pair<int,int>, ...> pq; return dist[t]; }',
    '};',
  ],
  python: [
    '# === 图论全景知识体系速查 (Python) ===',
    'class GraphSummary:',
    '    # 1. 遍历搜索：递归 DFS / 队列 deque BFS',
    '    def traversal(self, u, vis): vis.add(u); [self.traversal(v, vis) for v in adj[u] if v not in vis]',
    '    # 2. 并查集：find 路径压缩 + union 按秩合并',
    '    def find(self, i): parent[i] = self.find(parent[i]) if parent[i] != i else i; return parent[i]',
    '    # 3. 最小生成树：Kruskal 边权排序 + 并查集判环',
    '    def kruskal(self, edges): edges.sort(key=lambda e: e[2]); return total_weight',
    '    # 4. 拓扑排序：Kahn 算法队列削减入度',
    '    def topo_sort(self, in_degree): q = deque([i for i, d in enumerate(in_degree) if d == 0])',
    '    # 5. 最短路径：Dijkstra 堆优化 heapq',
    '    def dijkstra(self, s, t): pq = [(0, s)]; heapq.heappush(pq, (0, s)); return dist[t]',
  ],
  javascript: [
    '// === 图论全景知识体系速查 (JavaScript) ===',
    'class GraphSummary {',
    '  // 1. 遍历搜索：递归 DFS / 队列 BFS',
    '  traversal(u, vis) { vis[u] = true; for (const v of adj[u]) if (!vis[v]) this.traversal(v, vis); }',
    '  // 2. 并查集：find 路径压缩 + union 按秩合并',
    '  find(i) { return parent[i] === i ? i : (parent[i] = this.find(parent[i])); }',
    '  // 3. 最小生成树：Kruskal 贪心加边 / Prim 割边扩展',
    '  kruskal(edges) { edges.sort((a, b) => a[2] - b[2]); return total; }',
    '  // 4. 拓扑排序：Kahn 算法维护入度为 0 队列',
    '  topoSort(inDegree) { const q = []; /* 削减入度输出线性序 */ }',
    '  // 5. 最短路径：Dijkstra 优先队列 / Floyd 多源',
    '  dijkstra(s, t) { const pq = new MinPriorityQueue(); return dist[t]; }',
    '}',
  ],
};

export const GRAPH_SUMMARY_PROBLEM_HTML = `
  <div style="font-size: 13px; line-height: 1.7; color: #cbd5e1; display: flex; flex-direction: column; gap: 12px;">
    <div style="display: flex; align-items: center; gap: 8px;">
      <span style="padding: 2px 7px; border-radius: 4px; background: rgba(56, 189, 248, 0.15); color: #38bdf8; font-weight: 700; font-size: 11px; border: 1px solid rgba(56, 189, 248, 0.3);">全景知识图谱</span>
      <span style="padding: 2px 7px; border-radius: 4px; background: rgba(16, 185, 129, 0.15); color: #34d399; font-weight: 700; font-size: 11px; border: 1px solid rgba(16, 185, 129, 0.3);">五大支柱</span>
      <span style="font-size: 13px; font-weight: 700; color: #f8fafc;">图论全景核心知识体系 (Graph Theory Architecture)</span>
    </div>
    <p style="margin: 0;">
      图论是计算机科学与算法竞赛中最富表现力的分支，涵盖网络流、路径规划、拓扑依赖与集合维护。其底层核心可系统归结为五大基石支柱：
    </p>

    <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(220px, 1fr)); gap: 10px;">
      <div style="background: rgba(15, 23, 42, 0.75); border: 1px solid rgba(16, 185, 129, 0.3); border-left: 4px solid #10b981; padding: 10px; border-radius: 6px;">
        <div style="font-weight: 700; color: #34d399; margin-bottom: 4px;">1. 遍历搜索 (Traversal)</div>
        <div style="font-size: 12px; color: #cbd5e1;">DFS（递归/回溯/连通分量）与 BFS（层序/无权最短路），基础中的基石。</div>
      </div>
      <div style="background: rgba(15, 23, 42, 0.75); border: 1px solid rgba(59, 130, 246, 0.3); border-left: 4px solid #3b82f6; padding: 10px; border-radius: 6px;">
        <div style="font-weight: 700; color: #60a5fa; margin-bottom: 4px;">2. 并查集 (Disjoint-Set)</div>
        <div style="font-size: 12px; color: #cbd5e1;">find 路径压缩 + union 按秩合并，以近乎 O(1) 维护连通性与动态判环。</div>
      </div>
      <div style="background: rgba(15, 23, 42, 0.75); border: 1px solid rgba(168, 85, 247, 0.3); border-left: 4px solid #a855f7; padding: 10px; border-radius: 6px;">
        <div style="font-weight: 700; color: #c084fc; margin-bottom: 4px;">3. 最小生成树 (MST)</div>
        <div style="font-size: 12px; color: #cbd5e1;">Kruskal 加边贪心（并查集判环）与 Prim 割边扩展（堆优化），n 节点取 n-1 条边。</div>
      </div>
      <div style="background: rgba(15, 23, 42, 0.75); border: 1px solid rgba(234, 179, 8, 0.3); border-left: 4px solid #eab308; padding: 10px; border-radius: 6px;">
        <div style="font-weight: 700; color: #facc15; margin-bottom: 4px;">4. 拓扑排序 (Topological)</div>
        <div style="font-size: 12px; color: #cbd5e1;">Kahn 算法剥洋葱削减入度，DAG 线性依赖排序与环路检测。</div>
      </div>
      <div style="background: rgba(15, 23, 42, 0.75); border: 1px solid rgba(239, 68, 68, 0.3); border-left: 4px solid #ef4444; padding: 10px; border-radius: 6px;">
        <div style="font-weight: 700; color: #f87171; margin-bottom: 4px;">5. 最短路径 (Shortest Path)</div>
        <div style="font-size: 12px; color: #cbd5e1;">Dijkstra（非负权堆优化）、Bellman-Ford/SPFA（负权松弛）、Floyd（全源动态规划）。</div>
      </div>
    </div>
  </div>
`;

export const GRAPH_SUMMARY_ANALYSIS_HTML = `
  <div style="font-size: 13px; line-height: 1.7; color: #cbd5e1; display: flex; flex-direction: column; gap: 12px;">
    <div style="display: flex; align-items: center; gap: 8px;">
      <span style="padding: 2px 7px; border-radius: 4px; background: rgba(56, 189, 248, 0.15); color: #38bdf8; font-weight: 700; font-size: 11px; border: 1px solid rgba(56, 189, 248, 0.3);">算法选型秘籍</span>
      <span style="font-size: 13px; font-weight: 700; color: #f8fafc;">图论核心决策雷达</span>
    </div>

    <div style="background: rgba(15, 23, 42, 0.75); border: 1px solid rgba(59, 130, 246, 0.25); border-left: 4px solid #3b82f6; border-radius: 6px; padding: 10px 14px;">
      <div style="font-weight: 700; color: #60a5fa; margin-bottom: 6px;">🎯 问题特征与算法映射指引</div>
      <div style="font-size: 12px; color: #cbd5e1; display: flex; flex-direction: column; gap: 6px;">
        <div>• <b>无权图最短步数 / 扩散层数</b> $\\to$ <b>单源/多源 BFS</b>（先进先出单调性）</div>
        <div>• <b>连通块维护 / 动态增边判环</b> $\\to$ <b>并查集 (Union-Find)</b></div>
        <div>• <b>所有点连通且代价最小</b> $\\to$ <b>Kruskal (稀疏图 $E \\ll V^2$) / Prim (稠密图)</b></div>
        <div>• <b>先决条件 / 依赖流水线 / 任务排期</b> $\\to$ <b>Kahn 拓扑排序</b></div>
        <div>• <b>正权边最短路</b> $\\to$ <b>Dijkstra + 优先队列</b>，有负权边用 <b>Bellman-Ford / SPFA</b>，全源多点用 <b>Floyd</b></div>
      </div>
    </div>
  </div>
`;
