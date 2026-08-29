/**
 * Floyd-Warshall 全源最短路径算法 (Floyd-Warshall Algorithm)
 * 领域知识与题解精讲配置声明
 */

export const FLOYD_PROBLEM_HTML = `
  <div style="display: flex; flex-direction: column; gap: 12px; color: #cbd5e1; font-size: 12px; line-height: 1.6;">
    <div style="display: flex; align-items: center; gap: 8px;">
      <span style="padding: 2px 6px; border-radius: 4px; background: rgba(59,130,246,0.2); color: #60a5fa; font-weight: 700; border: 1px solid rgba(59,130,246,0.3);">Graph Theory</span>
      <span style="padding: 2px 6px; border-radius: 4px; background: rgba(245,158,11,0.2); color: #fbbf24; font-weight: 700; border: 1px solid rgba(245,158,11,0.3);">Medium</span>
      <h2 style="font-size: 14px; font-weight: 700; color: #ffffff; margin: 0;">Floyd-Warshall 多源最短路径算法</h2>
    </div>
    <p style="margin: 0;">计算图中 <strong>任意两点之间 (All-Pairs)</strong> 的最短路径长度。基于 <strong>动态规划（DP）</strong> 思想，逐步允许引入中间中转顶点集合 <code style="color: #38bdf8; font-family: monospace;">k ∈ {0, 1, ..., n-1}</code> 进行矩阵状态转移。</p>
    <div style="padding: 10px; border-radius: 10px; background: #020617; border: 1px solid #1e293b; display: flex; flex-direction: column; gap: 6px; font-family: monospace; font-size: 11px;">
      <div style="color: #34d399; font-weight: 700;">DP 状态转移方程:</div>
      <div><code style="color: #38bdf8;">dp[k][i][j] = min(dp[k-1][i][j], dp[k-1][i][k] + dp[k-1][k][j])</code></div>
      <div>降维空间压缩后: <code style="color: #34d399;">dp[i][j] = min(dp[i][j], dp[i][k] + dp[k][j])</code> (最外层循环必须是 k)。</div>
    </div>
  </div>
`;

export const FLOYD_ANALYSIS_HTML = `
  <div style="display: flex; flex-direction: column; gap: 12px; color: #cbd5e1; font-size: 12px; line-height: 1.6;">
    <h3 style="font-size: 14px; font-weight: 700; color: #ffffff; margin: 0; display: flex; align-items: center; gap: 6px;">
      <span>💡</span> 中间中转点阶段推进与矩阵松弛
    </h3>
    <div style="display: flex; flex-direction: column; gap: 8px;">
      <div style="padding: 10px; border-radius: 10px; background: #020617; border: 1px solid #1e293b;">
        <div style="font-weight: 700; color: #60a5fa; margin-bottom: 4px;">① 三重循环机制</div>
        <p style="margin: 0; color: #94a3b8;">
        1. <strong>外层 k（中转点）：</strong> 阶段推进，每次尝试将节点 <code style="color: #fbbf24; font-family: monospace;">k</code> 作为中转点；<br/>
        2. <strong>中层 i（起点）：</strong> 枚举所有可能的路径起点；<br/>
        3. <strong>内层 j（终点）：</strong> 枚举所有可能的路径终点；<br/>
        4. <strong>转移更新：</strong> 若 <code style="color: #34d399; font-family: monospace;">dist[i][k] + dist[k][j] < dist[i][j]</code>，则更新 <code style="color: #34d399; font-family: monospace;">dist[i][j]</code>。
        </p>
      </div>
      <div style="padding: 10px; border-radius: 10px; background: #020617; border: 1px solid #1e293b;">
        <div style="font-weight: 700; color: #34d399; margin-bottom: 4px;">② 复杂度与适用场景</div>
        <p style="margin: 0; color: #94a3b8;">
        • 时间复杂度：<code style="color: #34d399; font-family: monospace;">O(V³)</code>。<br/>
        • 空间复杂度：<code style="color: #60a5fa; font-family: monospace;">O(V²)</code>（二维距离矩阵）。<br/>
        • 代码实现极其精简（仅 5 行核心循环），适合顶点数较小（V ≤ 300）的多源最短路与传递闭包计算。
        </p>
      </div>
    </div>
  </div>
`;

export const FLOYD_CODE_LANGUAGES: Record<string, string[]> = {
  java: [
    'public class Solution {',
    '    public int[][] floydWarshall(int n, int[][] edges) {',
    '        int[][] dist = new int[n][n];',
    '        for (int[] row : dist) Arrays.fill(row, 1000000);',
    '        for (int i = 0; i < n; i++) dist[i][i] = 0;',
    '        for (int[] e : edges) dist[e[0]][e[1]] = e[2];',
    '        for (int k = 0; k < n; k++) { // 中转点',
    '            for (int i = 0; i < n; i++) { // 起点',
    '                for (int j = 0; j < n; j++) { // 终点',
    '                    if (dist[i][k] + dist[k][j] < dist[i][j]) {',
    '                        dist[i][j] = dist[i][k] + dist[k][j];',
    '                    }',
    '                }',
    '            }',
    '        }',
    '        return dist;',
    '    }',
    '}',
  ],
  cpp: [
    'vector<vector<int>> floydWarshall(int n, vector<vector<int>>& edges) {',
    '    vector<vector<int>> dist(n, vector<int>(n, 1e6));',
    '    for (int i = 0; i < n; i++) dist[i][i] = 0;',
    '    for (auto& e : edges) dist[e[0]][e[1]] = e[2];',
    '    for (int k = 0; k < n; k++) {',
    '        for (int i = 0; i < n; i++) {',
    '            for (int j = 0; j < n; j++) {',
    '                if (dist[i][k] + dist[k][j] < dist[i][j]) {',
    '                    dist[i][j] = dist[i][k] + dist[k][j];',
    '                }',
    '            }',
    '        }',
    '    }',
    '    return dist;',
    '}',
  ],
  python: [
    'def floyd_warshall(n: int, edges: list[tuple[int, int, int]]) -> list[list[int]]:',
    '    dist = [[float("inf")] * n for _ in range(n)]',
    '    for i in range(n): dist[i][i] = 0',
    '    for u, v, w in edges: dist[u][v] = w',
    '    for k in range(n):',
    '        for i in range(n):',
    '            for j in range(n):',
    '                if dist[i][k] + dist[k][j] < dist[i][j]:',
    '                    dist[i][j] = dist[i][k] + dist[k][j]',
    '    return dist',
  ],
  javascript: [
    'function floydWarshall(n, edges) {',
    '    const dist = Array.from({ length: n }, () => new Array(n).fill(Infinity));',
    '    for (let i = 0; i < n; i++) dist[i][i] = 0;',
    '    for (const [u, v, w] of edges) dist[u][v] = w;',
    '    for (let k = 0; k < n; k++) {',
    '        for (let i = 0; i < n; i++) {',
    '            for (let j = 0; j < n; j++) {',
    '                if (dist[i][k] + dist[k][j] < dist[i][j]) {',
    '                    dist[i][j] = dist[i][k] + dist[k][j];',
    '                }',
    '            }',
    '        }',
    '    }',
    '    return dist;',
    '}',
  ],
};
