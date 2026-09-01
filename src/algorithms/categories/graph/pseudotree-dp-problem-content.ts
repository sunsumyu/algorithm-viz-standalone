/**
 * 基环树 DP 与断环为链 (Pseudotree DP - Namori Graph)
 * 参考左程云《算法通关课》Class 077: 基环树找环、断边化树、两次树形 DP 与无后效性最优化 (洛谷 P2607 骑士 / P1453 城市环路)
 */

export const PSEUDOTREE_CODE_LANGUAGES: Record<string, string[]> = {
  cpp: [
    '#include <iostream>',
    '#include <vector>',
    '#include <algorithm>',
    'using namespace std;',
    '',
    '// 基环树 DP (洛谷 P2607 [ZJOI2008] 骑士 / 左程云 Class 077)',
    '// 核心：DFS 找环，断开环边 (u, v)，分别强制不选 u 和不选 v 进行两次树形 DP',
    'class PseudotreeDP {',
    'public:',
    '    struct Edge { int to, id; };',
    '    int n, rootU = 0, rootV = 0, cutEdgeId = -1;',
    '    vector<int> weight;',
    '    vector<vector<Edge>> adj;',
    '    vector<bool> vis;',
    '    vector<vector<long long>> dp; // dp[u][0]: 不选 u, dp[u][1]: 选 u',
    '    ',
    '    PseudotreeDP(int n, vector<int>& w) : n(n), weight(w), adj(n + 1),',
    '                                          vis(n + 1, false), dp(n + 1, vector<long long>(2, 0)) {}',
    '    ',
    '    void addEdge(int u, int v, int id) {',
    '        adj[u].push_back({v, id});',
    '        adj[v].push_back({u, id});',
    '    }',
    '    ',
    '    // 1. DFS 寻找基环树上的环与关键断边 (rootU, rootV)',
    '    void findCircle(int u, int edgeId) {',
    '        vis[u] = true;',
    '        for (auto& edge : adj[u]) {',
    '            if (edge.id == edgeId) continue;',
    '            int v = edge.to;',
    '            if (vis[v]) {',
    '                rootU = u;',
    '                rootV = v;',
    '                cutEdgeId = edge.id;',
    '            } else {',
    '                findCircle(v, edge.id);',
    '            }',
    '        }',
    '    }',
    '    ',
    '    // 2. 树形 DP: 经典没有上司的舞会状态转移',
    '    void treeDP(int u, int edgeId) {',
    '        dp[u][0] = 0;',
    '        dp[u][1] = weight[u];',
    '        for (auto& edge : adj[u]) {',
    '            if (edge.id == edgeId || edge.id == cutEdgeId) continue;',
    '            int v = edge.to;',
    '            treeDP(v, edge.id);',
    '            dp[u][0] += max(dp[v][0], dp[v][1]);',
    '            dp[u][1] += dp[v][0];',
    '        }',
    '    }',
    '    ',
    '    // 3. 断环为链求解',
    '    long long solve(int start) {',
    '        findCircle(start, -1);',
    '        if (cutEdgeId == -1) return 0;',
    '        ',
    '        // 方案 1: 强制不选 rootU',
    '        treeDP(rootU, -1);',
    '        long long ans1 = dp[rootU][0];',
    '        ',
    '        // 方案 2: 强制不选 rootV',
    '        treeDP(rootV, -1);',
    '        long long ans2 = dp[rootV][0];',
    '        ',
    '        return max(ans1, ans2);',
    '    }',
    '};',
  ],
  java: [
    'package class077;',
    '',
    'import java.util.*;',
    '',
    '// 基环树 DP - 左程云标准实现 (骑士 / 城市环路)',
    'public class Code01_PseudotreeDP {',
    '    public static int n, rootU, rootV, cutEdgeId = -1;',
    '    public static int[] weight;',
    '    public static List<int[]>[] adj;',
    '    public static boolean[] vis;',
    '    public static long[][] dp;',
    '    ',
    '    public static void findCircle(int u, int edgeId) {',
    '        vis[u] = true;',
    '        for (int[] edge : adj[u]) {',
    '            if (edge[1] == edgeId) continue;',
    '            int v = edge[0];',
    '            if (vis[v]) {',
    '                rootU = u; rootV = v; cutEdgeId = edge[1];',
    '            } else {',
    '                findCircle(v, edge[1]);',
    '            }',
    '        }',
    '    }',
    '    ',
    '    public static void treeDP(int u, int edgeId) {',
    '        dp[u][0] = 0;',
    '        dp[u][1] = weight[u];',
    '        for (int[] edge : adj[u]) {',
    '            if (edge[1] == edgeId || edge[1] == cutEdgeId) continue;',
    '            int v = edge[0];',
    '            treeDP(v, edge[1]);',
    '            dp[u][0] += Math.max(dp[v][0], dp[v][1]);',
    '            dp[u][1] += dp[v][0];',
    '        }',
    '    }',
    '}',
  ],
  python: [
    'class PseudotreeDP:',
    '    def __init__(self, n: int, weights: list[int]):',
    '        self.n = n',
    '        self.w = weights',
    '        self.adj = [[] for _ in range(n + 1)]',
    '        self.vis = [False] * (n + 1)',
    '        self.dp = [[0, 0] for _ in range(n + 1)]',
    '        self.root_u = 0',
    '        self.root_v = 0',
    '        self.cut_edge = -1',
    '        ',
    '    def find_circle(self, u: int, edge_id: int):',
    '        self.vis[u] = True',
    '        for v, eid in self.adj[u]:',
    '            if eid == edge_id: continue',
    '            if self.vis[v]:',
    '                self.root_u = u',
    '                self.root_v = v',
    '                self.cut_edge = eid',
    '            else:',
    '                self.find_circle(v, eid)',
    '                ',
    '    def tree_dp(self, u: int, edge_id: int):',
    '        self.dp[u][0] = 0',
    '        self.dp[u][1] = self.w[u]',
    '        for v, eid in self.adj[u]:',
    '            if eid == edge_id or eid == self.cut_edge: continue',
    '            self.tree_dp(v, eid)',
    '            self.dp[u][0] += max(self.dp[v][0], self.dp[v][1])',
    '            self.dp[u][1] += self.dp[v][0]',
  ],
  javascript: [
    '// 基环树 DP (JavaScript 版)',
    'class PseudotreeDP {',
    '  constructor(n, weights) {',
    '    this.n = n;',
    '    this.w = weights;',
    '    this.adj = Array.from({ length: n + 1 }, () => []);',
    '    this.vis = Array(n + 1).fill(false);',
    '    this.dp = Array.from({ length: n + 1 }, () => [0, 0]);',
    '    this.rootU = 0;',
    '    this.rootV = 0;',
    '    this.cutEdgeId = -1;',
    '  }',
    '  ',
    '  findCircle(u, edgeId) {',
    '    this.vis[u] = true;',
    '    for (const [v, eid] of this.adj[u]) {',
    '      if (eid === edgeId) continue;',
    '      if (this.vis[v]) {',
    '        this.rootU = u;',
    '        this.rootV = v;',
    '        this.cutEdgeId = eid;',
    '      } else {',
    '        this.findCircle(v, eid);',
    '      }',
    '    }',
    '  }',
    '}',
  ],
};

export const PSEUDOTREE_PROBLEM_HTML = `
  <div style="font-size: 13px; line-height: 1.6; color: #334155;">
    <h3 style="margin-top: 0; color: #0f172a; font-size: 15px; font-weight: 800;">🎡 基环树 DP (Pseudotree / Namori Graph)</h3>
    <p>
      <b>基环树 (Pseudotree)</b> 是指包含 $n$ 个节点和 $n$ 条边的连通无向图。它的结构恰好为一个<b>简单环</b>加上若干悬挂在外围的<b>子树</b>。
    </p>
    <p>
      在基环树上求<b>最大权独立集</b>（如骑士互斥不能同时选，洛谷 P2607 / P1453）：
    </p>
    <ul>
      <li><b>核心矛盾</b>：由于环的存在，树形 DP 的无后效性被破坏。</li>
      <li><b>断环为链破局</b>：找到环上一条关键边 $(u, v)$，强制断开！</li>
    </ul>

    <div style="background: #f8fafc; border-left: 4px solid #3b82f6; padding: 8px 12px; margin: 10px 0; border-radius: 0 6px 6px 0;">
      <div style="font-weight: 700; color: #1e40af; margin-bottom: 4px;">⚔️ 两次树形 DP 互斥分类</div>
      <div style="font-size: 11.5px; color: #334155;">
        因为 $u$ 和 $v$ 不能同时选：<br/>
        1. 强制不选 $u$：以 $u$ 为根做树形 DP，得到最大值 $dp[u][0]$；<br/>
        2. 强制不选 $v$：以 $v$ 为根做树形 DP，得到最大值 $dp[v][0]$；<br/>
        取 $\\max(dp[u][0], dp[v][0])$ 即可完美覆盖所有合法方案！
      </div>
    </div>
  </div>
`;

export const PSEUDOTREE_ANALYSIS_HTML = `
  <div style="font-size: 13px; line-height: 1.6; color: #334155;">
    <h3 style="margin-top: 0; color: #0f172a; font-size: 15px; font-weight: 800;">💡 左程云基环树找环与状态转移深度解析</h3>

    <div style="background: #eff6ff; border: 1px solid #bfdbfe; border-radius: 6px; padding: 10px; margin-bottom: 12px;">
      <div style="font-weight: 700; color: #1e3a8a; margin-bottom: 4px;">1. 边编号防返祖边误判</div>
      <div style="font-size: 12px; color: #1e40af;">
        无向图找环时，需要记录入边的编号 <code>edgeId</code>，防止沿刚刚走过的无向反向边误判为环。遇到第一个访问过的节点即锁定了环上关键边 $(u, v)$。
      </div>
    </div>

    <div style="background: #f0fdf4; border: 1px solid #bbf7d0; border-radius: 6px; padding: 10px;">
      <div style="font-weight: 700; color: #166534; margin-bottom: 4px;">2. 复杂度完全线性</div>
      <div style="font-size: 12px; color: #15803d;">
        找环耗时 $O(n)$，两次树形 DP 各耗时 $O(n)$，总体严格在线性 $O(n)$ 时间内解决任意基环树森林的全局最优化！
      </div>
    </div>
  </div>
`;
