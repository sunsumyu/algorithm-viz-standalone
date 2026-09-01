/**
 * 动态点分治与点分树 (Dynamic Centroid Decomposition / Centroid Tree)
 * 进阶树论: 重心递归分治建树、树高严格 O(log n)、点分树向上跳跃维护距离 (洛谷 P6329 / SPOJ QTREE5)
 */

export const CENTROID_TREE_CODE_LANGUAGES: Record<string, string[]> = {
  cpp: [
    '#include <iostream>',
    '#include <vector>',
    '#include <algorithm>',
    'using namespace std;',
    '',
    '// 动态点分树 (洛谷 P6329 【模板】点分树 / 震波)',
    '// 核心：重心连边成树，点分树高度 <= log2(n)，向上跳祖先 O(log n) 统计距离',
    'class CentroidTree {',
    'public:',
    '    int n, rootCentroid = 0;',
    '    vector<vector<int>> origAdj, ctreeAdj;',
    '    vector<int> sz, maxSubtree, parentCTree;',
    '    vector<bool> vis;',
    '    ',
    '    CentroidTree(int n) : n(n), origAdj(n + 1), ctreeAdj(n + 1),',
    '                          sz(n + 1, 0), maxSubtree(n + 1, 0),',
    '                          parentCTree(n + 1, 0), vis(n + 1, false) {}',
    '    ',
    '    void addEdge(int u, int v) {',
    '        origAdj[u].push_back(v);',
    '        origAdj[v].push_back(u);',
    '    }',
    '    ',
    '    // 1. 获取子树大小与最大子树',
    '    void getSubtreeSize(int u, int fa, int totalNodes, int& centroid) {',
    '        sz[u] = 1;',
    '        maxSubtree[u] = 0;',
    '        for (int v : origAdj[u]) {',
    '            if (v == fa || vis[v]) continue;',
    '            getSubtreeSize(v, u, totalNodes, centroid);',
    '            sz[u] += sz[v];',
    '            maxSubtree[u] = max(maxSubtree[u], sz[v]);',
    '        }',
    '        maxSubtree[u] = max(maxSubtree[u], totalNodes - sz[u]);',
    '        if (centroid == 0 || maxSubtree[u] < maxSubtree[centroid]) {',
    '            centroid = u;',
    '        }',
    '    }',
    '    ',
    '    // 2. 递归构建点分树',
    '    int buildCentroidTree(int u, int totalNodes) {',
    '        int centroid = 0;',
    '        getSubtreeSize(u, 0, totalNodes, centroid);',
    '        vis[centroid] = true;',
    '        ',
    '        for (int v : origAdj[centroid]) {',
    '            if (vis[v]) continue;',
    '            // 计算子树的真实大小',
    '            int nextTotal = (sz[v] > sz[centroid]) ? (totalNodes - sz[centroid]) : sz[v];',
    '            int childCentroid = buildCentroidTree(v, nextTotal);',
    '            ctreeAdj[centroid].push_back(childCentroid);',
    '            parentCTree[childCentroid] = centroid;',
    '        }',
    '        return centroid;',
    '    }',
    '    ',
    '    void init() {',
    '        rootCentroid = buildCentroidTree(1, n);',
    '    }',
    '};',
  ],
  java: [
    'package advanced_tree;',
    '',
    'import java.util.*;',
    '',
    '// 动态点分树标准实现 - 重心分治递归构建与 O(log n) 祖先跳跃',
    'public class Code01_CentroidTree {',
    '    public static int n, rootCentroid;',
    '    public static List<Integer>[] origAdj, ctreeAdj;',
    '    public static int[] sz, maxSubtree, parentCTree;',
    '    public static boolean[] vis;',
    '}',
  ],
  python: [
    'class CentroidTree:',
    '    def __init__(self, n: int):',
    '        self.n = n',
    '        self.orig_adj = [[] for _ in range(n + 1)]',
    '        self.ctree_adj = [[] for _ in range(n + 1)]',
    '        self.parent_ctree = [0] * (n + 1)',
    '        self.vis = [False] * (n + 1)',
  ],
  javascript: [
    '// 动态点分树 (JavaScript 版)',
    'class CentroidTree {',
    '  constructor(n) {',
    '    this.n = n;',
    '    this.origAdj = Array.from({ length: n + 1 }, () => []);',
    '    this.ctreeAdj = Array.from({ length: n + 1 }, () => []);',
    '    this.parentCTree = Array(n + 1).fill(0);',
    '    this.vis = Array(n + 1).fill(false);',
    '  }',
    '}',
  ],
};

export const CENTROID_TREE_PROBLEM_HTML = `
  <div style="font-size: 13px; line-height: 1.6; color: #334155;">
    <h3 style="margin-top: 0; color: #0f172a; font-size: 15px; font-weight: 800;">🌲 动态点分树 (Centroid Tree)</h3>
    <p>
      将树上重心点分治的递归过程保存下来：每层子树的重心连向下一层子树的重心，构建出的一棵全新树结构称为<b>点分树</b>（洛谷 P6329 【模板】点分树 / SPOJ QTREE5）。
    </p>

    <div style="background: #f8fafc; border-left: 4px solid #3b82f6; padding: 8px 12px; margin: 10px 0; border-radius: 0 6px 6px 0;">
      <div style="font-weight: 700; color: #1e40af; margin-bottom: 4px;">👑 核心高度上界定理</div>
      <div style="font-size: 11.5px; color: #334155;">
        无论原树形态如何严重退化（即使是单链 $O(n)$ 深度），<b>点分树的树高严格不超过 $\\lfloor \\log_2 n \\rfloor + 1$</b>！
      </div>
    </div>
  </div>
`;

export const CENTROID_TREE_ANALYSIS_HTML = `
  <div style="font-size: 13px; line-height: 1.6; color: #334155;">
    <h3 style="margin-top: 0; color: #0f172a; font-size: 15px; font-weight: 800;">💡 点分树如何支持动态修改与路径统计？</h3>

    <div style="background: #eff6ff; border: 1px solid #bfdbfe; border-radius: 6px; padding: 10px; margin-bottom: 12px;">
      <div style="font-weight: 700; color: #1e3a8a; margin-bottom: 4px;">1. 祖先路径全覆盖性质</div>
      <div style="font-size: 12px; color: #1e40af;">
        原树中任意两点 $u, v$ 的路径，必然恰好在点分树上它们的最近公共祖先 $\\text{LCA}_{\\text{CTree}}(u, v)$ 处被拆解和统计！
      </div>
    </div>

    <div style="background: #f0fdf4; border: 1px solid #bbf7d0; border-radius: 6px; padding: 10px;">
      <div style="font-weight: 700; color: #166534; margin-bottom: 4px;">2. O(log n) 向上跳跃修改</div>
      <div style="font-size: 12px; color: #15803d;">
        单点点权修改或距离询问时，只需沿着点分树父指针向上跳 $O(\\log n)$ 层，更新/查询祖先节点挂载的动态开点线段树，单次操作复杂度为 $O(\\log^2 n)$！
      </div>
    </div>
  </div>
`;
