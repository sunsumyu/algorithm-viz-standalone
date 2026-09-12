/**
 * N 皇后可视化器（回溯算法）— 4-Card 标准现代架构
 * LeetCode 51：在 N×N 棋盘上放置 N 个皇后，使得彼此不能相互攻击
 * 核心：逐行放置 + 三方向对角线冲突判定 (isValid)
 */
import { registerDeclarativeAlgorithm } from '../../../core/declarative-algorithm-visualizer';


import {
  NQUEEN_PROBLEM_HTML,
  NQUEEN_ANALYSIS_HTML,
  NQUEEN_CODE_LANGUAGES,
} from './nqueen-problem-content';

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
      if (board[r][c] === 1) conflicts.push([r, c]);
    }
    // 检查 45° 右上对角线
    for (let r = row - 1, c = col + 1; r >= 0 && c < n; r--, c++) {
      if (board[r][c] === 1) conflicts.push([r, c]);
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
function withMetrics(steps: NQueenStep[]): NQueenStep[] {
  return steps.map((s) => {
    const n = s.board.length;
    const colsUsed = new Set(s.queens.map(([, c]) => c));
    const colMaskStr = Array.from({ length: n }, (_, i) => (colsUsed.has(i) ? '1' : '0')).join('');
    const isConflict = s.action === 'conflict';

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

/** 主视觉：N×N 动态棋盘沙盘 */
export function renderNQueenCanvas(container: HTMLElement, step: NQueenStep): void {
  const n = step.board.length;

  const conflictSet = new Set(step.conflicts.map(([r, c]) => `${r},${c}`));
  const isTrying = step.action === 'try' || step.action === 'conflict';
  const tryR = step.row;
  const tryC = step.col;

  let boardHtml = `<div style="display: grid; grid-template-columns: repeat(${n}, minmax(0, 1fr)); width: 100%; max-width: ${Math.min(360, n * 50)}px; aspect-ratio: 1; border: 2px solid #334155; border-radius: 10px; overflow: hidden; box-shadow: 0 4px 14px rgba(0,0,0,0.12);">`;

  for (let r = 0; r < n; r++) {
    for (let c = 0; c < n; c++) {
      const isDark = (r + c) % 2 === 1;
      const hasQueen = step.board[r][c] === 1;
      const isConflictQueen = hasQueen && conflictSet.has(`${r},${c}`);
      const isCurrentTry = isTrying && r === tryR && c === tryC;
      const isConflictTry = isCurrentTry && step.action === 'conflict';

      let bg = isDark ? '#cbd5e1' : '#f8fafc';
      if (isConflictQueen || isConflictTry) {
        bg = '#fecaca';
      } else if (isCurrentTry) {
        bg = '#fef08a';
      } else if (hasQueen) {
        bg = '#bfdbfe';
      }

      let content = '';
      if (hasQueen) {
        content = `<span style="font-size: ${Math.max(14, 32 - n * 2)}px; filter: drop-shadow(0 2px 4px rgba(0,0,0,0.2));">👑</span>`;
      } else if (isConflictTry) {
        content = `<span style="font-size: ${Math.max(12, 26 - n * 2)}px; color: #dc2626; font-weight: 900;">✕</span>`;
      } else if (isCurrentTry) {
        content = `<span style="font-size: ${Math.max(12, 26 - n * 2)}px; color: #ca8a04; font-weight: 900;">?</span>`;
      }

      boardHtml += `
        <div style="background: ${bg}; display: flex; align-items: center; justify-content: center; position: relative; border: 0.5px solid rgba(0,0,0,0.05); user-select: none; transition: background 0.15s;">
          ${content}
          <span style="position: absolute; bottom: 1px; right: 2px; font-size: 8px; color: #94a3b8; font-family: monospace;">${r},${c}</span>
        </div>
      `;
    }
  }
  boardHtml += `</div>`;

  container.innerHTML = `
    <div style="width: 100%; height: 100%; display: flex; align-items: center; justify-content: center; padding: 12px; box-sizing: border-box; overflow: auto;">
      ${boardHtml}
    </div>
  `;
}

registerDeclarativeAlgorithm({
  id: 'nqueen',
  name: 'N 皇后',
  category: 'backtracking',
  description: '在 N×N 棋盘上放置 N 个皇后，逐行放置与三方向对角线冲突剪枝',
  icon: '👑',
  difficulty: 3,
  levelOrder: 16,
  learningGoal: '掌握二维棋盘回溯模型的按行递归与三方向 (列、主副对角线) 冲突检验机制',
  inputs: [
    {
      id: 'n',
      label: '棋盘规模 N',
      type: 'number',
      defaultValue: '4',
      placeholder: '4 - 8',
    },
  ],
  presets: [
    { label: 'N=4', values: { n: '4' } },
    { label: 'N=5', values: { n: '5' } },
    { label: 'N=6', values: { n: '6' } },
    { label: 'N=8', values: { n: '8' } },
  ],
  metrics: [
    { id: 'row', label: '当前放置行', color: '#2563eb' },
    { id: 'attempts', label: '尝试次数', color: '#f59e0b' },
    { id: 'solutions', label: '合法解数', color: '#10b981' },
    { id: 'col-mask', label: '列占用位图', color: '#2563eb' },
    { id: 'action', label: '回溯动作', color: '#dc2626' },
  ],
  legend: [
    { label: '已放置皇后', color: '#3b82f6' },
    { label: '当前试探位', color: '#facc15' },
    { label: '冲突格', color: '#f87171' },
  ],
  codeLanguages: NQUEEN_CODE_LANGUAGES,
  problemHtml: NQUEEN_PROBLEM_HTML,
  analysisHtml: NQUEEN_ANALYSIS_HTML,
  generateSteps: (inputs) => {
    let n = parseInt(String(inputs.n ?? '4'), 10);
    if (!Number.isFinite(n)) n = 4;
    n = Math.max(1, Math.min(9, n));
    return withMetrics(buildNQueenSteps(n));
  },
  renderCanvas: (container, step) => renderNQueenCanvas(container, step as NQueenStep),
});
