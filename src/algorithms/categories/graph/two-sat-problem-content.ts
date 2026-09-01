/**
 * 2-SAT 问题与 Tarjan 强连通分量判定 (2-Satisfiability Problem)
 * 参考左程云《算法通关课》Class 078: 逻辑蕴涵建图 (~u -> v, ~v -> u)、Tarjan SCC 缩点、矛盾检测与拓扑序逆序赋值 (洛谷 P4782)
 */

export const TWO_SAT_CODE_LANGUAGES: Record<string, string[]> = {
  cpp: [
    '#include <iostream>',
    '#include <vector>',
    '#include <stack>',
    '#include <algorithm>',
    'using namespace std;',
    '',
    '// 2-SAT 问题 (洛谷 P4782 / 左程云 Class 078)',
    '// 核心：子句 (u or v) 转化为蕴涵边 (~u -> v, ~v -> u)，Tarjan SCC 判环与拓扑序构造',
    'class TwoSAT {',
    'public:',
    '    int n, dfnCnt = 0, sccCnt = 0;',
    '    vector<vector<int>> adj;',
    '    vector<int> dfn, low, scc;',
    '    vector<bool> inStack;',
    '    stack<int> st;',
    '    ',
    '    // 节点映射：x_i 为真 -> 2*i - 1, x_i 为假 -> 2*i',
    '    TwoSAT(int n) : n(n), adj(2 * n + 1), dfn(2 * n + 1, 0),',
    '                    low(2 * n + 1, 0), scc(2 * n + 1, 0), inStack(2 * n + 1, false) {}',
    '    ',
    '    // 添加子句 (u isTrueVal1) OR (v isTrueVal2)',
    '    void addClause(int u, int valU, int v, int valV) {',
    '        int nodeU = valU ? 2 * u - 1 : 2 * u;',
    '        int notU  = valU ? 2 * u : 2 * u - 1;',
    '        int nodeV = valV ? 2 * v - 1 : 2 * v;',
    '        int notV  = valV ? 2 * v : 2 * v - 1;',
    '        ',
    '        adj[notU].push_back(nodeV); // ~u -> v',
    '        adj[notV].push_back(nodeU); // ~v -> u',
    '    }',
    '    ',
    '    void tarjan(int u) {',
    '        dfn[u] = low[u] = ++dfnCnt;',
    '        st.push(u);',
    '        inStack[u] = true;',
    '        ',
    '        for (int v : adj[u]) {',
    '            if (!dfn[v]) {',
    '                tarjan(v);',
    '                low[u] = min(low[u], low[v]);',
    '            } else if (inStack[v]) {',
    '                low[u] = min(low[u], dfn[v]);',
    '            }',
    '        }',
    '        ',
    '        if (dfn[u] == low[u]) {',
    '            sccCnt++;',
    '            while (true) {',
    '                int top = st.top(); st.pop();',
    '                inStack[top] = false;',
    '                scc[top] = sccCnt;',
    '                if (top == u) break;',
    '            }',
    '        }',
    '    }',
    '    ',
    '    bool solve(vector<int>& assignment) {',
    '        for (int i = 1; i <= 2 * n; ++i) {',
    '            if (!dfn[i]) tarjan(i);',
    '        }',
    '        ',
    '        assignment.resize(n + 1);',
    '        for (int i = 1; i <= n; ++i) {',
    '            int trueNode = 2 * i - 1;',
    '            int falseNode = 2 * i;',
    '            if (scc[trueNode] == scc[falseNode]) return false; // 矛盾无解',
    '            // scc 编号越小，拓扑序越靠后，优先取真',
    '            assignment[i] = scc[trueNode] < scc[falseNode] ? 1 : 0;',
    '        }',
    '        return true;',
    '    }',
    '};',
  ],
  java: [
    'package class078;',
    '',
    'import java.util.*;',
    '',
    '// 2-SAT 标准实现 - 左程云 Class 078',
    'public class Code01_TwoSAT {',
    '    public static int n, dfnCnt = 0, sccCnt = 0;',
    '    public static List<Integer>[] adj;',
    '    public static int[] dfn, low, scc;',
    '    public static boolean[] inStack;',
    '    public static Deque<Integer> st = new ArrayDeque<>();',
    '    ',
    '    public static void tarjan(int u) {',
    '        dfn[u] = low[u] = ++dfnCnt;',
    '        st.push(u);',
    '        inStack[u] = true;',
    '        for (int v : adj[u]) {',
    '            if (dfn[v] == 0) {',
    '                tarjan(v);',
    '                low[u] = Math.min(low[u], low[v]);',
    '            } else if (inStack[v]) {',
    '                low[u] = Math.min(low[u], dfn[v]);',
    '            }',
    '        }',
    '        if (dfn[u] == low[u]) {',
    '            sccCnt++;',
    '            while (true) {',
    '                int top = st.pop();',
    '                inStack[top] = false;',
    '                scc[top] = sccCnt;',
    '                if (top == u) break;',
    '            }',
    '        }',
    '    }',
    '}',
  ],
  python: [
    'class TwoSAT:',
    '    def __init__(self, n: int):',
    '        self.n = n',
    '        self.adj = [[] for _ in range(2 * n + 1)]',
    '        self.dfn = [0] * (2 * n + 1)',
    '        self.low = [0] * (2 * n + 1)',
    '        self.scc = [0] * (2 * n + 1)',
    '        self.in_stack = [False] * (2 * n + 1)',
    '        self.st = []',
    '        self.timer = 0',
    '        self.scc_cnt = 0',
    '        ',
    '    def add_clause(self, u: int, val_u: int, v: int, val_v: int):',
    '        node_u = 2 * u - 1 if val_u else 2 * u',
    '        not_u  = 2 * u if val_u else 2 * u - 1',
    '        node_v = 2 * v - 1 if val_v else 2 * v',
    '        not_v  = 2 * v if val_v else 2 * v - 1',
    '        self.adj[not_u].append(node_v)',
    '        self.adj[not_v].append(node_u)',
  ],
  javascript: [
    '// 2-SAT 问题 (JavaScript 版)',
    'class TwoSAT {',
    '  constructor(n) {',
    '    this.n = n;',
    '    this.adj = Array.from({ length: 2 * n + 1 }, () => []);',
    '    this.dfn = Array(2 * n + 1).fill(0);',
    '    this.low = Array(2 * n + 1).fill(0);',
    '    this.scc = Array(2 * n + 1).fill(0);',
    '    this.inStack = Array(2 * n + 1).fill(false);',
    '    this.stack = [];',
    '    this.dfnCnt = 0;',
    '    this.sccCnt = 0;',
    '  }',
    '  ',
    '  addClause(u, valU, v, valV) {',
    '    const nodeU = valU ? 2 * u - 1 : 2 * u;',
    '    const notU  = valU ? 2 * u : 2 * u - 1;',
    '    const nodeV = valV ? 2 * v - 1 : 2 * v;',
    '    const notV  = valV ? 2 * v : 2 * v - 1;',
    '    this.adj[notU].push(nodeV);',
    '    this.adj[notV].push(nodeU);',
    '  }',
    '}',
  ],
};

export const TWO_SAT_PROBLEM_HTML = `
  <div style="font-size: 13px; line-height: 1.6; color: #334155;">
    <h3 style="margin-top: 0; color: #0f172a; font-size: 15px; font-weight: 800;">⚖️ 2-SAT 问题 (2-Satisfiability)</h3>
    <p>
      给定 $n$ 个布尔变量 $x_1, \\dots, x_n$ 和 $m$ 个由两个文字构成的析取子句（如 $(x_1 \\lor \\neg x_2)$）。求是否存在一组真值指派使得所有子句同时为真（洛谷 P4782）。
    </p>
    <p>
      <b>逻辑蕴涵图转化 (Implication Graph)</b>：
    </p>
    <ul>
      <li>$(u \\lor v)$ 恒等变形为两个逻辑推导：$\\neg u \\implies v$ 与 $\\neg v \\implies u$。</li>
      <li>每个变量拆为两个状态节点：$x_i$ 与 $\\neg x_i$。</li>
    </ul>

    <div style="background: #f8fafc; border-left: 4px solid #3b82f6; padding: 8px 12px; margin: 10px 0; border-radius: 0 6px 6px 0;">
      <div style="font-weight: 700; color: #1e40af; margin-bottom: 4px;">🔍 Tarjan 矛盾判定准则</div>
      <div style="font-size: 11.5px; color: #334155;">
        若存在某个变量 $i$ 使得 $x_i$ 与 $\\neg x_i$ 属于同一强连通分量（$scc[x_i] == scc[\\neg x_i]$），则必然推出自相矛盾，<b>无解</b>！否则必有解，且拓扑序逆序（$scc$ 编号更小）的节点为真！
      </div>
    </div>
  </div>
`;

export const TWO_SAT_ANALYSIS_HTML = `
  <div style="font-size: 13px; line-height: 1.6; color: #334155;">
    <h3 style="margin-top: 0; color: #0f172a; font-size: 15px; font-weight: 800;">💡 左程云 2-SAT 算法拓扑序与赋值原理</h3>

    <div style="background: #eff6ff; border: 1px solid #bfdbfe; border-radius: 6px; padding: 10px; margin-bottom: 12px;">
      <div style="font-weight: 700; color: #1e3a8a; margin-bottom: 4px;">1. 为什么 scc 编号小者为真？</div>
      <div style="font-size: 12px; color: #1e40af;">
        Tarjan 算法生成的强连通分量编号是<b>逆拓扑序</b>（越早完成 DFS 的分量编号越小，在 DAG 中处于更下游）。根据蕴涵推导逻辑：下游为真绝不会推导向上游造成假，因此 $scc[x_i] < scc[\\neg x_i]$ 时选 $x_i = 1$ 绝对安全！
      </div>
    </div>

    <div style="background: #f0fdf4; border: 1px solid #bbf7d0; border-radius: 6px; padding: 10px;">
      <div style="font-weight: 700; color: #166534; margin-bottom: 4px;">2. NP-Complete 边界线</div>
      <div style="font-size: 12px; color: #15803d;">
        3-SAT 问题是经典的 NP-完全问题；而 2-SAT 通过蕴涵图强连通分量转化，可在严格 $O(V + E)$ 线性时间内完美求出解或证明无解！
      </div>
    </div>
  </div>
`;
