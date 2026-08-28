/**
 * LeetCode 51: N 皇后 (N-Queens)
 * 领域知识与题解精讲配置声明
 */

export const NQUEEN_PROBLEM_HTML = `
  <div style="display: flex; flex-direction: column; gap: 12px; color: #cbd5e1; font-size: 12px; line-height: 1.6;">
    <div style="display: flex; align-items: center; gap: 8px;">
      <span style="padding: 2px 6px; border-radius: 4px; background: rgba(59,130,246,0.2); color: #60a5fa; font-weight: 700; border: 1px solid rgba(59,130,246,0.3);">LeetCode 51</span>
      <span style="padding: 2px 6px; border-radius: 4px; background: rgba(239,68,68,0.2); color: #f87171; font-weight: 700; border: 1px solid rgba(239,68,68,0.3);">Hard</span>
      <h2 style="font-size: 14px; font-weight: 700; color: #ffffff; margin: 0;">N 皇后 (N-Queens)</h2>
    </div>
    <p style="margin: 0;">按照国际象棋的规则，皇后可以攻击与之处在同一行或同一列或同一斜线上的棋子。</p>
    <p style="margin: 0;"><strong>n 皇后问题</strong> 研究的是如何将 <code style="color: #fde047; font-family: monospace;">n</code> 个皇后放置在 <code style="color: #fde047; font-family: monospace;">n&times;n</code> 的棋盘上，并且使皇后彼此之间不能相互攻击。</p>
    <p style="margin: 0;">给你一个整数 <code style="color: #fde047; font-family: monospace;">n</code> ，返回所有不同的 <strong>n 皇后问题</strong> 的解决方案。</p>
    <div style="padding: 10px; border-radius: 10px; background: #020617; border: 1px solid #1e293b; display: flex; flex-direction: column; gap: 6px; font-family: monospace; font-size: 11px;">
      <div style="color: #34d399; font-weight: 700;">示例 1:</div>
      <div>输入: n = 4</div>
      <div>输出: [[".Q..","...Q","Q...","..Q."],["..Q.","Q...","...Q",".Q.."]]</div>
      <div>解释: 4 皇后问题存在两个不同的解法。</div>
    </div>
    <div style="padding: 10px; border-radius: 10px; background: #020617; border: 1px solid #1e293b; display: flex; flex-direction: column; gap: 6px; font-family: monospace; font-size: 11px;">
      <div style="color: #34d399; font-weight: 700;">示例 2:</div>
      <div>输入: n = 1</div>
      <div>输出: [["Q"]]</div>
    </div>
    <div style="display: flex; flex-direction: column; gap: 4px; color: #94a3b8; font-size: 11.5px;">
      <div style="font-weight: 700; color: #cbd5e1;">提示：</div>
      <div>• 1 &le; n &le; 9</div>
    </div>
  </div>
`;

export const NQUEEN_ANALYSIS_HTML = `
  <div style="display: flex; flex-direction: column; gap: 12px; color: #cbd5e1; font-size: 12px; line-height: 1.6;">
    <h3 style="font-size: 14px; font-weight: 700; color: #ffffff; margin: 0; display: flex; align-items: center; gap: 6px;">
      <span>💡</span> 逐行放置与三大冲突约束检验
    </h3>
    <div style="display: flex; flex-direction: column; gap: 8px;">
      <div style="padding: 10px; border-radius: 10px; background: #020617; border: 1px solid #1e293b;">
        <div style="font-weight: 700; color: #60a5fa; margin-bottom: 4px;">① 为什么按行递归？（天然消除行冲突）</div>
        <p style="margin: 0; color: #94a3b8;">如果把棋盘看作 $N \times N$ 个格子任意选 $N$ 个，搜索空间将高达 $C_{N^2}^N$。但由于每一行<strong>只能且必须</strong>放置一个皇后，因此递归深度直接对应行号 <code style="color: #7dd3fc; font-family: monospace;">row</code>，每层只遍历列 <code style="color: #34d399; font-family: monospace;">col &isin; [0, n-1]</code>，行冲突自然不复存在！</p>
      </div>
      <div style="padding: 10px; border-radius: 10px; background: #020617; border: 1px solid #1e293b;">
        <div style="font-weight: 700; color: #34d399; margin-bottom: 4px;">② 冲突合法性校验 (isValid)</div>
        <p style="margin: 0; color: #94a3b8;">由于下方未放置棋子，只需向上方检查三个方向：<br/>
        1. <strong>同列冲突</strong>：检查上方同一列是否有皇后。<br/>
        2. <strong>135° 对角线</strong>：检查左上方是否有皇后（<code style="color: #fde047; font-family: monospace;">r--, c--</code>）。<br/>
        3. <strong>45° 对角线</strong>：检查右上方是否有皇后（<code style="color: #fde047; font-family: monospace;">r--, c++</code>）。</p>
      </div>
      <div style="padding: 10px; border-radius: 10px; background: #020617; border: 1px solid #1e293b;">
        <div style="font-weight: 700; color: #fbbf24; margin-bottom: 4px;">③ 终止条件与收集方案</div>
        <p style="margin: 0; color: #94a3b8;">当 <code style="color: #7dd3fc; font-family: monospace;">row == n</code> 时，说明成功在所有 $N$ 行安全摆放了皇后，将当前棋盘状态转为字符列表存入解集。</p>
      </div>
    </div>
  </div>
`;

export const NQUEEN_CODE_LANGUAGES: Record<string, string[]> = {
  java: [
    'public List<List<String>> solveNQueens(int n) {',
    '    List<List<String>> res = new ArrayList<>();',
    '    char[][] chessboard = new char[n][n];',
    '    for (char[] c : chessboard) Arrays.fill(c, \'.\');',
    '    backtrack(n, 0, chessboard, res);',
    '    return res;',
    '}',
    '',
    'void backtrack(int n, int row, char[][] board, List<List<String>> res) {',
    '    if (row == n) {',
    '        res.add(toList(board)); // 成功放置 N 个皇后，收集解',
    '        return;',
    '    }',
    '    for (int col = 0; col < n; col++) {',
    '        if (isValid(row, col, board, n)) { // 校验列与两对角线',
    '            board[row][col] = \'Q\'; // 放置皇后',
    '            backtrack(n, row + 1, board, res); // 递归下一行',
    '            board[row][col] = \'.\'; // 撤销皇后',
    '        }',
    '    }',
    '}',
  ],
  cpp: [
    'class Solution {',
    'public:',
    '    vector<vector<string>> solveNQueens(int n) {',
    '        vector<vector<string>> res;',
    '        vector<string> board(n, string(n, \'.\'));',
    '        backtrack(n, 0, board, res);',
    '        return res;',
    '    }',
    '    void backtrack(int n, int row, vector<string>& board, vector<vector<string>>& res) {',
    '        if (row == n) {',
    '            res.push_back(board);',
    '            return;',
    '        }',
    '        for (int col = 0; col < n; col++) {',
    '            if (isValid(row, col, board, n)) {',
    '                board[row][col] = \'Q\';',
    '                backtrack(n, row + 1, board, res);',
    '                board[row][col] = \'.\';',
    '            }',
    '        }',
    '    }',
    '};',
  ],
  python: [
    'class Solution:',
    '    def solveNQueens(self, n: int) -> List[List[str]]:',
    '        res = []',
    '        board = [[\'.\'] * n for _ in range(n)]',
    '        def backtrack(row: int):',
    '            if row == n:',
    '                res.append(["".join(r) for r in board])',
    '                return',
    '            for col in range(n):',
    '                if isValid(row, col, board, n):',
    '                    board[row][col] = \'Q\'',
    '                    backtrack(row + 1)',
    '                    board[row][col] = \'.\'',
    '        backtrack(0)',
    '        return res',
  ],
  javascript: [
    'var solveNQueens = function(n) {',
    '    const res = [];',
    '    const board = Array.from({ length: n }, () => Array(n).fill(\'.\'));',
    '    function backtrack(row) {',
    '        if (row === n) {',
    '            res.push(board.map(r => r.join(\'\')));',
    '            return;',
    '        }',
    '        for (let col = 0; col < n; col++) {',
    '            if (isValid(row, col, board, n)) {',
    '                board[row][col] = \'Q\';',
    '                backtrack(row + 1);',
    '                board[row][col] = \'.\';',
    '            }',
    '        }',
    '    }',
    '    backtrack(0);',
    '    return res;',
    '};',
  ],
};
