/**
 * 岛屿数量 (Number of Islands · LeetCode 200)
 * 领域知识与题解精讲配置声明（三阶段演化架构）
 */

export const ISLANDS_PROBLEM_HTML = `
  <div style="display: flex; flex-direction: column; gap: 12px; color: #cbd5e1; font-size: 12px; line-height: 1.6;">
    <div style="display: flex; align-items: center; gap: 8px;">
      <span style="padding: 2px 6px; border-radius: 4px; background: rgba(59,130,246,0.2); color: #60a5fa; font-weight: 700; border: 1px solid rgba(59,130,246,0.3);">LeetCode 200</span>
      <span style="padding: 2px 6px; border-radius: 4px; background: rgba(245,158,11,0.2); color: #fbbf24; font-weight: 700; border: 1px solid rgba(245,158,11,0.3);">Medium</span>
      <h2 style="font-size: 14px; font-weight: 700; color: #ffffff; margin: 0;">岛屿数量 (Number of Islands)</h2>
    </div>
    <p style="margin: 0;">给你一个由 <code style="color: #38bdf8; font-family: monospace;">'1'</code>（陆地）和 <code style="color: #64748b; font-family: monospace;">'0'</code>（水）组成的二维网格，请你计算网格中岛屿的数量。岛屿总是被水包围，并且每座岛屿只能由水平方向或竖直方向上相邻的陆地连接形成。此外，假设该网格的四条外围边界均被水包围。</p>
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
      <span>💡</span> 连通分量求解三大演化范式
    </h3>
    <div style="display: flex; flex-direction: column; gap: 8px;">
      <div style="padding: 10px; border-radius: 10px; background: #020617; border: 1px solid #1e293b;">
        <div style="font-weight: 700; color: #60a5fa; margin-bottom: 4px;">① Stage 1: DFS 递归沉岛法 (Depth-First Search)</div>
        <p style="margin: 0; color: #94a3b8;">
        双重循环扫描，遇到陆地 <code style="color: #38bdf8; font-family: monospace;">'1'</code> 则计数 <code style="color: #fbbf24; font-family: monospace;">count++</code>，并立即以该格为起点启动 DFS 递归。向上下左右四个方向深入，把整座岛屿的所有连通陆地“染色沉没”为 <code style="color: #64748b; font-family: monospace;">'0'</code>，防止后续重复计算。
        </p>
      </div>
      <div style="padding: 10px; border-radius: 10px; background: #020617; border: 1px solid #1e293b;">
        <div style="font-weight: 700; color: #34d399; margin-bottom: 4px;">② Stage 2: BFS 广度优先队列波浪扩散 (Breadth-First Search)</div>
        <p style="margin: 0; color: #94a3b8;">
        发现陆地后加入队列并<strong>入队即染色</strong>，避免重复入队导致的内存暴涨；随后通过队列不断出队、层层波浪式向四周蔓延沉岛，空间复杂度为对角线级别的 <code style="color: #34d399; font-family: monospace;">O(min(M, N))</code>。
        </p>
      </div>
      <div style="padding: 10px; border-radius: 10px; background: #020617; border: 1px solid #1e293b;">
        <div style="font-weight: 700; color: #f59e0b; margin-bottom: 4px;">③ Stage 3: 并查集动态连通分量 (Union-Find)</div>
        <p style="margin: 0; color: #94a3b8;">
        将每个陆地单元格初始化为一个独立集合，初始集合数即陆地总数。只需向右、向下扫描相邻单元格，若相邻均为陆地则执行 <code style="color: #f59e0b; font-family: monospace;">union()</code>，每次成功合并集合计数减一，最终集合数即岛屿总数。
        </p>
      </div>
    </div>
  </div>
`;

/** Stage 1: DFS 深度优先沉岛法四语言实现 */
export const STAGE1_DFS_CODES: Record<string, string[]> = {
  java: [
    'public class Solution {',
    '    public int numIslands(char[][] grid) {',
    '        int count = 0;',
    '        int m = grid.length, n = grid[0].length;',
    '        for (int r = 0; r < m; r++) {',
    '            for (int c = 0; c < n; c++) {',
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
    '        grid[r][c] = \'0\'; // 沉岛染色',
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
    '        int m = grid.size(), n = grid[0].size();',
    '        for (int r = 0; r < m; r++) {',
    '            for (int c = 0; c < n; c++) {',
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
    '        dfs(grid, r + 1, c);',
    '        dfs(grid, r - 1, c);',
    '        dfs(grid, r, c + 1);',
    '        dfs(grid, r, c - 1);',
    '    }',
    '};',
  ],
  python: [
    'class Solution:',
    '    def numIslands(self, grid: List[List[str]]) -> int:',
    '        count = 0',
    '        m = len(grid)',
    '        n = len(grid[0])',
    '        def dfs(r: int, c: int) -> None:',
    '            if r < 0 or r >= m:',
    '                return',
    '            if c < 0 or c >= n:',
    '                return',
    '            if grid[r][c] != "1":',
    '                return',
    '            grid[r][c] = "0"  # 沉岛染色',
    '            dfs(r + 1, c)',
    '            dfs(r - 1, c)',
    '            dfs(r, c + 1)',
    '            dfs(r, c - 1)',
    '        for r in range(m):',
    '            for c in range(n):',
    '                if grid[r][c] == "1":',
    '                    count += 1',
    '                    dfs(r, c)',
    '        return count',
  ],
  javascript: [
    'var numIslands = function(grid) {',
    '    let count = 0;',
    '    const m = grid.length, n = grid[0].length;',
    '    const dfs = (r, c) => {',
    '        if (r < 0 || r >= m || c < 0 || c >= n || grid[r][c] !== "1") return;',
    '        grid[r][c] = "0";',
    '        dfs(r + 1, c);',
    '        dfs(r - 1, c);',
    '        dfs(r, c + 1);',
    '        dfs(r, c - 1);',
    '    };',
    '    for (let r = 0; r < m; r++) {',
    '        for (let c = 0; c < n; c++) {',
    '            if (grid[r][c] === "1") {',
    '                count++;',
    '                dfs(r, c);',
    '            }',
    '        }',
    '    }',
    '    return count;',
    '};',
  ],
};

/** Stage 2: BFS 广度优先队列波浪扩散四语言实现 */
export const STAGE2_BFS_CODES: Record<string, string[]> = {
  java: [
    'public class Solution {',
    '    public int numIslands(char[][] grid) {',
    '        int count = 0;',
    '        int m = grid.length, n = grid[0].length;',
    '        int[][] dirs = {{0,1},{1,0},{0,-1},{-1,0}};',
    '        for (int r = 0; r < m; r++) {',
    '            for (int c = 0; c < n; c++) {',
    '                if (grid[r][c] == \'1\') {',
    '                    count++;',
    '                    grid[r][c] = \'0\'; // 入队立即沉岛',
    '                    Queue<int[]> q = new LinkedList<>();',
    '                    q.offer(new int[]{r, c});',
    '                    while (!q.isEmpty()) {',
    '                        int[] cur = q.poll();',
    '                        for (int[] d : dirs) {',
    '                            int nr = cur[0] + d[0], nc = cur[1] + d[1];',
    '                            if (nr >= 0 && nr < m && nc >= 0 && nc < n && grid[nr][nc] == \'1\') {',
    '                                grid[nr][nc] = \'0\';',
    '                                q.offer(new int[]{nr, nc});',
    '                            }',
    '                        }',
    '                    }',
    '                }',
    '            }',
    '        }',
    '        return count;',
    '    }',
    '}',
  ],
  cpp: [
    'class Solution {',
    'public:',
    '    int numIslands(vector<vector<char>>& grid) {',
    '        int count = 0, m = grid.size(), n = grid[0].size();',
    '        int dirs[4][2] = {{0,1},{1,0},{0,-1},{-1,0}};',
    '        for (int r = 0; r < m; r++) {',
    '            for (int c = 0; c < n; c++) {',
    '                if (grid[r][c] == \'1\') {',
    '                    count++;',
    '                    grid[r][c] = \'0\';',
    '                    queue<pair<int, int>> q;',
    '                    q.push({r, c});',
    '                    while (!q.empty()) {',
    '                        auto [cr, cc] = q.front(); q.pop();',
    '                        for (auto& d : dirs) {',
    '                            int nr = cr + d[0], nc = cc + d[1];',
    '                            if (nr >= 0 && nr < m && nc >= 0 && nc < n && grid[nr][nc] == \'1\') {',
    '                                grid[nr][nc] = \'0\';',
    '                                q.push({nr, nc});',
    '                            }',
    '                        }',
    '                    }',
    '                }',
    '            }',
    '        }',
    '        return count;',
    '    }',
    '};',
  ],
  python: [
    'class Solution:',
    '    def numIslands(self, grid: List[List[str]]) -> int:',
    '        count = 0',
    '        m = len(grid)',
    '        n = len(grid[0])',
    '        dirs = [(0, 1), (1, 0), (0, -1), (-1, 0)]',
    '        for r in range(m):',
    '            for c in range(n):',
    '                if grid[r][c] == "1":',
    '                    count += 1',
    '                    grid[r][c] = "0"  # 入队立即沉岛',
    '                    q = collections.deque([(r, c)])',
    '                    while q:',
    '                        cr, cc = q.popleft()',
    '                        for dr, dc in dirs:',
    '                            nr = cr + dr',
    '                            nc = cc + dc',
    '                            if nr < 0 or nr >= m:',
    '                                continue',
    '                            if nc < 0 or nc >= n:',
    '                                continue',
    '                            if grid[nr][nc] == "1":',
    '                                grid[nr][nc] = "0"',
    '                                q.append((nr, nc))',
    '        return count',
  ],
  javascript: [
    'var numIslands = function(grid) {',
    '    let count = 0;',
    '    const m = grid.length, n = grid[0].length;',
    '    const dirs = [[0,1],[1,0],[0,-1],[-1,0]];',
    '    for (let r = 0; r < m; r++) {',
    '        for (let c = 0; c < n; c++) {',
    '            if (grid[r][c] === "1") {',
    '                count++;',
    '                grid[r][c] = "0";',
    '                const q = [[r, c]];',
    '                while (q.length > 0) {',
    '                    const [cr, cc] = q.shift();',
    '                    for (const [dr, dc] of dirs) {',
    '                        const nr = cr + dr, nc = cc + dc;',
    '                        if (nr >= 0 && nr < m && nc >= 0 && nc < n && grid[nr][nc] === "1") {',
    '                            grid[nr][nc] = "0";',
    '                            q.push([nr, nc]);',
    '                        }',
    '                    }',
    '                }',
    '            }',
    '        }',
    '    }',
    '    return count;',
    '};',
  ],
};

/** Stage 3: 并查集 Union-Find 连通性四语言实现 */
export const STAGE3_UF_CODES: Record<string, string[]> = {
  java: [
    'public class Solution {',
    '    public int numIslands(char[][] grid) {',
    '        int m = grid.length, n = grid[0].length;',
    '        UnionFind uf = new UnionFind(grid);',
    '        int[][] dirs = {{1, 0}, {0, 1}};',
    '        for (int r = 0; r < m; r++) {',
    '            for (int c = 0; c < n; c++) {',
    '                if (grid[r][c] == \'1\') {',
    '                    for (int[] d : dirs) {',
    '                        int nr = r + d[0], nc = c + d[1];',
    '                        if (nr < m && nc < n && grid[nr][nc] == \'1\') {',
    '                            uf.union(r * n + c, nr * n + nc);',
    '                        }',
    '                    }',
    '                }',
    '            }',
    '        }',
    '        return uf.getCount();',
    '    }',
    '}',
  ],
  cpp: [
    'class Solution {',
    'public:',
    '    int numIslands(vector<vector<char>>& grid) {',
    '        int m = grid.size(), n = grid[0].size();',
    '        UnionFind uf(grid);',
    '        int dirs[2][2] = {{1, 0}, {0, 1}};',
    '        for (int r = 0; r < m; r++) {',
    '            for (int c = 0; c < n; c++) {',
    '                if (grid[r][c] == \'1\') {',
    '                    for (auto& d : dirs) {',
    '                        int nr = r + d[0], nc = c + d[1];',
    '                        if (nr < m && nc < n && grid[nr][nc] == \'1\') {',
    '                            uf.unite(r * n + c, nr * n + nc);',
    '                        }',
    '                    }',
    '                }',
    '            }',
    '        }',
    '        return uf.getCount();',
    '    }',
    '};',
  ],
  python: [
    'class Solution:',
    '    def numIslands(self, grid: List[List[str]]) -> int:',
    '        m, n = len(grid), len(grid[0])',
    '        uf = UnionFind(grid)',
    '        dirs = [(1, 0), (0, 1)]',
    '        for r in range(m):',
    '            for c in range(n):',
    '                if grid[r][c] == "1":',
    '                    for dr, dc in dirs:',
    '                        nr, nc = r + dr, c + dc',
    '                        if nr < m and nc < n and grid[nr][nc] == "1":',
    '                            uf.union(r * n + c, nr * n + nc)',
    '        return uf.count',
  ],
  javascript: [
    'var numIslands = function(grid) {',
    '    const m = grid.length, n = grid[0].length;',
    '    const uf = new UnionFind(grid);',
    '    const dirs = [[1, 0], [0, 1]];',
    '    for (let r = 0; r < m; r++) {',
    '        for (let c = 0; c < n; c++) {',
    '            if (grid[r][c] === "1") {',
    '                for (const [dr, dc] of dirs) {',
    '                    const nr = r + dr, nc = c + dc;',
    '                    if (nr < m && nc < n && grid[nr][nc] === "1") {',
    '                        uf.union(r * n + c, nr * n + nc);',
    '                    }',
    '                }',
    '            }',
    '        }',
    '    }',
    '    return uf.getCount();',
    '};',
  ],
};

/** 保持向下兼容的旧导出 */
export const ISLANDS_CODE_LANGUAGES = STAGE1_DFS_CODES;
