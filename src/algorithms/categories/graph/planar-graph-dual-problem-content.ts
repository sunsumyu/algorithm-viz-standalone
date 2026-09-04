/**
 * 平面图最小割转对偶图最短路 (Planar Graph Min-Cut to Dual Graph Shortest Path)
 * 进阶图论: 狼抓兔子、平面图每个面抽象为点、最小割等价于对偶图最短路、Dijkstra 取代 Dinic 极速求解 (洛谷 P4001)
 */

export const PLANAR_DUAL_CODE_LANGUAGES: Record<string, string[]> = {
  cpp: [
    '#include <iostream>',
    '#include <vector>',
    '#include <queue>',
    'using namespace std;',
    '',
    '// 平面图最小割转对偶图最短路 (洛谷 P4001 [ICPC-Beijing 2006] 狼抓兔子)',
    '// 核心：平面网格面转点，原图割边对应对偶图连边，Dijkstra 极速 O((V+E)log V)',
    'struct Edge {',
    '    int to, weight;',
    '};',
    '',
    'int n, m;',
    'vector<vector<Edge>> dualAdj;',
    'int S_star, T_star;',
    '',
    'int dijkstraDual() {',
    '    int totalNodes = dualAdj.size();',
    '    vector<int> dist(totalNodes, 1e9);',
    '    priority_queue<pair<int, int>, vector<pair<int, int>>, greater<pair<int, int>>> pq;',
    '    ',
    '    dist[S_star] = 0;',
    '    pq.push({0, S_star});',
    '    ',
    '    while (!pq.empty()) {',
    '        auto [d, u] = pq.top(); pq.pop();',
    '        if (d > dist[u]) continue;',
    '        if (u == T_star) return d;',
    '        ',
    '        for (const auto& e : dualAdj[u]) {',
    '            if (dist[u] + e.weight < dist[e.to]) {',
    '                dist[e.to] = dist[u] + e.weight;',
    '                pq.push({dist[e.to], e.to});',
    '            }',
    '        }',
    '    }',
    '    return dist[T_star];',
    '}',
  ],
  java: [
    'package advanced_graph;',
    '',
    'import java.util.*;',
    '',
    '// 平面图最小割转对偶图最短路 (洛谷 P4001 [ICPC-Beijing 2006] 狼抓兔子)',
    '// 核心思想：平面网格面转点，原图割边对应对偶图连边，Dijkstra 极速 O((V+E)log V)',
    'public class Code02_PlanarGraphDual {',
    '',
    '    public static class Edge {',
    '        public int to;',
    '        public int weight;',
    '        public Edge(int to, int weight) {',
    '            this.to = to;',
    '            this.weight = weight;',
    '        }',
    '    }',
    '',
    '    public static int n, m;',
    '    public static int sStar, tStar;',
    '    public static List<List<Edge>> dualAdj;',
    '',
    '    public static void addDualEdge(int u, int v, int w) {',
    '        dualAdj.get(u).add(new Edge(v, w));',
    '        dualAdj.get(v).add(new Edge(u, w));',
    '    }',
    '',
    '    // 堆优化 Dijkstra 求解对偶图最短路 (即原图最小割)',
    '    public static int dijkstraDual(int totalDualNodes, int src, int dest) {',
    '        int[] dist = new int[totalDualNodes + 1];',
    '        Arrays.fill(dist, Integer.MAX_VALUE);',
    '        boolean[] visited = new boolean[totalDualNodes + 1];',
    '        PriorityQueue<int[]> pq = new PriorityQueue<>((a, b) -> Integer.compare(a[0], b[0]));',
    '',
    '        dist[src] = 0;',
    '        pq.offer(new int[]{0, src});',
    '',
    '        while (!pq.isEmpty()) {',
    '            int[] curr = pq.poll();',
    '            int d = curr[0];',
    '            int u = curr[1];',
    '',
    '            if (visited[u]) continue;',
    '            visited[u] = true;',
    '',
    '            if (u == dest) {',
    '                return d; // 提前到达对偶汇点 T*',
    '            }',
    '',
    '            for (Edge edge : dualAdj.get(u)) {',
    '                int v = edge.to;',
    '                int w = edge.weight;',
    '                if (!visited[v] && dist[u] + w < dist[v]) {',
    '                    dist[v] = dist[u] + w;',
    '                    pq.offer(new int[]{dist[v], v});',
    '                }',
    '            }',
    '        }',
    '        return dist[dest];',
    '    }',
    '',
    '    public static int solveSample() {',
    '        int totalNodes = 6;',
    '        sStar = 0;',
    '        tStar = 5;',
    '        dualAdj = new ArrayList<>();',
    '        for (int i = 0; i <= totalNodes; i++) dualAdj.add(new ArrayList<>());',
    '        addDualEdge(sStar, 1, 3);',
    '        addDualEdge(sStar, 2, 4);',
    '        addDualEdge(1, 3, 2);',
    '        addDualEdge(2, 4, 3);',
    '        addDualEdge(3, tStar, 3);',
    '        addDualEdge(4, tStar, 2);',
    '        return dijkstraDual(totalNodes, sStar, tStar);',
    '    }',
    '}',
  ],
  python: [
    'import heapq',
    '',
    '# 平面图最小割转对偶图最短路 (Python 版)',
    'def dijkstra_dual(dual_adj, s_star, t_star, total_nodes):',
    '    dist = {i: float("inf") for i in range(total_nodes + 1)}',
    '    dist[s_star] = 0',
    '    pq = [(0, s_star)]',
    '    visited = set()',
    '    ',
    '    while pq:',
    '        d, u = heapq.heappop(pq)',
    '        if u in visited: continue',
    '        visited.add(u)',
    '        if u == t_star: return d',
    '        ',
    '        for v, w in dual_adj[u, []]:',
    '            if v not in visited and dist[u] + w < dist[v]:',
    '                dist[v] = dist[u] + w',
    '                heapq.heappush(pq, (dist[v], v))',
    '    return dist[t_star]',
  ],
  javascript: [
    '// 平面图对偶图最短路 (JavaScript 优先队列版)',
    'function dijkstraDual(dualAdj, sStar, tStar, totalNodes) {',
    '  const dist = new Array(totalNodes + 1).fill(Infinity);',
    '  const visited = new Array(totalNodes + 1).fill(false);',
    '  const pq = [{ d: 0, u: sStar }];',
    '  dist[sStar] = 0;',
    '  ',
    '  while (pq.length > 0) {',
    '    pq.sort((a, b) => a.d - b.d);',
    '    const { d, u } = pq.shift();',
    '    if (visited[u]) continue;',
    '    visited[u] = true;',
    '    if (u === tStar) return d;',
    '    ',
    '    for (const [v, w] of dualAdj[u] || []) {',
    '      if (!visited[v] && dist[u] + w < dist[v]) {',
    '        dist[v] = dist[u] + w;',
    '        pq.push({ d: dist[v], u: v });',
    '      }',
    '    }',
    '  }',
    '  return dist[tStar];',
    '}',
  ],
};

export const PLANAR_DUAL_PROBLEM_HTML = `
  <div style="font-size: 13px; line-height: 1.6; color: #334155;">
    <h3 style="margin-top: 0; color: #0f172a; font-size: 15px; font-weight: 800;">🌐 平面图最小割转对偶图最短路 (Planar Graph Dual)</h3>
    <p>
      在大型网格平面图中（如 $1000 \\times 1000$ 的狼抓兔子网络），若使用常规最大流算法（如 Dinic）求 $S-T$ 最小割，时间复杂度高达 $O(V^2 E) = O(N^6)$。利用<b>平面图与对偶图的对偶定理</b>，将最小割问题转化为对偶图上的<b>单源最短路径</b>问题（洛谷 P4001）。
    </p>

    <div style="background: #f8fafc; border-left: 4px solid #3b82f6; padding: 8px 12px; margin: 10px 0; border-radius: 0 6px 6px 0;">
      <div style="font-weight: 700; color: #1e40af; margin-bottom: 4px;">⚡ 对偶转换三步法</div>
      <div style="font-size: 11.5px; color: #334155;">
        1. <b>面转点</b>：原图的每个三角面对应对偶图的一个内部节点；<br/>
        2. <b>割转路</b>：原图分割源汇 $S-T$ 的一条连续割线，精准对应对偶图从超级源面 $S^*$ 到超级汇面 $T^*$ 的一条连通路径；<br/>
        3. <b>Dijkstra 极速求解</b>：在对偶图上跑堆优化最短路，复杂度降至 $O((V+E)\\log V)$！
      </div>
    </div>
  </div>
`;

export const PLANAR_DUAL_ANALYSIS_HTML = `
  <div style="font-size: 13px; line-height: 1.6; color: #334155;">
    <h3 style="margin-top: 0; color: #0f172a; font-size: 15px; font-weight: 800;">💡 为什么割线严格对应对偶图路径？</h3>

    <div style="background: #eff6ff; border: 1px solid #bfdbfe; border-radius: 6px; padding: 10px; margin-bottom: 12px;">
      <div style="font-weight: 700; color: #1e3a8a; margin-bottom: 4px;">1. 拓扑分割的等价性</div>
      <div style="font-size: 12px; color: #1e40af;">
        平面图中任何割断 $S$ 与 $T$ 的最小割集合，几何上必须形成一条从网格“上方/左侧边界”贯穿到“下方/右侧边界”的封闭隔离带。这条隔离带横跨的每条原图边，恰好是对偶图中相邻两面的通道！
      </div>
    </div>

    <div style="background: #f0fdf4; border: 1px solid #bbf7d0; border-radius: 6px; padding: 10px;">
      <div style="font-weight: 700; color: #166534; margin-bottom: 4px;">2. 算法吞吐量量级跃升</div>
      <div style="font-size: 12px; color: #15803d;">
        对于 $1000 \\times 1000$ 节点的大图，Dinic 算法往往因残量增广过多而超时（TLE），而对偶图 Dijkstra 仅需毫秒级（约 0.05 秒）即可直接输出全局最小割容量！
      </div>
    </div>
  </div>
`;
