/**
 * 树上众数与深度统计 (Tree Dominant Color - CF600E Lomsat gelral)
 * 进阶树论: 树上启发式合并 DSU on Tree、动态维护最大频次 maxCnt 与众数和 sumColor、O(N log N) (CF600E)
 */

export const TREE_DOMINANT_CODE_LANGUAGES: Record<string, string[]> = {
  cpp: [
    '#include <iostream>',
    '#include <vector>',
    'using namespace std;',
    '',
    '// 树上众数求和 (Codeforces 600E Lomsat gelral)',
    '// 核心：DSU on Tree 动态维护 maxCnt 与 sumColor，严格 O(N log N)',
    'typedef long long ll;',
    '',
    'class TreeDominantColor {',
    'public:',
    '    int n;',
    '    vector<vector<int>> adj;',
    '    vector<int> col, sz, son, cnt;',
    '    vector<ll> ans;',
    '    int maxCnt = 0;',
    '    ll sumColor = 0;',
    '    ',
    '    TreeDominantColor(int n) : n(n), adj(n + 1), col(n + 1), sz(n + 1),',
    '                               son(n + 1, 0), cnt(n + 1, 0), ans(n + 1, 0) {}',
    '    ',
    '    void addEdge(int u, int v) {',
    '        adj[u].push_back(v);',
    '        adj[v].push_back(u);',
    '    }',
    '    ',
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
    '    void addNode(int u, int fa, int val, int skipSon) {',
    '        cnt[col[u]] += val;',
    '        if (cnt[col[u]] > maxCnt) {',
    '            maxCnt = cnt[col[u]];',
    '            sumColor = col[u];',
    '        } else if (cnt[col[u]] == maxCnt) {',
    '            sumColor += col[u];',
    '        }',
    '        for (int v : adj[u]) {',
    '            if (v != fa && v != skipSon) addNode(v, u, val, skipSon);',
    '        }',
    '    }',
    '    ',
    '    void dfsSolve(int u, int fa, bool keep) {',
    '        for (int v : adj[u]) {',
    '            if (v != fa && v != son[u]) dfsSolve(v, u, false);',
    '        }',
    '        if (son[u]) dfsSolve(son[u], u, true);',
    '        ',
    '        addNode(u, fa, 1, son[u]);',
    '        ans[u] = sumColor;',
    '        ',
    '        if (!keep) {',
    '            // 清空桶与统计量',
    '            addNode(u, fa, -1, 0);',
    '            maxCnt = 0;',
    '            sumColor = 0;',
    '        }',
    '    }',
    '};',
  ],
  java: [
    'package advanced_tree;',
    '',
    'import java.util.*;',
    '',
    '// 树上众数求和 - CF600E',
    'public class Code01_TreeDominantColor {',
    '    public static int n, maxCnt;',
    '    public static long sumColor;',
    '    public static List<Integer>[] adj;',
    '    public static int[] col, sz, son, cnt;',
    '    public static long[] ans;',
    '}',
  ],
  python: [
    '# 树上众数求和 (Python 版)',
    'class TreeDominantColor:',
    '    def __init__(self, n: int):',
    '        self.n = n',
    '        self.adj = [[] for _ in range(n + 1)]',
    '        self.col = [0] * (n + 1)',
    '        self.cnt = [0] * (n + 1)',
    '        self.ans = [0] * (n + 1)',
    '        self.max_cnt = 0',
    '        self.sum_color = 0',
  ],
  javascript: [
    '// 树上众数求和 (JavaScript 版)',
    'class TreeDominantColor {',
    '  constructor(n) {',
    '    this.n = n;',
    '    this.cnt = Array(n + 1).fill(0);',
    '    this.ans = Array(n + 1).fill(0);',
    '    this.maxCnt = 0;',
    '    this.sumColor = 0;',
    '  }',
  ],
};

export const TREE_DOMINANT_PROBLEM_HTML = `
  <div style="font-size: 13px; line-height: 1.6; color: #334155;">
    <h3 style="margin-top: 0; color: #0f172a; font-size: 15px; font-weight: 800;">👑 树上众数求和 (Tree Dominant Color - CF600E)</h3>
    <p>
      一棵包含 $n$ 个节点的树，每个节点涂有颜色 $col[u]$。定义以 $u$ 为根的子树中的<b>“主导颜色”（Dominant Colors）</b>为在该子树内出现频次最高的所有颜色。求每个节点 $u$ 的子树中所有主导颜色的编号之和（CF600E Lomsat gelral）。
    </p>

    <div style="background: #f8fafc; border-left: 4px solid #3b82f6; padding: 8px 12px; margin: 10px 0; border-radius: 0 6px 6px 0;">
      <div style="font-weight: 700; color: #1e40af; margin-bottom: 4px;">📈 DSU on Tree 动态最值维护</div>
      <div style="font-size: 11.5px; color: #334155;">
        当颜色 $c$ 的频次更新时：<br/>
        1. 若 $\\text{cnt}[c] > \\text{maxCnt}$：更新 $\\text{maxCnt} = \\text{cnt}[c]$，重置 $\\text{sumColor} = c$；<br/>
        2. 若 $\\text{cnt}[c] == \\text{maxCnt}$：累加 $\\text{sumColor} += c$。
      </div>
    </div>
  </div>
`;

export const TREE_DOMINANT_ANALYSIS_HTML = `
  <div style="font-size: 13px; line-height: 1.6; color: #334155;">
    <h3 style="margin-top: 0; color: #0f172a; font-size: 15px; font-weight: 800;">💡 为什么能用 O(1) 维护众数和？</h3>

    <div style="background: #eff6ff; border: 1px solid #bfdbfe; border-radius: 6px; padding: 10px; margin-bottom: 12px;">
      <div style="font-weight: 700; color: #1e3a8a; margin-bottom: 4px;">1. 单调递增性保障</div>
      <div style="font-size: 12px; color: #1e40af;">
        在启发式合并向子树加入节点的过程中，频次 $\\text{cnt}[c]$ 始终单调递增，因此最大频次 $\\text{maxCnt}$ 只会单调上升或保持不变，无需在集合中回退寻找次大值，更新操作严格 $O(1)$！
      </div>
    </div>

    <div style="background: #f0fdf4; border: 1px solid #bbf7d0; border-radius: 6px; padding: 10px;">
      <div style="font-weight: 700; color: #166534; margin-bottom: 4px;">2. 整体严格 O(N log N)</div>
      <div style="font-size: 12px; color: #15803d;">
        结合轻重链剖分，每个节点被重扫 $O(\\log N)$ 次，单次操作 $O(1)$，总时间复杂度与空间复杂度均达到最优！
      </div>
    </div>
  </div>
`;
