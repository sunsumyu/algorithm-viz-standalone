/**
 * 国际象棋·N皇后巅峰对弈 (N-Queens Chess Battle & Backtracking Arena)
 * 经典回溯算法、约束满足问题（CSP）与剪枝优化多语言源码与深度题解
 */

export const NQUEEN_BATTLE_CODE_LANGUAGES: Record<string, string[]> = {
  cpp: [
    '#include <iostream>',
    '#include <vector>',
    '#include <string>',
    'using namespace std;',
    '',
    '// N 皇后经典回溯算法：位运算剪枝优化版本',
    'class NQueensSolver {',
    'public:',
    '    int totalSolutions = 0;',
    '    vector<vector<string>> solveNQueens(int n) {',
    '        vector<vector<string>> res;',
    '        vector<string> board(n, string(n, \'.\'));',
    '        // 列占用、主对角线 (r - c + n)、副对角线 (r + c) 标记',
    '        vector<bool> col(n, false), diag1(2 * n, false), diag2(2 * n, false);',
    '        backtrack(0, n, board, col, diag1, diag2, res);',
    '        return res;',
    '    }',
    '',
    'private:',
    '    void backtrack(int row, int n, vector<string>& board,',
    '                   vector<bool>& col, vector<bool>& diag1, vector<bool>& diag2,',
    '                   vector<vector<string>>& res) {',
    '        if (row == n) {',
    '            res.push_back(board);',
    '            totalSolutions++;',
    '            return;',
    '        }',
    '        for (int c = 0; c < n; c++) {',
    '            if (col[c] || diag1[row - c + n] || diag2[row + c]) continue; // 剪枝',
    '',
    '            // 做选择',
    '            board[row][c] = \'Q\';',
    '            col[c] = diag1[row - c + n] = diag2[row + c] = true;',
    '',
    '            backtrack(row + 1, n, board, col, diag1, diag2, res); // 递归下一行',
    '',
    '            // 撤销选择 (回溯)',
    '            board[row][c] = \'.\';',
    '            col[c] = diag1[row - c + n] = diag2[row + c] = false;',
    '        }',
    '    }',
    '};',
  ],
  java: [
    'import java.util.*;',
    '',
    'public class NQueensBattle {',
    '    public static List<List<String>> solveNQueens(int n) {',
    '        List<List<String>> results = new ArrayList<>();',
    '        char[][] board = new char[n][n];',
    '        for (char[] row : board) Arrays.fill(row, \'.\');',
    '        boolean[] cols = new boolean[n];',
    '        boolean[] d1 = new boolean[2 * n]; // 主对角线 r - c + n',
    '        boolean[] d2 = new boolean[2 * n]; // 副对角线 r + c',
    '',
    '        dfs(0, n, board, cols, d1, d2, results);',
    '        return results;',
    '    }',
    '',
    '    private static void dfs(int row, int n, char[][] board, boolean[] cols, boolean[] d1, boolean[] d2, List<List<String>> res) {',
    '        if (row == n) {',
    '            List<String> list = new ArrayList<>();',
    '            for (char[] r : board) list.add(new String(r));',
    '            res.add(list);',
    '            return;',
    '        }',
    '        for (int c = 0; c < n; c++) {',
    '            if (cols[c] || d1[row - c + n] || d2[row + c]) continue;',
    '            board[row][c] = \'Q\';',
    '            cols[c] = d1[row - c + n] = d2[row + c] = true;',
    '            dfs(row + 1, n, board, cols, d1, d2, res);',
    '            board[row][c] = \'.\';',
    '            cols[c] = d1[row - c + n] = d2[row + c] = false;',
    '        }',
    '    }',
    '}',
  ],
  python: [
    'def solve_n_queens(n: int) -> list[list[str]]:',
    '    """位运算加速 N 皇后求解"""',
    '    solutions = []',
    '    queens = [-1] * n',
    '',
    '    def backtrack(row: int, cols: int, diag1: int, diag2: int):',
    '        if row == n:',
    '            board = ["." * c + "Q" + "." * (n - c - 1) for c in queens]',
    '            solutions.append(board)',
    '            return',
    '        # 可用位置位掩码',
    '        available_positions = ((1 << n) - 1) & ~(cols | diag1 | diag2)',
    '        while available_positions:',
    '            position = available_positions & -available_positions',
    '            available_positions &= available_positions - 1',
    '            col = bin(position - 1).count("1")',
    '            queens[row] = col',
    '            backtrack(row + 1, cols | position, (diag1 | position) << 1, (diag2 | position) >> 1)',
    '',
    '    backtrack(0, 0, 0, 0)',
    '    return solutions',
  ],
  javascript: [
    '// 约束满足问题 (CSP) 冲突检测与剪枝',
    'function isValidQueen(queens, row, col) {',
    '  for (let r = 0; r < row; r++) {',
    '    const c = queens[r];',
    '    if (c === col || Math.abs(r - row) === Math.abs(c - col)) return false;',
    '  }',
    '  return true;',
    '}',
  ],
};

export const NQUEEN_BATTLE_PROBLEM_HTML = `
  <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; color: #1e293b; line-height: 1.6;">
    <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 10px;">
      <span style="font-size: 20px;">👑</span>
      <h3 style="margin: 0; font-size: 15px; font-weight: 800; color: #0f172a;">国际象棋·N皇后巅峰对弈 (N-Queens Chess Battle)</h3>
      <span style="background: #eff6ff; color: #2563eb; font-size: 11px; font-weight: 700; padding: 2px 8px; border-radius: 999px; border: 1px solid #bfdbfe;">回溯与约束满足</span>
    </div>

    <p style="font-size: 12.5px; color: #334155; margin-bottom: 10px;">
      在 $N \\times N$ 的国际象棋棋盘上，如何摆放 $N$ 个皇后，使其彼此之间不能相互攻击？（即任意两个皇后不能处于同一行、同一列或同一对角线上）。
    </p>

    <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 8px; margin-bottom: 12px;">
      <div style="background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 6px; padding: 8px;">
        <h4 style="margin: 0 0 4px 0; font-size: 11.5px; color: #0f172a;">🎮 对弈与实验室玩法</h4>
        <ul style="margin: 0; padding-left: 16px; font-size: 11px; color: #475569;">
          <li><b>👑 手动落子与激光射线</b>：放置皇后即刻投射横、竖、斜 8 向激光攻击场；</li>
          <li><b>🤖 人机回溯对弈</b>：与回溯 AI 逐行交替落子，逼迫对方陷入死局！</li>
          <li><b>🖼️ 92 种全解画廊</b>：一键自动演算 8 皇后的全部 92 组解并快速切换。</li>
        </ul>
      </div>
      <div style="background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 6px; padding: 8px;">
        <h4 style="margin: 0 0 4px 0; font-size: 11.5px; color: #0f172a;">🧠 核心算法原理</h4>
        <ul style="margin: 0; padding-left: 16px; font-size: 11px; color: #475569;">
          <li><b>约束剪枝</b>：利用哈希/位运算在 $O(1)$ 时间内完成对角线冲突检测；</li>
          <li><b>递归与回溯</b>：尝试 $\\to$ 冲突 $\\to$ 撤销选择回退至上一行；</li>
          <li><b>状态空间树</b>：透视搜索树的深度与剪枝节点分布。</li>
        </ul>
      </div>
    </div>
  </div>
`;

export const NQUEEN_BATTLE_ANALYSIS_HTML = `
  <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; color: #1e293b; line-height: 1.6;">
    <h3 style="margin-top: 0; font-size: 14px; font-weight: 800; color: #0f172a;">N 皇后约束对角线数学规律</h3>

    <div style="margin-bottom: 10px;">
      <h4 style="margin: 0 0 4px 0; font-size: 12px; color: #2563eb;">1. 对角线坐标映射</h4>
      <p style="font-size: 11.5px; color: #475569; margin: 0;">
        在网格坐标 $(r, c)$ 中：
        <br>• <b>主对角线（左上至右下）</b>：所有单元格的行减列之差 $r - c$ 恒为常数；
        <br>• <b>副对角线（右上至左下）</b>：所有单元格的行加列之和 $r + c$ 恒为常数。
      </p>
    </div>

    <div style="margin-bottom: 10px;">
      <h4 style="margin: 0 0 4px 0; font-size: 12px; color: #10b981;">2. 搜索树时间复杂度与剪枝</h4>
      <p style="font-size: 11.5px; color: #475569; margin: 0;">
        暴力穷举需要检查 $C_{N^2}^N$ 种可能；通过逐行放置 + 对角线剪枝，搜索空间大幅缩减至 $O(N!)$，在 $N=8$ 时仅需 2057 次状态探测即可求出全部 92 个解！
      </p>
    </div>
  </div>
`;
