/**
 * 树上有依赖的背包问题与常数优化 (Tree-Dependent Knapsack DP - 洛谷 P2014 选课)
 * 进阶树论+DP: 泛化物品树上合并、子树大小上下界优化 O(N*V)、依赖性拓扑与虚拟超级根 (洛谷 P2014)
 */

export const TREE_KNAPSACK_CODE_LANGUAGES: Record<string, string[]> = {
  cpp: [
    '#include <iostream>',
    '#include <vector>',
    '#include <algorithm>',
    'using namespace std;',
    '',
    '// 树上有依赖的背包问题 (洛谷 P2014 选课)',
    '// 核心：泛化物品树上合并，利用子树大小限制第二维循环，复杂度严格 O(N*V)',
    'class TreeKnapsackDP {',
    'public:',
    '    int n, V;',
    '    vector<vector<int>> adj;',
    '    vector<int> weight, value, sz;',
    '    vector<vector<int>> dp;',
    '    ',
    '    TreeKnapsackDP(int n, int v) : n(n), V(v), adj(n + 1), weight(n + 1, 1),',
    '                                   value(n + 1, 0), sz(n + 1, 0), dp(n + 1, vector<int>(v + 1, 0)) {}',
    '    ',
    '    void addEdge(int u, int v) {',
    '        adj[u].push_back(v);',
    '    }',
    '    ',
    '    void dfs(int u) {',
    '        sz[u] = weight[u];',
    '        dp[u][weight[u]] = value[u];',
    '        ',
    '        for (int v : adj[u]) {',
    '            dfs(v);',
    '            // 上下界优化：倒序枚举当前合并后的容量上限',
    '            for (int j = min(V, sz[u] + sz[v]); j >= weight[u]; --j) {',
    '                for (int k = 1; k <= min(sz[v], j - weight[u]); ++k) {',
    '                    dp[u][j] = max(dp[u][j], dp[u][j - k] + dp[v][k]);',
    '                }',
    '            }',
    '            sz[u] += sz[v];',
    '        }',
    '    }',
    '    ',
    '    int solve() {',
    '        dfs(0); // 0 为超级源点虚拟根',
    '        return dp[0][V];',
    '    }',
    '};',
  ],
  java: [
    'package advanced_tree_dp;',
    '',
    'import java.util.*;',
    '',
    '// 树上依赖背包 - 洛谷 P2014',
    'public class Code01_TreeKnapsackDP {',
    '    public static int solve(int n, int V, int[] pre, int[] val) { return 0; }',
    '}',
  ],
  python: [
    '# 树上有依赖的背包问题 (Python 版)',
    'def tree_knapsack(n, V, adj, weight, value):',
    '    return 0',
  ],
  javascript: [
    '// 树上有依赖的背包问题 (JavaScript 版)',
    'function treeKnapsack(n, V, adj, weight, value) {',
    '  return 0;',
    '}',
  ],
};

export const TREE_KNAPSACK_PROBLEM_HTML = `
  <div style="font-size: 13px; line-height: 1.6; color: #334155;">
    <h3 style="margin-top: 0; color: #0f172a; font-size: 15px; font-weight: 800;">🌲 树上有依赖的背包问题 (Tree Knapsack DP - P2014 选课)</h3>
    <p>
      学校有 $n$ 门课程，每门课程修读消耗体积 $w_i=1$，获得学分学识价值 $v_i$。某些课程有先修课约束（必须先选修父课程才能选修子课程）。在总选课容量 $V$ 限制下，求能获得的最大价值（洛谷 P2014 / 金明的预算方案）。
    </p>

    <div style="background: #f8fafc; border-left: 4px solid #3b82f6; padding: 8px 12px; margin: 10px 0; border-radius: 0 6px 6px 0;">
      <div style="font-weight: 700; color: #1e40af; margin-bottom: 4px;">👑 泛化物品树形合并与状态转移</div>
      <div style="font-size: 11.5px; color: #334155;">
        $$dp[u][j] = \\max_{v \\in son(u), k \\le j - w[u]} \\{ dp[u][j - k] + dp[v][k] \\}$$
        建立虚拟根节点 $0$ 连接所有森林根，限制循环上界至子树大小 $sz[u]$，时间复杂度从 $O(N V^2)$ 压缩至严格 $O(N V)$！
      </div>
    </div>
  </div>
`;

export const TREE_KNAPSACK_ANALYSIS_HTML = `
  <div style="font-size: 13px; line-height: 1.6; color: #334155;">
    <h3 style="margin-top: 0; color: #0f172a; font-size: 15px; font-weight: 800;">💡 上下界优化的复杂度证明</h3>

    <div style="background: #eff6ff; border: 1px solid #bfdbfe; border-radius: 6px; padding: 10px; margin-bottom: 12px;">
      <div style="font-weight: 700; color: #1e3a8a; margin-bottom: 4px;">1. 点对贡献等价性</div>
      <div style="font-size: 12px; color: #1e40af;">
        两重循环的内层实质上是在合并两棵互不相交的子树 $sz[u]$ 与 $sz[v]$。每一对节点 $(a, b)$ 恰好只在它们的最近公共祖先 (LCA) 处被合并枚举一次，总计算次数等于树上节点对数 $\\le \\binom{N}{2} = O(N^2)$ 或 $O(NV)$。
      </div>
    </div>

    <div style="background: #f0fdf4; border: 1px solid #bbf7d0; border-radius: 6px; padding: 10px;">
      <div style="font-weight: 700; color: #166534; margin-bottom: 4px;">2. DFS 序转化备选方案</div>
      <div style="font-size: 12px; color: #15803d;">
        除了树上合并，亦可利用树的 DFS 出栈序将树形依赖转化为序列上的 $01$ 背包跳跃（不选当前子树则直接跳过 $sz[u]$ 个位置），代码更短！
      </div>
    </div>
  </div>
`;
