/**
 * N 皇后步骤编译器
 * 负责推演棋盘按行回溯执行步骤
 */

export interface NQueenStep {
  board: number[][];
  row: number;
  col: number | null;
  conflicts: Array<[number, number]>;
  action: 'start' | 'try' | 'place' | 'conflict' | 'backtrack' | 'solution' | 'done';
  attempts: number;
  solutions: number;
  message: string;
  codeLine: number;
  queens: Array<[number, number]>;
  metrics?: Record<string, string>;
}

export const MAX_STEPS = 2000;

export function buildNQueenSteps(n: number): NQueenStep[] {
  const steps: NQueenStep[] = [];
  const board: number[][] = Array.from({ length: n }, () => Array(n).fill(0));
  let attempts = 0;
  let solutions = 0;
  let truncated = false;

  const snapshot = (
    action: NQueenStep['action'],
    row: number,
    col: number | null,
    conflicts: Array<[number, number]>,
    message: string,
    codeLine: number,
  ) => {
    if (steps.length >= MAX_STEPS) {
      truncated = true;
      return;
    }
    const queens: Array<[number, number]> = [];
    for (let r = 0; r < n; r++) {
      for (let c = 0; c < n; c++) {
        if (board[r][c] === 1) queens.push([r, c]);
      }
    }
    steps.push({
      board: board.map((r) => [...r]),
      row,
      col,
      conflicts: conflicts.map(([r, c]) => [r, c]),
      action,
      attempts,
      solutions,
      message,
      codeLine,
      queens,
    });
  };

  const conflictsAt = (row: number, col: number): Array<[number, number]> => {
    const conflicts: Array<[number, number]> = [];
    // 检查正上方同列
    for (let r = 0; r < row; r++) {
      if (board[r][col] === 1) conflicts.push([r, col]);
    }
    // 检查 135° 左上对角线
    for (let r = row - 1, c = col - 1; r >= 0 && c >= 0; r--, c--) {
      if (board[r][c] === 1) conflicts.push([r, col]);
    }
    // 检查 45° 右上对角线
    for (let r = row - 1, c = col + 1; r >= 0 && c < n; r--, c++) {
      if (board[r][c] === 1) conflicts.push([r, col]);
    }
    return conflicts;
  };

  snapshot('start', 0, null, [], `开始在 ${n}×${n} 棋盘上放置 ${n} 个皇后，逐行回溯搜索`, 5);

  const backtrack = (row: number) => {
    if (truncated) return;
    if (row === n) {
      solutions++;
      snapshot('solution', row, null, [], `🎉 找到第 ${solutions} 个合法 N 皇后解！`, 11);
      return;
    }

    for (let col = 0; col < n; col++) {
      attempts++;
      const conflicts = conflictsAt(row, col);
      snapshot('try', row, col, conflicts, `尝试在第 ${row + 1} 行第 ${col + 1} 列 (${row}, ${col}) 放置皇后`, 14);

      if (conflicts.length > 0) {
        snapshot(
          'conflict',
          row,
          col,
          conflicts,
          `⚔️ 位置 (${row}, ${col}) 与已有皇后发生冲突 (${conflicts.map(([r, c]) => `(${r},${c})`).join(', ')})，剪枝跳过`,
          14
        );
        continue;
      }

      board[row][col] = 1;
      snapshot('place', row, col, [], `👑 放置皇后到 (${row}, ${col})，进入下一行 row=${row + 1}`, 15);
      backtrack(row + 1);
      board[row][col] = 0;
      snapshot('backtrack', row, col, [], `🔙 回溯撤销 (${row}, ${col}) 的皇后，继续尝试当前行下一列`, 17);
    }
  };

  backtrack(0);

  const doneMsg =
    solutions === 0
      ? `搜索完成！无解（共找到 0 个解）`
      : `🎉 搜索完成！共找到 ${solutions} 个解（${solutions} 组不冲突的合法摆放解）`;
  snapshot('done', n, null, [], doneMsg, 6);
  return steps;
}

/** 为每一步附加状态监视器指标（键名与 spec.metrics 的 id 一一对应） */
export function withMetrics(steps: NQueenStep[]): NQueenStep[] {
  return steps.map((s) => {
    const n = s.board.length;
    const colsUsed = new Set(s.queens.map(([, c]) => c));
    const colMaskStr = Array.from({ length: n }, (_, i) => (colsUsed.has(i) ? '1' : '0')).join('');

    let action = '🔍 校验位置';
    if (s.action === 'place') action = '👑 放置皇后';
    else if (s.action === 'conflict') action = '⚔️ 冲突剪枝';
    else if (s.action === 'backtrack') action = '↩️ 回溯';
    else if (s.action === 'solution') action = '🎉 找到合法解';
    else if (s.action === 'done') action = '完成';
    else if (s.action === 'start') action = '开始';

    return {
      ...s,
      log: s.message,
      metrics: {
        row: s.row >= 0 ? String(s.row) : '—',
        attempts: String(s.attempts),
        solutions: String(s.solutions),
        'col-mask': colMaskStr,
        action,
      },
    };
  });
}
