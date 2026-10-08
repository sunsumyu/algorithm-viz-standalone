/**
 * 不同岛屿的数量 (Number of Distinct Islands · LeetCode 694)
 * 领域知识与四语言题解精讲配置声明
 */

export const DISTINCT_ISLANDS_PROBLEM_HTML = `
  <div style="display: flex; flex-direction: column; gap: 12px; color: #cbd5e1; font-size: 12px; line-height: 1.6;">
    <div style="display: flex; align-items: center; gap: 8px;">
      <span style="padding: 2px 6px; border-radius: 4px; background: rgba(59,130,246,0.2); color: #60a5fa; font-weight: 700; border: 1px solid rgba(59,130,246,0.3);">LeetCode 694</span>
      <span style="padding: 2px 6px; border-radius: 4px; background: rgba(245,158,11,0.2); color: #fbbf24; font-weight: 700; border: 1px solid rgba(245,158,11,0.3);">Medium</span>
      <h2 style="font-size: 14px; font-weight: 700; color: #ffffff; margin: 0;">不同岛屿的数量 (Distinct Islands)</h2>
    </div>
    <p style="margin: 0;">给定一个大小为 <code style="color: #38bdf8; font-family: monospace;">m × n</code> 的二进制矩阵 <code style="color: #60a5fa; font-family: monospace;">grid</code>，由 <code style="color: #34d399; font-family: monospace;">1</code>（陆地）和 <code style="color: #64748b; font-family: monospace;">0</code>（水域）组成。<br/>
    一个岛屿是由水平方向或垂直方向相连的陆地组成的连通块。<strong>如果一个岛屿可以通过平移（不能旋转或翻转）与另一个岛屿完全重合</strong>，则认为这两个岛屿是相同的。<br/>
    返回矩阵中<strong>互不相同形状</strong>的岛屿的数量。</p>
    <div style="padding: 10px; border-radius: 10px; background: #020617; border: 1px solid #1e293b; display: flex; flex-direction: column; gap: 6px; font-family: monospace; font-size: 11px;">
      <div style="color: #34d399; font-weight: 700;">核心平移不变性破局：基准原点相对坐标序列化</div>
      <div>1. 无论岛屿出现在网格的哪个绝对位置，其几何形状完全由其相对于该岛屿<strong>起始锚点 (r0, c0) 的相对偏移坐标</strong> <code style="color: #fbbf24;">(r - r0, c - c0)</code> 决定；<br/>
      2. 在 DFS 连通分量遍历时收集所有相对坐标并按顺序序列化为形状签名字符串（Shape Signature）；<br/>
      3. 将签名存入哈希集合 <code style="color: #a855f7;">Set&lt;string&gt;</code>，集合的元素个数即为不同几何形状岛屿的总数！</div>
    </div>
  </div>
`;

export const DISTINCT_ISLANDS_ANALYSIS_HTML = `
  <div style="display: flex; flex-direction: column; gap: 12px; color: #cbd5e1; font-size: 12px; line-height: 1.6;">
    <h3 style="font-size: 14px; font-weight: 700; color: #ffffff; margin: 0; display: flex; align-items: center; gap: 6px;">
      <span>💡</span> 几何形状哈希化与平移不变性模型
    </h3>
    <div style="display: flex; flex-direction: column; gap: 8px;">
      <div style="padding: 10px; border-radius: 10px; background: #020617; border: 1px solid #1e293b;">
        <div style="font-weight: 700; color: #60a5fa; margin-bottom: 4px;">① 相对坐标原点归一化</div>
        <p style="margin: 0; color: #94a3b8;">
        当外层循环扫描到某岛屿的首个陆地格子 <code style="color: #34d399; font-family: monospace;">(r0, c0)</code> 时，以此为基准原点。<br/>
        DFS 遍历该岛屿的每个点 <code style="color: #38bdf8; font-family: monospace;">(r, c)</code>，记录其相对偏移 <code style="color: #fbbf24; font-family: monospace;">(r - r0, c - c0)</code>，并将该点置为 <code style="color: #64748b; font-family: monospace;">0</code> 防止重复遍历。<br/>
        将相对坐标排序后拼接为唯一字符串，如 <code style="color: #a855f7; font-family: monospace;">"0,0:0,1:1,0:1,1"</code> 代表 2×2 正方形。
        </p>
      </div>
      <div style="padding: 10px; border-radius: 10px; background: #020617; border: 1px solid #1e293b;">
        <div style="font-weight: 700; color: #34d399; margin-bottom: 4px;">② 哈希去重</div>
        <p style="margin: 0; color: #94a3b8;">
        将计算得到的形状签名加入哈希集合 <code style="color: #34d399; font-family: monospace;">Set</code>。<br/>
        若集合中已存在相同签名，则判定为同构岛屿（平移等价），去重丢弃；若不存在则新增一种独立岛屿形态。
        </p>
      </div>
      <div style="padding: 10px; border-radius: 10px; background: #020617; border: 1px solid #1e293b;">
        <div style="font-weight: 700; color: #a855f7; margin-bottom: 4px;">③ 复杂度分析</div>
        <p style="margin: 0; color: #94a3b8;">
        • 时间复杂度：<code style="color: #34d399; font-family: monospace;">O(M × N)</code>，每个单元格仅被访问常数次，相对坐标数量总和为陆地格数。<br/>
        • 空间复杂度：<code style="color: #60a5fa; font-family: monospace;">O(M × N)</code>，递归栈与哈希集合所占用的内存空间。
        </p>
      </div>
    </div>
  </div>
`;

export const DISTINCT_ISLANDS_CODE_LANGUAGES: Record<string, string[]> = {
  java: [
    'public class Solution {',
    '    public int numDistinctIslands(int[][] grid) {',
    '        int m = grid.length, n = grid[0].length;',
    '        Set<String> shapes = new HashSet<>();',
    '        for (int i = 0; i < m; i++) {',
    '            for (int j = 0; j < n; j++) {',
    '                if (grid[i][j] == 1) {',
    '                    List<String> path = new ArrayList<>();',
    '                    dfs(grid, i, j, i, j, path);',
    '                    shapes.add(String.join(";", path));',
    '                }',
    '            }',
    '        }',
    '        return shapes.size();',
    '    }',
    '    private void dfs(int[][] grid, int r, int c, int r0, int c0, List<String> path) {',
    '        if (r < 0 || r >= grid.length || c < 0 || c >= grid[0].length || grid[r][c] == 0) return;',
    '        grid[r][c] = 0; // 沉没已访问陆地',
    '        path.add((r - r0) + "," + (c - c0)); // 相对基准原点坐标',
    '        dfs(grid, r + 1, c, r0, c0, path);',
    '        dfs(grid, r - 1, c, r0, c0, path);',
    '        dfs(grid, r, c + 1, r0, c0, path);',
    '        dfs(grid, r, c - 1, r0, c0, path);',
    '    }',
    '}',
  ],
  cpp: [
    'class Solution {',
    'public:',
    '    int numDistinctIslands(vector<vector<int>>& grid) {',
    '        int m = grid.size(), n = grid[0].size();',
    '        unordered_set<string> shapes;',
    '        for (int i = 0; i < m; i++) {',
    '            for (int j = 0; j < n; j++) {',
    '                if (grid[i][j] == 1) {',
    '                    string shape = "";',
    '                    dfs(grid, i, j, i, j, shape);',
    '                    shapes.insert(shape);',
    '                }',
    '            }',
    '        }',
    '        return shapes.size();',
    '    }',
    '    void dfs(vector<vector<int>>& grid, int r, int c, int r0, int c0, string& shape) {',
    '        if (r < 0 || r >= grid.size() || c < 0 || c >= grid[0].size() || grid[r][c] == 0) return;',
    '        grid[r][c] = 0;',
    '        shape += to_string(r - r0) + "," + to_string(c - c0) + ";";',
    '        dfs(grid, r + 1, c, r0, c0, shape);',
    '        dfs(grid, r - 1, c, r0, c0, shape);',
    '        dfs(grid, r, c + 1, r0, c0, shape);',
    '        dfs(grid, r, c - 1, r0, c0, shape);',
    '    }',
    '};',
  ],
  python: [
    'class Solution:',
    '    def numDistinctIslands(self, grid: List[List[int]]) -> int:',
    '        m, n = len(grid), len(grid[0])',
    '        shapes = set()',
    '        def dfs(r, c, r0, c0, path):',
    '            if r < 0 or r >= m or c < 0 or c >= n or grid[r][c] == 0:',
    '                return',
    '            grid[r][c] = 0',
    '            path.append(f"{r - r0},{c - c0}")',
    '            dfs(r + 1, c, r0, c0, path)',
    '            dfs(r - 1, c, r0, c0, path)',
    '            dfs(r, c + 1, r0, c0, path)',
    '            dfs(r, c - 1, r0, c0, path)',
    '        for i in range(m):',
    '            for j in range(n):',
    '                if grid[i][j] == 1:',
    '                    path = []',
    '                    dfs(i, j, i, j, path)',
    '                    shapes.add(";".join(path))',
    '        return len(shapes)',
  ],
  javascript: [
    'var numDistinctIslands = function(grid) {',
    '    const m = grid.length, n = grid[0].length;',
    '    const shapes = new Set();',
    '    function dfs(r, c, r0, c0, path) {',
    '        if (r < 0 || r >= m || c < 0 || c >= n || grid[r][c] === 0) return;',
    '        grid[r][c] = 0;',
    '        path.push(`${r - r0},${c - c0}`);',
    '        dfs(r + 1, c, r0, c0, path);',
    '        dfs(r - 1, c, r0, c0, path);',
    '        dfs(r, c + 1, r0, c0, path);',
    '        dfs(r, c - 1, r0, c0, path);',
    '    }',
    '    for (let i = 0; i < m; i++) {',
    '        for (let j = 0; j < n; j++) {',
    '            if (grid[i][j] === 1) {',
    '                const path = [];',
    '                dfs(i, j, i, j, path);',
    '                shapes.add(path.join(";"));',
    '            }',
    '        }',
    '    }',
    '    return shapes.size;',
    '};',
  ],
};
