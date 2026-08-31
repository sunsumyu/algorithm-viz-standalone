/**
 * 数独神偷·密码解构者 (Sudoku Cipher: Backtracking & MRV Solver)
 * 经典回溯算法（Backtracking）、数独求解（LeetCode 37）与最少剩余值启发式（MRV）多语言题解
 */

export const SUDOKU_CIPHER_CODE_LANGUAGES: Record<string, string[]> = {
  cpp: [
    '#include <iostream>',
    '#include <vector>',
    'using namespace std;',
    '',
    '// 经典数独回溯求解算法 (LeetCode 37)',
    'class SudokuSolver {',
    'public:',
    '    bool solveSudoku(vector<vector<char>>& board) {',
    '        for (int r = 0; r < 9; r++) {',
    '            for (int c = 0; c < 9; c++) {',
    '                if (board[r][c] != \'.\') continue;',
    '',
    '                // 尝试填入数字 1 ~ 9',
    '                for (char ch = \'1\'; ch <= \'9\'; ch++) {',
    '                    if (isValid(board, r, c, ch)) {',
    '                        board[r][c] = ch; // 做选择',
    '                        if (solveSudoku(board)) return true; // 递归下一空格',
    '                        board[r][c] = \'.\'; // 撤销选择 (回溯)',
    '                    }',
    '                }',
    '                return false; // 1~9 均不合法，触发上一层回溯',
    '            }',
    '        }',
    '        return true; // 所有空格均已成功填满',
    '    }',
    '',
    'private:',
    '    bool isValid(const vector<vector<char>>& board, int row, int col, char ch) {',
    '        for (int i = 0; i < 9; i++) {',
    '            if (board[row][i] == ch) return false; // 行冲突',
    '            if (board[i][col] == ch) return false; // 列冲突',
    '            // 3x3 宫格冲突',
    '            int r = 3 * (row / 3) + i / 3;',
    '            int c = 3 * (col / 3) + i % 3;',
    '            if (board[r][c] == ch) return false;',
    '        }',
    '        return true;',
    '    }',
    '};',
  ],
  java: [
    'public class SudokuSolver {',
    '    public static boolean solveSudoku(char[][] board) {',
    '        for (int r = 0; r < 9; r++) {',
    '            for (int c = 0; c < 9; c++) {',
    '                if (board[r][c] != \'.\') continue;',
    '                for (char ch = \'1\'; ch <= \'9\'; ch++) {',
    '                    if (isValid(board, r, c, ch)) {',
    '                        board[r][c] = ch;',
    '                        if (solveSudoku(board)) return true;',
    '                        board[r][c] = \'.\';',
    '                    }',
    '                }',
    '                return false;',
    '            }',
    '        }',
    '        return true;',
    '    }',
    '',
    '    private static boolean isValid(char[][] board, int row, int col, char ch) {',
    '        for (int i = 0; i < 9; i++) {',
    '            if (board[row][i] == ch || board[i][col] == ch) return false;',
    '            if (board[3 * (row / 3) + i / 3][3 * (col / 3) + i % 3] == ch) return false;',
    '        }',
    '        return true;',
    '    }',
    '}',
  ],
  python: [
    'def solve_sudoku(board: list[list[str]]) -> bool:',
    '    """经典回溯解数独"""',
    '    for r in range(9):',
    '        for c in range(9):',
    '            if board[r][c] != ".":',
    '                continue',
    '            for num in "123456789":',
    '                if is_valid(board, r, c, num):',
    '                    board[r][c] = num',
    '                    if solve_sudoku(board):',
    '                        return True',
    '                    board[r][c] = "."',
    '            return False',
    '    return True',
    '',
    'def is_valid(board, row, col, num):',
    '    for i in range(9):',
    '        if board[row][i] == num or board[i][col] == num:',
    '            return False',
    '        if board[3 * (row // 3) + i // 3][3 * (col // 3) + i % 3] == num:',
    '            return False',
    '    return True',
  ],
  javascript: [
    'function solveSudoku(board) {',
    '  for (let r = 0; r < 9; r++) {',
    '    for (let c = 0; c < 9; c++) {',
    '      if (board[r][c] !== \'.\') continue;',
    '      for (let num = 1; num <= 9; num++) {',
    '        const ch = String(num);',
    '        if (isValid(board, r, c, ch)) {',
    '          board[r][c] = ch;',
    '          if (solveSudoku(board)) return true;',
    '          board[r][c] = \'.\';',
    '        }',
    '      }',
    '      return false;',
    '    }',
    '  }',
    '  return true;',
    '}',
  ],
};

export const SUDOKU_CIPHER_PROBLEM_HTML = `
  <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; color: #1e293b; line-height: 1.6;">
    <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 10px;">
      <span style="font-size: 20px;">🧩</span>
      <h3 style="margin: 0; font-size: 15px; font-weight: 800; color: #0f172a;">数独神偷·密码解构者 (Sudoku Cipher Matrix)</h3>
      <span style="background: #eff6ff; color: #2563eb; font-size: 11px; font-weight: 700; padding: 2px 8px; border-radius: 999px; border: 1px solid #bfdbfe;">回溯与约束满足 CSP</span>
    </div>

    <p style="font-size: 12.5px; color: #334155; margin-bottom: 10px;">
      破解赛博密室的核心安全终端！在 $9 \\times 9$ 网格中填入数字 1~9，满足<b>每行、每列以及每个 $3 \\times 3$ 宫格内数字均无重复</b>。通过<b>回溯试探与 MRV 启发式剪枝</b>瞬间瓦解数独密码！
    </p>

    <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 8px; margin-bottom: 12px;">
      <div style="background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 6px; padding: 8px;">
        <h4 style="margin: 0 0 4px 0; font-size: 11.5px; color: #0f172a;">🎮 密室解谜玩法</h4>
        <ul style="margin: 0; padding-left: 16px; font-size: 11px; color: #475569;">
          <li><b>🔲 赛博 9x9 矩阵</b>：点击单元格填入数字，实时扫描行/列/宫冲突；</li>
          <li><b>🎯 MRV 候选高亮</b>：实时标注剩余候选数最少的格子；</li>
          <li><b>⚡ 量子回溯求解</b>：一键 60 FPS 动态推演试探、冲突与回溯动画。</li>
        </ul>
      </div>
      <div style="background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 6px; padding: 8px;">
        <h4 style="margin: 0 0 4px 0; font-size: 11.5px; color: #0f172a;">🧠 核心回溯原理</h4>
        <ul style="margin: 0; padding-left: 16px; font-size: 11px; color: #475569;">
          <li><b>递归基</b>：遍历完所有 81 格无冲突即找到唯一解；</li>
          <li><b>剪枝回退</b>：当前格 1~9 均与已有数字冲突时，撤销上一格并回溯。</li>
        </ul>
      </div>
    </div>
  </div>
`;

export const SUDOKU_CIPHER_ANALYSIS_HTML = `
  <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; color: #1e293b; line-height: 1.6;">
    <h3 style="margin-top: 0; font-size: 14px; font-weight: 800; color: #0f172a;">数独回溯与 MRV 启发式优化</h3>

    <div style="margin-bottom: 10px;">
      <h4 style="margin: 0 0 4px 0; font-size: 12px; color: #2563eb;">1. 最少剩余值启发式 (Minimum Remaining Values, MRV)</h4>
      <p style="font-size: 11.5px; color: #475569; margin: 0;">
        经典回溯按坐标从左到右、从上到下扫描；而 MRV 启发式优先选择<b>候选数字最少（分支因子最小）</b>的空格进行试探。这样能最早发现死胡同并触发剪枝，将原本万次递归骤降至数百次！
      </p>
    </div>
  </div>
`;
