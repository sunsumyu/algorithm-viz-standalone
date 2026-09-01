/**
 * 网络流最大权闭合子图 (Max-Weight Closure of Directed Graph)
 * 进阶网络流: 正权点连源点 S、负权点连汇点 T、依赖边容量无穷大、最大权 = 正权和 - 最小割 (洛谷 P2762)
 */

export const MAX_WEIGHT_CLOSURE_CODE_LANGUAGES: Record<string, string[]> = {
  cpp: [
    '#include <iostream>',
    '#include <vector>',
    '#include <queue>',
    '#include <numeric>',
    'using namespace std;',
    '',
    '// 最大权闭合子图 (洛谷 P2762 太空飞行计划问题)',
    '// 核心：S -> 正权点(收益)，负权点(成本) -> T，依赖边 inf，最大收益 = 总正权和 - 最小割',
    'class MaxWeightClosure {',
    'public:',
    '    struct Edge {',
    '        int to, cap, flow, rev;',
    '    };',
    '    ',
    '    int n, S, T;',
    '    vector<vector<Edge>> adj;',
    '    vector<int> level, cur;',
    '    int totalPositiveWeight = 0;',
    '    ',
    '    MaxWeightClosure(int n) : n(n), S(0), T(n + 1), adj(n + 2),',
    '                              level(n + 2, -1), cur(n + 2, 0) {}',
    '    ',
    '    void addEdge(int u, int v, int cap) {',
    '        int idxU = adj[u].size();',
    '        int idxV = adj[v].size();',
    '        adj[u].push_back({v, cap, 0, idxV});',
    '        adj[v].push_back({u, 0, 0, idxU});',
    '    }',
    '    ',
    '    void addNode(int u, int weight) {',
    '        if (weight > 0) {',
    '            totalPositiveWeight += weight;',
    '            addEdge(S, u, weight); // 正权点：连 S，容量为收益',
    '        } else if (weight < 0) {',
    '            addEdge(u, T, -weight); // 负权点：连 T，容量为成本',
    '        }',
    '    }',
    '    ',
    '    void addDependency(int u, int v) {',
    '        addEdge(u, v, 1e9); // 依赖关系：容量为无穷大 (不可割断)',
    '    }',
    '    ',
    '    bool bfs() {',
    '        fill(level.begin(), level.end(), -1);',
    '        queue<int> q;',
    '        q.push(S);',
    '        level[S] = 0;',
    '        while (!q.empty()) {',
    '            int u = q.front(); q.pop();',
    '            for (const auto& e : adj[u]) {',
    '                if (e.cap > e.flow && level[e.to] == -1) {',
    '                    level[e.to] = level[u] + 1;',
    '                    q.push(e.to);',
    '                }',
    '            }',
    '        }',
    '        return level[T] != -1;',
    '    }',
    '    ',
    '    int dfs(int u, int pushed) {',
    '        if (u == T || pushed == 0) return pushed;',
    '        for (int& cid = cur[u]; cid < (int)adj[u].size(); ++cid) {',
    '            auto& e = adj[u][cid];',
    '            int tr = e.to;',
    '            if (level[u] + 1 != level[tr] || e.cap <= e.flow) continue;',
    '            int trPushed = dfs(tr, min(pushed, e.cap - e.flow));',
    '            if (trPushed == 0) continue;',
    '            e.flow += trPushed;',
    '            adj[tr][e.rev].flow -= trPushed;',
    '            return trPushed;',
    '        }',
    '        return 0;',
    '    }',
    '    ',
    '    pair<int, vector<int>> solve() {',
    '        int minCut = 0;',
    '        while (bfs()) {',
    '            fill(cur.begin(), cur.end(), 0);',
    '            while (int pushed = dfs(S, 1e9)) minCut += pushed;',
    '        }',
    '        int maxProfit = totalPositiveWeight - minCut;',
    '        ',
    '        // 残量网络中与 S 连通的点即为闭合子图所选节点',
    '        vector<bool> vis(n + 2, false);',
    '        queue<int> q;',
    '        q.push(S);',
    '        vis[S] = true;',
    '        vector<int> chosenNodes;',
    '        while (!q.empty()) {',
    '            int u = q.front(); q.pop();',
    '            if (u >= 1 && u <= n) chosenNodes.push_back(u);',
    '            for (const auto& e : adj[u]) {',
    '                if (e.cap > e.flow && !vis[e.to]) {',
    '                    vis[e.to] = true;',
    '                    q.push(e.to);',
    '                }',
    '            }',
    '        }',
    '        return {maxProfit, chosenNodes};',
    '    }',
    '};',
  ],
  java: [
    'package advanced_flow;',
    '',
    'import java.util.*;',
    '',
    '// 最大权闭合子图标准实现 - Dinic 最小割与方案输出',
    'public class Code01_MaxWeightClosure {',
    '    public static int n, S, T, totalPositiveWeight;',
    '    public static List<Edge>[] adj;',
    '    public static int[] level, cur;',
    '}',
  ],
  python: [
    'class MaxWeightClosure:',
    '    def __init__(self, n: int):',
    '        self.n = n',
    '        self.S = 0',
    '        self.T = n + 1',
    '        self.adj = [[] for _ in range(n + 2)]',
    '        self.total_positive = 0',
  ],
  javascript: [
    '// 最大权闭合子图 (JavaScript 版)',
    'class MaxWeightClosure {',
    '  constructor(n) {',
    '    this.n = n;',
    '    this.S = 0;',
    '    this.T = n + 1;',
    '    this.adj = Array.from({ length: n + 2 }, () => []);',
    '    this.totalPositive = 0;',
    '  }',
    '}',
  ],
};

export const MAX_WEIGHT_CLOSURE_PROBLEM_HTML = `
  <div style="font-size: 13px; line-height: 1.6; color: #334155;">
    <h3 style="margin-top: 0; color: #0f172a; font-size: 15px; font-weight: 800;">💰 最大权闭合子图 (Max-Weight Closure)</h3>
    <p>
      有向图 $G=(V, E)$ 的<b>闭合子图</b>是指一个点集 $S \subseteq V$，若 $u \in S$ 且存在有向依赖边 $u \to v$，则必有 $v \in S$。求所有闭合子图中点权和的最大值（洛谷 P2762 太空飞行计划问题）。
    </p>

    <div style="background: #f8fafc; border-left: 4px solid #3b82f6; padding: 8px 12px; margin: 10px 0; border-radius: 0 6px 6px 0;">
      <div style="font-weight: 700; color: #1e40af; margin-bottom: 4px;">📐 最小割经典建图模型</div>
      <div style="font-size: 11.5px; color: #334155;">
        1. 建立超级源点 $S$ 和超级汇点 $T$；<br/>
        2. 对正权点 $u$ ($w_u > 0$)：连边 $S \to u$，容量为 $w_u$（割断代表放弃该收益）；<br/>
        3. 对负权点 $v$ ($w_v < 0$)：连边 $v \to T$，容量为 $-w_v$（割断代表支付该成本）；<br/>
        4. 对原图依赖边 $u \to v$：连边 $u \to v$，容量为 $\\infty$（强依赖不可割断）。
      </div>
    </div>
  </div>
`;

export const MAX_WEIGHT_CLOSURE_ANALYSIS_HTML = `
  <div style="font-size: 13px; line-height: 1.6; color: #334155;">
    <h3 style="margin-top: 0; color: #0f172a; font-size: 15px; font-weight: 800;">💡 最大净收益定理与最优方案提取</h3>

    <div style="background: #eff6ff; border: 1px solid #bfdbfe; border-radius: 6px; padding: 10px; margin-bottom: 12px;">
      <div style="font-weight: 700; color: #1e3a8a; margin-bottom: 4px;">1. 最大权计算公式</div>
      <div style="font-size: 12px; color: #1e40af;">
        $$\\text{MaxProfit} = \\sum_{w_u > 0} w_u - \\text{MinCut}$$
        最小割恰好对应了“放弃的所有正权收益 + 支付的所有负权成本”的最小值！
      </div>
    </div>

    <div style="background: #f0fdf4; border: 1px solid #bbf7d0; border-radius: 6px; padding: 10px;">
      <div style="font-weight: 700; color: #166534; margin-bottom: 4px;">2. 方案提取定理</div>
      <div style="font-size: 12px; color: #15803d;">
        在最终残量网络中，从源点 $S$ 出发沿着还有正向剩余容量 $(cap > flow)$ 的边能够访问到的所有节点集合，恰好构成全局最优闭合子图！
      </div>
    </div>
  </div>
`;
