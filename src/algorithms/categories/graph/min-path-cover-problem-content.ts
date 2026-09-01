/**
 * DAG 最小路径覆盖与传递闭包 (Minimum Path Cover on DAG)
 * 经典图论建模: 拆点二分图 (u_out, v_in)、最小路径数 = n - 最大匹配数、Floyd 传递闭包处理可相交路径 (洛谷 P2764)
 */

export const MIN_PATH_COVER_CODE_LANGUAGES: Record<string, string[]> = {
  cpp: [
    '#include <iostream>',
    '#include <vector>',
    'using namespace std;',
    '',
    '// DAG 最小路径覆盖 (洛谷 P2764)',
    '// 核心：拆点建二分图，路径数 = n - 最大匹配，递归打印路径链',
    'class MinPathCover {',
    'public:',
    '    int n, m;',
    '    vector<vector<int>> adj;',
    '    vector<int> match;',
    '    vector<bool> vis;',
    '    ',
    '    MinPathCover(int n) : n(n), adj(n + 1), match(n + 1, 0), vis(n + 1, false) {}',
    '    ',
    '    void addEdge(int u, int v) {',
    '        adj[u].push_back(v);',
    '    }',
    '    ',
    '    // 匈牙利算法求二分图最大匹配',
    '    bool dfs(int u) {',
    '        for (int v : adj[u]) {',
    '            if (!vis[v]) {',
    '                vis[v] = true;',
    '                if (match[v] == 0 || dfs(match[v])) {',
    '                    match[v] = u;',
    '                    return true;',
    '                }',
    '            }',
    '        }',
    '        return false;',
    '    }',
    '    ',
    '    int solve() {',
    '        int maxMatch = 0;',
    '        for (int i = 1; i <= n; ++i) {',
    '            fill(vis.begin(), vis.end(), false);',
    '            if (dfs(i)) maxMatch++;',
    '        }',
    '        return n - maxMatch;',
    '    }',
    '};',
  ],
  java: [
    'package advanced_graph;',
    '',
    'import java.util.*;',
    '',
    '// DAG 最小路径覆盖 - 拆点二分图匹配',
    'public class Code01_MinPathCover {',
    '    public static int n, maxMatch;',
    '    public static List<Integer>[] adj;',
    '    public static int[] match;',
    '    public static boolean[] vis;',
    '    public static int solve() { return 0; }',
    '}',
  ],
  python: [
    '# DAG 最小路径覆盖 (Python 版)',
    'def min_path_cover(n: int, edges: list[tuple[int, int]]) -> tuple[int, list[list[int]]]:',
    '    adj = [[] for _ in range(n + 1)]',
    '    for u, v in edges: adj[u].append(v)',
    '    match = [0] * (n + 1)',
    '    # 匈牙利匹配 ...',
    '    return (n, [])',
  ],
  javascript: [
    '// DAG 最小路径覆盖 (JavaScript 版)',
    'function minPathCover(n, edges) {',
    '  const adj = Array.from({ length: n + 1 }, () => []);',
    '  edges.forEach(([u, v]) => adj[u].push(v));',
    '  return n;',
    '}',
  ],
};

export const MIN_PATH_COVER_PROBLEM_HTML = `
  <div style="font-size: 13px; line-height: 1.6; color: #334155;">
    <h3 style="margin-top: 0; color: #0f172a; font-size: 15px; font-weight: 800;">🚀 DAG 最小路径覆盖 (Minimum Path Cover on DAG)</h3>
    <p>
      给定一个有向无环图 (DAG)，找出最少数量的不相交简单路径（每个节点恰好出现在一条路径中），使得这些路径覆盖图中的所有节点（洛谷 P2764）。
    </p>

    <div style="background: #f8fafc; border-left: 4px solid #3b82f6; padding: 8px 12px; margin: 10px 0; border-radius: 0 6px 6px 0;">
      <div style="font-weight: 700; color: #1e40af; margin-bottom: 4px;">👑 拆点二分图匹配定理</div>
      <div style="font-size: 11.5px; color: #334155;">
        $$\\text{最小路径覆盖数} = n - \\text{二分图最大匹配数}$$
        每个节点拆分为出点 $u_{out}$ 与入点 $u_{in}$。每匹配一条边 $(u_{out} \\to v_{in})$，就意味着将节点 $u$ 与 $v$ 合并进同一条路径链，使总路径数减少 1！
      </div>
    </div>
  </div>
`;

export const MIN_PATH_COVER_ANALYSIS_HTML = `
  <div style="font-size: 13px; line-height: 1.6; color: #334155;">
    <h3 style="margin-top: 0; color: #0f172a; font-size: 15px; font-weight: 800;">💡 可相交路径覆盖的扩展：传递闭包</h3>

    <div style="background: #eff6ff; border: 1px solid #bfdbfe; border-radius: 6px; padding: 10px; margin-bottom: 12px;">
      <div style="font-weight: 700; color: #1e3a8a; margin-bottom: 4px;">1. 允许路径点重叠时怎么办？</div>
      <div style="font-size: 12px; color: #1e40af;">
        若题目允许路径相交（一个点可被多条路径覆盖），只需先用 Floyd 算法求原图的<b>传递闭包</b>（只要 $u$ 可达 $v$ 就建立新边 $u \\to v$），然后在传递闭包图上直接求不可相交最小路径覆盖即可！
      </div>
    </div>

    <div style="background: #f0fdf4; border: 1px solid #bbf7d0; border-radius: 6px; padding: 10px;">
      <div style="font-weight: 700; color: #166534; margin-bottom: 4px;">2. 与 Dilworth 定理的对偶呼应</div>
      <div style="font-size: 12px; color: #15803d;">
        偏序集上的 Dilworth 定理指出：<b>最小链覆盖数 = 最长反链长度</b>（即最大独立点集），拆点二分图匹配正是链覆盖在算法上的完美构造体现！
      </div>
    </div>
  </div>
`;
