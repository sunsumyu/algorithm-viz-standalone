/**
 * 圆方树与点双连通分量 (Block-Cut Tree / Cactus Graph)
 * 进阶图论: Tarjan 求点双连通分量 (v-BCC)、新建方点构建圆方二分树、所有简单路径并集转化 (洛谷 P4320 / P5236)
 */

export const BLOCK_CUT_TREE_CODE_LANGUAGES: Record<string, string[]> = {
  cpp: [
    '#include <iostream>',
    '#include <vector>',
    '#include <stack>',
    '#include <algorithm>',
    'using namespace std;',
    '',
    '// 圆方树构建 (Block-Cut Tree - 洛谷 P4320 / P5236)',
    '// 核心：Tarjan 求点双连通分量 (v-BCC)，每个点双建一个方点，原图点为圆点，连边成树',
    'class BlockCutTree {',
    'public:',
    '    int n, dfnCnt = 0, squareNodeCnt = 0;',
    '    vector<vector<int>> origAdj;  // 原图邻接表',
    '    vector<vector<int>> treeAdj;  // 圆方树邻接表',
    '    vector<int> dfn, low;',
    '    stack<int> st;',
    '    ',
    '    BlockCutTree(int n) : n(n), origAdj(n + 1), treeAdj(2 * n + 1),',
    '                          dfn(n + 1, 0), low(n + 1, 0), squareNodeCnt(n) {}',
    '    ',
    '    void addOrigEdge(int u, int v) {',
    '        origAdj[u].push_back(v);',
    '        origAdj[v].push_back(u);',
    '    }',
    '    ',
    '    void addTreeEdge(int roundNode, int squareNode) {',
    '        treeAdj[roundNode].push_back(squareNode);',
    '        treeAdj[squareNode].push_back(roundNode);',
    '    }',
    '    ',
    '    void tarjan(int u) {',
    '        dfn[u] = low[u] = ++dfnCnt;',
    '        st.push(u);',
    '        ',
    '        for (int v : origAdj[u]) {',
    '            if (!dfn[v]) {',
    '                tarjan(v);',
    '                low[u] = min(low[u], low[v]);',
    '                if (low[v] >= dfn[u]) { // 发现以 u 为根的点双连通块',
    '                    int square = ++squareNodeCnt; // 新建方点',
    '                    while (true) {',
    '                        int top = st.top(); st.pop();',
    '                        addTreeEdge(top, square);',
    '                        if (top == v) break;',
    '                    }',
    '                    addTreeEdge(u, square); // 割点 u 也属于该点双',
    '                }',
    '            } else {',
    '                low[u] = min(low[u], dfn[v]);',
    '            }',
    '        }',
    '    }',
    '    ',
    '    void buildTree() {',
    '        for (int i = 1; i <= n; ++i) {',
    '            if (!dfn[i]) tarjan(i);',
    '        }',
    '    }',
    '};',
  ],
  java: [
    'package advanced_graph;',
    '',
    'import java.util.*;',
    '',
    '// 圆方树标准构建与点双缩点',
    'public class Code01_BlockCutTree {',
    '    public static int n, dfnCnt = 0, squareCnt;',
    '    public static List<Integer>[] origAdj, treeAdj;',
    '    public static int[] dfn, low;',
    '    public static Deque<Integer> st = new ArrayDeque<>();',
    '    ',
    '    public static void tarjan(int u) {',
    '        dfn[u] = low[u] = ++dfnCnt;',
    '        st.push(u);',
    '        for (int v : origAdj[u]) {',
    '            if (dfn[v] == 0) {',
    '                tarjan(v);',
    '                low[u] = Math.min(low[u], low[v]);',
    '                if (low[v] >= dfn[u]) {',
    '                    int square = ++squareCnt;',
    '                    while (true) {',
    '                        int top = st.pop();',
    '                        treeAdj[top].add(square);',
    '                        treeAdj[square].add(top);',
    '                        if (top == v) break;',
    '                    }',
    '                    treeAdj[u].add(square);',
    '                    treeAdj[square].add(u);',
    '                }',
    '            } else {',
    '                low[u] = Math.min(low[u], dfn[v]);',
    '            }',
    '        }',
    '    }',
    '}',
  ],
  python: [
    'class BlockCutTree:',
    '    def __init__(self, n: int):',
    '        self.n = n',
    '        self.orig_adj = [[] for _ in range(n + 1)]',
    '        self.tree_adj = [[] for _ in range(2 * n + 1)]',
    '        self.dfn = [0] * (n + 1)',
    '        self.low = [0] * (n + 1)',
    '        self.timer = 0',
    '        self.square_cnt = n',
    '        self.st = []',
    '        ',
    '    def add_orig_edge(self, u: int, v: int):',
    '        self.orig_adj[u].append(v)',
    '        self.orig_adj[v].append(u)',
    '        ',
    '    def tarjan(self, u: int):',
    '        self.timer += 1',
    '        self.dfn[u] = self.low[u] = self.timer',
    '        self.st.append(u)',
    '        for v in self.orig_adj[u]:',
    '            if not self.dfn[v]:',
    '                self.tarjan(v)',
    '                self.low[u] = min(self.low[u], self.low[v])',
    '                if self.low[v] >= self.dfn[u]:',
    '                    self.square_cnt += 1',
    '                    sq = self.square_cnt',
    '                    while True:',
    '                        top = self.st.pop()',
    '                        self.tree_adj[top].append(sq)',
    '                        self.tree_adj[sq].append(top)',
    '                        if top == v:',
    '                            break',
    '                    self.tree_adj[u].append(sq)',
    '                    self.tree_adj[sq].append(u)',
    '            else:',
    '                self.low[u] = min(self.low[u], self.dfn[v])',
  ],
  javascript: [
    '// 圆方树构建 (JavaScript 版)',
    'class BlockCutTree {',
    '  constructor(n) {',
    '    this.n = n;',
    '    this.origAdj = Array.from({ length: n + 1 }, () => []);',
    '    this.treeAdj = Array.from({ length: 2 * n + 1 }, () => []);',
    '    this.dfn = Array(n + 1).fill(0);',
    '    this.low = Array(n + 1).fill(0);',
    '    this.timer = 0;',
    '    this.squareCnt = n;',
    '    this.st = [];',
    '  }',
    '  ',
    '  addOrigEdge(u, v) {',
    '    this.origAdj[u].push(v);',
    '    this.origAdj[v].push(u);',
    '  }',
    '}',
  ],
};

export const BLOCK_CUT_TREE_PROBLEM_HTML = `
  <div style="font-size: 13px; line-height: 1.6; color: #334155;">
    <h3 style="margin-top: 0; color: #0f172a; font-size: 15px; font-weight: 800;">🌵 圆方树 (Block-Cut Tree)</h3>
    <p>
      无向图（尤其是仙人掌图）结构复杂，包含各种环与交织点。<b>圆方树</b>通过点双连通分量 (v-BCC) 缩点，将任意一般无向图转化为一棵优雅的树形结构（洛谷 P4320 道路相遇 / P5236 静态仙人掌）。
    </p>
    <p>
      <b>圆点与方点定义</b>：
    </p>
    <ul>
      <li><b>圆点 (Round Node ⚪)</b>：原图中的每一个普通节点；</li>
      <li><b>方点 (Square Node 🟩)</b>：每一个极大点双连通分量 (v-BCC) 对应一个方点；</li>
      <li><b>圆方连边</b>：每个点双连通块中的所有圆点，向该块对应的方点连一条无向边。</li>
    </ul>

    <div style="background: #f8fafc; border-left: 4px solid #3b82f6; padding: 8px 12px; margin: 10px 0; border-radius: 0 6px 6px 0;">
      <div style="font-weight: 700; color: #1e40af; margin-bottom: 4px;">✨ 神奇几何性质</div>
      <div style="font-size: 11.5px; color: #334155;">
        原图中两点 $u, v$ 之间<b>所有简单路径的并集</b>，恰好对应圆方树上从 $u$ 到 $v$ 树上路径经过的<b>所有圆点</b>！这使得两点间必经割点数量转化为树上路径长度！
      </div>
    </div>
  </div>
`;

export const BLOCK_CUT_TREE_ANALYSIS_HTML = `
  <div style="font-size: 13px; line-height: 1.6; color: #334155;">
    <h3 style="margin-top: 0; color: #0f172a; font-size: 15px; font-weight: 800;">💡 圆方树在竞赛与工程中的威力</h3>

    <div style="background: #eff6ff; border: 1px solid #bfdbfe; border-radius: 6px; padding: 10px; margin-bottom: 12px;">
      <div style="font-weight: 700; color: #1e3a8a; margin-bottom: 4px;">1. 仙人掌图与一般图降维打击</div>
      <div style="font-size: 12px; color: #1e40af;">
        仙人掌图上的动态规划、两点间必经点查询等困难问题，建立圆方树后直接蜕化为普通的<b>树链剖分</b>或 <b>LCA 树上倍增</b>问题，时间复杂度从 NP 难度直降至 $O(\log n)$！
      </div>
    </div>

    <div style="background: #f0fdf4; border: 1px solid #bbf7d0; border-radius: 6px; padding: 10px;">
      <div style="font-weight: 700; color: #166534; margin-bottom: 4px;">2. 严格的二分树结构</div>
      <div style="font-size: 12px; color: #15803d;">
        圆方树必定是一棵<b>二分图树</b>（圆点只能连方点，方点只能连圆点，绝不存在圆-圆或方-方连边），性质极其优美。
      </div>
    </div>
  </div>
`;
