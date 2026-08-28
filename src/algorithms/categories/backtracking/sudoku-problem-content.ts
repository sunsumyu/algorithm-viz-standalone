/**
 * LeetCode 37: 解数独 (Sudoku Solver)
 * 领域知识与题解精讲配置声明
 */

export const SUDOKU_PROBLEM_HTML = `
  <div style="display: flex; flex-direction: column; gap: 12px; color: #cbd5e1; font-size: 12px; line-height: 1.6;">
    <div style="display: flex; align-items: center; gap: 8px;">
      <span style="padding: 2px 6px; border-radius: 4px; background: rgba(59,130,246,0.2); color: #60a5fa; font-weight: 700; border: 1px solid rgba(59,130,246,0.3);">LeetCode 37</span>
      <span style="padding: 2px 6px; border-radius: 4px; background: rgba(239,68,68,0.2); color: #f87171; font-weight: 700; border: 1px solid rgba(239,68,68,0.3);">Hard</span>
      <h2 style="font-size: 14px; font-weight: 700; color: #ffffff; margin: 0;">解数独 (Sudoku Solver)</h2>
    </div>
    <p style="margin: 0;">编写一个程序，通过填充空格来解决数独问题。</p>
    <p style="margin: 0;">数独的解法需 <strong>遵循如下规则</strong>：</p>
    <ol style="margin: 0; padding-left: 20px; display: flex; flex-direction: column; gap: 4px;">
      <li>数字 <code style="color: #fde047; font-family: monospace;">1-9</code> 在每一行只能出现一次。</li>
      <li>数字 <code style="color: #fde047; font-family: monospace;">1-9</code> 在每一列只能出现一次。</li>
      <li>数字 <code style="color: #fde047; font-family: monospace;">1-9</code> 在每一个以粗实线分隔的 <code style="color: #fde047; font-family: monospace;">3x3</code> 宫内只能出现一次。</li>
    </ol>
    <p style="margin: 0;">数独部分空格内已填入了数字，空白格用 <code style="color: #fde047; font-family: monospace;">'.'</code> 表示。</p>
    <div style="display: flex; flex-direction: column; gap: 4px; color: #94a3b8; font-size: 11.5px;">
      <div style="font-weight: 700; color: #cbd5e1;">提示：</div>
      <div>• 输入数独保证 恰好有一个 唯一解</div>
      <div>• board.length == 9, board[i].length == 9</div>
      <div>• board[i][j] 是一位数字或 '.'</div>
    </div>
  </div>
`;

export const SUDOKU_ANALYSIS_HTML = `
  <div style="display: flex; flex-direction: column; gap: 12px; color: #cbd5e1; font-size: 12px; line-height: 1.6;">
    <h3 style="font-size: 14px; font-weight: 700; color: #ffffff; margin: 0; display: flex; align-items: center; gap: 6px;">
      <span>💡</span> 二维递归树与三大排他约束检验
    </h3>
    <div style="display: flex; flex-direction: column; gap: 8px;">
      <div style="padding: 10px; border-radius: 10px; background: #020617; border: 1px solid #1e293b;">
        <div style="font-weight: 700; color: #60a5fa; margin-bottom: 4px;">① 为什么解数独返回值是 boolean？</div>
        <p style="margin: 0; color: #94a3b8;">之前的问题求的是「所有解」，所以递归函数无返回值直接遍历整棵树；而解数独只需要找到<strong>一组唯一合法解</strong>，一旦填满直接返回 <code style="color: #34d399; font-family: monospace;">true</code> 并逐层立即返回，停止后续不必要的探索！</p>
      </div>
      <div style="padding: 10px; border-radius: 10px; background: #020617; border: 1px solid #1e293b;">
        <div style="font-weight: 700; color: #34d399; margin-bottom: 4px;">② 双重循环遍历棋盘</div>
        <p style="margin: 0; color: #94a3b8;">一个 <code style="color: #7dd3fc; font-family: monospace;">for</code> 遍历行，一个 <code style="color: #7dd3fc; font-family: monospace;">for</code> 遍历列。遇到空格 <code style="color: #fde047; font-family: monospace;">'.'</code> 时，尝试填入 <code style="color: #fde047; font-family: monospace;">'1' ~ '9'</code>。若 9 个数字都试过全不合法，则返回 <code style="color: #fb7185; font-family: monospace;">false</code> 触发上一层回溯。</p>
      </div>
      <div style="padding: 10px; border-radius: 10px; background: #020617; border: 1px solid #1e293b;">
        <div style="font-weight: 700; color: #fbbf24; margin-bottom: 4px;">③ 九宫格 3x3 坐标映射公式</div>
        <p style="margin: 0; color: #94a3b8;">给定格点 <code style="color: #fde047; font-family: monospace;">(row, col)</code>，其所在的 3x3 宫起始左上角为：<br/>
        <code style="color: #7dd3fc; font-family: monospace;">startRow = (row / 3) * 3</code>，<code style="color: #7dd3fc; font-family: monospace;">startCol = (col / 3) * 3</code>。<br/>
        只需双重循环 3x3 检查是否有重复数字即可。</p>
      </div>
    </div>
  </div>
`;

export const SUDOKU_CODE_LANGUAGES: Record<string, string[]> = {
  java: [
    'public void solveSudoku(char[][] board) {',
    '    backtrack(board);',
    '}',
    '',
    'boolean backtrack(char[][] board) {',
    '    for (int i = 0; i < 9; i++) { // 遍历行',
    '        for (int j = 0; j < 9; j++) { // 遍历列',
    '            if (board[i][j] != \'.\') continue;',
    '            for (char k = \'1\'; k <= \'9\'; k++) { // 尝试填入 1-9',
    '                if (isValid(i, j, k, board)) {',
    '                    board[i][j] = k;',
    '                    if (backtrack(board)) return true; // 找到可行解立即返回',
    '                    board[i][j] = \'.\'; // 撤销尝试',
    '                }',
    '            }',
    '            return false; // 9个数均不合法，说明前一步有误，触发回溯',
    '        }',
    '    }',
    '    return true; // 全部空格填满，成功找到解',
    '}',
  ],
  cpp: [
    'class Solution {',
    'public:',
    '    void solveSudoku(vector<vector<char>>& board) {',
    '        backtrack(board);',
    '    }',
    '    bool backtrack(vector<vector<char>>& board) {',
    '        for (int i = 0; i < 9; i++) {',
    '            for (int j = 0; j < 9; j++) {',
    '                if (board[i][j] != \'.\') continue;',
    '                for (char k = \'1\'; k <= \'9\'; k++) {',
    '                    if (isValid(i, j, k, board)) {',
    '                        board[i][j] = k;',
    '                        if (backtrack(board)) return true;',
    '                        board[i][j] = \'.\';',
    '                    }',
    '                }',
    '                return false;',
    '            }',
    '        }',
    '        return true;',
    '    }',
    '};',
  ],
  python: [
    'class Solution:',
    '    def solveSudoku(self, board: List[List[str]]) -> None:',
    '        def backtrack() -> bool:',
    '            for i in range(9):',
    '                for j in range(9):',
    '                    if board[i][j] != \'.\':',
    '                        continue',
    '                    for k in \'123456789\':',
    '                        if isValid(i, j, k, board):',
    '                            board[i][j] = k',
    '                            if backtrack():',
    '                                return True',
    '                            board[i][j] = \'.\'',
    '                    return False',
    '            return True',
    '        backtrack()',
  ],
  javascript: [
    'var solveSudoku = function(board) {',
    '    function backtrack() {',
    '        for (let i = 0; i < 9; i++) {',
    '            for (let j = 0; j < 9; j++) {',
    '                if (board[i][j] !== \'.\') continue;',
    '                for (let k = 1; k <= 9; k++) {',
    '                    const charK = String(k);',
    '                    if (isValid(i, j, charK, board)) {',
    '                        board[i][j] = charK;',
    '                        if (backtrack()) return true;',
    '                        board[i][j] = \'.\';',
    '                    }',
    '                }',
    '                return false;',
    '            }',
    '        }',
    '        return true;',
    '    }',
    '    backtrack();',
    '};',
  ],
};
