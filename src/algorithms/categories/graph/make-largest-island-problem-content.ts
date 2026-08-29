/**
 * 力扣 827. 最大人工岛 (Making A Large Island)
 * 题目解析、算法精讲与四语言源码
 */

export const MAKE_LARGEST_ISLAND_PROBLEM_HTML = `
<div style="line-height: 1.7; font-size: 13.5px; color: #cbd5e1;">
  <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 12px;">
    <span style="font-weight: 800; font-size: 16px; color: #f8fafc;">827. 最大人工岛</span>
    <span style="background: #991b1b; color: #fca5a5; font-size: 11px; font-weight: 700; padding: 2px 8px; border-radius: 4px;">困难 / Hard</span>
  </div>

  <p>给你一个大小为 <code>n x n</code> 二进制矩阵 <code>grid</code> 。最多 <strong>只能将一格</strong> <code>0</code> （水域）变成 <code>1</code> （陆地）。</p>
  <p>返回执行此操作后， <code>grid</code> 中最大的岛屿面积是多少？</p>
  <p><strong>岛屿</strong> 由水平或垂直方向相连的 <code>1</code> 形成的一个最大组。</p>

  <h4 style="color: #38bdf8; margin-top: 16px; margin-bottom: 8px;">示例 1：</h4>
  <pre style="background: #1e293b; padding: 10px; border-radius: 8px; font-size: 12px; color: #e2e8f0;"><strong>输入:</strong> grid = [[1, 0], [0, 1]]
<strong>输出:</strong> 3
<strong>解释:</strong> 将一格 0 变成 1，最终连通最大岛屿面积为 1 + 1 + 1 = 3。</pre>
</div>
`;

export const MAKE_LARGEST_ISLAND_ANALYSIS_HTML = `
<div style="line-height: 1.7; font-size: 13.5px; color: #cbd5e1;">
  <h3 style="color: #38bdf8; margin-top: 0;">💡 核心思路：岛屿编号染色 + 水域桥接合并</h3>
  <p>若对每个水域 0 都重新执行全图 DFS 计算连通面积，时间复杂度高达 <code>O(N^4)</code>。<strong>两遍扫描法</strong>可在 <code>O(N^2)</code> 内完美求解：</p>

  <h4 style="color: #67e8f9; margin-top: 12px;">算法流程：</h4>
  <ol style="padding-left: 20px;">
    <li><strong>第一遍扫描（岛屿染色编号与面积缓存）：</strong>
      <ul>
        <li>使用从 <code>2</code> 开始递增的编号（如 2, 3, 4...）标记各个独立岛屿。</li>
        <li>通过 DFS/BFS 统计每个岛屿的面积，并存入哈希表 <code>areaMap[id] = area</code>。</li>
      </ul>
    </li>
    <li><strong>第二遍扫描（尝试填海造陆）：</strong>
      <ul>
        <li>遍历所有水域格 <code>(r, c) == 0</code>。</li>
        <li>使用 <code>Set</code> 收集其上下左右 4 个相邻格子的<strong>不同岛屿编号</strong>（去重避免重复累加同一岛屿）。</li>
        <li>合并后的面积 = <code>1 + sum(areaMap[neighbor_id])</code>。</li>
        <li>维护最大可能面积 <code>maxArea</code>。</li>
      </ul>
    </li>
  </ol>

  <h4 style="color: #67e8f9; margin-top: 12px;">复杂度分析</h4>
  <ul style="padding-left: 20px;">
    <li><strong>时间复杂度：</strong><code>O(N^2)</code>，两遍扫描各遍历一次 <code>N × N</code> 网格。</li>
    <li><strong>空间复杂度：</strong><code>O(N^2)</code>，用于保存染色后的 <code>grid</code> 以及哈希映射。</li>
  </ul>
</div>
`;

export const MAKE_LARGEST_ISLAND_CODE_LANGUAGES: Record<string, string[]> = {
  java: [
    'class Solution {',
    '    public int largestIsland(int[][] grid) {',
    '        int n = grid.length;',
    '        Map<Integer, Integer> areaMap = new HashMap<>();',
    '        int islandId = 2, maxArea = 0;',
    '        // 1. 岛屿编号与面积统计',
    '        for (int r = 0; r < n; r++) {',
    '            for (int c = 0; c < n; c++) {',
    '                if (grid[r][c] == 1) {',
    '                    int area = dfs(grid, r, c, islandId);',
    '                    areaMap.put(islandId, area);',
    '                    maxArea = Math.max(maxArea, area);',
    '                    islandId++;',
    '                }',
    '            }',
    '        }',
    '        // 2. 遍历水域桥接相邻岛屿',
    '        int[] dr = {-1, 1, 0, 0}, dc = {0, 0, -1, 1};',
    '        for (int r = 0; r < n; r++) {',
    '            for (int c = 0; c < n; c++) {',
    '                if (grid[r][c] == 0) {',
    '                    Set<Integer> seen = new HashSet<>();',
    '                    int curArea = 1;',
    '                    for (int d = 0; d < 4; d++) {',
    '                        int nr = r + dr[d], nc = c + dc[d];',
    '                        if (nr >= 0 && nr < n && nc >= 0 && nc < n && grid[nr][nc] > 1) {',
    '                            seen.add(grid[nr][nc]);',
    '                        }',
    '                    }',
    '                    for (int id : seen) curArea += areaMap.get(id);',
    '                    maxArea = Math.max(maxArea, curArea);',
    '                }',
    '            }',
    '        }',
    '        return maxArea;',
    '    }',
    '    private int dfs(int[][] grid, int r, int c, int id) {',
    '        if (r < 0 || r >= grid.length || c < 0 || c >= grid.length || grid[r][c] != 1) return 0;',
    '        grid[r][c] = id;',
    '        return 1 + dfs(grid, r + 1, c, id) + dfs(grid, r - 1, c, id) + dfs(grid, r, c + 1, id) + dfs(grid, r, c - 1, id);',
    '    }',
    '}',
  ],
  cpp: [
    'class Solution {',
    'public:',
    '    int largestIsland(vector<vector<int>>& grid) {',
    '        int n = grid.size();',
    '        unordered_map<int, int> areaMap;',
    '        int islandId = 2, maxArea = 0;',
    '        for (int r = 0; r < n; ++r) {',
    '            for (int c = 0; c < n; ++c) {',
    '                if (grid[r][c] == 1) {',
    '                    int area = dfs(grid, r, c, islandId);',
    '                    areaMap[islandId] = area;',
    '                    maxArea = max(maxArea, area);',
    '                    islandId++;',
    '                }',
    '            }',
    '        }',
    '        int dr[4] = {-1, 1, 0, 0}, dc[4] = {0, 0, -1, 1};',
    '        for (int r = 0; r < n; ++r) {',
    '            for (int c = 0; c < n; ++c) {',
    '                if (grid[r][c] == 0) {',
    '                    unordered_set<int> seen;',
    '                    int curArea = 1;',
    '                    for (int d = 0; d < 4; ++d) {',
    '                        int nr = r + dr[d], nc = c + dc[d];',
    '                        if (nr >= 0 && nr < n && nc >= 0 && nc < n && grid[nr][nc] > 1) {',
    '                            seen.insert(grid[nr][nc]);',
    '                        }',
    '                    }',
    '                    for (int id : seen) curArea += areaMap[id];',
    '                    maxArea = max(maxArea, curArea);',
    '                }',
    '            }',
    '        }',
    '        return maxArea;',
    '    }',
    'private:',
    '    int dfs(vector<vector<int>>& grid, int r, int c, int id) {',
    '        if (r < 0 || r >= grid.size() || c < 0 || c >= grid.size() || grid[r][c] != 1) return 0;',
    '        grid[r][c] = id;',
    '        return 1 + dfs(grid, r + 1, c, id) + dfs(grid, r - 1, c, id) + dfs(grid, r, c + 1, id) + dfs(grid, r, c - 1, id);',
    '    }',
    '};',
  ],
  python: [
    'class Solution:',
    '    def largestIsland(self, grid: List[List[int]]) -> int:',
    '        n = len(grid)',
    '        area_map = {}',
    '        island_id = 2',
    '        def dfs(r, c, i_id):',
    '            if r < 0 or r >= n or c < 0 or c >= n or grid[r][c] != 1:',
    '                return 0',
    '            grid[r][c] = i_id',
    '            return 1 + dfs(r + 1, c, i_id) + dfs(r - 1, c, i_id) + dfs(r, c + 1, i_id) + dfs(r, c - 1, i_id)',
    '        max_area = 0',
    '        for r in range(n):',
    '            for c in range(n):',
    '                if grid[r][c] == 1:',
    '                    area = dfs(r, c, island_id)',
    '                    area_map[island_id] = area',
    '                    max_area = max(max_area, area)',
    '                    island_id += 1',
    '        for r in range(n):',
    '            for c in range(n):',
    '                if grid[r][c] == 0:',
    '                    seen = set()',
    '                    for dr, dc in [(-1,0), (1,0), (0,-1), (0,1)]:',
    '                        nr, nc = r + dr, c + dc',
    '                        if 0 <= nr < n and 0 <= nc < n and grid[nr][nc] > 1:',
    '                            seen.add(grid[nr][nc])',
    '                    cur_area = 1 + sum(area_map[i_id] for i_id in seen)',
    '                    max_area = max(max_area, cur_area)',
    '        return max_area',
  ],
  javascript: [
    'var largestIsland = function(grid) {',
    '    const n = grid.length;',
    '    const areaMap = new Map();',
    '    let islandId = 2, maxArea = 0;',
    '    const dfs = (r, c, id) => {',
    '        if (r < 0 || r >= n || c < 0 || c >= n || grid[r][c] !== 1) return 0;',
    '        grid[r][c] = id;',
    '        return 1 + dfs(r + 1, c, id) + dfs(r - 1, c, id) + dfs(r, c + 1, id) + dfs(r, c - 1, id);',
    '    };',
    '    for (let r = 0; r < n; r++) {',
    '        for (let c = 0; c < n; c++) {',
    '            if (grid[r][c] === 1) {',
    '                const area = dfs(r, c, islandId);',
    '                areaMap.set(islandId, area);',
    '                maxArea = Math.max(maxArea, area);',
    '                islandId++;',
    '            }',
    '        }',
    '    }',
    '    const dirs = [[-1,0],[1,0],[0,-1],[0,1]];',
    '    for (let r = 0; r < n; r++) {',
    '        for (let c = 0; c < n; c++) {',
    '            if (grid[r][c] === 0) {',
    '                const seen = new Set();',
    '                let curArea = 1;',
    '                for (const [dr, dc] of dirs) {',
    '                    const nr = r + dr, nc = c + dc;',
    '                    if (nr >= 0 && nr < n && nc >= 0 && nc < n && grid[nr][nc] > 1) {',
    '                        seen.add(grid[nr][nc]);',
    '                    }',
    '                }',
    '                for (const id of seen) curArea += areaMap.get(id);',
    '                maxArea = Math.max(maxArea, curArea);',
    '            }',
    '        }',
    '    }',
    '    return maxArea;',
    '};',
  ],
};
