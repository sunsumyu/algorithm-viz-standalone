/**
 * 树上差分与子树前缀和 (Tree Difference Array)
 * 进阶图论: 点差分 (diff[u]++, diff[v]++, diff[lca]--, diff[fa[lca]]--)、边差分 (diff[lca]-=2)、自底向上 DFS 前缀和 (洛谷 P3128 / P3258)
 */

export const TREE_DIFF_CODE_LANGUAGES: Record<string, string[]> = {
  cpp: [
    '#include <iostream>',
    '#include <vector>',
    '#include <algorithm>',
    'using namespace std;',
    '',
    '// 树上差分 (洛谷 P3128 [USACO15DEC] Max Flow P)',
    '// 核心：点差分与边差分标记，LCA 约束，自底向上 DFS 一次性汇总',
    'class TreeDifference {',
    'public:',
    '    int n, maxDepth;',
    '    vector<vector<int>> adj;',
    '    vector<vector<int>> up;',
    '    vector<int> depth, diff, val;',
    '    ',
    '    TreeDifference(int n) : n(n), maxDepth(20), adj(n + 1),',
    '                            up(n + 1, vector<int>(21, 0)), depth(n + 1, 0),',
    '                            diff(n + 1, 0), val(n + 1, 0) {}',
    '    ',
    '    void addEdge(int u, int v) {',
    '        adj[u].push_back(v);',
    '        adj[v].push_back(u);',
    '    }',
    '    ',
    '    void dfsLCA(int u, int p, int d) {',
    '        depth[u] = d;',
    '        up[u][0] = p;',
    '        for (int i = 1; i <= maxDepth; ++i) up[u][i] = up[up[u][i - 1]][i - 1];',
    '        for (int v : adj[u]) {',
    '            if (v != p) dfsLCA(v, u, d + 1);',
    '        }',
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
    '    // 点差分：路径 u -> v 上的所有点权值 +w',
    '    void addPathNode(int u, int v, int w = 1) {',
    '        int lca = getLCA(u, v);',
    '        diff[u] += w;',
    '        diff[v] += w;',
    '        diff[lca] -= w;',
    '        if (up[lca][0] > 0) diff[up[lca][0]] -= w;',
    '    }',
    '    ',
    '    // 边差分：路径 u -> v 上的所有边权值 +w',
    '    void addPathEdge(int u, int v, int w = 1) {',
    '        int lca = getLCA(u, v);',
    '        diff[u] += w;',
    '        diff[v] += w;',
    '        diff[lca] -= 2 * w;',
    '    }',
    '    ',
    '    // 自底向上前缀和汇总',
    '    void dfsSum(int u, int p) {',
    '        val[u] = diff[u];',
    '        for (int v : adj[u]) {',
    '            if (v != p) {',
    '                dfsSum(v, u);',
    '                val[u] += val[v];',
    '            }',
    '        }',
    '    }',
    '};',
  ],
  java: [
    'package advanced_tree;',
    '',
    'import java.util.*;',
    '',
    '// 树上差分标准实现 - 点差分与边差分',
    'public class Code01_TreeDifference {',
    '    public static int n;',
    '    public static List<Integer>[] adj;',
    '    public static int[][] up;',
    '    public static int[] depth, diff, val;',
    '    ',
    '    public static void addPathNode(int u, int v, int lca, int faLca) {',
    '        diff[u]++;',
    '        diff[v]++;',
    '        diff[lca]--;',
    '        if (faLca > 0) diff[faLca]--;',
    '    }',
    '    ',
    '    public static void dfsSum(int u, int p) {',
    '        val[u] = diff[u];',
    '        for (int v : adj[u]) {',
    '            if (v != p) {',
    '                dfsSum(v, u);',
    '                val[u] += val[v];',
    '            }',
    '        }',
    '    }',
    '}',
  ],
  python: [
    'class TreeDifference:',
    '    def __init__(self, n: int):',
    '        self.n = n',
    '        self.adj = [[] for _ in range(n + 1)]',
    '        self.diff = [0] * (n + 1)',
    '        self.val = [0] * (n + 1)',
    '        ',
    '    def add_path_node(self, u: int, v: int, lca: int, fa_lca: int, w: int = 1):',
    '        self.diff[u] += w',
    '        self.diff[v] += w',
    '        self.diff[lca] -= w',
    '        if fa_lca > 0:',
    '            self.diff[fa_lca] -= w',
    '            ',
    '    def dfs_sum(self, u: int, p: int):',
    '        self.val[u] = self.diff[u]',
    '        for v in self.adj[u]:',
    '            if v != p:',
    '                self.dfs_sum(v, u)',
    '                self.val[u] += self.val[v]',
  ],
  javascript: [
    '// 树上差分 (JavaScript 版)',
    'class TreeDifference {',
    '  constructor(n) {',
    '    this.n = n;',
    '    this.adj = Array.from({ length: n + 1 }, () => []);',
    '    this.diff = Array(n + 1).fill(0);',
    '    this.val = Array(n + 1).fill(0);',
    '  }',
    '  ',
    '  addPathNode(u, v, lca, faLca, w = 1) {',
    '    this.diff[u] += w;',
    '    this.diff[v] += w;',
    '    this.diff[lca] -= w;',
    '    if (faLca > 0) this.diff[faLca] -= w;',
    '  }',
    '}',
  ],
};

export const TREE_DIFF_PROBLEM_HTML = `
  <div style="font-size: 13px; line-height: 1.6; color: #334155;">
    <h3 style="margin-top: 0; color: #0f172a; font-size: 15px; font-weight: 800;">🌲 树上差分 (Tree Difference Array)</h3>
    <p>
      在树上进行多轮路径权值修改（如频繁将路径 $u \\to v$ 上所有点或所有边权值加 $1$）。传统暴力单次修改耗时 $O(n)$，而<b>树上差分</b>配合 LCA 可在 $O(1)$ 时间内打上差分标记，最后仅需一次自底向上的 DFS 子树前缀和即可在 $O(n)$ 内完成全树统计（洛谷 P3128 / P3258）。
    </p>

    <div style="background: #f8fafc; border-left: 4px solid #3b82f6; padding: 8px 12px; margin: 10px 0; border-radius: 0 6px 6px 0;">
      <div style="font-weight: 700; color: #1e40af; margin-bottom: 4px;">📐 点差分公式</div>
      <div style="font-size: 11.5px; color: #334155;">
        $\\text{diff}[u] += w, \\quad \\text{diff}[v] += w, \\quad \\text{diff}[\\text{lca}] -= w, \\quad \\text{diff}[\\text{fa}[\\text{lca}]] -= w$
      </div>
    </div>

    <div style="background: #f8fafc; border-left: 4px solid #10b981; padding: 8px 12px; margin: 10px 0; border-radius: 0 6px 6px 0;">
      <div style="font-weight: 700; color: #065f46; margin-bottom: 4px;">📏 边差分公式</div>
      <div style="font-size: 11.5px; color: #334155;">
        将边权下放给深度较深的子节点：$\\text{diff}[u] += w, \\quad \\text{diff}[v] += w, \\quad \\text{diff}[\\text{lca}] -= 2w$
      </div>
    </div>
  </div>
`;

export const TREE_DIFF_ANALYSIS_HTML = `
  <div style="font-size: 13px; line-height: 1.6; color: #334155;">
    <h3 style="margin-top: 0; color: #0f172a; font-size: 15px; font-weight: 800;">💡 树上差分原理与子树和推导</h3>

    <div style="background: #eff6ff; border: 1px solid #bfdbfe; border-radius: 6px; padding: 10px; margin-bottom: 12px;">
      <div style="font-weight: 700; color: #1e3a8a; margin-bottom: 4px;">1. 为什么不会扩散到根节点？</div>
      <div style="font-size: 12px; color: #1e40af;">
        当自底向上计算子树和 $val[x] = diff[x] + \\sum val[son]$ 时，$u$ 和 $v$ 向上汇聚到 $\\text{lca}$ 产生 $+2w$。减去 $\\text{lca}$ 处的 $-w$ 后，$\\text{lca}$ 节点实际值恰好为 $+w$；在 $\\text{fa}[\\text{lca}]$ 处再减去 $-w$，向上累加的净增加值彻底归零，完美约束在路径内！
      </div>
    </div>

    <div style="background: #f0fdf4; border: 1px solid #bbf7d0; border-radius: 6px; padding: 10px;">
      <div style="font-weight: 700; color: #166534; margin-bottom: 4px;">2. 与一维差分的对应关系</div>
      <div style="font-size: 12px; color: #15803d;">
        一维差分：$d[L] += w, d[R+1] -= w$。树上差分把区间的左右端点推广到树上的两个分支，以最近公共祖先 (LCA) 作为汇聚和截断点。
      </div>
    </div>
  </div>
`;
