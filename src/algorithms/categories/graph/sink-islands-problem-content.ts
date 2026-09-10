/**
 * 沉没孤岛 / 力扣 130. 被围绕的区域 (Surrounded Regions / Sink Isolated Islands)
 * 题目解析、算法精讲与四语言源码
 */

export const SINK_ISLANDS_PROBLEM_HTML = `
<div style="line-height: 1.7; font-size: 13.5px; color: #cbd5e1;">
  <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 12px;">
    <span style="font-weight: 800; font-size: 16px; color: #f8fafc;">130. 被围绕的区域 (沉没孤岛)</span>
    <span style="background: #854d0e; color: #fde047; font-size: 11px; font-weight: 700; padding: 2px 8px; border-radius: 4px;">中等 / Medium</span>
  </div>

  <p>给你一个 <code>m x n</code> 的矩阵 <code>board</code> ，由若干字符 <code>'X'</code> 和 <code>'O'</code> （或网格 1 与 0）组成，捕获所有 <strong>被围绕的区域</strong>：</p>
  <ul style="padding-left: 20px;">
    <li><strong>连接：</strong>一个单元格与水平或垂直方向上相邻的单元格连接。</li>
    <li><strong>区域：</strong>连接所有 <code>'O'</code> 的单元格来形成一个区域。</li>
    <li><strong>围绕：</strong>如果您可以用 <code>'X'</code> 单元格 <strong>完全包围</strong> 该区域，并且该区域中没有任何单元格在 <code>board</code> 的边缘，则该区域被视为被围绕。</li>
  </ul>
  <p>通过将输入矩阵中的所有 <code>'O'</code>（孤岛）替换为 <code>'X'</code>（水域），从而捕获被围绕的区域。边缘相连的 <code>'O'</code> 则保留。</p>

  <h4 style="color: #38bdf8; margin-top: 16px; margin-bottom: 8px;">示例 1：</h4>
  <pre style="background: #1e293b; padding: 10px; border-radius: 8px; font-size: 12px; color: #e2e8f0;"><strong>输入：</strong>grid = [
  [1, 1, 1, 1],
  [1, 0, 0, 1],
  [1, 1, 0, 1],
  [1, 0, 1, 1]
]
<strong>输出：</strong>中间孤立陆地被完全淹没</pre>
</div>
`;

export const SINK_ISLANDS_ANALYSIS_HTML = `
<div style="line-height: 1.7; font-size: 13.5px; color: #cbd5e1;">
  <h3 style="color: #38bdf8; margin-top: 0;">💡 核心思路：边缘反向寻路与两阶段沉没</h3>
  <p>如果从每个内部节点去判断是否被完全包围，逻辑非常复杂。反向思考更加清晰：</p>

  <h4 style="color: #67e8f9; margin-top: 12px;">步骤拆解：</h4>
  <ol style="padding-left: 20px;">
    <li><strong>第一阶段（边缘淹没保护）：</strong>遍历网格的四条外边界（上、下、左、右），只要遇到陆地 <code>1</code>，就以其为起点进行 DFS/BFS，将所有与边缘连通的陆地临时标记为 <code>2 (Protected)</code>。</li>
    <li><strong>第二阶段（沉没与还原）：</strong>遍历整个网格：
      <ul>
        <li>如果当前格子是 <code>1</code>（未与边缘相连的真正孤岛），直接修改为 <code>0</code>（沉没为水域）。</li>
        <li>如果当前格子是 <code>2</code>（受保护的边缘陆地），将其还原回 <code>1</code>。</li>
      </ul>
    </li>
  </ol>

  <h4 style="color: #67e8f9; margin-top: 12px;">复杂度分析</h4>
  <ul style="padding-left: 20px;">
    <li><strong>时间复杂度：</strong><code>O(M × N)</code>，每个网格单元最多被访问常数次。</li>
    <li><strong>空间复杂度：</strong><code>O(M × N)</code>，DFS 递归调用栈的最大深度。</li>
  </ul>
</div>
`;

export const SINK_ISLANDS_CODE_LANGUAGES: Record<string, string[]> = {
  java: [
    'class Solution {',
    '    public void solve(int[][] grid) {',
    '        int m = grid.length, n = grid[0].length;',
    '        // 1. 扫描四周边沿陆地，标记为 2 (受保护)',
    '        for (int r = 0; r < m; r++) {',
    '            if (grid[r][0] == 1) dfs(grid, r, 0);',
    '            if (grid[r][n - 1] == 1) dfs(grid, r, n - 1);',
    '        }',
    '        for (int c = 0; c < n; c++) {',
    '            if (grid[0][c] == 1) dfs(grid, 0, c);',
    '            if (grid[m - 1][c] == 1) dfs(grid, m - 1, c);',
    '        }',
    '        // 2. 沉没孤岛 (1 -> 0) 并还原保护区 (2 -> 1)',
    '        for (int r = 0; r < m; r++) {',
    '            for (int c = 0; c < n; c++) {',
    '                if (grid[r][c] == 1) grid[r][c] = 0;',
    '                else if (grid[r][c] == 2) grid[r][c] = 1;',
    '            }',
    '        }',
    '    }',
    '    private void dfs(int[][] grid, int r, int c) {',
    '        if (r < 0 || r >= grid.length || c < 0 || c >= grid[0].length || grid[r][c] != 1) return;',
    '        grid[r][c] = 2;',
    '        dfs(grid, r + 1, c); dfs(grid, r - 1, c);',
    '        dfs(grid, r, c + 1); dfs(grid, r, c - 1);',
    '    }',
    '}',
  ],
  cpp: [
    'class Solution {',
    'public:',
    '    void solve(vector<vector<int>>& grid) {',
    '        int m = grid.size(), n = grid[0].size();',
    '        for (int r = 0; r < m; ++r) {',
    '            if (grid[r][0] == 1) dfs(grid, r, 0);',
    '            if (grid[r][n-1] == 1) dfs(grid, r, n-1);',
    '        }',
    '        for (int c = 0; c < n; ++c) {',
    '            if (grid[0][c] == 1) dfs(grid, 0, c);',
    '            if (grid[m-1][c] == 1) dfs(grid, m-1, c);',
    '        }',
    '        for (int r = 0; r < m; ++r) {',
    '            for (int c = 0; c < n; ++c) {',
    '                if (grid[r][c] == 1) grid[r][c] = 0;',
    '                else if (grid[r][c] == 2) grid[r][c] = 1;',
    '            }',
    '        }',
    '    }',
    'private:',
    '    void dfs(vector<vector<int>>& grid, int r, int c) {',
    '        if (r < 0 || r >= grid.size() || c < 0 || c >= grid[0].size() || grid[r][c] != 1) return;',
    '        grid[r][c] = 2;',
    '        dfs(grid, r+1, c); dfs(grid, r-1, c);',
    '        dfs(grid, r, c+1); dfs(grid, r, c-1);',
    '    }',
    '};',
  ],
  python: [
    'class Solution:',
    '    def solve(self, grid: List[List[int]]) -> None:',
    '        m, n = len(grid), len(grid[0])',
    '        def dfs(r, c):',
    '            if r < 0 or r >= m or c < 0 or c >= n or grid[r][c] != 1:',
    '                return',
    '            grid[r][c] = 2',
    '            for dr, dc in [(-1,0), (1,0), (0,-1), (0,1)]:',
    '                dfs(r + dr, c + dc)',
    '        for r in range(m):',
    '            if grid[r][0] == 1: dfs(r, 0)',
    '            if grid[r][n-1] == 1: dfs(r, n-1)',
    '        for c in range(n):',
    '            if grid[0][c] == 1: dfs(0, c)',
    '            if grid[m-1][c] == 1: dfs(m-1, c)',
    '        for r in range(m):',
    '            for c in range(n):',
    '                if grid[r][c] == 1: grid[r][c] = 0',
    '                elif grid[r][c] == 2: grid[r][c] = 1',
  ],
  javascript: [
    'var solve = function(grid) {',
    '    const m = grid.length, n = grid[0].length;',
    '    const dfs = (r, c) => {',
    '        if (r < 0 || r >= m || c < 0 || c >= n || grid[r][c] !== 1) return;',
    '        grid[r][c] = 2;',
    '        dfs(r + 1, c); dfs(r - 1, c);',
    '        dfs(r, c + 1); dfs(r, c - 1);',
    '    };',
    '    for (let r = 0; r < m; r++) {',
    '        if (grid[r][0] === 1) dfs(r, 0);',
    '        if (grid[r][n - 1] === 1) dfs(r, n - 1);',
    '    }',
    '    for (let c = 0; c < n; c++) {',
    '        if (grid[0][c] === 1) dfs(0, c);',
    '        if (grid[m - 1][c] === 1) dfs(m - 1, c);',
    '    }',
    '    for (let r = 0; r < m; r++) {',
    '        for (let c = 0; c < n; c++) {',
    '            if (grid[r][c] === 1) grid[r][c] = 0;',
    '            else if (grid[r][c] === 2) grid[r][c] = 1;',
    '        }',
    '    }',
    '};',
  ],
};
