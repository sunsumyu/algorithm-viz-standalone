/**
 * DAG 支配树与编译控制流分析 (Dominator Tree on DAG)
 * 进阶图论: 控制流图支配关系 (idom)、DAG 前驱节点支配树 LCA 定理、增量倍增构建 (洛谷 P5180)
 */

export const DOMINATOR_TREE_CODE_LANGUAGES: Record<string, string[]> = {
  cpp: [
    '#include <iostream>',
    '#include <vector>',
    '#include <queue>',
    '#include <algorithm>',
    'using namespace std;',
    '',
    '// DAG 支配树构建 (洛谷 P5180 / 编译原理 SSA 形式)',
    '// 核心：拓扑排序 + 前驱节点在支配树上的 LCA 定理：idom[u] = LCA_tree(pred[1], pred[2]...)',
    'class DAGDominatorTree {',
    'public:',
    '    int n, root, maxDepth = 18;',
    '    vector<vector<int>> adj, revAdj, domTreeAdj;',
    '    vector<int> inDegree, topoOrder, depth, idom;',
    '    vector<vector<int>> up;',
    '    ',
    '    DAGDominatorTree(int n, int root = 1) : n(n), root(root), adj(n + 1),',
    '                                            revAdj(n + 1), domTreeAdj(n + 1),',
    '                                            inDegree(n + 1, 0), depth(n + 1, 0),',
    '                                            idom(n + 1, 0), up(n + 1, vector<int>(19, 0)) {}',
    '    ',
    '    void addEdge(int u, int v) {',
    '        adj[u].push_back(v);',
    '        revAdj[v].push_back(u);',
    '        inDegree[v]++;',
    '    }',
    '    ',
    '    int getLCA(int u, int v) {',
    '        if (depth[u] < depth[v]) swap(u, v);',
    '        for (int i = maxDepth; i >= 0; --i) {',
    '            if (depth[u] - (1 << i) >= depth[v]) u = up[u][i];',
    '        }',
    '        if (u == v) return u;',
    '        for (int i = maxDepth; i >= 0; --i) {',
    '            if (up[u][i] != up[v][i]) {',
    '                u = up[u][i];',
    '                v = up[v][i];',
    '            }',
    '        }',
    '        return up[u][0];',
    '    }',
    '    ',
    '    void buildDominatorTree() {',
    '        queue<int> q;',
    '        q.push(root);',
    '        depth[root] = 1;',
    '        ',
    '        while (!q.empty()) {',
    '            int u = q.front(); q.pop();',
    '            topoOrder.push_back(u);',
    '            ',
    '            if (u != root) {',
    '                // idom[u] = 所有前驱节点在支配树上的 LCA',
    '                int pLCA = revAdj[u][0];',
    '                for (size_t i = 1; i < revAdj[u].size(); ++i) {',
    '                    pLCA = getLCA(pLCA, revAdj[u][i]);',
    '                }',
    '                idom[u] = pLCA;',
    '                domTreeAdj[pLCA].push_back(u);',
    '                depth[u] = depth[pLCA] + 1;',
    '                up[u][0] = pLCA;',
    '                for (int i = 1; i <= maxDepth; ++i) up[u][i] = up[up[u][i - 1]][i - 1];',
    '            }',
    '            ',
    '            for (int v : adj[u]) {',
    '                if (--inDegree[v] == 0) q.push(v);',
    '            }',
    '        }',
    '    }',
    '};',
  ],
  java: [
    'package advanced_graph;',
    '',
    'import java.util.*;',
    '',
    '// DAG 支配树标准实现 - 拓扑排序与 LCA 增量构建',
    'public class Code01_DAGDominatorTree {',
    '    public static int n, root = 1;',
    '    public static List<Integer>[] adj, revAdj, domTree;',
    '    public static int[] inDegree, depth, idom;',
    '    public static int[][] up;',
    '}',
  ],
  python: [
    'class DAGDominatorTree:',
    '    def __init__(self, n: int, root: int = 1):',
    '        self.n = n',
    '        self.root = root',
    '        self.adj = [[] for _ in range(n + 1)]',
    '        self.rev_adj = [[] for _ in range(n + 1)]',
    '        self.in_degree = [0] * (n + 1)',
    '        self.depth = [0] * (n + 1)',
    '        self.idom = [0] * (n + 1)',
    '        self.up = [[0] * 20 for _ in range(n + 1)]',
  ],
  javascript: [
    '// DAG 支配树 (JavaScript 版)',
    'class DAGDominatorTree {',
    '  constructor(n, root = 1) {',
    '    this.n = n;',
    '    this.root = root;',
    '    this.adj = Array.from({ length: n + 1 }, () => []);',
    '    this.revAdj = Array.from({ length: n + 1 }, () => []);',
    '    this.inDegree = Array(n + 1).fill(0);',
    '    this.depth = Array(n + 1).fill(0);',
    '    this.idom = Array(n + 1).fill(0);',
    '    this.up = Array.from({ length: n + 1 }, () => Array(20).fill(0));',
    '  }',
    '}',
  ],
};

export const DOMINATOR_TREE_PROBLEM_HTML = `
  <div style="font-size: 13px; line-height: 1.6; color: #334155;">
    <h3 style="margin-top: 0; color: #0f172a; font-size: 15px; font-weight: 800;">🏛️ 支配树 (Dominator Tree)</h3>
    <p>
      在有向流图 $G=(V, E, r)$ 中，若从源点 $r$ 到点 $w$ 的<b>每一条路径</b>都必须经过点 $d$，则称 $d$ <b>支配</b> $w$。每个点离它最近的严格支配者称为<b>直接支配点 (idom)</b>，所有直接支配边构成一棵以源点为根的<b>支配树</b>（洛谷 P5180 / 编译原理 SSA 支配边界）。
    </p>

    <div style="background: #f8fafc; border-left: 4px solid #3b82f6; padding: 8px 12px; margin: 10px 0; border-radius: 0 6px 6px 0;">
      <div style="font-weight: 700; color: #1e40af; margin-bottom: 4px;">📐 DAG 支配树 LCA 定理</div>
      <div style="font-size: 11.5px; color: #334155;">
        在 DAG 上，节点 $u$ 的直接支配点等于其<b>所有直接前驱节点在支配树上的最近公共祖先</b>：<br/>
        $\\text{idom}[u] = \\text{LCA}_{\\text{DomTree}}(\\text{pred}_1, \\text{pred}_2, \\dots, \\text{pred}_k)$
      </div>
    </div>
  </div>
`;

export const DOMINATOR_TREE_ANALYSIS_HTML = `
  <div style="font-size: 13px; line-height: 1.6; color: #334155;">
    <h3 style="margin-top: 0; color: #0f172a; font-size: 15px; font-weight: 800;">💡 支配树在工业界的核心应用</h3>

    <div style="background: #eff6ff; border: 1px solid #bfdbfe; border-radius: 6px; padding: 10px; margin-bottom: 12px;">
      <div style="font-weight: 700; color: #1e3a8a; margin-bottom: 4px;">1. 编译器底层优化 (LLVM / GCC)</div>
      <div style="font-size: 12px; color: #1e40af;">
        支配树是编译器构建<b>静态单赋值形式 (SSA Form)</b>、插入 $\\phi$ 函数（支配边界 Dominance Frontier）、循环不变代码外提 (LICM) 与死代码消除的基础基石！
      </div>
    </div>

    <div style="background: #f0fdf4; border: 1px solid #bbf7d0; border-radius: 6px; padding: 10px;">
      <div style="font-weight: 700; color: #166534; margin-bottom: 4px;">2. 关键节点与网络咽喉评估</div>
      <div style="font-size: 12px; color: #15803d;">
        在支配树中，节点 $u$ 的子树大小即为：如果 $u$ 故障瘫痪，网络中将有多少个节点彻底失去与根节点的连通性！
      </div>
    </div>
  </div>
`;
