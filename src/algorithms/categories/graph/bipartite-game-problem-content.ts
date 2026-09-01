/**
 * 二分图博弈论与最大匹配必胜点 (Bipartite Graph Game)
 * 进阶博弈图论: 轮流移动棋子判定、先手必胜当且仅当起点属于所有最大匹配、交错轨 DFS 标记 (洛谷 P4055 [JSOI2009] 游戏)
 */

export const BIPARTITE_GAME_CODE_LANGUAGES: Record<string, string[]> = {
  cpp: [
    '#include <iostream>',
    '#include <vector>',
    '#include <algorithm>',
    'using namespace std;',
    '',
    '// 二分图博弈论算法 (洛谷 P4055 [JSOI2009] 游戏)',
    '// 核心：先手必胜 <=> 起点属于二分图的所有最大匹配；从非匹配点交错轨 DFS 找非必胜点',
    'class BipartiteGame {',
    'public:',
    '    int n, m;',
    '    vector<vector<int>> adj;',
    '    vector<int> matchLeft, matchRight;',
    '    vector<bool> vis, canBeUnmatched;',
    '    ',
    '    BipartiteGame(int n, int m) : n(n), m(m), adj(n + 1),',
    '                                  matchLeft(n + 1, 0), matchRight(m + 1, 0),',
    '                                  vis(max(n, m) + 1, false), canBeUnmatched(n + 1, false) {}',
    '    ',
    '    void addEdge(int u, int v) {',
    '        adj[u].push_back(v);',
    '    }',
    '    ',
    '    // 1. 匈牙利算法求最大匹配',
    '    bool dfsHungar(int u) {',
    '        for (int v : adj[u]) {',
    '            if (vis[v]) continue;',
    '            vis[v] = true;',
    '            if (!matchRight[v] || dfsHungar(matchRight[v])) {',
    '                matchRight[v] = u;',
    '                matchLeft[u] = v;',
    '                return true;',
    '            }',
    '        }',
    '        return false;',
    '    }',
    '    ',
    '    // 2. 从未匹配点出发在交错轨上 DFS 标记非必须匹配点',
    '    void dfsAlternate(int u) {',
    '        canBeUnmatched[u] = true;',
    '        for (int v : adj[u]) {',
    '            if (!vis[v] && matchRight[v] > 0) {',
    '                vis[v] = true;',
    '                dfsAlternate(matchRight[v]); // 沿匹配边退回左部',
    '            }',
    '        }',
    '    }',
    '    ',
    '    vector<int> getWinningStartNodes() {',
    '        for (int i = 1; i <= n; ++i) {',
    '            fill(vis.begin(), vis.end(), false);',
    '            dfsHungar(i);',
    '        }',
    '        ',
    '        fill(vis.begin(), vis.end(), false);',
    '        // 从所有未匹配的左部点出发探索交错轨',
    '        for (int i = 1; i <= n; ++i) {',
    '            if (!matchLeft[i]) dfsAlternate(i);',
    '        }',
    '        ',
    '        vector<int> winningNodes;',
    '        for (int i = 1; i <= n; ++i) {',
    '            // 既在当前最大匹配中，又无法被交错轨替换的点即为必胜起点',
    '            if (matchLeft[i] && !canBeUnmatched[i]) {',
    '                winningNodes.push_back(i);',
    '            }',
    '        }',
    '        return winningNodes;',
    '    }',
    '};',
  ],
  java: [
    'package advanced_game;',
    '',
    'import java.util.*;',
    '',
    '// 二分图博弈论标准实现 - 先手必胜点集',
    'public class Code01_BipartiteGame {',
    '    public static int n, m;',
    '    public static List<Integer>[] adj;',
    '    public static int[] matchLeft, matchRight;',
    '    public static boolean[] vis, canBeUnmatched;',
    '}',
  ],
  python: [
    'class BipartiteGame:',
    '    def __init__(self, n: int, m: int):',
    '        self.n = n',
    '        self.m = m',
    '        self.adj = [[] for _ in range(n + 1)]',
    '        self.match_left = [0] * (n + 1)',
    '        self.match_right = [0] * (m + 1)',
    '        self.can_be_unmatched = [False] * (n + 1)',
  ],
  javascript: [
    '// 二分图博弈论 (JavaScript 版)',
    'class BipartiteGame {',
    '  constructor(n, m) {',
    '    this.n = n;',
    '    this.m = m;',
    '    this.adj = Array.from({ length: n + 1 }, () => []);',
    '    this.matchLeft = Array(n + 1).fill(0);',
    '    this.matchRight = Array(m + 1).fill(0);',
    '    this.canBeUnmatched = Array(n + 1).fill(false);',
    '  }',
    '}',
  ],
};

export const BIPARTITE_GAME_PROBLEM_HTML = `
  <div style="font-size: 13px; line-height: 1.6; color: #334155;">
    <h3 style="margin-top: 0; color: #0f172a; font-size: 15px; font-weight: 800;">♟️ 二分图博弈论 (Bipartite Graph Game)</h3>
    <p>
      两人在二分图 $G=(X, Y, E)$ 上玩移动棋子博弈。先手选定起点 $S$，双方轮流将棋子沿未走过的边移动到相邻未访问节点，不能移动者判负（洛谷 P4055 [JSOI2009] 游戏）。
    </p>

    <div style="background: #f8fafc; border-left: 4px solid #3b82f6; padding: 8px 12px; margin: 10px 0; border-radius: 0 6px 6px 0;">
      <div style="font-weight: 700; color: #1e40af; margin-bottom: 4px;">👑 先手必胜判定定理</div>
      <div style="font-size: 11.5px; color: #334155;">
        <b>先手必胜当且仅当：起点 $S$ 属于二分图的“所有”最大匹配！</b><br/>
        若存在某个最大匹配不包含 $S$，后手可通过沿匹配边应对使先手最终无法移动（先手必败）。
      </div>
    </div>
  </div>
`;

export const BIPARTITE_GAME_ANALYSIS_HTML = `
  <div style="font-size: 13px; line-height: 1.6; color: #334155;">
    <h3 style="margin-top: 0; color: #0f172a; font-size: 15px; font-weight: 800;">💡 如何判定点是否属于“所有”最大匹配？</h3>

    <div style="background: #eff6ff; border: 1px solid #bfdbfe; border-radius: 6px; padding: 10px; margin-bottom: 12px;">
      <div style="font-weight: 700; color: #1e3a8a; margin-bottom: 4px;">1. 残量交错轨遍历法</div>
      <div style="font-size: 12px; color: #1e40af;">
        先求出一组基准最大匹配 $M$。从所有<b>未匹配点</b>出发在交错轨上 DFS（非匹配边 → 匹配边 → 非匹配边）。所有能被访问到的匹配点，通过交错轨异或倒戈后均可被替换出匹配（属于“非必须匹配点”）。
      </div>
    </div>

    <div style="background: #f0fdf4; border: 1px solid #bbf7d0; border-radius: 6px; padding: 10px;">
      <div style="font-weight: 700; color: #166534; margin-bottom: 4px;">2. 绝对不可替代的必胜点</div>
      <div style="font-size: 12px; color: #15803d;">
        那些在匹配中、且在任何从未匹配点出发的交错轨上都<b>无法被访问到</b>的节点，就是无论怎么换匹配方案都绝对无法剔除的<b>先手必胜起点 👑</b>！
      </div>
    </div>
  </div>
`;
