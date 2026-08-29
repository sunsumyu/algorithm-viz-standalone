/**
 * 岛屿数量 BFS (Number of Islands BFS · LeetCode 200)
 * 领域知识与题解精讲配置声明
 */

export const ISLANDS_BFS_PROBLEM_HTML = `
  <div style="display: flex; flex-direction: column; gap: 12px; color: #cbd5e1; font-size: 12px; line-height: 1.6;">
    <div style="display: flex; align-items: center; gap: 8px;">
      <span style="padding: 2px 6px; border-radius: 4px; background: rgba(59,130,246,0.2); color: #60a5fa; font-weight: 700; border: 1px solid rgba(59,130,246,0.3);">LeetCode 200</span>
      <span style="padding: 2px 6px; border-radius: 4px; background: rgba(245,158,11,0.2); color: #fbbf24; font-weight: 700; border: 1px solid rgba(245,158,11,0.3);">Medium</span>
      <h2 style="font-size: 14px; font-weight: 700; color: #ffffff; margin: 0;">岛屿数量 (BFS 广度优先搜索)</h2>
    </div>
    <p style="margin: 0;">给你一个由 <code style="color: #38bdf8; font-family: monospace;">'1'</code>（陆地）和 <code style="color: #64748b; font-family: monospace;">'0'</code>（水）组成的的二维网格，请你计算网格中岛屿的数量。岛屿由水平方向或竖直方向上相邻的陆地连接而成。</p>
    <div style="padding: 10px; border-radius: 10px; background: #020617; border: 1px solid #1e293b; display: flex; flex-direction: column; gap: 6px; font-family: monospace; font-size: 11px;">
      <div style="color: #34d399; font-weight: 700;">核心思想:</div>
      <div>使用队列进行层层波浪式扩散，在节点<strong>入队时立即标记为 visited</strong>，防止重复入队导致内存暴涨。</div>
    </div>
  </div>
`;

export const ISLANDS_BFS_ANALYSIS_HTML = `
  <div style="display: flex; flex-direction: column; gap: 12px; color: #cbd5e1; font-size: 12px; line-height: 1.6;">
    <h3 style="font-size: 14px; font-weight: 700; color: #ffffff; margin: 0; display: flex; align-items: center; gap: 6px;">
      <span>💡</span> 队列辅助 BFS 扩散与即时标记
    </h3>
    <div style="display: flex; flex-direction: column; gap: 8px;">
      <div style="padding: 10px; border-radius: 10px; background: #020617; border: 1px solid #1e293b;">
        <div style="font-weight: 700; color: #60a5fa; margin-bottom: 4px;">① 入队即标记原则</div>
        <p style="margin: 0; color: #94a3b8;">
        1. 发现陆地 <code style="color: #34d399; font-family: monospace;">grid[r][c] == '1'</code>，<code style="color: #fbbf24; font-family: monospace;">count++</code>；<br/>
        2. <strong>起点入队并立即染色：</strong> <code style="color: #38bdf8; font-family: monospace;">grid[r][c] = '0'; queue.offer(new int[]{r, c});</code>；<br/>
        3. <strong>出队并向四周扫描：</strong> 弹出队首 <code style="color: #38bdf8; font-family: monospace;">(curR, curC)</code>，检查四邻；<br/>
        4. <strong>邻居入队：</strong> 若邻居为陆地，<strong>在加入队列的同时立即将其置为 '0'</strong>，保证每个节点只进队一次。
        </p>
      </div>
      <div style="padding: 10px; border-radius: 10px; background: #020617; border: 1px solid #1e293b;">
        <div style="font-weight: 700; color: #34d399; margin-bottom: 4px;">② 复杂度分析</div>
        <p style="margin: 0; color: #94a3b8;">
        • 时间复杂度：<code style="color: #34d399; font-family: monospace;">O(M × N)</code>，每个网格节点至多入队出队一次。<br/>
        • 空间复杂度：<code style="color: #60a5fa; font-family: monospace;">O(min(M, N))</code>，队列中最多容纳对角线周长数量的单元格。
        </p>
      </div>
    </div>
  </div>
`;

export const ISLANDS_BFS_CODE_LANGUAGES: Record<string, string[]> = {
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
    '                    grid[r][c] = \'0\'; // 入队立即标记',
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
    '    def numIslands(self, grid: list[list[str]]) -> int:',
    '        count = 0',
    '        m, n = len(grid), len(grid[0])',
    '        dirs = [(0,1), (1,0), (0,-1), (-1,0)]',
    '        for r in range(m):',
    '            for c in range(n):',
    '                if grid[r][c] == \'1\':',
    '                    count += 1',
    '                    grid[r][c] = \'0\'',
    '                    q = collections.deque([(r, c)])',
    '                    while q:',
    '                        cr, cc = q.popleft()',
    '                        for dr, dc in dirs:',
    '                            nr, nc = cr + dr, cc + dc',
    '                            if 0 <= nr < m and 0 <= nc < n and grid[nr][nc] == \'1\':',
    '                                grid[nr][nc] = \'0\'',
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
    '            if (grid[r][c] === \'1\') {',
    '                count++;',
    '                grid[r][c] = \'0\';',
    '                const q = [[r, c]];',
    '                while (q.length > 0) {',
    '                    const [cr, cc] = q.shift();',
    '                    for (const [dr, dc] of dirs) {',
    '                        const nr = cr + dr, nc = cc + dc;',
    '                        if (nr >= 0 && nr < m && nc >= 0 && nc < n && grid[nr][nc] === \'1\') {',
    '                            grid[nr][nc] = \'0\';',
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
