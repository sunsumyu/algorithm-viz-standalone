/**
 * 上下界网络流与循环流 (Bounded Flow / Feasible Circulation)
 * 进阶网络流: 每条边强制流量 [low, up]、差额网络与超级源汇 SS/TT 平衡、满流判定定理 (洛谷 P5192 / LOJ 115)
 */

export const BOUNDED_FLOW_CODE_LANGUAGES: Record<string, string[]> = {
  cpp: [
    '#include <iostream>',
    '#include <vector>',
    '#include <queue>',
    '#include <numeric>',
    'using namespace std;',
    '',
    '// 有上下界网络流 (LOJ 115 无源汇可行流 / 洛谷 P5192)',
    '// 核心：自由容量 up-low，点差额 inLow - outLow，超级源汇 SS/TT 满流判定',
    'class BoundedFlow {',
    'public:',
    '    struct Edge {',
    '        int to, cap, flow, low, rev;',
    '    };',
    '    ',
    '    int n, SS, TT;',
    '    vector<vector<Edge>> adj;',
    '    vector<int> delta, level, cur;',
    '    int sumPositiveDelta = 0;',
    '    ',
    '    BoundedFlow(int n) : n(n), SS(n + 1), TT(n + 2), adj(n + 3),',
    '                         delta(n + 1, 0), level(n + 3, -1), cur(n + 3, 0) {}',
    '    ',
    '    void addBoundedEdge(int u, int v, int low, int up) {',
    '        delta[u] -= low; // u 必须流出 low',
    '        delta[v] += low; // v 必须流入 low',
    '        int idxU = adj[u].size();',
    '        int idxV = adj[v].size();',
    '        adj[u].push_back({v, up - low, 0, low, idxV});',
    '        adj[v].push_back({u, 0, 0, 0, idxU});',
    '    }',
    '    ',
    '    void buildSuperSourceSink() {',
    '        for (int i = 1; i <= n; ++i) {',
    '            if (delta[i] > 0) {',
    '                sumPositiveDelta += delta[i];',
    '                addEdge(SS, i, delta[i]);',
    '            } else if (delta[i] < 0) {',
    '                addEdge(i, TT, -delta[i]);',
    '            }',
    '        }',
    '    }',
    '    ',
    '    void addEdge(int u, int v, int cap) {',
    '        int idxU = adj[u].size();',
    '        int idxV = adj[v].size();',
    '        adj[u].push_back({v, cap, 0, 0, idxV});',
    '        adj[v].push_back({u, 0, 0, 0, idxU});',
    '    }',
    '    ',
    '    bool bfs() {',
    '        fill(level.begin(), level.end(), -1);',
    '        queue<int> q;',
    '        q.push(SS);',
    '        level[SS] = 0;',
    '        while (!q.empty()) {',
    '            int u = q.front(); q.pop();',
    '            for (const auto& e : adj[u]) {',
    '                if (e.cap > e.flow && level[e.to] == -1) {',
    '                    level[e.to] = level[u] + 1;',
    '                    q.push(e.to);',
    '                }',
    '            }',
    '        }',
    '        return level[TT] != -1;',
    '    }',
    '    ',
    '    int dfs(int u, int pushed) {',
    '        if (u == TT || pushed == 0) return pushed;',
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
    '    bool hasFeasibleFlow() {',
    '        buildSuperSourceSink();',
    '        int maxFlow = 0;',
    '        while (bfs()) {',
    '            fill(cur.begin(), cur.end(), 0);',
    '            while (int pushed = dfs(SS, 1e9)) maxFlow += pushed;',
    '        }',
    '        // 当且仅当伴随网络最大流满流时，原图存在可行流',
    '        return maxFlow == sumPositiveDelta;',
    '    }',
    '};',
  ],
  java: [
    'package advanced_flow;',
    '',
    'import java.util.*;',
    '',
    '// 上下界网络流标准实现 - 差额网络与超级源汇满流判定',
    'public class Code01_BoundedFlow {',
    '    public static int n, SS, TT, sumPositiveDelta;',
    '    public static List<Edge>[] adj;',
    '    public static int[] delta, level, cur;',
    '}',
  ],
  python: [
    'class BoundedFlow:',
    '    def __init__(self, n: int):',
    '        self.n = n',
    '        self.ss = n + 1',
    '        self.tt = n + 2',
    '        self.adj = [[] for _ in range(n + 3)]',
    '        self.delta = [0] * (n + 1)',
    '        self.sum_positive_delta = 0',
  ],
  javascript: [
    '// 上下界网络流 (JavaScript 版)',
    'class BoundedFlow {',
    '  constructor(n) {',
    '    this.n = n;',
    '    this.SS = n + 1;',
    '    this.TT = n + 2;',
    '    this.adj = Array.from({ length: n + 3 }, () => []);',
    '    this.delta = Array(n + 1).fill(0);',
    '    this.sumPositiveDelta = 0;',
    '  }',
    '}',
  ],
};

export const BOUNDED_FLOW_PROBLEM_HTML = `
  <div style="font-size: 13px; line-height: 1.6; color: #334155;">
    <h3 style="margin-top: 0; color: #0f172a; font-size: 15px; font-weight: 800;">🌊 上下界网络流 (Bounded Flow)</h3>
    <p>
      在许多现实调度中（如列车时刻表、工作班次编排），网络中每条边 $e$ 的流量不仅有容量上限 $up(e)$，还存在必须满足的<b>最低流量下界 $low(e)$</b>，即 $low(e) \\le flow(e) \\le up(e)$（LOJ 115 / 洛谷 P5192）。
    </p>

    <div style="background: #f8fafc; border-left: 4px solid #3b82f6; padding: 8px 12px; margin: 10px 0; border-radius: 0 6px 6px 0;">
      <div style="font-weight: 700; color: #1e40af; margin-bottom: 4px;">⚖️ 差额网络平衡定理</div>
      <div style="font-size: 11.5px; color: #334155;">
        1. 每条原边自由容量设为 $up(e) - low(e)$；<br/>
        2. 节点差额 $\\Delta(u) = \\sum \\text{必须入流} - \\sum \\text{必须出流}$；<br/>
        3. 若 $\\Delta(u) > 0$，从超级源点 $SS$ 向 $u$ 连容量为 $\\Delta(u)$ 的补偿边；若 $\\Delta(u) < 0$，从 $u$ 向超级汇点 $TT$ 连容量为 $-\\Delta(u)$ 的补偿边。
      </div>
    </div>
  </div>
`;

export const BOUNDED_FLOW_ANALYSIS_HTML = `
  <div style="font-size: 13px; line-height: 1.6; color: #334155;">
    <h3 style="margin-top: 0; color: #0f172a; font-size: 15px; font-weight: 800;">💡 可行流充要判定与流量还原</h3>

    <div style="background: #eff6ff; border: 1px solid #bfdbfe; border-radius: 6px; padding: 10px; margin-bottom: 12px;">
      <div style="font-weight: 700; color: #1e3a8a; margin-bottom: 4px;">1. 伴随网络满流判定</div>
      <div style="font-size: 12px; color: #1e40af;">
        在伴随网络上运行 Dinic 求 $SS \\to TT$ 的最大流。<b>当且仅当所有 $SS$ 发出的边均满流</b>（即 $\\text{MaxFlow} = \\sum_{\\Delta > 0} \\Delta$）时，原图存在合法可行流！
      </div>
    </div>

    <div style="background: #f0fdf4; border: 1px solid #bbf7d0; border-radius: 6px; padding: 10px;">
      <div style="font-weight: 700; color: #166534; margin-bottom: 4px;">2. 原图真实流量精确还原</div>
      <div style="font-size: 12px; color: #15803d;">
        原图中每条边的最终真实流量为：$\\text{TrueFlow}(e) = low(e) + \\text{伴随网络中自由边流过的流量}$，自动满足流量守恒与上下界约束！
      </div>
    </div>
  </div>
`;
