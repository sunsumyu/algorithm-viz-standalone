/**
 * K 短路与 A* 启发式搜索 (K-th Shortest Path)
 * 进阶图论: 反向图 Dijkstra 预处理 h(u) = dis[u->T]、正向 A* 优先队列搜索 f(u) = g(u) + h(u)、终点第 K 次弹出即为第 K 短路 (洛谷 P2483)
 */

export const K_SHORTEST_PATH_CODE_LANGUAGES: Record<string, string[]> = {
  cpp: [
    '#include <iostream>',
    '#include <vector>',
    '#include <queue>',
    '#include <algorithm>',
    'using namespace std;',
    '',
    '// K 短路问题 (A* 算法 - 洛谷 P2483)',
    '// 核心：反向图 Dijkstra 预处理 h(u) = dis[u->T]，正向 A* 优先队列弹出 T 的第 k 次即为答案',
    'struct Edge { int to, w; };',
    'struct Node {',
    '    int u, g, f;',
    '    bool operator>(const Node& o) const { return f > o.f; }',
    '};',
    '',
    'class KthShortestPath {',
    'public:',
    '    int n, S, T, K;',
    '    vector<vector<Edge>> adj, revAdj;',
    '    vector<int> h, countPop;',
    '    ',
    '    KthShortestPath(int n, int S, int T, int K) : n(n), S(S), T(T), K(K),',
    '                                                  adj(n + 1), revAdj(n + 1),',
    '                                                  h(n + 1, 1e9), countPop(n + 1, 0) {}',
    '    ',
    '    void addEdge(int u, int v, int w) {',
    '        adj[u].push_back({v, w});',
    '        revAdj[v].push_back({u, w});',
    '    }',
    '    ',
    '    // 1. 反向图 Dijkstra 计算所有点到 T 的精确最短路作为 h(u)',
    '    void dijkstraRev() {',
    '        priority_queue<pair<int, int>, vector<pair<int, int>>, greater<>> pq;',
    '        h[T] = 0;',
    '        pq.push({0, T});',
    '        ',
    '        while (!pq.empty()) {',
    '            auto [d, u] = pq.top(); pq.pop();',
    '            if (d > h[u]) continue;',
    '            for (const auto& e : revAdj[u]) {',
    '                if (h[e.to] > h[u] + e.w) {',
    '                    h[e.to] = h[u] + e.w;',
    '                    pq.push({h[e.to], e.to});',
    '                }',
    '            }',
    '        }',
    '    }',
    '    ',
    '    // 2. 正向 A* 搜索',
    '    int aStar() {',
    '        dijkstraRev();',
    '        if (h[S] == 1e9) return -1; // 连通性不可达',
    '        ',
    '        priority_queue<Node, vector<Node>, greater<Node>> pq;',
    '        pq.push({S, 0, h[S]});',
    '        ',
    '        while (!pq.empty()) {',
    '            Node cur = pq.top(); pq.pop();',
    '            countPop[cur.u]++;',
    '            ',
    '            if (cur.u == T && countPop[T] == K) {',
    '                return cur.g; // 第 K 次到达终点，返回精确花费',
    '            }',
    '            if (countPop[cur.u] > K) continue;',
    '            ',
    '            for (const auto& e : adj[cur.u]) {',
    '                int nextG = cur.g + e.w;',
    '                pq.push({e.to, nextG, nextG + h[e.to]});',
    '            }',
    '        }',
    '        return -1;',
    '    }',
    '};',
  ],
  java: [
    'package advanced_graph;',
    '',
    'import java.util.*;',
    '',
    '// K 短路 A* 标准实现',
    'public class Code01_KthShortestPath {',
    '    public static class Edge { int to, w; Edge(int t, int w) { this.to = t; this.w = w; } }',
    '    public static class State implements Comparable<State> {',
    '        int u, g, f;',
    '        State(int u, int g, int f) { this.u = u; this.g = g; this.f = f; }',
    '        public int compareTo(State o) { return Integer.compare(this.f, o.f); }',
    '    }',
    '}',
  ],
  python: [
    'import heapq',
    '',
    'class KthShortestPath:',
    '    def __init__(self, n: int, S: int, T: int, K: int):',
    '        self.n = n',
    '        self.S = S',
    '        self.T = T',
    '        self.K = K',
    '        self.adj = [[] for _ in range(n + 1)]',
    '        self.rev_adj = [[] for _ in range(n + 1)]',
    '        self.h = [float("inf")] * (n + 1)',
    '        self.count_pop = [0] * (n + 1)',
  ],
  javascript: [
    '// K 短路 (JavaScript 版)',
    'class KthShortestPath {',
    '  constructor(n, S, T, K) {',
    '    this.n = n;',
    '    this.S = S;',
    '    this.T = T;',
    '    this.K = K;',
    '    this.adj = Array.from({ length: n + 1 }, () => []);',
    '    this.revAdj = Array.from({ length: n + 1 }, () => []);',
    '  }',
    '}',
  ],
};

export const K_SHORTEST_PATH_PROBLEM_HTML = `
  <div style="font-size: 13px; line-height: 1.6; color: #334155;">
    <h3 style="margin-top: 0; color: #0f172a; font-size: 15px; font-weight: 800;">🚀 K 短路问题 (K-th Shortest Path)</h3>
    <p>
      给定一个带权有向图、起点 $S$、终点 $T$ 和正整数 $K$。求从 $S$ 到 $T$ 的所有路径中长度第 $K$ 小的路径长度（允许经过重复点和边，洛谷 P2483）。
    </p>

    <div style="background: #f8fafc; border-left: 4px solid #3b82f6; padding: 8px 12px; margin: 10px 0; border-radius: 0 6px 6px 0;">
      <div style="font-weight: 700; color: #1e40af; margin-bottom: 4px;">🎯 A* 启发式搜索双阶段求解</div>
      <div style="font-size: 11.5px; color: #334155;">
        1. <b>反向图 Dijkstra</b>：以终点 $T$ 为源点在反向图上跑最短路，求出每个节点到 $T$ 的真实距离 $h(u) = \\text{dis}[u \\to T]$；<br/>
        2. <b>正向 A* 优先队列</b>：按估价函数 $f(u) = g(u) + h(u)$ 维护小根堆。因为 $h(u)$ 绝不高估真实距离，<b>终点 $T$ 第 $K$ 次被弹出小根堆时，其 $g(T)$ 恰好就是全局第 $K$ 短路</b>！
      </div>
    </div>
  </div>
`;

export const K_SHORTEST_PATH_ANALYSIS_HTML = `
  <div style="font-size: 13px; line-height: 1.6; color: #334155;">
    <h3 style="margin-top: 0; color: #0f172a; font-size: 15px; font-weight: 800;">💡 A* 在 K 短路中的严格正确性</h3>

    <div style="background: #eff6ff; border: 1px solid #bfdbfe; border-radius: 6px; padding: 10px; margin-bottom: 12px;">
      <div style="font-weight: 700; color: #1e3a8a; margin-bottom: 4px;">1. 完美启发函数的单调性</div>
      <div style="font-size: 12px; color: #1e40af;">
        反向 Dijkstra 计算出的 $h(u)$ 是无约束的真实最短距离，满足 $h(u) \\le w(u, v) + h(v)$ 三角不等式。当终点被弹出时，$f(T) = g(T) + 0 = g(T)$，堆弹出的序列严格按路径总长升序排列！
      </div>
    </div>

    <div style="background: #f0fdf4; border: 1px solid #bbf7d0; border-radius: 6px; padding: 10px;">
      <div style="font-weight: 700; color: #166534; margin-bottom: 4px;">2. 剪枝策略</div>
      <div style="font-size: 12px; color: #15803d;">
        任意普通节点 $u$ 被弹出超过 $K$ 次后，其后续扩展出的路径排名必然大于 $K$，可直接剪枝跳过，保证高效！
      </div>
    </div>
  </div>
`;
