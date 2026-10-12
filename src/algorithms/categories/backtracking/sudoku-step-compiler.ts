/**
 * 解数独步骤编译器
 * 负责解析数独题盘并推演回溯填充步骤
 */

export interface SudokuStep {
  board: string[][];
  fixed: boolean[][];
  row: number | null;
  col: number | null;
  candidate: string | null;
  conflicts: Array<[number, number]>;
  action: 'start' | 'scan' | 'try' | 'place' | 'reject' | 'backtrack' | 'solved';
  attempts: number;
  filled: number;
  message: string;
  codeLine: number;
  metrics?: Record<string, string>;
}

export const DEFAULT_PUZZLE =
  '53..7....\n6..195...\n.98....6.\n8...6...3\n4..8.3..1\n7...2...6\n.6....28.\n...419..5\n....8..79';
export const EASY_PUZZLE =
  '..3.2.6..\n9..3.5..1\n..18.64..\n..81.29..\n7.......8\n..67.82..\n..26.95..\n8..2.3..9\n..5.1.3..';
export const SIMPLE_PUZZLE =
  '534678912\n672195348\n198342567\n859761423\n426853791\n713924856\n961537284\n287419635\n3452861..';

export const MAX_STEPS = 2000;

export function parsePuzzle(text: string): string[][] {
  const chars = text.replace(/[^0-9.]/g, '').slice(0, 81).padEnd(81, '.');
  const board: string[][] = [];
  for (let r = 0; r < 9; r++) {
    board.push(
      chars
        .slice(r * 9, r * 9 + 9)
        .split('')
        .map((c) => (c === '0' ? '.' : c))
    );
  }
  return board;
}

export function buildSudokuSteps(initial: string[][]): SudokuStep[] {
  const board = initial.map((row) => [...row]);
  const fixed = initial.map((row) => row.map((cell) => cell !== '.'));
  const steps: SudokuStep[] = [];
  let attempts = 0;
  let truncated = false;

  const countFilled = () => board.flat().filter((v) => v !== '.').length;
  const snapshot = (
    action: SudokuStep['action'],
    row: number | null,
    col: number | null,
    candidate: string | null,
    conflicts: Array<[number, number]>,
    message: string,
    codeLine: number
  ) => {
    if (steps.length >= MAX_STEPS) {
      truncated = true;
      return;
    }
    steps.push({
      board: board.map((r) => [...r]),
      fixed: fixed.map((r) => [...r]),
      row,
      col,
      candidate,
      conflicts: conflicts.map(([r, c]) => [r, c]),
      action,
      attempts,
      filled: countFilled(),
      message,
      codeLine,
    });
  };

  const conflictCells = (row: number, col: number, val: string): Array<[number, number]> => {
    const conflicts: Array<[number, number]> = [];
    // 检查同行与同列
    for (let i = 0; i < 9; i++) {
      if (i !== col && board[row][i] === val) conflicts.push([row, i]);
      if (i !== row && board[i][col] === val) conflicts.push([i, col]);
    }
    // 检查 3x3 宫
    const br = Math.floor(row / 3) * 3;
    const bc = Math.floor(col / 3) * 3;
    for (let r = br; r < br + 3; r++) {
      for (let c = bc; c < bc + 3; c++) {
        if ((r !== row || c !== col) && board[r][c] === val) {
          conflicts.push([r, c]);
        }
      }
    }
    return Array.from(new Map(conflicts.map((p) => [`${p[0]},${p[1]}`, p])).values());
  };

  snapshot('start', null, null, null, [], `开始解数独：初始已填入 ${countFilled()}/81 个数字`, 2);

  const backtrack = (): boolean => {
    if (truncated) return true;

    for (let r = 0; r < 9; r++) {
      for (let c = 0; c < 9; c++) {
        if (board[r][c] !== '.') continue;

        for (let k = 1; k <= 9; k++) {
          const charK = String(k);
          attempts++;
          const conflicts = conflictCells(r, c, charK);

          snapshot('try', r, c, charK, conflicts, `尝试在 (${r}, ${c}) 填入数字 ${charK}`, 9);

          if (conflicts.length > 0) {
            snapshot(
              'reject',
              r,
              c,
              charK,
              conflicts,
              `⚔️ 数字 ${charK} 与已有数字冲突 (${conflicts.map(([cr, cc]) => `(${cr},${cc})`).join(', ')})，剪枝跳过`,
              9
            );
            continue;
          }

          board[r][c] = charK;
          snapshot('place', r, c, charK, [], `✍️ 填入数字 ${charK} 到 (${r}, ${c})，递归尝试下一个空格`, 10);

          if (backtrack()) return true;

          board[r][c] = '.';
          snapshot('backtrack', r, c, charK, [], `🔙 回溯撤销 (${r}, ${c}) 的数字 ${charK}，恢复为空格`, 12);
        }

        // 1-9 都尝试过均不合法
        return false;
      }
    }

    return true; // 遍历完所有格子均无空格，求解成功
  };

  const solved = backtrack();

  if (solved && !truncated) {
    snapshot('solved', null, null, null, [], `🎉 数独成功求解完成，数独已解出！全部 81 个单元格满足数独规则`, 17);
  }

  return steps;
}

/** 为每一步附加状态监视器指标（键名与 spec.metrics 的 id 一一对应） */
export function withMetrics(steps: SudokuStep[]): SudokuStep[] {
  return steps.map((s) => {
    let action = '✓ 校验通过';
    if (s.action === 'place') action = '✍️ 合法填入';
    else if (s.action === 'reject') action = '⚔️ 触发冲突 (剪枝)';
    else if (s.action === 'backtrack') action = '↩️ 回溯';
    else if (s.action === 'solved') action = '🎉 求解完成';
    else if (s.action === 'scan') action = '🔍 扫描空格';
    else if (s.action === 'start') action = '开始';

    return {
      ...s,
      log: s.message,
      metrics: {
        'try-cell': s.row !== null ? `(${s.row}, ${s.col})` : '全局扫描',
        candidate: s.candidate || '—',
        filled: `${s.filled} / 81 (${Math.min(100, (s.filled / 81) * 100).toFixed(0)}%)`,
        attempts: String(s.attempts),
        action,
      },
    };
  });
}
