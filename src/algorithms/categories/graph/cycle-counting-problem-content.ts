/**
 * 无向图三元环与四元环定向计数 (3-Cycle and 4-Cycle Counting in Graph)
 * 进阶图论: 度数偏序有向化 (出度 <= sqrt(m))、两步打标枚举、严格 O(m*sqrt(m)) 环计数 (洛谷 P1989)
 */

export const CYCLE_COUNTING_CODE_LANGUAGES: Record<string, string[]> = {
  cpp: [
    '#include <iostream>',
    '#include <vector>',
    '#include <algorithm>',
    'using namespace std;',
    '',
    '// 三元环计数算法 (洛谷 P1989)',
    '// 核心：按度数偏序将无向图定向为 DAG (出度 <= sqrt(m))，两步打标严格 O(m sqrt(m))',
    'class CycleCounting {',
    'public:',
    '    int n, m;',
    '    vector<pair<int, int>> origEdges;',
    '    vector<int> deg, vis;',
    '    vector<vector<int>> dagAdj;',
    '    ',
    '    CycleCounting(int n) : n(n), deg(n + 1, 0), vis(n + 1, 0), dagAdj(n + 1) {}',
    '    ',
    '    void addEdge(int u, int v) {',
    '        origEdges.push_back({u, v});',
    '        deg[u]++;',
    '        deg[v]++;',
    '    }',
    '    ',
    '    // 偏序规则：度数小的连向度数大的；度数相同时编号小的连向编号大的',
    '    bool cmp(int u, int v) {',
    '        return deg[u] < deg[v] || (deg[u] == deg[v] && u < v);',
    '    }',
    '    ',
    '    long long count3Cycles() {',
    '        // 1. 度数偏序定向',
    '        for (const auto& e : origEdges) {',
    '            int u = e.first, v = e.second;',
    '            if (cmp(u, v)) dagAdj[u].push_back(v);',
    '            else dagAdj[v].push_back(u);',
    '        }',
    '        ',
    '        long long count = 0;',
    '        // 2. 枚举 u 的两层出边',
    '        for (int u = 1; u <= n; ++u) {',
    '            for (int v : dagAdj[u]) vis[v] = u; // 打标',
    '            ',
    '            for (int v : dagAdj[u]) {',
    '                for (int w : dagAdj[v]) {',
    '                    if (vis[w] == u) {',
    '                        count++; // 找到三元环 (u, v, w)',
    '                    }',
    '                }',
    '            }',
    '        }',
    '        return count;',
    '    }',
    '};',
  ],
  java: [
    'package advanced_graph;',
    '',
    'import java.util.*;',
    '',
    '// 三元环高效定向计数 - O(m sqrt(m))',
    'public class Code01_CycleCounting {',
    '    public static int n;',
    '    public static int[] deg, vis;',
    '    public static List<Integer>[] dagAdj;',
    '    ',
    '    public static boolean cmp(int u, int v) {',
    '        return deg[u] < deg[v] || (deg[u] == deg[v] && u < v);',
    '    }',
    '    ',
    '    public static long count3Cycles(List<int[]> edges) {',
    '        for (int[] e : edges) {',
    '            int u = e[0], v = e[1];',
    '            if (cmp(u, v)) dagAdj[u].add(v);',
    '            else dagAdj[v].add(u);',
    '        }',
    '        long ans = 0;',
    '        for (int u = 1; u <= n; u++) {',
    '            for (int v : dagAdj[u]) vis[v] = u;',
    '            for (int v : dagAdj[u]) {',
    '                for (int w : dagAdj[v]) {',
    '                    if (vis[w] == u) ans++;',
    '                }',
    '            }',
    '        }',
    '        return ans;',
    '    }',
    '}',
  ],
  python: [
    'class CycleCounting:',
    '    def __init__(self, n: int):',
    '        self.n = n',
    '        self.deg = [0] * (n + 1)',
    '        self.vis = [0] * (n + 1)',
    '        self.edges = []',
    '        self.dag = [[] for _ in range(n + 1)]',
    '        ',
    '    def add_edge(self, u: int, v: int):',
    '        self.edges.append((u, v))',
    '        self.deg[u] += 1',
    '        self.deg[v] += 1',
    '        ',
    '    def count_3_cycles(self) -> int:',
    '        for u, v in self.edges:',
    '            if self.deg[u] < self.deg[v] or (self.deg[u] == self.deg[v] and u < v):',
    '                self.dag[u].append(v)',
    '            else:',
    '                self.dag[v].append(u)',
    '        ans = 0',
    '        for u in range(1, self.n + 1):',
    '            for v in self.dag[u]:',
    '                self.vis[v] = u',
    '            for v in self.dag[u]:',
    '                for w in self.dag[v]:',
    '                    if self.vis[w] == u:',
    '                        ans += 1',
    '        return ans',
  ],
  javascript: [
    '// 三元环计数 (JavaScript 版)',
    'class CycleCounting {',
    '  constructor(n) {',
    '    this.n = n;',
    '    this.deg = Array(n + 1).fill(0);',
    '    this.vis = Array(n + 1).fill(0);',
    '    this.edges = [];',
    '    this.dag = Array.from({ length: n + 1 }, () => []);',
    '  }',
    '}',
  ],
};

export const CYCLE_COUNTING_PROBLEM_HTML = `
  <div style="font-size: 13px; line-height: 1.6; color: #334155;">
    <h3 style="margin-top: 0; color: #0f172a; font-size: 15px; font-weight: 800;">🔺 无向图三元环与四元环计数 (Cycle Counting)</h3>
    <p>
      在无向图 $G=(V, E)$ 中统计三元环（3 个点两两相连）和四元环的数量。暴力枚举 3 点需耗时 $O(n^3)$，而通过<b>度数偏序定向法</b>可将图转化为 DAG，在严格 $O(m \\sqrt{m})$ 极速内求得精确结果（洛谷 P1989）。
    </p>

    <div style="background: #f8fafc; border-left: 4px solid #3b82f6; padding: 8px 12px; margin: 10px 0; border-radius: 0 6px 6px 0;">
      <div style="font-weight: 700; color: #1e40af; margin-bottom: 4px;">📐 度数偏序定向定理</div>
      <div style="font-size: 11.5px; color: #334155;">
        将无向边 $(u, v)$ 定向为 $u \\to v$ 当且仅当：$deg[u] < deg[v]$ 或 $(deg[u] == deg[v] \\land u < v)$。<br/>
        <b>出度上界引理</b>：定向后的 DAG 中，任意节点 $u$ 的出度 $\\text{outdeg}(u) \\le \\sqrt{2m}$！
      </div>
    </div>
  </div>
`;

export const CYCLE_COUNTING_ANALYSIS_HTML = `
  <div style="font-size: 13px; line-height: 1.6; color: #334155;">
    <h3 style="margin-top: 0; color: #0f172a; font-size: 15px; font-weight: 800;">💡 为什么时间复杂度是 O(m√m)？</h3>

    <div style="background: #eff6ff; border: 1px solid #bfdbfe; border-radius: 6px; padding: 10px; margin-bottom: 12px;">
      <div style="font-weight: 700; color: #1e3a8a; margin-bottom: 4px;">1. 出度根号上界证明</div>
      <div style="font-size: 12px; color: #1e40af;">
        若 $deg[u] \\le \\sqrt{m}$，则其出度显然 $\\le \\sqrt{m}$；若 $deg[u] > \\sqrt{m}$，其出边只能连向度数比它更大的点，由于全图总度数和为 $2m$，度数 $> \\sqrt{m}$ 的点最多只有 $2\\sqrt{m}$ 个，故其出度也 $\\le 2\\sqrt{m}$！
      </div>
    </div>

    <div style="background: #f0fdf4; border: 1px solid #bbf7d0; border-radius: 6px; padding: 10px;">
      <div style="font-weight: 700; color: #166534; margin-bottom: 4px;">2. 社交网络与三角聚集度</div>
      <div style="font-size: 12px; color: #15803d;">
        三元环计数在社交网络图分析（聚类系数 Clustering Coefficient）、知识图谱推理与子图同构检测中是核心基础算法！
      </div>
    </div>
  </div>
`;
