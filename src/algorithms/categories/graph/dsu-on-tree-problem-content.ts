/**
 * 树上启发式合并 (DSU on Tree - Heavy-Light Merge on Trees)
 * 进阶树论: 重儿子保留计数桶 (keep=true)、轻儿子统计后清空 (keep=false)、轻边跳跃不超过 O(log n) 次 (CF600E / 洛谷 U41492)
 */

export const DSU_ON_TREE_CODE_LANGUAGES: Record<string, string[]> = {
  cpp: [
    '#include <iostream>',
    '#include <vector>',
    'using namespace std;',
    '',
    '// 树上启发式合并 DSU on Tree (CF600E / 洛谷 U41492)',
    '// 核心：重儿子保留贡献，轻儿子清空贡献，总复杂度严格 O(N log N)',
    'class DSUOnTree {',
    'public:',
    '    int n;',
    '    vector<vector<int>> adj;',
    '    vector<int> col, sz, son, cnt, ans;',
    '    int distinctCount = 0;',
    '    ',
    '    DSUOnTree(int n) : n(n), adj(n + 1), col(n + 1, 0), sz(n + 1, 0),',
    '                       son(n + 1, 0), cnt(n + 1, 0), ans(n + 1, 0) {}',
    '    ',
    '    void addEdge(int u, int v) {',
    '        adj[u].push_back(v);',
    '        adj[v].push_back(u);',
    '    }',
    '    ',
    '    // 1. 第一次 DFS：求重儿子与子树大小',
    '    void dfsInit(int u, int fa) {',
    '        sz[u] = 1;',
    '        for (int v : adj[u]) {',
    '            if (v == fa) continue;',
    '            dfsInit(v, u);',
    '            sz[u] += sz[v];',
    '            if (sz[v] > sz[son[u]]) son[u] = v;',
    '        }',
    '    }',
    '    ',
    '    // 2. 添加/删除子树贡献',
    '    void updateSubtree(int u, int fa, int val, int skipSon) {',
    '        if (cnt[col[u]] == 0 && val == 1) distinctCount++;',
    '        cnt[col[u]] += val;',
    '        if (cnt[col[u]] == 0 && val == -1) distinctCount--;',
    '        ',
    '        for (int v : adj[u]) {',
    '            if (v != fa && v != skipSon) updateSubtree(v, u, val, skipSon);',
    '        }',
    '    }',
    '    ',
    '    // 3. 第二次 DFS：启发式合并',
    '    void dfsSolve(int u, int fa, bool keep) {',
    '        // 先处理所有轻儿子 (不保留数据)',
    '        for (int v : adj[u]) {',
    '            if (v != fa && v != son[u]) dfsSolve(v, u, false);',
    '        }',
    '        // 再处理重儿子 (保留数据)',
    '        if (son[u]) dfsSolve(son[u], u, true);',
    '        ',
    '        // 暴力将轻儿子及当前节点贡献加入',
    '        updateSubtree(u, fa, 1, son[u]);',
    '        ans[u] = distinctCount;',
    '        ',
    '        // 若为轻儿子，清空本子树贡献',
    '        if (!keep) {',
    '            updateSubtree(u, fa, -1, 0);',
    '        }',
    '    }',
    '};',
  ],
  java: [
    'package advanced_tree;',
    '',
    'import java.util.*;',
    '',
    '// 树上启发式合并标准实现 - DSU on Tree',
    'public class Code01_DSUOnTree {',
    '    public static int n, distinctColors;',
    '    public static List<Integer>[] adj;',
    '    public static int[] col, sz, son, cnt, ans;',
    '}',
  ],
  python: [
    'class DSUOnTree:',
    '    def __init__(self, n: int):',
    '        self.n = n',
    '        self.adj = [[] for _ in range(n + 1)]',
    '        self.col = [0] * (n + 1)',
    '        self.son = [0] * (n + 1)',
    '        self.sz = [0] * (n + 1)',
    '        self.cnt = [0] * (n + 1)',
    '        self.ans = [0] * (n + 1)',
  ],
  javascript: [
    '// 树上启发式合并 (JavaScript 版)',
    'class DSUOnTree {',
    '  constructor(n) {',
    '    this.n = n;',
    '    this.adj = Array.from({ length: n + 1 }, () => []);',
    '    this.col = Array(n + 1).fill(0);',
    '    this.son = Array(n + 1).fill(0);',
    '    this.sz = Array(n + 1).fill(0);',
    '    this.cnt = Array(n + 1).fill(0);',
    '    this.ans = Array(n + 1).fill(0);',
    '  }',
    '}',
  ],
};

export const DSU_ON_TREE_PROBLEM_HTML = `
  <div style="font-size: 13px; line-height: 1.6; color: #334155;">
    <h3 style="margin-top: 0; color: #0f172a; font-size: 15px; font-weight: 800;">🌲 树上启发式合并 (DSU on Tree)</h3>
    <p>
      给定一棵包含 $n$ 个节点的树，每个节点具有某种属性（如颜色 $col[u]$）。需要查询以每个节点为根的子树内某种特征统计（如不同颜色数量、众数和等）。利用重链剖分的轻重儿子划分思想，实现静态全局计数桶复用（CF600E / 洛谷 U41492）。
    </p>

    <div style="background: #f8fafc; border-left: 4px solid #3b82f6; padding: 8px 12px; margin: 10px 0; border-radius: 0 6px 6px 0;">
      <div style="font-weight: 700; color: #1e40af; margin-bottom: 4px;">👑 核心合并准则</div>
      <div style="font-size: 11.5px; color: #334155;">
        1. <b>轻儿子不保留</b>：先递归所有轻儿子，跑完后清空全局计数桶 (keep = false)；<br/>
        2. <b>重儿子保留</b>：最后递归重儿子，跑完后<b>保留</b>全局计数桶 (keep = true)；<br/>
        3. <b>暴力合并轻子树</b>：将轻儿子子树的节点逐一加入计数桶，记录本节点答案。
      </div>
    </div>
  </div>
`;

export const DSU_ON_TREE_ANALYSIS_HTML = `
  <div style="font-size: 13px; line-height: 1.6; color: #334155;">
    <h3 style="margin-top: 0; color: #0f172a; font-size: 15px; font-weight: 800;">💡 严格 O(n log n) 复杂度证明</h3>

    <div style="background: #eff6ff; border: 1px solid #bfdbfe; border-radius: 6px; padding: 10px; margin-bottom: 12px;">
      <div style="font-weight: 700; color: #1e3a8a; margin-bottom: 4px;">1. 轻边跳跃上限引理</div>
      <div style="font-size: 12px; color: #1e40af;">
        每个节点到树根的路径上，至多经过 $\\lfloor \\log_2 n \\rfloor$ 条轻边。一个节点只有在其所属子树作为轻儿子被暴力扫描时才会被访问一次，故每个节点在整个算法生命周期中最多被访问 $O(\\log n)$ 次！
      </div>
    </div>

    <div style="background: #f0fdf4; border: 1px solid #bbf7d0; border-radius: 6px; padding: 10px;">
      <div style="font-weight: 700; color: #166534; margin-bottom: 4px;">2. 空间零额外开销</div>
      <div style="font-size: 12px; color: #15803d;">
        无需动态开点线段树或线段树合并的多余内存指针，仅需一个全局一维数组 <code>cnt[]</code> 即可完成所有统计，常数极小且极度节省空间！
      </div>
    </div>
  </div>
`;
