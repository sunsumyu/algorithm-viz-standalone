/**
 * 柯尼希定理与二分图最小点覆盖 / 最大独立集 (Konig's Theorem & Min Vertex Cover)
 * 参考左程云《算法通关课》Class 069: 柯尼希定理、最大匹配转化、未匹配点交替轨扫描与构造方案 (洛谷 P2740)
 */

export const KONIG_CODE_LANGUAGES: Record<string, string[]> = {
  cpp: [
    '#include <iostream>',
    '#include <vector>',
    '#include <algorithm>',
    'using namespace std;',
    '',
    '// 柯尼希定理 (Konig Theorem) / 二分图最小点覆盖与最大独立集 (左程云 Class 069)',
    '// 核心结论：',
    '// 1. 最大匹配数 = 最小点覆盖数',
    '// 2. 最大独立集 = 总点数 - 最大匹配数',
    'class KonigCover {',
    'public:',
    '    int n, m;',
    '    vector<vector<int>> adj;',
    '    vector<int> matchL, matchR;',
    '    vector<bool> vis, visL, visR;',
    '    ',
    '    KonigCover(int n, int m) : n(n), m(m), adj(n + 1),',
    '                              matchL(n + 1, 0), matchR(m + 1, 0),',
    '                              vis(m + 1, false), visL(n + 1, false), visR(m + 1, false) {}',
    '    ',
    '    void addEdge(int u, int v) {',
    '        adj[u].push_back(v);',
    '    }',
    '    ',
    '    bool dfs(int u) {',
    '        for (int v : adj[u]) {',
    '            if (!vis[v]) {',
    '                vis[v] = true;',
    '                if (matchR[v] == 0 || dfs(matchR[v])) {',
    '                    matchR[v] = u;',
    '                    matchL[u] = v;',
    '                    return true;',
    '                }',
    '            }',
    '        }',
    '        return false;',
    '    }',
    '    ',
    '    // 1. 求解最大匹配',
    '    int maxMatching() {',
    '        int ans = 0;',
    '        for (int i = 1; i <= n; ++i) {',
    '            fill(vis.begin(), vis.end(), false);',
    '            if (dfs(i)) ans++;',
    '        }',
    '        return ans;',
    '    }',
    '    ',
    '    // 2. 柯尼希定理构造方案：从未匹配左点出发沿交错轨 DFS',
    '    void alternatingDfs(int u) {',
    '        visL[u] = true;',
    '        for (int v : adj[u]) {',
    '            if (!visR[v] && v != matchL[u]) { // 沿未匹配边走到右部',
    '                visR[v] = true;',
    '                if (matchR[v] != 0 && !visL[matchR[v]]) { // 沿匹配边走回左部',
    '                    alternatingDfs(matchR[v]);',
    '                }',
    '            }',
    '        }',
    '    }',
    '};',
  ],
  java: [
    'package class069;',
    '',
    'import java.util.*;',
    '',
    '// 柯尼希定理 - 左程云标准实现',
    'public class Code03_KonigTheorem {',
    '    public static int n, m;',
    '    public static List<Integer>[] adj;',
    '    public static int[] matchL, matchR;',
    '    public static boolean[] vis, visL, visR;',
    '    ',
    '    public static boolean dfs(int u) {',
    '        for (int v : adj[u]) {',
    '            if (!vis[v]) {',
    '                vis[v] = true;',
    '                if (matchR[v] == 0 || dfs(matchR[v])) {',
    '                    matchR[v] = u;',
    '                    matchL[u] = v;',
    '                    return true;',
    '                }',
    '            }',
    '        }',
    '        return false;',
    '    }',
    '}',
  ],
  python: [
    'class KonigCover:',
    '    def __init__(self, n: int, m: int):',
    '        self.n = n',
    '        self.m = m',
    '        self.adj = [[] for _ in range(n + 1)]',
    '        self.match_l = [0] * (n + 1)',
    '        self.match_r = [0] * (m + 1)',
    '        self.vis = [False] * (m + 1)',
    '        self.vis_l = [False] * (n + 1)',
    '        self.vis_r = [False] * (m + 1)',
    '        ',
    '    def dfs(self, u: int) -> bool:',
    '        for v in self.adj[u]:',
    '            if not self.vis[v]:',
    '                self.vis[v] = True',
    '                if self.match_r[v] == 0 or self.dfs(self.match_r[v]):',
    '                    self.match_r[v] = u',
    '                    self.match_l[u] = v',
    '                    return True',
    '        return False',
  ],
  javascript: [
    '// 柯尼希定理 (JavaScript 版)',
    'class KonigCover {',
    '  constructor(n, m) {',
    '    this.n = n;',
    '    this.m = m;',
    '    this.adj = Array.from({ length: n + 1 }, () => []);',
    '    this.matchL = Array(n + 1).fill(0);',
    '    this.matchR = Array(m + 1).fill(0);',
    '    this.vis = Array(m + 1).fill(false);',
    '    this.visL = Array(n + 1).fill(false);',
    '    this.visR = Array(m + 1).fill(false);',
    '  }',
    '  ',
    '  dfs(u) {',
    '    for (const v of this.adj[u]) {',
    '      if (!this.vis[v]) {',
    '        this.vis[v] = true;',
    '        if (this.matchR[v] === 0 || this.dfs(this.matchR[v])) {',
    '          this.matchR[v] = u;',
    '          this.matchL[u] = v;',
    '          return true;',
    '        }',
    '      }',
    '    }',
    '    return false;',
    '  }',
    '}',
  ],
};

export const KONIG_PROBLEM_HTML = `
  <div style="font-size: 13px; line-height: 1.6; color: #334155;">
    <h3 style="margin-top: 0; color: #0f172a; font-size: 15px; font-weight: 800;">🛡️ 柯尼希定理 (Kőnig's Theorem)</h3>
    <p>
      在二分图中，<b>点覆盖 (Vertex Cover)</b> 是指选择一个点集 $S$，使得图中的每条边至少有一个端点属于 $S$。
    </p>
    <p>
      <b>柯尼希定理 (Kőnig's Theorem)</b> 给出了二分图匹配与覆盖的深刻对偶等价性：
    </p>
    <ul>
      <li><b>最小点覆盖数</b> = <b>最大匹配数</b>。</li>
      <li><b>最大独立集大小</b> = <b>总节点数 - 最大匹配数</b>。</li>
    </ul>

    <div style="background: #f8fafc; border-left: 4px solid #3b82f6; padding: 8px 12px; margin: 10px 0; border-radius: 0 6px 6px 0;">
      <div style="font-weight: 700; color: #1e40af; margin-bottom: 4px;">🔍 构造法精髓：交错轨扫描</div>
      <div style="font-size: 11.5px; color: #334155;">
        从未匹配的左点出发走交错轨，标记可达点集。最小点覆盖 = <b>未访问左点 + 已访问右点</b>；最大独立集 = <b>已访问左点 + 未访问右点</b>！
      </div>
    </div>
  </div>
`;

export const KONIG_ANALYSIS_HTML = `
  <div style="font-size: 13px; line-height: 1.6; color: #334155;">
    <h3 style="margin-top: 0; color: #0f172a; font-size: 15px; font-weight: 800;">💡 左程云柯尼希定理对偶构造解析</h3>

    <div style="background: #eff6ff; border: 1px solid #bfdbfe; border-radius: 6px; padding: 10px; margin-bottom: 12px;">
      <div style="font-weight: 700; color: #1e3a8a; margin-bottom: 4px;">1. 为什么覆盖数等于匹配数？</div>
      <div style="font-size: 12px; color: #1e40af;">
        每条匹配边至少需要一个端点来覆盖，所以覆盖数 $\ge$ 匹配数；通过交错轨构造出的点集大小恰好等于匹配数，且每条边都被覆盖，故必为最小值！
      </div>
    </div>

    <div style="background: #f0fdf4; border: 1px solid #bbf7d0; border-radius: 6px; padding: 10px;">
      <div style="font-weight: 700; color: #166534; margin-bottom: 4px;">2. 经典网格/矩阵覆盖应用</div>
      <div style="font-size: 12px; color: #15803d;">
        车攻守问题、障碍物覆盖 (Muddy Fields)、矩阵变换染色等问题，均可通过行/列建模为二分图并利用柯尼希定理秒杀！
      </div>
    </div>
  </div>
`;
