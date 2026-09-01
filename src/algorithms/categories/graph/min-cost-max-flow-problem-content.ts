/**
 * 最小费用最大流 (Minimum Cost Maximum Flow - MCMF)
 * 参考左程云《算法通关课》【必备篇】class072: 连续最短路算法 (SPFA / EK)、成对反向弧负费用退费与费用累加 (洛谷 P3381)
 */

export const MCMF_CODE_LANGUAGES: Record<string, string[]> = {
  cpp: [
    '#include <iostream>',
    '#include <vector>',
    '#include <queue>',
    '#include <algorithm>',
    'using namespace std;',
    '',
    '// 最小费用最大流 (洛谷 P3381 / 左程云 class072)',
    '// 核心：SPFA 寻找单位费用最短路 + 增广推流与反向弧负费用退费',
    'struct Edge {',
    '    int to, cap, flow, cost, rev;',
    '};',
    '',
    'class MCMF {',
    'public:',
    '    int n, s, t;',
    '    vector<vector<Edge>> adj;',
    '    vector<int> dist, preNode, preEdge;',
    '    vector<bool> inQueue;',
    '    ',
    '    MCMF(int n, int s, int t) : n(n), s(s), t(t), adj(n + 1), dist(n + 1), preNode(n + 1), preEdge(n + 1), inQueue(n + 1) {}',
    '    ',
    '    void addEdge(int u, int v, int cap, int cost) {',
    '        adj[u].push_back({v, cap, 0, cost, (int)adj[v].size()});',
    '        adj[v].push_back({u, 0, 0, -cost, (int)adj[u].size() - 1}); // 反向弧费用为 -cost',
    '    }',
    '    ',
    '    // 1. SPFA 寻找单位费用最短路',
    '    bool spfa() {',
    '        fill(dist.begin(), dist.end(), 1e9);',
    '        fill(inQueue.begin(), inQueue.end(), false);',
    '        queue<int> q;',
    '        q.push(s);',
    '        dist[s] = 0;',
    '        inQueue[s] = true;',
    '        ',
    '        while (!q.empty()) {',
    '            int u = q.front(); q.pop();',
    '            inQueue[u] = false;',
    '            for (int i = 0; i < (int)adj[u].size(); ++i) {',
    '                Edge& e = adj[u][i];',
    '                if (e.cap - e.flow > 0 && dist[e.to] > dist[u] + e.cost) {',
    '                    dist[e.to] = dist[u] + e.cost;',
    '                    preNode[e.to] = u;',
    '                    preEdge[e.to] = i;',
    '                    if (!inQueue[e.to]) {',
    '                        inQueue[e.to] = true;',
    '                        q.push(e.to);',
    '                    }',
    '                }',
    '            }',
    '        }',
    '        return dist[t] < 1e9;',
    '    }',
    '    ',
    '    pair<int, int> getMinCostMaxFlow() {',
    '        int maxFlow = 0, minCost = 0;',
    '        while (spfa()) {',
    '            int pushed = 1e9;',
    '            for (int u = t; u != s; u = preNode[u]) {',
    '                Edge& e = adj[preNode[u]][preEdge[u]];',
    '                pushed = min(pushed, e.cap - e.flow);',
    '            }',
    '            for (int u = t; u != s; u = preNode[u]) {',
    '                Edge& e = adj[preNode[u]][preEdge[u]];',
    '                e.flow += pushed;',
    '                adj[u][e.rev].flow -= pushed;',
    '            }',
    '            maxFlow += pushed;',
    '            minCost += pushed * dist[t];',
    '        }',
    '        return {maxFlow, minCost};',
    '    }',
    '};',
  ],
  java: [
    'package class072;',
    '',
    'import java.util.*;',
    '',
    '// 最小费用最大流 - 左程云标准模板',
    'public class Code01_MCMFLuogu {',
    '    public static class Edge {',
    '        public int to, cap, flow, cost, rev;',
    '        public Edge(int to, int cap, int cost, int rev) {',
    '            this.to = to; this.cap = cap; this.flow = 0; this.cost = cost; this.rev = rev;',
    '        }',
    '    }',
    '    ',
    '    public static List<Edge>[] graph;',
    '    public static int[] dist, preNode, preEdge;',
    '    public static boolean[] inQueue;',
    '    ',
    '    public static boolean spfa(int s, int t, int n) {',
    '        Arrays.fill(dist, Integer.MAX_VALUE);',
    '        Queue<Integer> queue = new LinkedList<>();',
    '        queue.add(s);',
    '        dist[s] = 0;',
    '        inQueue[s] = true;',
    '        ',
    '        while (!queue.isEmpty()) {',
    '            int u = queue.poll();',
    '            inQueue[u] = false;',
    '            for (int i = 0; i < graph[u].size(); i++) {',
    '                Edge e = graph[u].get(i);',
    '                if (e.cap - e.flow > 0 && dist[e.to] > dist[u] + e.cost) {',
    '                    dist[e.to] = dist[u] + e.cost;',
    '                    preNode[e.to] = u;',
    '                    preEdge[e.to] = i;',
    '                    if (!inQueue[e.to]) {',
    '                        inQueue[e.to] = true;',
    '                        queue.add(e.to);',
    '                    }',
    '                }',
    '            }',
    '        }',
    '        return dist[t] < Integer.MAX_VALUE;',
    '    }',
    '}',
  ],
  python: [
    'from collections import deque',
    '',
    'class MCMF:',
    '    def __init__(self, n: int, s: int, t: int):',
    '        self.n, self.s, self.t = n, s, t',
    '        self.graph = [[] for _ in range(n + 1)]',
    '        self.dist = [float("inf")] * (n + 1)',
    '        self.pre_node = [0] * (n + 1)',
    '        self.pre_edge = [0] * (n + 1)',
    '        self.in_queue = [False] * (n + 1)',
    '        ',
    '    def add_edge(self, u: int, v: int, cap: int, cost: int):',
    '        self.graph[u].append([v, cap, 0, cost, len(self.graph[v])])',
    '        self.graph[v].append([u, 0, 0, -cost, len(self.graph[u]) - 1])',
    '        ',
    '    def spfa(self) -> bool:',
    '        self.dist = [float("inf")] * (self.n + 1)',
    '        self.in_queue = [False] * (self.n + 1)',
    '        q = deque([self.s])',
    '        self.dist[self.s] = 0',
    '        self.in_queue[self.s] = True',
    '        ',
    '        while q:',
    '            u = q.popleft()',
    '            self.in_queue[u] = False',
    '            for i, (v, cap, flow, cost, rev) in enumerate(self.graph[u]):',
    '                if cap - flow > 0 and self.dist[v] > self.dist[u] + cost:',
    '                    self.dist[v] = self.dist[u] + cost',
    '                    self.pre_node[v] = u',
    '                    self.pre_edge[v] = i',
    '                    if not self.in_queue[v]:',
    '                        self.in_queue[v] = True',
    '                        q.append(v)',
    '        return self.dist[self.t] < float("inf")',
  ],
  javascript: [
    '// 最小费用最大流 (JavaScript 版)',
    'class MCMF {',
    '  constructor(n, s, t) {',
    '    this.n = n; this.s = s; this.t = t;',
    '    this.graph = Array.from({ length: n + 1 }, () => []);',
    '    this.dist = Array(n + 1).fill(Infinity);',
    '    this.preNode = Array(n + 1).fill(0);',
    '    this.preEdge = Array(n + 1).fill(0);',
    '    this.inQueue = Array(n + 1).fill(false);',
    '  }',
    '  ',
    '  addEdge(u, v, cap, cost) {',
    '    this.graph[u].push({ to: v, cap, flow: 0, cost, rev: this.graph[v].length });',
    '    this.graph[v].push({ to: u, cap: 0, flow: 0, cost: -cost, rev: this.graph[u].length - 1 });',
    '  }',
    '  ',
    '  spfa() {',
    '    this.dist.fill(Infinity);',
    '    this.inQueue.fill(false);',
    '    const q = [this.s];',
    '    this.dist[this.s] = 0;',
    '    this.inQueue[this.s] = true;',
    '    ',
    '    while (q.length > 0) {',
    '      const u = q.shift();',
    '      this.inQueue[u] = false;',
    '      for (let i = 0; i < this.graph[u].length; i++) {',
    '        const e = this.graph[u][i];',
    '        if (e.cap - e.flow > 0 && this.dist[e.to] > this.dist[u] + e.cost) {',
    '          this.dist[e.to] = this.dist[u] + e.cost;',
    '          this.preNode[e.to] = u;',
    '          this.preEdge[e.to] = i;',
    '          if (!this.inQueue[e.to]) {',
    '            this.inQueue[e.to] = true;',
    '            q.push(e.to);',
    '          }',
    '        }',
    '      }',
    '    }',
    '    return this.dist[this.t] < Infinity;',
    '  }',
    '}',
  ],
};

export const MCMF_PROBLEM_HTML = `
  <div style="font-size: 13px; line-height: 1.6; color: #334155;">
    <h3 style="margin-top: 0; color: #0f172a; font-size: 15px; font-weight: 800;">💰 最小费用最大流 (MCMF - Minimum Cost Max Flow)</h3>
    <p>
      在有向网络中，每条管道不仅有容量上限 $C(u, v)$，还存在单位流量的运输费用 $W(u, v)$。
    </p>
    <p>
      求在保证从源点 $S$ 流向汇点 $T$ 的流量达到<b>全局最大流</b>的前提下，使得总运费 $\\sum (flow \\times cost)$ <b>最小</b>（洛谷 P3381）。
    </p>

    <div style="background: #f8fafc; border-left: 4px solid #3b82f6; padding: 8px 12px; margin: 10px 0; border-radius: 0 6px 6px 0;">
      <div style="font-weight: 700; color: #1e40af; margin-bottom: 4px;">🎯 贪心增广与负费用退费</div>
      <div style="font-size: 11.5px; color: #334155;">
        每次通过 SPFA 寻找当前残量网络上<b>单位费用最短的增广路</b>；<br/>
        正向边费用为 $+cost$，反向边费用自动设为 $-cost$。若后续沿反向边推流，不仅退回流量，还会<b>退回对应的运费</b>！
      </div>
    </div>
  </div>
`;

export const MCMF_ANALYSIS_HTML = `
  <div style="font-size: 13px; line-height: 1.6; color: #334155;">
    <h3 style="margin-top: 0; color: #0f172a; font-size: 15px; font-weight: 800;">💡 左程云连续最短路增广 (Successive Shortest Path) 解析</h3>

    <div style="background: #eff6ff; border: 1px solid #bfdbfe; border-radius: 6px; padding: 10px; margin-bottom: 12px;">
      <div style="font-weight: 700; color: #1e3a8a; margin-bottom: 4px;">1. 为什么每次只走费用最短路？</div>
      <div style="font-size: 12px; color: #1e40af;">
        根据费用流凸性定理，每次沿当前单位费用最低的路径进行增广，能够保证在推满最大流的整个生命周期中，累积总费用始终保持在全局最低！
      </div>
    </div>

    <div style="background: #f0fdf4; border: 1px solid #bbf7d0; border-radius: 6px; padding: 10px;">
      <div style="font-weight: 700; color: #166534; margin-bottom: 4px;">2. 终极工业应用</div>
      <div style="font-size: 12px; color: #15803d;">
        物流调度系统、二分图带权最优分配、航空航线旅客转运优化等经典运筹学难题均直接归约为 MCMF 模型。
      </div>
    </div>
  </div>
`;
