/**
 * 岛屿数量 (Number of Islands · LeetCode 200)
 * 领域知识与题解精讲配置声明
 */

export const ISLANDS_PROBLEM_HTML = `
  <div style="display: flex; flex-direction: column; gap: 12px; color: #cbd5e1; font-size: 12px; line-height: 1.6;">
    <div style="display: flex; align-items: center; gap: 8px;">
      <span style="padding: 2px 6px; border-radius: 4px; background: rgba(59,130,246,0.2); color: #60a5fa; font-weight: 700; border: 1px solid rgba(59,130,246,0.3);">LeetCode 200</span>
      <span style="padding: 2px 6px; border-radius: 4px; background: rgba(245,158,11,0.2); color: #fbbf24; font-weight: 700; border: 1px solid rgba(245,158,11,0.3);">Medium</span>
      <h2 style="font-size: 14px; font-weight: 700; color: #ffffff; margin: 0;">岛屿数量 (Number of Islands)</h2>
    </div>
    <p style="margin: 0;">给你一个由 <code style="color: #38bdf8; font-family: monospace;">'1'</code>（陆地）和 <code style="color: #64748b; font-family: monospace;">'0'</code>（水）组成的的二维网格，请你计算网格中岛屿的数量。岛屿总是被水包围，并且每座岛屿只能由水平方向和/或竖直方向上相邻的陆地连接形成。此外，你可以假设该网格的四条边均被水包围。</p>
    <div style="padding: 10px; border-radius: 10px; background: #020617; border: 1px solid #1e293b; display: flex; flex-direction: column; gap: 6px; font-family: monospace; font-size: 11px;">
      <div style="color: #34d399; font-weight: 700;">示例:</div>
      <div>输入: grid = [</div>
      <div>&nbsp;&nbsp;["1","1","0","0","0"],</div>
      <div>&nbsp;&nbsp;["1","1","0","0","0"],</div>
      <div>&nbsp;&nbsp;["0","0","1","0","0"],</div>
      <div>&nbsp;&nbsp;["0","0","0","1","1"]</div>
      <div>]</div>
      <div>输出: 3</div>
    </div>
  </div>
`;

export const ISLANDS_ANALYSIS_HTML = `
  <div style="display: flex; flex-direction: column; gap: 12px; color: #cbd5e1; font-size: 12px; line-height: 1.6;">
    <h3 style="font-size: 14px; font-weight: 700; color: #ffffff; margin: 0; display: flex; align-items: center; gap: 6px;">
      <span>💡</span> 网格 DFS 沉岛法（染色淹没连通块）
    </h3>
    <div style="display: flex; flex-direction: column; gap: 8px;">
      <div style="padding: 10px; border-radius: 10px; background: #020617; border: 1px solid #1e293b;">
        <div style="font-weight: 700; color: #60a5fa; margin-bottom: 4px;">① 双重循环扫描与深度优先扩散</div>
        <p style="margin: 0; color: #94a3b8;">
        1. <strong>外层扫描：</strong> 双重循环遍历网格每一格 <code style="color: #38bdf8; font-family: monospace;">(r, c)</code>；<br/>
        2. <strong>发现新岛屿：</strong> 若遇到 <code style="color: #34d399; font-family: monospace;">grid[r][c] == '1'</code>，说明发现了一座新岛屿，<code style="color: #fbbf24; font-family: monospace;">count++</code>；<br/>
        3. <strong>DFS 淹没：</strong> 立即以此格为起点启动 DFS，沿上下左右四个方向扩散，把所有连通的 <code style="color: #38bdf8; font-family: monospace;">'1'</code> 沉没/标记为 <code style="color: #64748b; font-family: monospace;">'0'</code>（或 visited），避免重复统计。
        </p>
      </div>
      <div style="padding: 10px; border-radius: 10px; background: #020617; border: 1px solid #1e293b;">
        <div style="font-weight: 700; color: #34d399; margin-bottom: 4px;">② 复杂度分析</div>
        <p style="margin: 0; color: #94a3b8;">
        • 时间复杂度：<code style="color: #34d399; font-family: monospace;">O(M × N)</code>，每个网格单元格最多被访问一次。<br/>
        • 空间复杂度：<code style="color: #60a5fa; font-family: monospace;">O(M × N)</code>，最坏情况下整个网格全为陆地时的递归栈深度。
        </p>
      </div>
    </div>
  </div>
`;

export const ISLANDS_CODE_LANGUAGES: Record<string, string[]> = {
  java: [
    'public class Solution {',
    '    public int numIslands(char[][] grid) {',
    '        int count = 0;',
    '        for (int r = 0; r < grid.length; r++) {',
    '            for (int c = 0; c < grid[0].length; c++) {',
    '                if (grid[r][c] == \'1\') {',
    '                    count++;',
    '                    dfs(grid, r, c);',
    '                }',
    '            }',
    '        }',
    '        return count;',
    '    }',
    '    private void dfs(char[][] grid, int r, int c) {',
    '        if (r < 0 || r >= grid.length || c < 0 || c >= grid[0].length || grid[r][c] != \'1\') return;',
    '        grid[r][c] = \'0\'; // 沉岛标记',
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
    '    int numIslands(vector<vector<char>>& grid) {',
    '        int count = 0;',
    '        for (int r = 0; r < grid.size(); r++) {',
    '            for (int c = 0; c < grid[0].size(); c++) {',
    '                if (grid[r][c] == \'1\') {',
    '                    count++;',
    '                    dfs(grid, r, c);',
    '                }',
    '            }',
    '        }',
    '        return count;',
    '    }',
    '    void dfs(vector<vector<char>>& grid, int r, int c) {',
    '        if (r < 0 || r >= grid.size() || c < 0 || c >= grid[0].size() || grid[r][c] != \'1\') return;',
    '        grid[r][c] = \'0\';',
    '        dfs(grid, r + 1, c); dfs(grid, r - 1, c);',
    '        dfs(grid, r, c + 1); dfs(grid, r, c - 1);',
    '    }',
    '};',
  ],
  python: [
    'class Solution:',
    '    def numIslands(self, grid: list[list[str]]) -> int:',
    '        count = 0',
    '        m, n = len(grid), len(grid[0])',
    '        def dfs(r, c):',
    '            if r < 0 or r >= m or c < 0 or c >= n or grid[r][c] != \'1\':',
    '                return',
    '            grid[r][c] = \'0\'',
    '            dfs(r + 1, c); dfs(r - 1, c)',
    '            dfs(r, c + 1); dfs(r, c - 1)',
    '        for r in range(m):',
    '            for c in range(n):',
    '                if grid[r][c] == \'1\':',
    '                    count += 1',
    '                    dfs(r, c)',
    '        return count',
  ],
  javascript: [
    'var numIslands = function(grid) {',
    '    let count = 0;',
    '    const m = grid.length, n = grid[0].length;',
    '    const dfs = (r, c) => {',
    '        if (r < 0 || r >= m || c < 0 || c >= n || grid[r][c] !== \'1\') return;',
    '        grid[r][c] = \'0\';',
    '        dfs(r + 1, c); dfs(r - 1, c);',
    '        dfs(r, c + 1); dfs(r, c - 1);',
    '    };',
    '    for (let r = 0; r < m; r++) {',
    '        for (let c = 0; c < n; c++) {',
    '            if (grid[r][c] === \'1\') {',
    '                count++;',
    '                dfs(r, c);',
    '            }',
    '        }',
    '    }',
    '    return count;',
    '};',
  ],
};
