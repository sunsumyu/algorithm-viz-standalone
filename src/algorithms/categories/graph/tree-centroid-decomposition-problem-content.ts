/**
 * 树上重心点分治 (Tree Centroid Decomposition)
 * 参考左程云《算法通关课》进阶图论: 树的重心定位、O(log n) 分治层数、跨重心路径双指针统计与容斥原理 (洛谷 P3806)
 */

export const TREE_CENTROID_CODE_LANGUAGES: Record<string, string[]> = {
  cpp: [
    '#include <iostream>',
    '#include <vector>',
    '#include <algorithm>',
    'using namespace std;',
    '',
    '// 树上点分治 (洛谷 P3806 / 左程云进阶图论)',
    '// 核心：寻找树的重心保证分治层数 O(log n)，按重心统计跨子树路径并容斥去重',
    'class CentroidDecomposition {',
    'public:',
    '    struct Edge { int to, w; };',
    '    int n, root, maxPart, totalNodes;',
    '    vector<vector<Edge>> adj;',
    '    vector<int> sz, maxSubtree;',
    '    vector<bool> vis;',
    '    vector<int> dists;',
    '    ',
    '    CentroidDecomposition(int n) : n(n), adj(n + 1), sz(n + 1),',
    '                                  maxSubtree(n + 1), vis(n + 1, false) {}',
    '    ',
    '    void addEdge(int u, int v, int w) {',
    '        adj[u].push_back({v, w});',
    '        adj[v].push_back({u, w});',
    '    }',
    '    ',
    '    // 1. 寻找当前连通块的重心 (使得最大子树节点数 <= totalNodes / 2)',
    '    void getCentroid(int u, int p) {',
    '        sz[u] = 1;',
    '        maxSubtree[u] = 0;',
    '        for (auto& edge : adj[u]) {',
    '            int v = edge.to;',
    '            if (v != p && !vis[v]) {',
    '                getCentroid(v, u);',
    '                sz[u] += sz[v];',
    '                maxSubtree[u] = max(maxSubtree[u], sz[v]);',
    '            }',
    '        }',
    '        maxSubtree[u] = max(maxSubtree[u], totalNodes - sz[u]);',
    '        if (maxSubtree[u] < maxPart) {',
    '            maxPart = maxSubtree[u];',
    '            root = u;',
    '        }',
    '    }',
    '    ',
    '    // 2. 收集子树节点到重心的距离',
    '    void getDists(int u, int p, int d) {',
    '        dists.push_back(d);',
    '        for (auto& edge : adj[u]) {',
    '            int v = edge.to;',
    '            if (v != p && !vis[v]) {',
    '                getDists(v, u, d + edge.w);',
    '            }',
    '        }',
    '    }',
    '    ',
    '    // 3. 点分治递归主逻辑',
    '    void solve(int u) {',
    '        vis[u] = true; // 隔离当前重心',
    '        // 统计跨重心路径 (容斥去重)...',
    '        for (auto& edge : adj[u]) {',
    '            int v = edge.to;',
    '            if (!vis[v]) {',
    '                maxPart = 1e9;',
    '                totalNodes = sz[v];',
    '                getCentroid(v, 0);',
    '                solve(root); // 递归分治下一层重心',
    '            }',
    '        }',
    '    }',
    '};',
  ],
  java: [
    'package class075;',
    '',
    'import java.util.*;',
    '',
    '// 点分治 - 左程云进阶图论标准模板',
    'public class Code01_CentroidDecomposition {',
    '    public static int n, root, maxPart, totalNodes;',
    '    public static List<int[]>[] adj;',
    '    public static int[] sz, maxSubtree;',
    '    public static boolean[] vis;',
    '    ',
    '    public static void getCentroid(int u, int p) {',
    '        sz[u] = 1;',
    '        maxSubtree[u] = 0;',
    '        for (int[] edge : adj[u]) {',
    '            int v = edge[0];',
    '            if (v != p && !vis[v]) {',
    '                getCentroid(v, u);',
    '                sz[u] += sz[v];',
    '                maxSubtree[u] = Math.max(maxSubtree[u], sz[v]);',
    '            }',
    '        }',
    '        maxSubtree[u] = Math.max(maxSubtree[u], totalNodes - sz[u]);',
    '        if (maxSubtree[u] < maxPart) {',
    '            maxPart = maxSubtree[u];',
    '            root = u;',
    '        }',
    '    }',
    '}',
  ],
  python: [
    'class CentroidDecomposition:',
    '    def __init__(self, n: int):',
    '        self.n = n',
    '        self.adj = [[] for _ in range(n + 1)]',
    '        self.sz = [0] * (n + 1)',
    '        self.max_subtree = [0] * (n + 1)',
    '        self.vis = [False] * (n + 1)',
    '        self.root = 0',
    '        self.max_part = float("inf")',
    '        self.total_nodes = n',
    '        ',
    '    def get_centroid(self, u: int, p: int):',
    '        self.sz[u] = 1',
    '        self.max_subtree[u] = 0',
    '        for v, w in self.adj[u]:',
    '            if v != p and not self.vis[v]:',
    '                self.get_centroid(v, u)',
    '                self.sz[u] += self.sz[v]',
    '                self.max_subtree[u] = max(self.max_subtree[u], self.sz[v])',
    '        self.max_subtree[u] = max(self.max_subtree[u], self.total_nodes - self.sz[u])',
    '        if self.max_subtree[u] < self.max_part:',
    '            self.max_part = self.max_subtree[u]',
    '            self.root = u',
  ],
  javascript: [
    '// 树上点分治 (JavaScript 版)',
    'class CentroidDecomposition {',
    '  constructor(n) {',
    '    this.n = n;',
    '    this.adj = Array.from({ length: n + 1 }, () => []);',
    '    this.sz = Array(n + 1).fill(0);',
    '    this.maxSubtree = Array(n + 1).fill(0);',
    '    this.vis = Array(n + 1).fill(false);',
    '    this.root = 0;',
    '    this.maxPart = Infinity;',
    '    this.totalNodes = n;',
    '  }',
    '  ',
    '  getCentroid(u, p) {',
    '    this.sz[u] = 1;',
    '    this.maxSubtree[u] = 0;',
    '    for (const [v, w] of this.adj[u]) {',
    '      if (v !== p && !this.vis[v]) {',
    '        this.getCentroid(v, u);',
    '        this.sz[u] += this.sz[v];',
    '        this.maxSubtree[u] = Math.max(this.maxSubtree[u], this.sz[v]);',
    '      }',
    '    }',
    '    this.maxSubtree[u] = Math.max(this.maxSubtree[u], this.totalNodes - this.sz[u]);',
    '    if (this.maxSubtree[u] < this.maxPart) {',
    '      this.maxPart = this.maxSubtree[u];',
    '      this.root = u;',
    '    }',
    '  }',
    '}',
  ],
};

export const TREE_CENTROID_PROBLEM_HTML = `
  <div style="font-size: 13px; line-height: 1.6; color: #334155;">
    <h3 style="margin-top: 0; color: #0f172a; font-size: 15px; font-weight: 800;">👑 树上重心点分治 (Centroid Decomposition)</h3>
    <p>
      给定一棵包含 $n$ 个节点的带权无根树，求满足特定条件（如路径长度 $\le K$）的<b>无向点对路径数量</b>（洛谷 P3806）。
    </p>
    <p>
      点分治将树上路径划分为两类：
    </p>
    <ul>
      <li><b>经过当前根节点的路径</b>：由两条从根出发到不同子树的简单链拼接而成。</li>
      <li><b>不经过当前根节点的路径</b>：完全包含在某一棵子树内部，递归点分治求解。</li>
    </ul>

    <div style="background: #f8fafc; border-left: 4px solid #3b82f6; padding: 8px 12px; margin: 10px 0; border-radius: 0 6px 6px 0;">
      <div style="font-weight: 700; color: #1e40af; margin-bottom: 4px;">👑 树的重心性质</div>
      <div style="font-size: 11.5px; color: #334155;">
        删除重心后，分裂出的最大子树节点数不超过全树的 $n/2$。每次以重心为根分治，保证递归树深度严格为 $O(\\log n)$，整体时间复杂度降至 $O(n \\log n)$！
      </div>
    </div>
  </div>
`;

export const TREE_CENTROID_ANALYSIS_HTML = `
  <div style="font-size: 13px; line-height: 1.6; color: #334155;">
    <h3 style="margin-top: 0; color: #0f172a; font-size: 15px; font-weight: 800;">💡 左程云点分治容斥原理与复杂度分析</h3>

    <div style="background: #eff6ff; border: 1px solid #bfdbfe; border-radius: 6px; padding: 10px; margin-bottom: 12px;">
      <div style="font-weight: 700; color: #1e3a8a; margin-bottom: 4px;">1. 双指针与容斥去重</div>
      <div style="font-size: 12px; color: #1e40af;">
        将所有子树节点到重心的距离排序，用双指针统计和 $\le K$ 的点对数；然后对每个子树内部计算和 $\le K$ 的点对数并从总数中扣除（剔除来自同一子树的非法折返路径）。
      </div>
    </div>

    <div style="background: #f0fdf4; border: 1px solid #bbf7d0; border-radius: 6px; padding: 10px;">
      <div style="font-weight: 700; color: #166534; margin-bottom: 4px;">2. 隔离重心与递归子树</div>
      <div style="font-size: 12px; color: #15803d;">
        处理完当前重心的所有跨子树路径后，将重心标记为 <code>vis[root] = true</code> 隔离，并在各个未访问子树中重新寻找局部重心继续分治。
      </div>
    </div>
  </div>
`;
