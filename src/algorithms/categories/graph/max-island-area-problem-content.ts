/**
 * 岛屿的最大面积 (Max Area of Island · LeetCode 695)
 * 领域知识与题解精讲配置声明
 */

export const MAX_ISLAND_AREA_PROBLEM_HTML = `
  <div style="display: flex; flex-direction: column; gap: 12px; color: #cbd5e1; font-size: 12px; line-height: 1.6;">
    <div style="display: flex; align-items: center; gap: 8px;">
      <span style="padding: 2px 6px; border-radius: 4px; background: rgba(59,130,246,0.2); color: #60a5fa; font-weight: 700; border: 1px solid rgba(59,130,246,0.3);">LeetCode 695</span>
      <span style="padding: 2px 6px; border-radius: 4px; background: rgba(245,158,11,0.2); color: #fbbf24; font-weight: 700; border: 1px solid rgba(245,158,11,0.3);">Medium</span>
      <h2 style="font-size: 14px; font-weight: 700; color: #ffffff; margin: 0;">岛屿的最大面积 (Max Area of Island)</h2>
    </div>
    <p style="margin: 0;">给你一个大小为 <code style="color: #38bdf8; font-family: monospace;">m x n</code> 的二进制矩阵 <code style="color: #38bdf8; font-family: monospace;">grid</code> 。岛屿是由一些相邻的 <code style="color: #38bdf8; font-family: monospace;">1</code> (代表土地) 构成的组合，这里的“相邻”要求两个 <code style="color: #38bdf8; font-family: monospace;">1</code> 必须在 <strong>水平或者竖直方向</strong> 上相邻。岛屿的 <strong>面积</strong> 是岛上值为 <code style="color: #38bdf8; font-family: monospace;">1</code> 的单元格的数目。计算并返回 <code style="color: #38bdf8; font-family: monospace;">grid</code> 中最大的岛屿面积。如果没有岛屿，则返回面积为 <code style="color: #f87171; font-family: monospace;">0</code> 。</p>
    <div style="padding: 10px; border-radius: 10px; background: #020617; border: 1px solid #1e293b; display: flex; flex-direction: column; gap: 6px; font-family: monospace; font-size: 11px;">
      <div style="color: #34d399; font-weight: 700;">示例:</div>
      <div>输入: grid = [[0,0,1,0,0,0,0,1,0,0,0,0,0], [0,0,0,0,0,0,0,1,1,1,0,0,0], ...]</div>
      <div>输出: 6 (最大的连续连通块包含 6 个 '1')</div>
    </div>
  </div>
`;

export const MAX_ISLAND_AREA_ANALYSIS_HTML = `
  <div style="display: flex; flex-direction: column; gap: 12px; color: #cbd5e1; font-size: 12px; line-height: 1.6;">
    <h3 style="font-size: 14px; font-weight: 700; color: #ffffff; margin: 0; display: flex; align-items: center; gap: 6px;">
      <span>💡</span> DFS 递归计数与全局最大值更新
    </h3>
    <div style="display: flex; flex-direction: column; gap: 8px;">
      <div style="padding: 10px; border-radius: 10px; background: #020617; border: 1px solid #1e293b;">
        <div style="font-weight: 700; color: #60a5fa; margin-bottom: 4px;">① DFS 递归返回值面积累加</div>
        <p style="margin: 0; color: #94a3b8;">
        1. <strong>终止条件：</strong> 越界或遇水 <code style="color: #f87171; font-family: monospace;">if (r < 0 || r >= m || c < 0 || c >= n || grid[r][c] == 0) return 0;</code>；<br/>
        2. <strong>沉岛染色：</strong> <code style="color: #38bdf8; font-family: monospace;">grid[r][c] = 0;</code>；<br/>
        3. <strong>面积公式归约：</strong> <code style="color: #34d399; font-family: monospace;">return 1 + dfs(r+1,c) + dfs(r-1,c) + dfs(r,c+1) + dfs(r,c-1);</code>；<br/>
        4. <strong>全局最大值比对：</strong> <code style="color: #fbbf24; font-family: monospace;">maxArea = Math.max(maxArea, area);</code>。
        </p>
      </div>
      <div style="padding: 10px; border-radius: 10px; background: #020617; border: 1px solid #1e293b;">
        <div style="font-weight: 700; color: #34d399; margin-bottom: 4px;">② 复杂度分析</div>
        <p style="margin: 0; color: #94a3b8;">
        • 时间复杂度：<code style="color: #34d399; font-family: monospace;">O(M × N)</code>，每个网格至多访问一次。<br/>
        • 空间复杂度：<code style="color: #60a5fa; font-family: monospace;">O(M × N)</code>，递归栈空间。
        </p>
      </div>
    </div>
  </div>
`;

export const MAX_ISLAND_AREA_CODE_LANGUAGES: Record<string, string[]> = {
  java: [
    'public class Solution {',
    '    public int maxAreaOfIsland(int[][] grid) {',
    '        int maxArea = 0;',
    '        for (int r = 0; r < grid.length; r++) {',
    '            for (int c = 0; c < grid[0].length; c++) {',
    '                if (grid[r][c] == 1) {',
    '                    maxArea = Math.max(maxArea, dfs(grid, r, c));',
    '                }',
    '            }',
    '        }',
    '        return maxArea;',
    '    }',
    '    private int dfs(int[][] grid, int r, int c) {',
    '        if (r < 0 || r >= grid.length || c < 0 || c >= grid[0].length || grid[r][c] == 0) return 0;',
    '        grid[r][c] = 0; // 沉岛',
    '        return 1 + dfs(grid, r + 1, c) + dfs(grid, r - 1, c) + dfs(grid, r, c + 1) + dfs(grid, r, c - 1);',
    '    }',
    '}',
  ],
  cpp: [
    'class Solution {',
    'public:',
    '    int maxAreaOfIsland(vector<vector<int>>& grid) {',
    '        int maxArea = 0;',
    '        for (int r = 0; r < grid.size(); r++) {',
    '            for (int c = 0; c < grid[0].size(); c++) {',
    '                if (grid[r][c] == 1) {',
    '                    maxArea = max(maxArea, dfs(grid, r, c));',
    '                }',
    '            }',
    '        }',
    '        return maxArea;',
    '    }',
    '    int dfs(vector<vector<int>>& grid, int r, int c) {',
    '        if (r < 0 || r >= grid.size() || c < 0 || c >= grid[0].size() || grid[r][c] == 0) return 0;',
    '        grid[r][c] = 0;',
    '        return 1 + dfs(grid, r + 1, c) + dfs(grid, r - 1, c) + dfs(grid, r, c + 1) + dfs(grid, r, c - 1);',
    '    }',
    '};',
  ],
  python: [
    'class Solution:',
    '    def maxAreaOfIsland(self, grid: list[list[int]]) -> int:',
    '        m, n = len(grid), len(grid[0])',
    '        def dfs(r, c):',
    '            if r < 0 or r >= m or c < 0 or c >= n or grid[r][c] == 0:',
    '                return 0',
    '            grid[r][c] = 0',
    '            return 1 + dfs(r + 1, c) + dfs(r - 1, c) + dfs(r, c + 1) + dfs(r, c - 1)',
    '        max_area = 0',
    '        for r in range(m):',
    '            for c in range(n):',
    '                if grid[r][c] == 1:',
    '                    max_area = max(max_area, dfs(r, c))',
    '        return max_area',
  ],
  javascript: [
    'var maxAreaOfIsland = function(grid) {',
    '    let maxArea = 0;',
    '    const m = grid.length, n = grid[0].length;',
    '    const dfs = (r, c) => {',
    '        if (r < 0 || r >= m || c < 0 || c >= n || grid[r][c] === 0) return 0;',
    '        grid[r][c] = 0;',
    '        return 1 + dfs(r + 1, c) + dfs(r - 1, c) + dfs(r, c + 1) + dfs(r, c - 1);',
    '    };',
    '    for (let r = 0; r < m; r++) {',
    '        for (let c = 0; c < n; c++) {',
    '            if (grid[r][c] === 1) {',
    '                maxArea = Math.max(maxArea, dfs(r, c));',
    '            }',
    '        }',
    '    }',
    '    return maxArea;',
    '};',
  ],
};
