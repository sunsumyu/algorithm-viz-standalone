/**
 * 统计子岛屿 (Count Sub Islands · LeetCode 1905)
 * 领域知识与四语言题解精讲配置声明
 */

export const SUB_ISLANDS_PROBLEM_HTML = `
  <div style="display: flex; flex-direction: column; gap: 12px; color: #cbd5e1; font-size: 12px; line-height: 1.6;">
    <div style="display: flex; align-items: center; gap: 8px;">
      <span style="padding: 2px 6px; border-radius: 4px; background: rgba(59,130,246,0.2); color: #60a5fa; font-weight: 700; border: 1px solid rgba(59,130,246,0.3);">LeetCode 1905</span>
      <span style="padding: 2px 6px; border-radius: 4px; background: rgba(245,158,11,0.2); color: #fbbf24; font-weight: 700; border: 1px solid rgba(245,158,11,0.3);">Medium</span>
      <h2 style="font-size: 14px; font-weight: 700; color: #ffffff; margin: 0;">统计子岛屿 (Count Sub Islands)</h2>
    </div>
    <p style="margin: 0;">给你两个 <code style="color: #38bdf8; font-family: monospace;">m × n</code> 的二进制矩阵 <code style="color: #60a5fa; font-family: monospace;">grid1</code> 和 <code style="color: #34d399; font-family: monospace;">grid2</code>，均由 <code style="color: #34d399; font-family: monospace;">'1'</code>（陆地）和 <code style="color: #64748b; font-family: monospace;">'0'</code>（水域）组成。<br/>
    如果 <code style="color: #34d399; font-family: monospace;">grid2</code> 的一个岛屿中<strong>每一个陆地格子</strong>在 <code style="color: #60a5fa; font-family: monospace;">grid1</code> 中也全部都是陆地，则称该岛屿为<strong>子岛屿</strong>。<br/>
    返回 <code style="color: #34d399; font-family: monospace;">grid2</code> 中子岛屿的数目。</p>
    <div style="padding: 10px; border-radius: 10px; background: #020617; border: 1px solid #1e293b; display: flex; flex-direction: column; gap: 6px; font-family: monospace; font-size: 11px;">
      <div style="color: #34d399; font-weight: 700;">核心逆向思维：反向剪枝排除法</div>
      <div>1. 只要 <code style="color: #34d399;">grid2[r][c] == 1</code> 而 <code style="color: #60a5fa;">grid1[r][c] == 0</code>（母图对应格为水域），则该点所在的整座连通岛屿<strong>绝无可能是子岛屿</strong>！<br/>
      2. 阶段一：遍历 grid2，一旦遇到 <code style="color: #f43f5e;">grid2[r][c] == 1 && grid1[r][c] == 0</code>，立即发起 DFS 沉没整座不合格岛屿；<br/>
      3. 阶段二：排除所有不合格岛屿后，grid2 剩下的陆地必然 100% 全是纯正子岛屿，直接执行常规岛屿计数 DFS 即可！</div>
    </div>
  </div>
`;

export const SUB_ISLANDS_ANALYSIS_HTML = `
  <div style="display: flex; flex-direction: column; gap: 12px; color: #cbd5e1; font-size: 12px; line-height: 1.6;">
    <h3 style="font-size: 14px; font-weight: 700; color: #ffffff; margin: 0; display: flex; align-items: center; gap: 6px;">
      <span>💡</span> 逆向沉岛剪枝算法模型
    </h3>
    <div style="display: flex; flex-direction: column; gap: 8px;">
      <div style="padding: 10px; border-radius: 10px; background: #020617; border: 1px solid #1e293b;">
        <div style="font-weight: 700; color: #f43f5e; margin-bottom: 4px;">阶段一：逆向剪枝排除非子岛 (Pruning Non-Sub Islands)</div>
        <p style="margin: 0; color: #94a3b8;">
        双重循环扫描每个单元格 <code style="color: #38bdf8; font-family: monospace;">(r, c)</code>：<br/>
        当发现 <code style="color: #34d399; font-family: monospace;">grid2[r][c] == 1 && grid1[r][c] == 0</code> 时，说明该岛屿“越界”冒犯了母图水域，该连通块彻底作废！<br/>
        直接调用 <code style="color: #f43f5e; font-family: monospace;">dfs(grid2, r, c)</code> 将其整座岛屿在 grid2 中沉没为 0。
        </p>
      </div>
      <div style="padding: 10px; border-radius: 10px; background: #020617; border: 1px solid #1e293b;">
        <div style="font-weight: 700; color: #34d399; margin-bottom: 4px;">阶段二：统计纯净子岛屿 (Count Remaining Sub-Islands)</div>
        <p style="margin: 0; color: #94a3b8;">
        经过第一阶段的逆向排查，当前 grid2 中保留的每一个连通块，其所有陆地格子在 grid1 中都必然对应陆地。<br/>
        遍历 grid2，若 <code style="color: #34d399; font-family: monospace;">grid2[r][c] == 1</code>，则说明发现一座合法的全新子岛屿：<code style="color: #fbbf24; font-family: monospace;">count++</code>，并 DFS 浸没该子岛防止重复统计。
        </p>
      </div>
      <div style="padding: 10px; border-radius: 10px; background: #020617; border: 1px solid #1e293b;">
        <div style="font-weight: 700; color: #a855f7; margin-bottom: 4px;">复杂度分析</div>
        <p style="margin: 0; color: #94a3b8;">
        • 时间复杂度：<code style="color: #34d399; font-family: monospace;">O(M × N)</code>，每个网格单元最多被常数次访问与淹没。<br/>
        • 空间复杂度：<code style="color: #60a5fa; font-family: monospace;">O(M × N)</code>，最坏递归栈深度。
        </p>
      </div>
    </div>
  </div>
`;

export const SUB_ISLANDS_CODE_LANGUAGES: Record<string, string[]> = {
  java: [
    'public class Solution {',
    '    public int countSubIslands(int[][] grid1, int[][] grid2) {',
    '        int m = grid1.length, n = grid1[0].length;',
    '        // 阶段一：排除所有在 grid1 中对应水域的非子岛',
    '        for (int i = 0; i < m; i++) {',
    '            for (int j = 0; j < n; j++) {',
    '                if (grid2[i][j] == 1 && grid1[i][j] == 0) {',
    '                    dfs(grid2, i, j); // 逆向整岛淹没',
    '                }',
    '            }',
    '        }',
    '        // 阶段二：剩下的陆地必然全是子岛屿',
    '        int count = 0;',
    '        for (int i = 0; i < m; i++) {',
    '            for (int j = 0; j < n; j++) {',
    '                if (grid2[i][j] == 1) {',
    '                    count++;',
    '                    dfs(grid2, i, j);',
    '                }',
    '            }',
    '        }',
    '        return count;',
    '    }',
    '    private void dfs(int[][] grid, int r, int c) {',
    '        if (r < 0 || r >= grid.length || c < 0 || c >= grid[0].length || grid[r][c] == 0) return;',
    '        grid[r][c] = 0; // 就地沉没',
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
    '    int countSubIslands(vector<vector<int>>& grid1, vector<vector<int>>& grid2) {',
    '        int m = grid1.size(), n = grid1[0].size();',
    '        // 阶段一：排除在 grid1 中为水域的非子岛',
    '        for (int i = 0; i < m; i++) {',
    '            for (int j = 0; j < n; j++) {',
    '                if (grid2[i][j] == 1 && grid1[i][j] == 0) {',
    '                    dfs(grid2, i, j);',
    '                }',
    '            }',
    '        }',
    '        // 阶段二：统计纯净子岛屿',
    '        int count = 0;',
    '        for (int i = 0; i < m; i++) {',
    '            for (int j = 0; j < n; j++) {',
    '                if (grid2[i][j] == 1) {',
    '                    count++;',
    '                    dfs(grid2, i, j);',
    '                }',
    '            }',
    '        }',
    '        return count;',
    '    }',
    '    void dfs(vector<vector<int>>& grid, int r, int c) {',
    '        if (r < 0 || r >= grid.size() || c < 0 || c >= grid[0].size() || grid[r][c] == 0) return;',
    '        grid[r][c] = 0;',
    '        dfs(grid, r + 1, c);',
    '        dfs(grid, r - 1, c);',
    '        dfs(grid, r, c + 1);',
    '        dfs(grid, r, c - 1);',
    '    }',
    '};',
  ],
  python: [
    'class Solution:',
    '    def countSubIslands(self, grid1: List[List[int]], grid2: List[List[int]]) -> int:',
    '        m, n = len(grid1), len(grid1[0])',
    '        def dfs(r, c):',
    '            if r < 0 or r >= m or c < 0 or c >= n or grid2[r][c] == 0:',
    '                return',
    '            grid2[r][c] = 0',
    '            dfs(r + 1, c); dfs(r - 1, c)',
    '            dfs(r, c + 1); dfs(r, c - 1)',
    '        # 阶段一：排除所有在母图中对应水域的非子岛',
    '        for i in range(m):',
    '            for j in range(n):',
    '                if grid2[i][j] == 1 and grid1[i][j] == 0:',
    '                    dfs(i, j)',
    '        # 阶段二：统计所有合法子岛屿',
    '        count = 0',
    '        for i in range(m):',
    '            for j in range(n):',
    '                if grid2[i][j] == 1:',
    '                    count += 1',
    '                    dfs(i, j)',
    '        return count',
  ],
  javascript: [
    'var countSubIslands = function(grid1, grid2) {',
    '    const m = grid1.length, n = grid1[0].length;',
    '    function dfs(r, c) {',
    '        if (r < 0 || r >= m || c < 0 || c >= n || grid2[r][c] === 0) return;',
    '        grid2[r][c] = 0;',
    '        dfs(r + 1, c); dfs(r - 1, c);',
    '        dfs(r, c + 1); dfs(r, c - 1);',
    '    }',
    '    // 阶段一：排除所有非子岛',
    '    for (let i = 0; i < m; i++) {',
    '        for (let j = 0; j < n; j++) {',
    '            if (grid2[i][j] === 1 && grid1[i][j] === 0) {',
    '                dfs(i, j);',
    '            }',
    '        }',
    '    }',
    '    // 阶段二：统计纯净子岛屿',
    '    let count = 0;',
    '    for (let i = 0; i < m; i++) {',
    '        for (let j = 0; j < n; j++) {',
    '            if (grid2[i][j] === 1) {',
    '                count++;',
    '                dfs(i, j);',
    '            }',
    '        }',
    '    }',
    '    return count;',
    '};',
  ],
};
