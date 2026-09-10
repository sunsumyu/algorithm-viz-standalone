/**
 * 力扣 463. 岛屿的周长 (Island Perimeter)
 * 题目解析、算法精讲与四语言源码
 */

export const COASTLINE_PROBLEM_HTML = `
<div style="line-height: 1.7; font-size: 13.5px; color: #cbd5e1;">
  <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 12px;">
    <span style="font-weight: 800; font-size: 16px; color: #f8fafc;">463. 岛屿的周长</span>
    <span style="background: #065f46; color: #6ee7b7; font-size: 11px; font-weight: 700; padding: 2px 8px; border-radius: 4px;">简单 / Easy</span>
  </div>

  <p>给定一个 <code>row x col</code> 的二维网格地图 <code>grid</code> ，其中：<code>grid[i][j] = 1</code> 表示陆地， <code>grid[i][j] = 0</code> 表示水域。</p>
  <p>网格中的格子 <strong>水平和垂直</strong> 方向相连（对角线不相连）。整个网格被水完全包围，但其中恰好有一个岛屿（或者说，一个或多个表示陆地的格子相连组成的岛屿）。</p>
  <p>岛屿中没有“湖”（“湖” 指水域在岛屿内部且不和岛屿周围的水相连）。格子是边长为 1 的正方形。网格为长方形，且宽度和高度均不超过 100 。计算这个岛屿的周长。</p>

  <h4 style="color: #38bdf8; margin-top: 16px; margin-bottom: 8px;">示例 1：</h4>
  <pre style="background: #1e293b; padding: 10px; border-radius: 8px; font-size: 12px; color: #e2e8f0;"><strong>输入：</strong>grid = [[0,1,0,0],[1,1,1,0],[0,1,0,0],[1,1,0,0]]
<strong>输出：</strong>16
<strong>解释：</strong>它的周长是 16 个黄色条边。</pre>
</div>
`;

export const COASTLINE_ANALYSIS_HTML = `
<div style="line-height: 1.7; font-size: 13.5px; color: #cbd5e1;">
  <h3 style="color: #38bdf8; margin-top: 0;">💡 核心思路：单格 4 邻域外露边统计法</h3>
  <p>计算岛屿周长主要有两种高效解法：</p>

  <h4 style="color: #67e8f9; margin-top: 12px;">方法一：逐格检查 4 邻域 (遍历法)</h4>
  <ul style="padding-left: 20px;">
    <li>每个陆地格子基础贡献 4 条边。</li>
    <li>遍历网格中每个值为 <code>1</code> 的陆地格子 <code>(r, c)</code>，检查其上下左右 4 个相邻格子。</li>
    <li>若相邻格子是<strong>网格边界</strong>或者<strong>水域 (0)</strong>，则该方向贡献 1 个单位的周长。</li>
  </ul>

  <h4 style="color: #67e8f9; margin-top: 12px;">方法二：总陆地 × 4 - 邻接边数 × 2</h4>
  <p>设陆地总数为 <code>land</code>，相邻陆地对数为 <code>neighbor</code>，则 <code>周长 = land * 4 - neighbor * 2</code>。</p>

  <h4 style="color: #67e8f9; margin-top: 12px;">复杂度分析</h4>
  <ul style="padding-left: 20px;">
    <li><strong>时间复杂度：</strong><code>O(R × C)</code>，仅需遍历一次网格。</li>
    <li><strong>空间复杂度：</strong><code>O(1)</code>，无需额外内存空间。</li>
  </ul>
</div>
`;

export const COASTLINE_CODE_LANGUAGES: Record<string, string[]> = {
  java: [
    'class Solution {',
    '    public int islandPerimeter(int[][] grid) {',
    '        int rows = grid.length, cols = grid[0].length;',
    '        int perimeter = 0;',
    '        int[] dr = {-1, 0, 1, 0};',
    '        int[] dc = {0, 1, 0, -1};',
    '        for (int r = 0; r < rows; r++) {',
    '            for (int c = 0; c < cols; c++) {',
    '                if (grid[r][c] == 1) {',
    '                    for (int d = 0; d < 4; d++) {',
    '                        int nr = r + dr[d], nc = c + dc[d];',
    '                        if (nr < 0 || nr >= rows || nc < 0 || nc >= cols || grid[nr][nc] == 0) {',
    '                            perimeter++;',
    '                        }',
    '                    }',
    '                }',
    '            }',
    '        }',
    '        return perimeter;',
    '    }',
    '}',
  ],
  cpp: [
    'class Solution {',
    'public:',
    '    int islandPerimeter(vector<vector<int>>& grid) {',
    '        int rows = grid.size(), cols = grid[0].size();',
    '        int perimeter = 0;',
    '        int dr[4] = {-1, 0, 1, 0}, dc[4] = {0, 1, 0, -1};',
    '        for (int r = 0; r < rows; ++r) {',
    '            for (int c = 0; c < cols; ++c) {',
    '                if (grid[r][c] == 1) {',
    '                    for (int d = 0; d < 4; ++d) {',
    '                        int nr = r + dr[d], nc = c + dc[d];',
    '                        if (nr < 0 || nr >= rows || nc < 0 || nc >= cols || grid[nr][nc] == 0) {',
    '                            perimeter++;',
    '                        }',
    '                    }',
    '                }',
    '            }',
    '        }',
    '        return perimeter;',
    '    }',
    '};',
  ],
  python: [
    'class Solution:',
    '    def islandPerimeter(self, grid: List[List[int]]) -> int:',
    '        rows, cols = len(grid), len(grid[0])',
    '        perimeter = 0',
    '        for r in range(rows):',
    '            for c in range(cols):',
    '                if grid[r][c] == 1:',
    '                    for dr, dc in [(-1,0), (1,0), (0,-1), (0,1)]:',
    '                        nr, nc = r + dr, c + dc',
    '                        if nr < 0 or nr >= rows or nc < 0 or nc >= cols or grid[nr][nc] == 0:',
    '                            perimeter += 1',
    '        return perimeter',
  ],
  javascript: [
    'var islandPerimeter = function(grid) {',
    '    const rows = grid.length, cols = grid[0].length;',
    '    let perimeter = 0;',
    '    const dirs = [[-1,0],[0,1],[1,0],[0,-1]];',
    '    for (let r = 0; r < rows; r++) {',
    '        for (let c = 0; c < cols; c++) {',
    '            if (grid[r][c] === 1) {',
    '                for (const [dr, dc] of dirs) {',
    '                    const nr = r + dr, nc = c + dc;',
    '                    if (nr < 0 || nr >= rows || nc < 0 || nc >= cols || grid[nr][nc] === 0) {',
    '                        perimeter++;',
    '                    }',
    '                }',
    '            }',
    '        }',
    '    }',
    '    return perimeter;',
    '};',
  ],
};
