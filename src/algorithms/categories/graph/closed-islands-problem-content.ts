/**
 * 统计封闭岛屿的数目 (Number of Closed Islands · LeetCode 1254)
 * 领域知识与题解精讲配置声明
 */

export const CLOSED_ISLANDS_PROBLEM_HTML = `
  <div style="display: flex; flex-direction: column; gap: 12px; color: #cbd5e1; font-size: 12px; line-height: 1.6;">
    <div style="display: flex; align-items: center; gap: 8px;">
      <span style="padding: 2px 6px; border-radius: 4px; background: rgba(59,130,246,0.2); color: #60a5fa; font-weight: 700; border: 1px solid rgba(59,130,246,0.3);">LeetCode 1254</span>
      <span style="padding: 2px 6px; border-radius: 4px; background: rgba(245,158,11,0.2); color: #fbbf24; font-weight: 700; border: 1px solid rgba(245,158,11,0.3);">Medium</span>
      <h2 style="font-size: 14px; font-weight: 700; color: #ffffff; margin: 0;">统计封闭岛屿的数目 (Closed Islands)</h2>
    </div>
    <p style="margin: 0;">二维矩阵网格由 <code style="color: #34d399; font-family: monospace;">0</code>（陆地）和 <code style="color: #60a5fa; font-family: monospace;">1</code>（水域）组成。岛屿是由上下左右 4 个方向相连的 <code style="color: #34d399; font-family: monospace;">0</code> 组成的最大连通块。<br/>
    如果一个岛屿<strong>完全由水域 1 包围</strong>（即岛屿的任何陆地都不接触网格的四条外边界），则称该岛屿为<strong>封闭岛屿</strong>。请计算并返回封闭岛屿的数目。</p>
    <div style="padding: 10px; border-radius: 10px; background: #020617; border: 1px solid #1e293b; display: flex; flex-direction: column; gap: 6px; font-family: monospace; font-size: 11px;">
      <div style="color: #34d399; font-weight: 700;">核心破局思维：先淹边界，再数内陆</div>
      <div>1. 边界上的陆地（以及与其连通的陆地）绝对不可能被水域完全封闭，必须首先从边界发起 DFS 全部淹没为 1；<br/>
      2. 边界清理完毕后，网格内部剩下的所有陆地连通块，必然都是 100% 真正被水域环绕的封闭孤岛！</div>
    </div>
  </div>
`;

export const CLOSED_ISLANDS_ANALYSIS_HTML = `
  <div style="display: flex; flex-direction: column; gap: 12px; color: #cbd5e1; font-size: 12px; line-height: 1.6;">
    <h3 style="font-size: 14px; font-weight: 700; color: #ffffff; margin: 0; display: flex; align-items: center; gap: 6px;">
      <span>💡</span> 两阶段泛洪浸没算法模型
    </h3>
    <div style="display: flex; flex-direction: column; gap: 8px;">
      <div style="padding: 10px; border-radius: 10px; background: #020617; border: 1px solid #1e293b;">
        <div style="font-weight: 700; color: #60a5fa; margin-bottom: 4px;">阶段一：边界连通块定向淹没 (Pre-Flood Boundary)</div>
        <p style="margin: 0; color: #94a3b8;">
        遍历矩阵第 0 行、第 m-1 行、第 0 列、第 n-1 列，若遭遇 <code style="color: #34d399; font-family: monospace;">grid[r][c] == 0</code>，立即发起 DFS 将与其相连的所有陆地全数置为 <code style="color: #60a5fa; font-family: monospace;">1</code>。<br/>
        排除所有通向边界的“伪孤岛”，消除边缘效应。
        </p>
      </div>
      <div style="padding: 10px; border-radius: 10px; background: #020617; border: 1px solid #1e293b;">
        <div style="font-weight: 700; color: #34d399; margin-bottom: 4px;">阶段二：内部网格闭包计数 (Count Inner Closed Islands)</div>
        <p style="margin: 0; color: #94a3b8;">
        双重循环扫描内部单元格 <code style="color: #facc15; font-family: monospace;">[1..m-2][1..n-2]</code>：<br/>
        当命中 <code style="color: #34d399; font-family: monospace;">grid[r][c] == 0</code> 时，必然对应一座全新的封闭岛屿：<code style="color: #fbbf24; font-family: monospace;">count++</code>，随后 DFS 浸没该连通块防止重复统计。
        </p>
      </div>
      <div style="padding: 10px; border-radius: 10px; background: #020617; border: 1px solid #1e293b;">
        <div style="font-weight: 700; color: #a855f7; margin-bottom: 4px;">复杂度分析</div>
        <p style="margin: 0; color: #94a3b8;">
        • 时间复杂度：<code style="color: #34d399; font-family: monospace;">O(M × N)</code>，每个网格单元最多被访问两次。<br/>
        • 空间复杂度：<code style="color: #60a5fa; font-family: monospace;">O(M × N)</code>，最坏情况下 DFS 递归调用栈的深度。
        </p>
      </div>
    </div>
  </div>
`;

export const CLOSED_ISLANDS_CODE_LANGUAGES: Record<string, string[]> = {
  java: [
    'public class Solution {',
    '    public int closedIsland(int[][] grid) {',
    '        int m = grid.length, n = grid[0].length;',
    '        // 阶段一：淹没四周边界相连的陆地 (0 -> 1)',
    '        for (int i = 0; i < m; i++) {',
    '            dfs(grid, i, 0);',
    '            dfs(grid, i, n - 1);',
    '        }',
    '        for (int j = 0; j < n; j++) {',
    '            dfs(grid, 0, j);',
    '            dfs(grid, m - 1, j);',
    '        }',
    '        // 阶段二：遍历网格内部，统计真正被封闭的孤岛',
    '        int count = 0;',
    '        for (int i = 1; i < m - 1; i++) {',
    '            for (int j = 1; j < n - 1; j++) {',
    '                if (grid[i][j] == 0) {',
    '                    count++;',
    '                    dfs(grid, i, j);',
    '                }',
    '            }',
    '        }',
    '        return count;',
    '    }',
    '    private void dfs(int[][] grid, int r, int c) {',
    '        if (r < 0 || r >= grid.length || c < 0 || c >= grid[0].length || grid[r][c] == 1) return;',
    '        grid[r][c] = 1; // 淹没为水域',
    '        dfs(grid, r + 1, c);',
    '        dfs(grid, r - 1, c);',
    '        dfs(grid, r, c + 1);',
    '        dfs(grid, r, c - 1);',
    '    }',
    '}',
  ],
  cpp: [
    'class Solution {',
    'public:',
    '    int closedIsland(vector<vector<int>>& grid) {',
    '        int m = grid.size(), n = grid[0].size();',
    '        // 阶段一：淹没四周边界相连的陆地 (0 -> 1)',
    '        for (int i = 0; i < m; i++) {',
    '            dfs(grid, i, 0);',
    '            dfs(grid, i, n - 1);',
    '        }',
    '        for (int j = 0; j < n; j++) {',
    '            dfs(grid, 0, j);',
    '            dfs(grid, m - 1, j);',
    '        }',
    '        // 阶段二：遍历网格内部，统计真正封闭的孤岛',
    '        int count = 0;',
    '        for (int i = 1; i < m - 1; i++) {',
    '            for (int j = 1; j < n - 1; j++) {',
    '                if (grid[i][j] == 0) {',
    '                    count++;',
    '                    dfs(grid, i, j);',
    '                }',
    '            }',
    '        }',
    '        return count;',
    '    }',
    '    void dfs(vector<vector<int>>& grid, int r, int c) {',
    '        if (r < 0 || r >= grid.size() || c < 0 || c >= grid[0].size() || grid[r][c] == 1) return;',
    '        grid[r][c] = 1;',
    '        dfs(grid, r + 1, c);',
    '        dfs(grid, r - 1, c);',
    '        dfs(grid, r, c + 1);',
    '        dfs(grid, r, c - 1);',
    '    }',
    '};',
  ],
  python: [
    'class Solution:',
    '    def closedIsland(self, grid: List[List[int]]) -> int:',
    '        m, n = len(grid), len(grid[0])',
    '        def dfs(r, c):',
    '            if r < 0 or r >= m or c < 0 or c >= n or grid[r][c] == 1:',
    '                return',
    '            grid[r][c] = 1',
    '            dfs(r + 1, c); dfs(r - 1, c)',
    '            dfs(r, c + 1); dfs(r, c - 1)',
    '        # 阶段一：淹没所有边界连通的非封闭陆地',
    '        for i in range(m):',
    '            dfs(i, 0); dfs(i, n - 1)',
    '        for j in range(n):',
    '            dfs(0, j); dfs(m - 1, j)',
    '        # 阶段二：统计网格内部封闭岛屿',
    '        count = 0',
    '        for i in range(1, m - 1):',
    '            for j in range(1, n - 1):',
    '                if grid[i][j] == 0:',
    '                    count += 1',
    '                    dfs(i, j)',
    '        return count',
  ],
  javascript: [
    'var closedIsland = function(grid) {',
    '    const m = grid.length, n = grid[0].length;',
    '    function dfs(r, c) {',
    '        if (r < 0 || r >= m || c < 0 || c >= n || grid[r][c] === 1) return;',
    '        grid[r][c] = 1;',
    '        dfs(r + 1, c); dfs(r - 1, c);',
    '        dfs(r, c + 1); dfs(r, c - 1);',
    '    }',
    '    // 阶段一：淹没边界相连陆地',
    '    for (let i = 0; i < m; i++) {',
    '        dfs(i, 0); dfs(i, n - 1);',
    '    }',
    '    for (let j = 0; j < n; j++) {',
    '        dfs(0, j); dfs(m - 1, j);',
    '    }',
    '    // 阶段二：统计内部封闭岛',
    '    let count = 0;',
    '    for (let i = 1; i < m - 1; i++) {',
    '        for (let j = 1; j < n - 1; j++) {',
    '            if (grid[i][j] === 0) {',
    '                count++;',
    '                dfs(i, j);',
    '            }',
    '        }',
    '    }',
    '    return count;',
    '};',
  ],
};
