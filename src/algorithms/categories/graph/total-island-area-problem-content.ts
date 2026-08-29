/**
 * 孤岛总面积 (Total Island Area / Isolated Islands Sum)
 * 题目解析、算法精讲与四语言源码
 */

export const TOTAL_ISLAND_AREA_PROBLEM_HTML = `
<div style="line-height: 1.7; font-size: 13.5px; color: #cbd5e1;">
  <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 12px;">
    <span style="font-weight: 800; font-size: 16px; color: #f8fafc;">孤岛的总面积 (Total Island Area)</span>
    <span style="background: #065f46; color: #6ee7b7; font-size: 11px; font-weight: 700; padding: 2px 8px; border-radius: 4px;">中等 / Medium</span>
  </div>

  <p>给定一个由 <code>1</code>（陆地）和 <code>0</code>（水）组成的 <code>m x n</code> 网格地图 <code>grid</code>。</p>
  <p>岛屿由水平或垂直方向相连的陆地组成。网格中所有岛屿的总面积即为所有属于岛屿的陆地格子总数。</p>
  <p>计算网格中 <strong>所有岛屿的总面积</strong> 以及 <strong>每个独立岛屿的面积分布</strong>。</p>

  <h4 style="color: #38bdf8; margin-top: 16px; margin-bottom: 8px;">示例 1：</h4>
  <pre style="background: #1e293b; padding: 10px; border-radius: 8px; font-size: 12px; color: #e2e8f0;"><strong>输入：</strong>grid = [
  [1, 1, 0, 0, 0],
  [1, 1, 0, 0, 0],
  [0, 0, 1, 0, 0],
  [0, 0, 0, 1, 1]
]
<strong>输出：</strong>总面积 = 7 (岛屿 1: 面积 4, 岛屿 2: 面积 1, 岛屿 3: 面积 2)</pre>
</div>
`;

export const TOTAL_ISLAND_AREA_ANALYSIS_HTML = `
<div style="line-height: 1.7; font-size: 13.5px; color: #cbd5e1;">
  <h3 style="color: #38bdf8; margin-top: 0;">💡 核心思路：连通分量 DFS 面积累计</h3>
  <p>统计岛屿总面积与独立岛屿特征通常采用深度优先搜索 (DFS) 或广度优先搜索 (BFS)：</p>

  <h4 style="color: #67e8f9; margin-top: 12px;">算法流程：</h4>
  <ol style="padding-left: 20px;">
    <li><strong>网格双重循环：</strong>逐行逐列扫描网格，当遇到值为 <code>1</code> 且未被访问的陆地单元时，说明发现了一个新的岛屿连通块。</li>
    <li><strong>单岛 DFS 扩张：</strong>从该陆地单元启动 DFS，向上下左右 4 个方向探索相邻陆地：
      <ul>
        <li>每次成功访问一个新陆地单元，当前岛屿面积 <code>currentArea++</code>。</li>
        <li>将访问过的陆地标记为已访问（或置为 0），防止死循环。</li>
      </ul>
    </li>
    <li><strong>累计总面积：</strong>单次 DFS 结束后，将当前岛屿面积累加至总面积：<code>totalArea += currentArea</code>。</li>
  </ol>

  <h4 style="color: #67e8f9; margin-top: 12px;">复杂度分析</h4>
  <ul style="padding-left: 20px;">
    <li><strong>时间复杂度：</strong><code>O(M × N)</code>，每个网格单元最多被访问一次。</li>
    <li><strong>空间复杂度：</strong><code>O(M × N)</code>，递归栈或显式访问标记的空间开销。</li>
  </ul>
</div>
`;

export const TOTAL_ISLAND_AREA_CODE_LANGUAGES: Record<string, string[]> = {
  java: [
    'class Solution {',
    '    public int totalIslandArea(int[][] grid) {',
    '        int m = grid.length, n = grid[0].length;',
    '        int totalArea = 0;',
    '        boolean[][] visited = new boolean[m][n];',
    '        for (int r = 0; r < m; r++) {',
    '            for (int c = 0; c < n; c++) {',
    '                if (grid[r][c] == 1 && !visited[r][c]) {',
    '                    totalArea += dfs(grid, visited, r, c);',
    '                }',
    '            }',
    '        }',
    '        return totalArea;',
    '    }',
    '    private int dfs(int[][] grid, boolean[][] visited, int r, int c) {',
    '        if (r < 0 || r >= grid.length || c < 0 || c >= grid[0].length || grid[r][c] == 0 || visited[r][c]) return 0;',
    '        visited[r][c] = true;',
    '        int area = 1;',
    '        area += dfs(grid, visited, r + 1, c);',
    '        area += dfs(grid, visited, r - 1, c);',
    '        area += dfs(grid, visited, r, c + 1);',
    '        area += dfs(grid, visited, r, c - 1);',
    '        return area;',
    '    }',
    '}',
  ],
  cpp: [
    'class Solution {',
    'public:',
    '    int totalIslandArea(vector<vector<int>>& grid) {',
    '        int m = grid.size(), n = grid[0].size();',
    '        int totalArea = 0;',
    '        vector<vector<bool>> visited(m, vector<bool>(n, false));',
    '        for (int r = 0; r < m; ++r) {',
    '            for (int c = 0; c < n; ++c) {',
    '                if (grid[r][c] == 1 && !visited[r][c]) {',
    '                    totalArea += dfs(grid, visited, r, c);',
    '                }',
    '            }',
    '        }',
    '        return totalArea;',
    '    }',
    'private:',
    '    int dfs(vector<vector<int>>& grid, vector<vector<bool>>& visited, int r, int c) {',
    '        if (r < 0 || r >= grid.size() || c < 0 || c >= grid[0].size() || grid[r][c] == 0 || visited[r][c]) return 0;',
    '        visited[r][c] = true;',
    '        return 1 + dfs(grid, visited, r + 1, c) + dfs(grid, visited, r - 1, c) + dfs(grid, visited, r, c + 1) + dfs(grid, visited, r, c - 1);',
    '    }',
    '};',
  ],
  python: [
    'class Solution:',
    '    def totalIslandArea(self, grid: List[List[int]]) -> int:',
    '        m, n = len(grid), len(grid[0])',
    '        visited = set()',
    '        def dfs(r, c):',
    '            if r < 0 or r >= m or c < 0 or c >= n or grid[r][c] == 0 or (r, c) in visited:',
    '                return 0',
    '            visited.add((r, c))',
    '            return 1 + dfs(r + 1, c) + dfs(r - 1, c) + dfs(r, c + 1) + dfs(r, c - 1)',
    '        total_area = 0',
    '        for r in range(m):',
    '            for c in range(n):',
    '                if grid[r][c] == 1 and (r, c) not in visited:',
    '                    total_area += dfs(r, c)',
    '        return total_area',
  ],
  javascript: [
    'var totalIslandArea = function(grid) {',
    '    const m = grid.length, n = grid[0].length;',
    '    const visited = Array.from({length: m}, () => Array(n).fill(false));',
    '    const dfs = (r, c) => {',
    '        if (r < 0 || r >= m || c < 0 || c >= n || grid[r][c] === 0 || visited[r][c]) return 0;',
    '        visited[r][c] = true;',
    '        return 1 + dfs(r + 1, c) + dfs(r - 1, c) + dfs(r, c + 1) + dfs(r, c - 1);',
    '    };',
    '    let totalArea = 0;',
    '    for (let r = 0; r < m; r++) {',
    '        for (let c = 0; c < n; c++) {',
    '            if (grid[r][c] === 1 && !visited[r][c]) {',
    '                totalArea += dfs(r, c);',
    '            }',
    '        }',
    '    }',
    '    return totalArea;',
    '};',
  ],
};
