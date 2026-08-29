/**
 * KamaCoder 44: 开发商购买土地 (Buy Land / 二维前缀和)
 * 领域知识与题解精讲配置声明
 */

export const BUY_LAND_PROBLEM_HTML = `
  <div style="display: flex; flex-direction: column; gap: 12px; color: #cbd5e1; font-size: 12px; line-height: 1.6;">
    <div style="display: flex; align-items: center; gap: 8px;">
      <span style="padding: 2px 6px; border-radius: 4px; background: rgba(59,130,246,0.2); color: #60a5fa; font-weight: 700; border: 1px solid rgba(59,130,246,0.3);">KamaCoder 44</span>
      <span style="padding: 2px 6px; border-radius: 4px; background: rgba(245,158,11,0.2); color: #fbbf24; font-weight: 700; border: 1px solid rgba(245,158,11,0.3);">Medium</span>
      <h2 style="font-size: 14px; font-weight: 700; color: #ffffff; margin: 0;">开发商购买土地 (Buy Land / 二维前缀和)</h2>
    </div>
    <p style="margin: 0;">在一个 <code style="color: #fde047; font-family: monospace;">n &times; m</code> 的区域中，每个小方格代表一块土地的价值。开发商拥有一定的预算 <code style="color: #fde047; font-family: monospace;">budget</code> ，希望购买一块 <strong>连续的矩形土地</strong>，使得矩形土地内所有单元格的价值总和 <strong>不超过预算的前提下，土地面积最大</strong>。</p>
    <div style="padding: 10px; border-radius: 10px; background: #020617; border: 1px solid #1e293b; display: flex; flex-direction: column; gap: 6px; font-family: monospace; font-size: 11px;">
      <div style="color: #34d399; font-weight: 700;">示例:</div>
      <div>输入: grid = [[1, 2, 3], [4, 5, 6], [7, 8, 9]], budget = 20</div>
      <div>输出: 最大面积 = 4 (矩形 [0,0] 到 [1,1] 价值和 1+2+4+5=12 &le; 20)</div>
    </div>
    <div style="display: flex; flex-direction: column; gap: 4px; color: #94a3b8; font-size: 11.5px;">
      <div style="font-weight: 700; color: #cbd5e1;">提示：</div>
      <div>• 1 &le; n, m &le; 100</div>
      <div>• 1 &le; grid[i][j] &le; 100</div>
      <div>• 0 &le; budget &le; 10<sup>5</sup></div>
    </div>
  </div>
`;

export const BUY_LAND_ANALYSIS_HTML = `
  <div style="display: flex; flex-direction: column; gap: 12px; color: #cbd5e1; font-size: 12px; line-height: 1.6;">
    <h3 style="font-size: 14px; font-weight: 700; color: #ffffff; margin: 0; display: flex; align-items: center; gap: 6px;">
      <span>💡</span> 二维前缀和：容斥原理构建与 O(1) 任意子矩形求和
    </h3>
    <div style="display: flex; flex-direction: column; gap: 8px;">
      <div style="padding: 10px; border-radius: 10px; background: #020617; border: 1px solid #1e293b;">
        <div style="font-weight: 700; color: #60a5fa; margin-bottom: 4px;">① 二维前缀和构建公式</div>
        <p style="margin: 0; color: #94a3b8;">
        定义 <code style="color: #38bdf8; font-family: monospace;">prefix[i+1][j+1]</code> 为以 <code style="color: #fbbf24; font-family: monospace;">(0, 0)</code> 为左上角，以 <code style="color: #fbbf24; font-family: monospace;">(i, j)</code> 为右下角的矩形区域元素总和：<br/>
        <code style="color: #34d399; font-family: monospace; font-weight: 700;">prefix[i+1][j+1] = grid[i][j] + prefix[i][j+1] + prefix[i+1][j] - prefix[i][j]</code><br/>
        加上上方矩形和左方矩形，减去重复相加的左上重叠部分，再加上当前单元格！
        </p>
      </div>
      <div style="padding: 10px; border-radius: 10px; background: #020617; border: 1px solid #1e293b;">
        <div style="font-weight: 700; color: #34d399; margin-bottom: 4px;">② 任意子矩形区域和计算公式</div>
        <p style="margin: 0; color: #94a3b8;">
        对于左上角 <code style="color: #38bdf8; font-family: monospace;">(r1, c1)</code>、右下角 <code style="color: #f59e0b; font-family: monospace;">(r2, c2)</code> 的任意矩形：<br/>
        <code style="color: #34d399; font-family: monospace; font-weight: 700;">sum = prefix[r2+1][c2+1] - prefix[r1][c2+1] - prefix[r2+1][c1] + prefix[r1][c1]</code><br/>
        大矩形减去上方多余和左方多余，再加上被重复减去两次的左上角重叠区域！
        </p>
      </div>
      <div style="padding: 10px; border-radius: 10px; background: #020617; border: 1px solid #1e293b;">
        <div style="font-weight: 700; color: #f472b6; margin-bottom: 4px;">③ 购买土地决策优化</div>
        <p style="margin: 0; color: #94a3b8;">
        枚举所有可能的子矩形 <code style="color: #60a5fa; font-family: monospace;">(r1, c1) ~ (r2, c2)</code>，利用前缀和 <code style="color: #34d399; font-family: monospace;">O(1)</code> 算出价值总和。<br/>
        若总和 <code style="color: #fbbf24; font-family: monospace;">&le; budget</code>，则计算面积 <code style="color: #a78bfa; font-family: monospace;">(r2 - r1 + 1) * (c2 - c1 + 1)</code> 并更新最大面积。
        </p>
      </div>
    </div>
  </div>
`;

export const BUY_LAND_CODE_LANGUAGES: Record<string, string[]> = {
  java: [
    'public int[] buyLand(int[][] grid, int budget) {',
    '    int m = grid.length, n = grid[0].length;',
    '    int[][] prefix = new int[m + 1][n + 1];',
    '    for (int i = 0; i < m; i++)',
    '        for (int j = 0; j < n; j++)',
    '            prefix[i + 1][j + 1] = grid[i][j] + prefix[i][j + 1] + prefix[i + 1][j] - prefix[i][j];',
    '    int bestArea = 0;',
    '    int[] bestRect = new int[]{0, 0, 0, 0};',
    '    for (int r1 = 0; r1 < m; r1++)',
    '      for (int c1 = 0; c1 < n; c1++)',
    '        for (int r2 = r1; r2 < m; r2++)',
    '          for (int c2 = c1; c2 < n; c2++) {',
    '            int sum = prefix[r2 + 1][c2 + 1] - prefix[r1][c2 + 1] - prefix[r2 + 1][c1] + prefix[r1][c1];',
    '            if (sum <= budget) {',
    '                int area = (r2 - r1 + 1) * (c2 - c1 + 1);',
    '                if (area > bestArea) {',
    '                    bestArea = area;',
    '                    bestRect = new int[]{r1, c1, r2, c2};',
    '                }',
    '            }',
    '          }',
    '    return new int[]{bestArea, bestRect[0], bestRect[1], bestRect[2], bestRect[3]};',
    '}',
  ],
  cpp: [
    'class Solution {',
    'public:',
    '    vector<int> buyLand(vector<vector<int>>& grid, int budget) {',
    '        int m = grid.size(), n = grid[0].size();',
    '        vector<vector<int>> prefix(m + 1, vector<int>(n + 1, 0));',
    '        for (int i = 0; i < m; i++)',
    '            for (int j = 0; j < n; j++)',
    '                prefix[i + 1][j + 1] = grid[i][j] + prefix[i][j + 1] + prefix[i + 1][j] - prefix[i][j];',
    '        int bestArea = 0;',
    '        vector<int> bestRect = {0, 0, 0, 0};',
    '        for (int r1 = 0; r1 < m; r1++)',
    '          for (int c1 = 0; c1 < n; c1++)',
    '            for (int r2 = r1; r2 < m; r2++)',
    '              for (int c2 = c1; c2 < n; c2++) {',
    '                int sum = prefix[r2 + 1][c2 + 1] - prefix[r1][c2 + 1] - prefix[r2 + 1][c1] + prefix[r1][c1];',
    '                if (sum <= budget) {',
    '                    int area = (r2 - r1 + 1) * (c2 - c1 + 1);',
    '                    if (area > bestArea) {',
    '                        bestArea = area;',
    '                        bestRect = {r1, c1, r2, c2};',
    '                    }',
    '                }',
    '              }',
    '        return {bestArea, bestRect[0], bestRect[1], bestRect[2], bestRect[3]};',
    '    }',
    '};',
  ],
  python: [
    'class Solution:',
    '    def buyLand(self, grid: List[List[int]], budget: int) -> List[int]:',
    '        m, n = len(grid), len(grid[0])',
    '        prefix = [[0] * (n + 1) for _ in range(m + 1)]',
    '        for i in range(m):',
    '            for j in range(n):',
    '                prefix[i + 1][j + 1] = grid[i][j] + prefix[i][j + 1] + prefix[i + 1][j] - prefix[i][j]',
    '        best_area = 0',
    '        best_rect = [0, 0, 0, 0]',
    '        for r1 in range(m):',
    '            for c1 in range(n):',
    '                for r2 in range(r1, m):',
    '                    for c2 in range(c1, n):',
    '                        s = prefix[r2 + 1][c2 + 1] - prefix[r1][c2 + 1] - prefix[r2 + 1][c1] + prefix[r1][c1]',
    '                        if s <= budget:',
    '                            area = (r2 - r1 + 1) * (c2 - c1 + 1)',
    '                            if area > best_area:',
    '                                best_area = area',
    '                                best_rect = [r1, c1, r2, c2]',
    '        return [best_area] + best_rect',
  ],
  javascript: [
    'var buyLand = function(grid, budget) {',
    '    const m = grid.length, n = grid[0].length;',
    '    const prefix = Array.from({ length: m + 1 }, () => new Array(n + 1).fill(0));',
    '    for (let i = 0; i < m; i++)',
    '        for (let j = 0; j < n; j++)',
    '            prefix[i + 1][j + 1] = grid[i][j] + prefix[i][j + 1] + prefix[i + 1][j] - prefix[i][j];',
    '    let bestArea = 0;',
    '    let bestRect = [0, 0, 0, 0];',
    '    for (let r1 = 0; r1 < m; r1++)',
    '      for (let c1 = 0; c1 < n; c1++)',
    '        for (let r2 = r1; r2 < m; r2++)',
    '          for (let c2 = c1; c2 < n; c2++) {',
    '            const sum = prefix[r2 + 1][c2 + 1] - prefix[r1][c2 + 1] - prefix[r2 + 1][c1] + prefix[r1][c1];',
    '            if (sum <= budget) {',
    '                const area = (r2 - r1 + 1) * (c2 - c1 + 1);',
    '                if (area > bestArea) {',
    '                    bestArea = area;',
    '                    bestRect = [r1, c1, r2, c2];',
    '                }',
    '            }',
    '          }',
    '    return [bestArea, ...bestRect];',
    '};',
  ],
};
