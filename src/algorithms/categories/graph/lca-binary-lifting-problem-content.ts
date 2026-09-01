/**
 * 树上倍增求最近公共祖先 (LCA - Binary Lifting)
 * 参考左程云《算法通关课》Class 076: 树上倍增表 up[u][i]、二进制深度对齐与 O(log n) 祖先定位 (洛谷 P3379)
 */

export const LCA_CODE_LANGUAGES: Record<string, string[]> = {
  cpp: [
    '#include <iostream>',
    '#include <vector>',
    '#include <algorithm>',
    'using namespace std;',
    '',
    '// 树上倍增法求 LCA (洛谷 P3379 / 左程云 Class 076)',
    '// 核心：up[u][i] = up[up[u][i-1]][i-1]，深度对齐 + 二进制同步跃升',
    'class BinaryLiftingLCA {',
    'public:',
    '    int n, maxLog;',
    '    vector<vector<int>> adj;',
    '    vector<int> depth;',
    '    vector<vector<int>> up;',
    '    ',
    '    BinaryLiftingLCA(int n) : n(n), maxLog(20), adj(n + 1),',
    '                             depth(n + 1, 0), up(n + 1, vector<int>(21, 0)) {}',
    '    ',
    '    void addEdge(int u, int v) {',
    '        adj[u].push_back(v);',
    '        adj[v].push_back(u);',
    '    }',
    '    ',
    '    // 1. DFS 预处理深度与 2^0 祖先',
    '    void dfs(int u, int p, int d) {',
    '        depth[u] = d;',
    '        up[u][0] = p;',
    '        for (int i = 1; i <= maxLog; ++i) {',
    '            up[u][i] = up[up[u][i - 1]][i - 1]; // 倍增转移',
    '        }',
    '        for (int v : adj[u]) {',
    '            if (v != p) dfs(v, u, d + 1);',
    '        }',
    '    }',
    '    ',
    '    // 2. O(log n) 查询 LCA',
    '    int getLCA(int u, int v) {',
    '        if (depth[u] < depth[v]) swap(u, v);',
    '        ',
    '        // 阶段 1: 将更深的 u 提升至与 v 相同深度',
    '        for (int i = maxLog; i >= 0; --i) {',
    '            if (depth[u] - (1 << i) >= depth[v]) {',
    '                u = up[u][i];',
    '            }',
    '        }',
    '        if (u == v) return u;',
    '        ',
    '        // 阶段 2: u 和 v 同步向上倍增跳跃',
    '        for (int i = maxLog; i >= 0; --i) {',
    '            if (up[u][i] != up[v][i]) {',
    '                u = up[u][i];',
    '                v = up[v][i];',
    '            }',
    '        }',
    '        return up[u][0]; // 停在 LCA 正下方',
    '    }',
    '};',
  ],
  java: [
    'package class076;',
    '',
    'import java.util.*;',
    '',
    '// 树上倍增 LCA - 左程云标准实现',
    'public class Code01_LCA_BinaryLifting {',
    '    public static int n, maxLog = 20;',
    '    public static List<Integer>[] adj;',
    '    public static int[] depth;',
    '    public static int[][] up;',
    '    ',
    '    public static void dfs(int u, int p, int d) {',
    '        depth[u] = d;',
    '        up[u][0] = p;',
    '        for (int i = 1; i <= maxLog; i++) {',
    '            up[u][i] = up[up[u][i - 1]][i - 1];',
    '        }',
    '        for (int v : adj[u]) {',
    '            if (v != p) dfs(v, u, d + 1);',
    '        }',
    '    }',
    '    ',
    '    public static int getLCA(int u, int v) {',
    '        if (depth[u] < depth[v]) { int t = u; u = v; v = t; }',
    '        for (int i = maxLog; i >= 0; i--) {',
    '            if (depth[u] - (1 << i) >= depth[v]) u = up[u][i];',
    '        }',
    '        if (u == v) return u;',
    '        for (int i = maxLog; i >= 0; i--) {',
    '            if (up[u][i] != up[v][i]) {',
    '                u = up[u][i];',
    '                v = up[v][i];',
    '            }',
    '        }',
    '        return up[u][0];',
    '    }',
    '}',
  ],
  python: [
    'class BinaryLiftingLCA:',
    '    def __init__(self, n: int):',
    '        self.n = n',
    '        self.max_log = 20',
    '        self.adj = [[] for _ in range(n + 1)]',
    '        self.depth = [0] * (n + 1)',
    '        self.up = [[0] * 21 for _ in range(n + 1)]',
    '        ',
    '    def dfs(self, u: int, p: int, d: int):',
    '        self.depth[u] = d',
    '        self.up[u][0] = p',
    '        for i in range(1, self.max_log + 1):',
    '            self.up[u][i] = self.up[self.up[u][i - 1]][i - 1]',
    '        for v in self.adj[u]:',
    '            if v != p:',
    '                self.dfs(v, u, d + 1)',
    '                ',
    '    def get_lca(self, u: int, v: int) -> int:',
    '        if self.depth[u] < self.depth[v]:',
    '            u, v = v, u',
    '        for i in range(self.max_log, -1, -1):',
    '            if self.depth[u] - (1 << i) >= self.depth[v]:',
    '                u = self.up[u][i]',
    '        if u == v: return u',
    '        for i in range(self.max_log, -1, -1):',
    '            if self.up[u][i] != self.up[v][i]:',
    '                u = self.up[u][i]',
    '                v = self.up[v][i]',
    '        return self.up[u][0]',
  ],
  javascript: [
    '// 树上倍增 LCA (JavaScript 版)',
    'class BinaryLiftingLCA {',
    '  constructor(n) {',
    '    this.n = n;',
    '    this.maxLog = 20;',
    '    this.adj = Array.from({ length: n + 1 }, () => []);',
    '    this.depth = Array(n + 1).fill(0);',
    '    this.up = Array.from({ length: n + 1 }, () => Array(21).fill(0));',
    '  }',
    '  ',
    '  dfs(u, p, d) {',
    '    this.depth[u] = d;',
    '    this.up[u][0] = p;',
    '    for (let i = 1; i <= this.maxLog; i++) {',
    '      this.up[u][i] = this.up[this.up[u][i - 1]][i - 1];',
    '    }',
    '    for (const v of this.adj[u]) {',
    '      if (v !== p) this.dfs(v, u, d + 1);',
    '    }',
    '  }',
    '}',
  ],
};

export const LCA_PROBLEM_HTML = `
  <div style="font-size: 13px; line-height: 1.6; color: #334155;">
    <h3 style="margin-top: 0; color: #0f172a; font-size: 15px; font-weight: 800;">🌲 最近公共祖先 (Lowest Common Ancestor - LCA)</h3>
    <p>
      在一棵有根树中，两个节点 $u$ 和 $v$ 的<b>最近公共祖先 (LCA)</b> 是指距离它们最近且同时为两者祖先的节点（洛谷 P3379）。
    </p>
    <p>
      <b>倍增算法 (Binary Lifting)</b> 预处理 $up[u][i]$ 表示从点 $u$ 向上走 $2^i$ 步到达的祖先：
    </p>
    <ul>
      <li><b>预处理时间</b>：$O(n \\log n)$ 构建倍增表。</li>
      <li><b>单次查询</b>：$O(\\log n)$ 快速对齐深度并二进制跃升！</li>
    </ul>

    <div style="background: #f8fafc; border-left: 4px solid #3b82f6; padding: 8px 12px; margin: 10px 0; border-radius: 0 6px 6px 0;">
      <div style="font-weight: 700; color: #1e40af; margin-bottom: 4px;">🚀 状态转移核心</div>
      <div style="font-size: 11.5px; color: #334155;">
        $up[u][i] = up[up[u][i - 1]][i - 1]$：向上走 $2^i$ 步等价于先走 $2^{i-1}$ 步，再以到达的点为起点再走 $2^{i-1}$ 步！
      </div>
    </div>
  </div>
`;

export const LCA_ANALYSIS_HTML = `
  <div style="font-size: 13px; line-height: 1.6; color: #334155;">
    <h3 style="margin-top: 0; color: #0f172a; font-size: 15px; font-weight: 800;">💡 左程云树上倍增跳跃两阶段解析</h3>

    <div style="background: #eff6ff; border: 1px solid #bfdbfe; border-radius: 6px; padding: 10px; margin-bottom: 12px;">
      <div style="font-weight: 700; color: #1e3a8a; margin-bottom: 4px;">1. 深度对齐阶段 (Align Depth)</div>
      <div style="font-size: 12px; color: #1e40af;">
        设 $depth[u] > depth[v]$，利用二进制拆分深度差 $\\Delta d$，将 $u$ 不断向上跳跃 $2^i$ 步，直到 $depth[u] == depth[v]$。若此时 $u == v$，则 $v$ 即为 LCA。
      </div>
    </div>

    <div style="background: #f0fdf4; border: 1px solid #bbf7d0; border-radius: 6px; padding: 10px;">
      <div style="font-weight: 700; color: #166534; margin-bottom: 4px;">2. 同步跃升阶段 (Synchronous Leap)</div>
      <div style="font-size: 12px; color: #15803d;">
        从大到小枚举 $2^i$，只要 $up[u][i] \\ne up[v][i]$，说明跳跃后仍在 LCA 下方，立刻同步跳跃！最终 $u, v$ 将恰好停在 LCA 的直接子节点，其父节点 $up[u][0]$ 即为所求！
      </div>
    </div>
  </div>
`;

export const LCA_BINARY_LIFTING_CODE_LANGUAGES = LCA_CODE_LANGUAGES;
export const LCA_BINARY_LIFTING_PROBLEM_HTML = LCA_PROBLEM_HTML;
export const LCA_BINARY_LIFTING_ANALYSIS_HTML = LCA_ANALYSIS_HTML;
