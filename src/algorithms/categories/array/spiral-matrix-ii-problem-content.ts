/**
 * LeetCode 59: 螺旋矩阵 II (Spiral Matrix II)
 * 领域知识与题解精讲配置声明
 */

export const SPIRAL_MATRIX_II_PROBLEM_HTML = `
  <div style="display: flex; flex-direction: column; gap: 12px; color: #cbd5e1; font-size: 12px; line-height: 1.6;">
    <div style="display: flex; align-items: center; gap: 8px;">
      <span style="padding: 2px 6px; border-radius: 4px; background: rgba(59,130,246,0.2); color: #60a5fa; font-weight: 700; border: 1px solid rgba(59,130,246,0.3);">LeetCode 59</span>
      <span style="padding: 2px 6px; border-radius: 4px; background: rgba(245,158,11,0.2); color: #fbbf24; font-weight: 700; border: 1px solid rgba(245,158,11,0.3);">Medium</span>
      <h2 style="font-size: 14px; font-weight: 700; color: #ffffff; margin: 0;">螺旋矩阵 II (Spiral Matrix II)</h2>
    </div>
    <p style="margin: 0;">给你一个正整数 <code style="color: #fde047; font-family: monospace;">n</code> ，生成一个包含 <code style="color: #60a5fa; font-family: monospace;">1</code> 到 <code style="color: #60a5fa; font-family: monospace;">n<sup>2</sup></code> 所有元素，且元素按顺时针顺序螺旋排列的 <code style="color: #fde047; font-family: monospace;">n &times; n</code> 正方形矩阵 <code style="color: #fde047; font-family: monospace;">matrix</code> 。</p>
    <div style="padding: 10px; border-radius: 10px; background: #020617; border: 1px solid #1e293b; display: flex; flex-direction: column; gap: 6px; font-family: monospace; font-size: 11px;">
      <div style="color: #34d399; font-weight: 700;">示例 1:</div>
      <div>输入: n = 3</div>
      <div>输出: [[1,2,3],[8,9,4],[7,6,5]]</div>
    </div>
    <div style="padding: 10px; border-radius: 10px; background: #020617; border: 1px solid #1e293b; display: flex; flex-direction: column; gap: 6px; font-family: monospace; font-size: 11px;">
      <div style="color: #34d399; font-weight: 700;">示例 2:</div>
      <div>输入: n = 1</div>
      <div>输出: [[1]]</div>
    </div>
    <div style="display: flex; flex-direction: column; gap: 4px; color: #94a3b8; font-size: 11.5px;">
      <div style="font-weight: 700; color: #cbd5e1;">提示：</div>
      <div>• 1 &le; n &le; 20</div>
    </div>
  </div>
`;

export const SPIRAL_MATRIX_II_ANALYSIS_HTML = `
  <div style="display: flex; flex-direction: column; gap: 12px; color: #cbd5e1; font-size: 12px; line-height: 1.6;">
    <h3 style="font-size: 14px; font-weight: 700; color: #ffffff; margin: 0; display: flex; align-items: center; gap: 6px;">
      <span>💡</span> 循环不变量与四边界收缩法：清晰无 bug 的模拟精髓
    </h3>
    <div style="display: flex; flex-direction: column; gap: 8px;">
      <div style="padding: 10px; border-radius: 10px; background: #020617; border: 1px solid #1e293b;">
        <div style="font-weight: 700; color: #60a5fa; margin-bottom: 4px;">① 定义四边界</div>
        <p style="margin: 0; color: #94a3b8;">
        维护当前的上下左右四个动态边界：<br/>
        • <code style="color: #38bdf8; font-family: monospace;">top = 0</code>, <code style="color: #38bdf8; font-family: monospace;">bottom = n - 1</code><br/>
        • <code style="color: #f59e0b; font-family: monospace;">left = 0</code>, <code style="color: #f59e0b; font-family: monospace;">right = n - 1</code>
        </p>
      </div>
      <div style="padding: 10px; border-radius: 10px; background: #020617; border: 1px solid #1e293b;">
        <div style="font-weight: 700; color: #34d399; margin-bottom: 4px;">② 顺时针四步旋转填充</div>
        <p style="margin: 0; color: #94a3b8;">
        1. <strong>从左向右</strong>：填充第 <code style="color: #38bdf8; font-family: monospace;">top</code> 行，列从 <code style="color: #f59e0b; font-family: monospace;">left</code> 到 <code style="color: #f59e0b; font-family: monospace;">right</code>，随后 <code style="color: #38bdf8; font-family: monospace;">top++</code>（上边界下移）；<br/>
        2. <strong>从上向下</strong>：填充第 <code style="color: #f59e0b; font-family: monospace;">right</code> 列，行从 <code style="color: #38bdf8; font-family: monospace;">top</code> 到 <code style="color: #38bdf8; font-family: monospace;">bottom</code>，随后 <code style="color: #f59e0b; font-family: monospace;">right--</code>（右边界左移）；<br/>
        3. <strong>从右向左</strong>：填充第 <code style="color: #38bdf8; font-family: monospace;">bottom</code> 行，列从 <code style="color: #f59e0b; font-family: monospace;">right</code> 到 <code style="color: #f59e0b; font-family: monospace;">left</code>，随后 <code style="color: #38bdf8; font-family: monospace;">bottom--</code>（下边界上移）；<br/>
        4. <strong>从下向上</strong>：填充第 <code style="color: #f59e0b; font-family: monospace;">left</code> 列，行从 <code style="color: #38bdf8; font-family: monospace;">bottom</code> 到 <code style="color: #38bdf8; font-family: monospace;">top</code>，随后 <code style="color: #f59e0b; font-family: monospace;">left++</code>（左边界右移）。<br/>
        直到填充数字达到 <code style="color: #a78bfa; font-family: monospace;">n * n</code> 终止！
        </p>
      </div>
      <div style="padding: 10px; border-radius: 10px; background: #020617; border: 1px solid #1e293b;">
        <div style="font-weight: 700; color: #f472b6; margin-bottom: 4px;">③ 复杂度</div>
        <p style="margin: 0; color: #94a3b8;">
        • 时间复杂度：<code style="color: #60a5fa; font-family: monospace;">O(n<sup>2</sup>)</code>，矩阵中每个格子访问且仅访问一次。<br/>
        • 空间复杂度：<code style="color: #34d399; font-family: monospace;">O(1)</code> 额外辅助空间（不计存放结果的 n×n 矩阵）。
        </p>
      </div>
    </div>
  </div>
`;

export const SPIRAL_MATRIX_II_CODE_LANGUAGES: Record<string, string[]> = {
  java: [
    'public int[][] generateMatrix(int n) {',
    '    int[][] matrix = new int[n][n];',
    '    int top = 0, bottom = n - 1, left = 0, right = n - 1;',
    '    int num = 1;',
    '    while (num <= n * n) {',
    '        for (int c = left; c <= right; c++) matrix[top][c] = num++;',
    '        top++;',
    '        for (int r = top; r <= bottom; r++) matrix[r][right] = num++;',
    '        right--;',
    '        for (int c = right; c >= left; c--) matrix[bottom][c] = num++;',
    '        bottom--;',
    '        for (int r = bottom; r >= top; r--) matrix[r][left] = num++;',
    '        left++;',
    '    }',
    '    return matrix;',
    '}',
  ],
  cpp: [
    'class Solution {',
    'public:',
    '    vector<vector<int>> generateMatrix(int n) {',
    '        vector<vector<int>> matrix(n, vector<int>(n));',
    '        int top = 0, bottom = n - 1, left = 0, right = n - 1;',
    '        int num = 1;',
    '        while (num <= n * n) {',
    '            for (int c = left; c <= right; c++) matrix[top][c] = num++;',
    '            top++;',
    '            for (int r = top; r <= bottom; r++) matrix[r][right] = num++;',
    '            right--;',
    '            for (int c = right; c >= left; c--) matrix[bottom][c] = num++;',
    '            bottom--;',
    '            for (int r = bottom; r >= top; r--) matrix[r][left] = num++;',
    '            left++;',
    '        }',
    '        return matrix;',
    '    }',
    '};',
  ],
  python: [
    'class Solution:',
    '    def generateMatrix(self, n: int) -> List[List[int]]:',
    '        matrix = [[0] * n for _ in range(n)]',
    '        top, bottom, left, right = 0, n - 1, 0, n - 1',
    '        num = 1',
    '        while num <= n * n:',
    '            for c in range(left, right + 1):',
    '                matrix[top][c] = num',
    '                num += 1',
    '            top += 1',
    '            for r in range(top, bottom + 1):',
    '                matrix[r][right] = num',
    '                num += 1',
    '            right -= 1',
    '            for c in range(right, left - 1, -1):',
    '                matrix[bottom][c] = num',
    '                num += 1',
    '            bottom -= 1',
    '            for r in range(bottom, top - 1, -1):',
    '                matrix[r][left] = num',
    '                num += 1',
    '            left += 1',
    '        return matrix',
  ],
  javascript: [
    'var generateMatrix = function(n) {',
    '    const matrix = Array.from({ length: n }, () => new Array(n).fill(0));',
    '    let top = 0, bottom = n - 1, left = 0, right = n - 1;',
    '    let num = 1;',
    '    while (num <= n * n) {',
    '        for (let c = left; c <= right; c++) matrix[top][c] = num++;',
    '        top++;',
    '        for (let r = top; r <= bottom; r++) matrix[r][right] = num++;',
    '        right--;',
    '        for (let c = right; c >= left; c--) matrix[bottom][c] = num++;',
    '        bottom--;',
    '        for (let r = bottom; r >= top; r--) matrix[r][left] = num++;',
    '        left++;',
    '    }',
    '    return matrix;',
    '};',
  ],
};
