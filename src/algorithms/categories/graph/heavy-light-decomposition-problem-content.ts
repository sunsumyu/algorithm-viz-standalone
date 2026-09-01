/**
 * 树链剖分 (Heavy-Light Decomposition - HLD)
 * 参考左程云《算法通关课》进阶图论: 重儿子划分、重链顶端 top[]、DFS 序连续拍平与 O(log^2 n) 树上路径跳跃 (洛谷 P3384)
 */

export const HLD_CODE_LANGUAGES: Record<string, string[]> = {
  cpp: [
    '#include <iostream>',
    '#include <vector>',
    '#include <algorithm>',
    'using namespace std;',
    '',
    '// 树链剖分 (重链剖分 / 洛谷 P3384 / 左程云进阶图论)',
    '// 核心：两次 DFS 划分重儿子 son 与链头 top，将树上路径拆为 O(log n) 个连续区间',
    'class HLD {',
    'public:',
    '    int n, timer;',
    '    vector<vector<int>> adj;',
    '    vector<int> parent, depth, size, son, top, dfn, rnk;',
    '    ',
    '    HLD(int n) : n(n), timer(0), adj(n + 1), parent(n + 1), depth(n + 1),',
    '                 size(n + 1), son(n + 1, 0), top(n + 1), dfn(n + 1), rnk(n + 1) {}',
    '    ',
    '    void addEdge(int u, int v) {',
    '        adj[u].push_back(v);',
    '        adj[v].push_back(u);',
    '    }',
    '    ',
    '    // 1. 第一次 DFS: 统计 size, depth, parent 并找出重儿子 son',
    '    void dfs1(int u, int p, int d) {',
    '        parent[u] = p;',
    '        depth[u] = d;',
    '        size[u] = 1;',
    '        for (int v : adj[u]) {',
    '            if (v != p) {',
    '                dfs1(v, u, d + 1);',
    '                size[u] += size[v];',
    '                if (son[u] == 0 || size[v] > size[son[u]]) {',
    '                    son[u] = v;',
    '                }',
    '            }',
    '        }',
    '    }',
    '    ',
    '    // 2. 第二次 DFS: 优先走重儿子生成连续 DFS 序，确立重链头 top',
    '    void dfs2(int u, int t) {',
    '        top[u] = t;',
    '        dfn[u] = ++timer;',
    '        rnk[timer] = u;',
    '        if (son[u] == 0) return;',
    '        ',
    '        dfs2(son[u], t); // 重儿子继承当前链头',
    '        for (int v : adj[u]) {',
    '            if (v != parent[u] && v != son[u]) {',
    '                dfs2(v, v); // 轻儿子开启新重链',
    '            }',
    '        }',
    '    }',
    '    ',
    '    // 3. 树上路径跳跃: 沿重链向上跳跃至 LCA',
    '    vector<pair<int, int>> getPathSegments(int u, int v) {',
    '        vector<pair<int, int>> segments;',
    '        while (top[u] != top[v]) {',
    '            if (depth[top[u]] < depth[top[v]]) swap(u, v);',
    '            segments.push_back({dfn[top[u]], dfn[u]});',
    '            u = parent[top[u]];',
    '        }',
    '        if (depth[u] > depth[v]) swap(u, v);',
    '        segments.push_back({dfn[u], dfn[v]});',
    '        return segments;',
    '    }',
    '};',
  ],
  java: [
    'package class074;',
    '',
    'import java.util.*;',
    '',
    '// 树链剖分 - 左程云进阶图论标准模板',
    'public class Code01_HeavyLightDecomposition {',
    '    public static int n, timer = 0;',
    '    public static List<Integer>[] adj;',
    '    public static int[] parent, depth, size, son, top, dfn;',
    '    ',
    '    public static void dfs1(int u, int p, int d) {',
    '        parent[u] = p;',
    '        depth[u] = d;',
    '        size[u] = 1;',
    '        for (int v : adj[u]) {',
    '            if (v != p) {',
    '                dfs1(v, u, d + 1);',
    '                size[u] += size[v];',
    '                if (son[u] == 0 || size[v] > size[son[u]]) son[u] = v;',
    '            }',
    '        }',
    '    }',
    '    ',
    '    public static void dfs2(int u, int t) {',
    '        top[u] = t;',
    '        dfn[u] = ++timer;',
    '        if (son[u] == 0) return;',
    '        dfs2(son[u], t);',
    '        for (int v : adj[u]) {',
    '            if (v != parent[u] && v != son[u]) dfs2(v, v);',
    '        }',
    '    }',
    '}',
  ],
  python: [
    'class HLD:',
    '    def __init__(self, n: int):',
    '        self.n = n',
    '        self.adj = [[] for _ in range(n + 1)]',
    '        self.parent = [0] * (n + 1)',
    '        self.depth = [0] * (n + 1)',
    '        self.size = [0] * (n + 1)',
    '        self.son = [0] * (n + 1)',
    '        self.top = [0] * (n + 1)',
    '        self.dfn = [0] * (n + 1)',
    '        self.timer = 0',
    '        ',
    '    def dfs1(self, u: int, p: int, d: int):',
    '        self.parent[u] = p',
    '        self.depth[u] = d',
    '        self.size[u] = 1',
    '        for v in self.adj[u]:',
    '            if v != p:',
    '                self.dfs1(v, u, d + 1)',
    '                self.size[u] += self.size[v]',
    '                if self.son[u] == 0 or self.size[v] > self.size[self.son[u]]:',
    '                    self.son[u] = v',
    '                    ',
    '    def dfs2(self, u: int, t: int):',
    '        self.top[u] = t',
    '        self.timer += 1',
    '        self.dfn[u] = self.timer',
    '        if self.son[u] == 0: return',
    '        self.dfs2(self.son[u], t)',
    '        for v in self.adj[u]:',
    '            if v != self.parent[u] and v != self.son[u]:',
    '                self.dfs2(v, v)',
  ],
  javascript: [
    '// 树链剖分 (JavaScript 版)',
    'class HLD {',
    '  constructor(n) {',
    '    this.n = n;',
    '    this.adj = Array.from({ length: n + 1 }, () => []);',
    '    this.parent = Array(n + 1).fill(0);',
    '    this.depth = Array(n + 1).fill(0);',
    '    this.size = Array(n + 1).fill(0);',
    '    this.son = Array(n + 1).fill(0);',
    '    this.top = Array(n + 1).fill(0);',
    '    this.dfn = Array(n + 1).fill(0);',
    '    this.timer = 0;',
    '  }',
    '  ',
    '  dfs1(u, p, d) {',
    '    this.parent[u] = p;',
    '    this.depth[u] = d;',
    '    this.size[u] = 1;',
    '    for (const v of this.adj[u]) {',
    '      if (v !== p) {',
    '        this.dfs1(v, u, d + 1);',
    '        this.size[u] += this.size[v];',
    '        if (this.son[u] === 0 || this.size[v] > this.size[this.son[u]]) {',
    '          this.son[u] = v;',
    '        }',
    '      }',
    '    }',
    '  }',
    '  ',
    '  dfs2(u, t) {',
    '    this.top[u] = t;',
    '    this.dfn[u] = ++this.timer;',
    '    if (this.son[u] === 0) return;',
    '    this.dfs2(this.son[u], t);',
    '    for (const v of this.adj[u]) {',
    '      if (v !== this.parent[u] && v !== this.son[u]) {',
    '        this.dfs2(v, v);',
    '      }',
    '    }',
    '  }',
    '}',
  ],
};

export const HLD_PROBLEM_HTML = `
  <div style="font-size: 13px; line-height: 1.6; color: #334155;">
    <h3 style="margin-top: 0; color: #0f172a; font-size: 15px; font-weight: 800;">🎋 树链剖分 (Heavy-Light Decomposition)</h3>
    <p>
      在树形结构上，我们经常需要对<b>任意两点间的路径</b>或<b>任意子树</b>进行区间加、区间求和等高频操作。
    </p>
    <p>
      <b>树链剖分（重链剖分）</b>通过两次 DFS，将树分解为若干条互不相交的<b>重链 (Heavy Paths)</b>：
    </p>
    <ul>
      <li><b>重儿子 (Heavy Child)</b>：子树节点数最大的儿子节点；其余儿子为轻儿子。</li>
      <li><b>重链连续性</b>：优先遍历重儿子，使得同一重链上的节点在 <code>dfn</code> 序中具有<b>连续的下标区间</b>！</li>
    </ul>

    <div style="background: #f8fafc; border-left: 4px solid #3b82f6; padding: 8px 12px; margin: 10px 0; border-radius: 0 6px 6px 0;">
      <div style="font-weight: 700; color: #1e40af; margin-bottom: 4px;">🚀 极致性能：$O(\\log^2 n)$ 路径跳跃</div>
      <div style="font-size: 11.5px; color: #334155;">
        树上任意简单路径均可拆解为最多 $O(\\log n)$ 段连续的重链区间，配合线段树即可在 $O(\\log^2 n)$ 内完成路径修改与查询！
      </div>
    </div>
  </div>
`;

export const HLD_ANALYSIS_HTML = `
  <div style="font-size: 13px; line-height: 1.6; color: #334155;">
    <h3 style="margin-top: 0; color: #0f172a; font-size: 15px; font-weight: 800;">💡 左程云树链剖分双 DFS 与跳链算法解析</h3>

    <div style="background: #eff6ff; border: 1px solid #bfdbfe; border-radius: 6px; padding: 10px; margin-bottom: 12px;">
      <div style="font-weight: 700; color: #1e3a8a; margin-bottom: 4px;">1. 为什么重链数量不超过 $\\log n$？</div>
      <div style="font-size: 12px; color: #1e40af;">
        从根节点到任意叶子节点的路径上，每次经过一条轻边，子树大小至少减半！因此从任何节点向上跳到根，最多跨越 $\\log n$ 条轻边与重链。
      </div>
    </div>

    <div style="background: #f0fdf4; border: 1px solid #bbf7d0; border-radius: 6px; padding: 10px;">
      <div style="font-weight: 700; color: #166534; margin-bottom: 4px;">2. 子树与路径统一化</div>
      <div style="font-size: 12px; color: #15803d;">
        以 $u$ 为根的子树在 DFS 序中对应严格区间 $[dfn[u], dfn[u] + size[u] - 1]$；树上路径对应若干个 $[dfn[top[u]], dfn[u]]$ 区间，完美化归为经典线段树区间问题！
      </div>
    </div>
  </div>
`;
