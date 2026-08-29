/**
 * 力扣 417. 太平洋大西洋水流问题 (Pacific Atlantic Water Flow)
 * 题目解析、算法精讲与四语言源码
 */

export const WATER_FLOW_PROBLEM_HTML = `
<div style="line-height: 1.7; font-size: 13.5px; color: #cbd5e1;">
  <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 12px;">
    <span style="font-weight: 800; font-size: 16px; color: #f8fafc;">417. 太平洋大西洋水流问题</span>
    <span style="background: #854d0e; color: #fde047; font-size: 11px; font-weight: 700; padding: 2px 8px; border-radius: 4px;">中等 / Medium</span>
  </div>

  <p>有一个 <code>m × n</code> 的矩形岛屿，与 <strong>太平洋</strong> 和 <strong>大西洋</strong> 相邻。 <strong>“太平洋”</strong> 处于大陆的左边界和上边界，而 <strong>“大西洋”</strong> 处于大陆的右边界和下边界。</p>
  <p>这个岛被分割成一个由若干方形单元格组成的网格。给定一个 <code>m x n</code> 的整数矩阵 <code>heights</code> ， <code>heights[r][c]</code> 表示坐标 <code>(r, c)</code> 上单元格 <strong>高于海平面的高度</strong> 。</p>
  <p>岛上雨水充沛。雨水向四周相邻单元格流动，只能从较高或等高的单元格流向较低或等高的单元格。</p>
  <p>返回网格坐标 <code>result</code> 的 <strong>2D 列表</strong> ，其中 <code>result[i] = [r_i, c_i]</code> 表示雨水从单元格 <code>(r_i, c_i)</code> 流动 <strong>既可流向太平洋也可流向大西洋</strong> 。</p>

  <h4 style="color: #38bdf8; margin-top: 16px; margin-bottom: 8px;">示例 1：</h4>
  <pre style="background: #1e293b; padding: 10px; border-radius: 8px; font-size: 12px; color: #e2e8f0;"><strong>输入:</strong> heights = [[1,2,2,3,5],[3,2,3,4,4],[2,4,5,3,1],[6,7,1,4,5],[5,1,1,2,4]]
<strong>输出:</strong> [[0,4],[1,3],[1,4],[2,2],[3,0],[3,1],[4,0]]</pre>
</div>
`;

export const WATER_FLOW_ANALYSIS_HTML = `
<div style="line-height: 1.7; font-size: 13.5px; color: #cbd5e1;">
  <h3 style="color: #38bdf8; margin-top: 0;">💡 核心思路：从双洋边界逆流而上 (DFS / BFS)</h3>
  <p>正向思考：从每个格子出发模拟水往低处流，最坏情况下会重复遍历大量格子。<strong>逆向思考</strong>更加优雅高效：</p>

  <h4 style="color: #67e8f9; margin-top: 12px;">算法流程：</h4>
  <ol style="padding-left: 20px;">
    <li><strong>太平洋逆流搜索：</strong>从左侧和上侧边界出发，只能流向<strong>等高或更高</strong>的相邻格子（逆流登山），用 <code>pacific[r][c] = true</code> 记录能流向太平洋的所有格子。</li>
    <li><strong>大西洋逆流搜索：</strong>从右侧和下侧边界出发同样逆流搜索，用 <code>atlantic[r][c] = true</code> 记录能流向大西洋的所有格子。</li>
    <li><strong>求两洋交集：</strong>遍历整个矩阵，凡是 <code>pacific[r][c] && atlantic[r][c]</code> 均为既能流向太平洋又能流向大西洋的双洋枢纽。</li>
  </ol>

  <h4 style="color: #67e8f9; margin-top: 12px;">复杂度分析</h4>
  <ul style="padding-left: 20px;">
    <li><strong>时间复杂度：</strong><code>O(M × N)</code>，两个方向各遍历一次矩阵。</li>
    <li><strong>空间复杂度：</strong><code>O(M × N)</code>，用于保存双洋可达性布尔数组。</li>
  </ul>
</div>
`;

export const WATER_FLOW_CODE_LANGUAGES: Record<string, string[]> = {
  java: [
    'class Solution {',
    '    public List<List<Integer>> pacificAtlantic(int[][] heights) {',
    '        List<List<Integer>> res = new ArrayList<>();',
    '        int m = heights.length, n = heights[0].length;',
    '        boolean[][] pac = new boolean[m][n], atl = new boolean[m][n];',
    '        // 左右边界',
    '        for (int r = 0; r < m; r++) {',
    '            dfs(heights, pac, r, 0, heights[r][0]);',
    '            dfs(heights, atl, r, n - 1, heights[r][n - 1]);',
    '        }',
    '        // 上下边界',
    '        for (int c = 0; c < n; c++) {',
    '            dfs(heights, pac, 0, c, heights[0][c]);',
    '            dfs(heights, atl, m - 1, c, heights[m - 1][c]);',
    '        }',
    '        // 求交集',
    '        for (int r = 0; r < m; r++) {',
    '            for (int c = 0; c < n; c++) {',
    '                if (pac[r][c] && atl[r][c]) res.add(Arrays.asList(r, c));',
    '            }',
    '        }',
    '        return res;',
    '    }',
    '    private void dfs(int[][] h, boolean[][] visited, int r, int c, int prevH) {',
    '        if (r < 0 || r >= h.length || c < 0 || c >= h[0].length || visited[r][c] || h[r][c] < prevH) return;',
    '        visited[r][c] = true;',
    '        dfs(h, visited, r + 1, c, h[r][c]);',
    '        dfs(h, visited, r - 1, c, h[r][c]);',
    '        dfs(h, visited, r, c + 1, h[r][c]);',
    '        dfs(h, visited, r, c - 1, h[r][c]);',
    '    }',
    '}',
  ],
  cpp: [
    'class Solution {',
    'public:',
    '    vector<vector<int>> pacificAtlantic(vector<vector<int>>& heights) {',
    '        int m = heights.size(), n = heights[0].size();',
    '        vector<vector<bool>> pac(m, vector<bool>(n, false)), atl(m, vector<bool>(n, false));',
    '        for (int r = 0; r < m; ++r) {',
    '            dfs(heights, pac, r, 0, heights[r][0]);',
    '            dfs(heights, atl, r, n - 1, heights[r][n - 1]);',
    '        }',
    '        for (int c = 0; c < n; ++c) {',
    '            dfs(heights, pac, 0, c, heights[0][c]);',
    '            dfs(heights, atl, m - 1, c, heights[m - 1][c]);',
    '        }',
    '        vector<vector<int>> res;',
    '        for (int r = 0; r < m; ++r)',
    '            for (int c = 0; c < n; ++c)',
    '                if (pac[r][c] && atl[r][c]) res.push_back({r, c});',
    '        return res;',
    '    }',
    'private:',
    '    void dfs(vector<vector<int>>& h, vector<vector<bool>>& vis, int r, int c, int prevH) {',
    '        if (r < 0 || r >= h.size() || c < 0 || c >= h[0].size() || vis[r][c] || h[r][c] < prevH) return;',
    '        vis[r][c] = true;',
    '        dfs(h, vis, r + 1, c, h[r][c]); dfs(h, vis, r - 1, c, h[r][c]);',
    '        dfs(h, vis, r, c + 1, h[r][c]); dfs(h, vis, r, c - 1, h[r][c]);',
    '    }',
    '};',
  ],
  python: [
    'class Solution:',
    '    def pacificAtlantic(self, heights: List[List[int]]) -> List[List[int]]:',
    '        m, n = len(heights), len(heights[0])',
    '        pac, atl = set(), set()',
    '        def dfs(r, c, visited, prev_h):',
    '            if (r, c) in visited or r < 0 or r >= m or c < 0 or c >= n or heights[r][c] < prev_h:',
    '                return',
    '            visited.add((r, c))',
    '            for dr, dc in [(-1,0), (1,0), (0,-1), (0,1)]:',
    '                dfs(r + dr, c + dc, visited, heights[r][c])',
    '        for r in range(m):',
    '            dfs(r, 0, pac, heights[r][0])',
    '            dfs(r, n - 1, atl, heights[r][n - 1])',
    '        for c in range(n):',
    '            dfs(0, c, pac, heights[0][c])',
    '            dfs(m - 1, c, atl, heights[m - 1][c])',
    '        return list(pac & atl)',
  ],
  javascript: [
    'var pacificAtlantic = function(heights) {',
    '    const m = heights.length, n = heights[0].length;',
    '    const pac = Array.from({length: m}, () => Array(n).fill(false));',
    '    const atl = Array.from({length: m}, () => Array(n).fill(false));',
    '    const dfs = (r, c, vis, prevH) => {',
    '        if (r < 0 || r >= m || c < 0 || c >= n || vis[r][c] || heights[r][c] < prevH) return;',
    '        vis[r][c] = true;',
    '        dfs(r + 1, c, vis, heights[r][c]); dfs(r - 1, c, vis, heights[r][c]);',
    '        dfs(r, c + 1, vis, heights[r][c]); dfs(r, c - 1, vis, heights[r][c]);',
    '    };',
    '    for (let r = 0; r < m; r++) {',
    '        dfs(r, 0, pac, heights[r][0]);',
    '        dfs(r, n - 1, atl, heights[r][n - 1]);',
    '    }',
    '    for (let c = 0; c < n; c++) {',
    '        dfs(0, c, pac, heights[0][c]);',
    '        dfs(m - 1, c, atl, heights[m - 1][c]);',
    '    }',
    '    const res = [];',
    '    for (let r = 0; r < m; r++) {',
    '        for (let c = 0; c < n; c++) {',
    '            if (pac[r][c] && atl[r][c]) res.push([r, c]);',
    '        }',
    '    }',
    '    return res;',
    '};',
  ],
};
