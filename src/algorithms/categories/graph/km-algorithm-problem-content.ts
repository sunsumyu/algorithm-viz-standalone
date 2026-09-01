/**
 * 二分图最大权完美匹配与 KM 算法 (Kuhn-Munkres Algorithm)
 * 参考左程云《算法通关课》进阶图论: 顶标理论、相等子图、slack[] 松弛数组与 O(n^3) 最优带权分配 (洛谷 P6577)
 */

export const KM_ALGORITHM_CODE_LANGUAGES: Record<string, string[]> = {
  cpp: [
    '#include <iostream>',
    '#include <vector>',
    '#include <algorithm>',
    'using namespace std;',
    '',
    '// KM 算法 (Kuhn-Munkres) 求二分图最大权完美匹配 (洛谷 P6577)',
    '// 核心：顶标 lx[i] + ly[j] >= w[i][j]，相等子图寻找匹配，slack[] O(n^3) 顶标调整',
    'class KM {',
    'public:',
    '    int n;',
    '    vector<vector<long long>> weight;',
    '    vector<long long> lx, ly, slack;',
    '    vector<int> match;',
    '    vector<bool> visX, visY;',
    '    ',
    '    KM(int n) : n(n), weight(n + 1, vector<long long>(n + 1, -1e18)),',
    '                lx(n + 1, 0), ly(n + 1, 0), slack(n + 1, 1e18),',
    '                match(n + 1, 0), visX(n + 1, false), visY(n + 1, false) {}',
    '    ',
    '    bool dfs(int u) {',
    '        visX[u] = true;',
    '        for (int v = 1; v <= n; ++v) {',
    '            if (visY[v]) continue;',
    '            long long delta = lx[u] + ly[v] - weight[u][v];',
    '            if (delta == 0) { // 相等子图中的边',
    '                visY[v] = true;',
    '                if (match[v] == 0 || dfs(match[v])) {',
    '                    match[v] = u;',
    '                    return true;',
    '                }',
    '            } else {',
    '                slack[v] = min(slack[v], delta);',
    '            }',
    '        }',
    '        return false;',
    '    }',
    '    ',
    '    long long solve() {',
    '        for (int i = 1; i <= n; ++i) {',
    '            lx[i] = -1e18;',
    '            for (int j = 1; j <= n; ++j) lx[i] = max(lx[i], weight[i][j]);',
    '        }',
    '        ',
    '        for (int i = 1; i <= n; ++i) {',
    '            fill(slack.begin(), slack.end(), 1e18);',
    '            while (true) {',
    '                fill(visX.begin(), visX.end(), false);',
    '                fill(visY.begin(), visY.end(), false);',
    '                if (dfs(i)) break;',
    '                ',
    '                long long d = 1e18;',
    '                for (int j = 1; j <= n; ++j) {',
    '                    if (!visY[j]) d = min(d, slack[j]);',
    '                }',
    '                for (int j = 1; j <= n; ++j) {',
    '                    if (visX[j]) lx[j] -= d;',
    '                    if (visY[j]) ly[j] += d;',
    '                    else slack[j] -= d;',
    '                }',
    '            }',
    '        }',
    '        ',
    '        long long ans = 0;',
    '        for (int v = 1; v <= n; ++v) ans += weight[match[v]][v];',
    '        return ans;',
    '    }',
    '};',
  ],
  java: [
    'package class073;',
    '',
    'import java.util.*;',
    '',
    '// KM 算法 - 左程云标准实现',
    'public class Code01_KMAlgorithm {',
    '    public static int n;',
    '    public static long[][] weight;',
    '    public static long[] lx, ly, slack;',
    '    public static int[] match;',
    '    public static boolean[] visX, visY;',
    '    ',
    '    public static boolean dfs(int u) {',
    '        visX[u] = true;',
    '        for (int v = 1; v <= n; v++) {',
    '            if (visY[v]) continue;',
    '            long delta = lx[u] + ly[v] - weight[u][v];',
    '            if (delta == 0) {',
    '                visY[v] = true;',
    '                if (match[v] == 0 || dfs(match[v])) {',
    '                    match[v] = u;',
    '                    return true;',
    '                }',
    '            } else {',
    '                slack[v] = Math.min(slack[v], delta);',
    '            }',
    '        }',
    '        return false;',
    '    }',
    '}',
  ],
  python: [
    'class KM:',
    '    def __init__(self, n: int, weights: list[list[int]]):',
    '        self.n = n',
    '        self.w = weights',
    '        self.lx = [max(weights[i]) for i in range(n)]',
    '        self.ly = [0] * n',
    '        self.match = [-1] * n',
    '        self.slack = [float("inf")] * n',
    '        self.vis_x = [False] * n',
    '        self.vis_y = [False] * n',
    '        ',
    '    def dfs(self, u: int) -> bool:',
    '        self.vis_x[u] = True',
    '        for v in range(self.n):',
    '            if self.vis_y[v]: continue',
    '            delta = self.lx[u] + self.ly[v] - self.w[u][v]',
    '            if delta == 0:',
    '                self.vis_y[v] = True',
    '                if self.match[v] == -1 or self.dfs(self.match[v]):',
    '                    self.match[v] = u',
    '                    return True',
    '            else:',
    '                self.slack[v] = min(self.slack[v], delta)',
    '        return False',
  ],
  javascript: [
    '// KM 算法 (JavaScript 版)',
    'class KMAlgorithm {',
    '  constructor(n, weights) {',
    '    this.n = n;',
    '    this.w = weights;',
    '    this.lx = weights.map(row => Math.max(...row));',
    '    this.ly = Array(n).fill(0);',
    '    this.match = Array(n).fill(-1);',
    '    this.slack = Array(n).fill(Infinity);',
    '    this.visX = Array(n).fill(false);',
    '    this.visY = Array(n).fill(false);',
    '  }',
    '  ',
    '  dfs(u) {',
    '    this.visX[u] = true;',
    '    for (let v = 0; v < this.n; v++) {',
    '      if (this.visY[v]) continue;',
    '      const delta = this.lx[u] + this.ly[v] - this.w[u][v];',
    '      if (delta === 0) {',
    '        this.visY[v] = true;',
    '        if (this.match[v] === -1 || this.dfs(this.match[v])) {',
    '          this.match[v] = u;',
    '          return true;',
    '        }',
    '      } else {',
    '        this.slack[v] = Math.min(this.slack[v], delta);',
    '      }',
    '    }',
    '    return false;',
    '  }',
    '}',
  ],
};

export const KM_ALGORITHM_PROBLEM_HTML = `
  <div style="font-size: 13px; line-height: 1.6; color: #334155;">
    <h3 style="margin-top: 0; color: #0f172a; font-size: 15px; font-weight: 800;">💘 二分图最大权完美匹配 (KM 算法)</h3>
    <p>
      给定一个两侧各有 $n$ 个节点的带权完全二分图，边权 $W(i, j)$ 表示左侧节点 $i$ 与右侧节点 $j$ 配对所能获得的收益。
    </p>
    <p>
      求一种一一对应的<b>完美匹配方案</b>，使得所有匹配边的<b>权值总和最大</b>（洛谷 P6577）。
    </p>

    <div style="background: #f8fafc; border-left: 4px solid #3b82f6; padding: 8px 12px; margin: 10px 0; border-radius: 0 6px 6px 0;">
      <div style="font-weight: 700; color: #1e40af; margin-bottom: 4px;">👑 顶标与相等子图定理</div>
      <div style="font-size: 11.5px; color: #334155;">
        为每个左点设定顶标 $lx[i]$，右点设定顶标 $ly[j]$，满足 $lx[i] + ly[j] \ge W(i, j)$。<br/>
        只保留满足 $lx[i] + ly[j] == W(i, j)$ 的边构成的图称为<b>相等子图</b>。根据对偶定理：<b>相等子图中的完美匹配必为全局最大权匹配</b>！
      </div>
    </div>
  </div>
`;

export const KM_ALGORITHM_ANALYSIS_HTML = `
  <div style="font-size: 13px; line-height: 1.6; color: #334155;">
    <h3 style="margin-top: 0; color: #0f172a; font-size: 15px; font-weight: 800;">💡 左程云 KM 算法顶标动态调整机制解析</h3>

    <div style="background: #eff6ff; border: 1px solid #bfdbfe; border-radius: 6px; padding: 10px; margin-bottom: 12px;">
      <div style="font-weight: 700; color: #1e3a8a; margin-bottom: 4px;">1. 增广失败时的自适应松弛</div>
      <div style="font-size: 12px; color: #1e40af;">
        当在现有相等子图中找不到增广路时，计算交错树内外边顶标差值的最小值 $d = \min (lx[u] + ly[v] - W(u, v))$。<br/>
        树内左点顶标减 $d$，树内右点顶标加 $d$。已有匹配边顶标和不变，同时<b>恰好将至少一条新边引入相等子图</b>！
      </div>
    </div>

    <div style="background: #f0fdf4; border: 1px solid #bbf7d0; border-radius: 6px; padding: 10px;">
      <div style="font-weight: 700; color: #166534; margin-bottom: 4px;">2. slack[] 数组极致优化</div>
      <div style="font-size: 12px; color: #15803d;">
        维护 <code>slack[v]</code> 实时记录右侧各点进入相等子图所需的最小顶标改变量，将每次顶标更新开销降至 $O(n)$，整体达成 $O(n^3)$ 极速收敛！
      </div>
    </div>
  </div>
`;
