/**
 * N 皇后可视化器（回溯）
 * 枚举所有解，展示冲突、放置、撤销与无解状态
 */

import { StepVisualizer } from '../../../core/step-visualizer';
import { registerAlgorithm } from '../../../core/registry';
import { HighlightTarget } from '../../../core/code-panel';
import template from './nqueen.html?raw';

export interface NQueenStep {
  board: number[][];
  row: number;
  col: number | null;
  conflicts: Array<[number, number]>;
  action: 'start' | 'try' | 'place' | 'conflict' | 'backtrack' | 'solution' | 'done' | 'truncated';
  attempts: number;
  solutions: number;
  message: string;
  log: string;
  codeLine: HighlightTarget;
}

export const MAX_STEPS = 1600;

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
    log: string,
    codeLine: HighlightTarget,
  ) => {
    if (steps.length >= MAX_STEPS) {
      truncated = true;
      return;
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
      log,
      codeLine,
    });
  };

  const conflictsAt = (row: number, col: number): Array<[number, number]> => {
    const conflicts: Array<[number, number]> = [];
    for (let r = 0; r < row; r++) {
      if (board[r][col] === 1) conflicts.push([r, col]);
    }
    for (let r = row - 1, c = col - 1; r >= 0 && c >= 0; r--, c--) {
      if (board[r][c] === 1) conflicts.push([r, c]);
    }
    for (let r = row - 1, c = col + 1; r >= 0 && c < n; r--, c++) {
      if (board[r][c] === 1) conflicts.push([r, c]);
    }
    return conflicts;
  };

  snapshot('start', 0, null, [], `开始在 ${n}×${n} 棋盘上放置 ${n} 个皇后。`, '开始', 5);

  const backtrack = (row: number) => {
    if (truncated) return;
    if (row === n) {
      solutions++;
      snapshot('solution', row, null, [], `找到第 ${solutions} 个解。`, `解 #${solutions}`, { from: 10, to: 12 });
      return;
    }

    for (let col = 0; col < n; col++) {
      attempts++;
      const conflicts = conflictsAt(row, col);
      snapshot('try', row, col, conflicts, `尝试在第 ${row + 1} 行第 ${col + 1} 列放置皇后。`, `尝试 (${row + 1},${col + 1})`, 14);

      if (conflicts.length > 0) {
        snapshot('conflict', row, col, conflicts, `位置 (${row + 1},${col + 1}) 与已有皇后冲突，跳过。`, `冲突 (${row + 1},${col + 1})`, 15);
        continue;
      }

      board[row][col] = 1;
      snapshot('place', row, col, [], `放置皇后到 (${row + 1},${col + 1})，进入下一行。`, `放置 (${row + 1},${col + 1})`, 16);
      backtrack(row + 1);
      board[row][col] = 0;
      snapshot('backtrack', row, col, [], `撤销 (${row + 1},${col + 1})，回到上一层继续尝试。`, `撤销 (${row + 1},${col + 1})`, 18);
    }
  };

  backtrack(0);

  if (truncated) {
    snapshot('truncated', n, null, [], `演示步骤超过 ${MAX_STEPS}，已截断。当前找到 ${solutions} 个解。`, '演示截断', 24);
  } else if (solutions === 0) {
    snapshot('done', n, null, [], `${n} 皇后无解。`, '无解', 24);
  } else {
    snapshot('done', n, null, [], `搜索完成，共找到 ${solutions} 个解。`, `完成 ${solutions} 个解`, 24);
  }

  return steps;
}

export class NQueenVisualizer extends StepVisualizer<NQueenStep> {
  protected codeLines = [
    'public List<List<String>> solveNQueens(int n) {',
    '    List<List<String>> res = new ArrayList<>();',
    '    char[][] board = new char[n][n];',
    '    for (char[] row : board) Arrays.fill(row, \'.\');',
    '    backtrack(board, 0, res, n);',
    '    return res;',
    '}',
    '',
    'void backtrack(char[][] board, int row, List<List<String>> res, int n) {',
    '    if (row == n) {',
    '        res.add(construct(board));',
    '        return;',
    '    }',
    '    for (int col = 0; col < n; col++) {',
    '        if (!isValid(board, row, col)) continue;',
    '        board[row][col] = \'Q\';',
    '        backtrack(board, row + 1, res, n);',
    '        board[row][col] = \'.\';',
    '    }',
    '}',
  ];
  protected codePanelTitle = 'N 皇后回溯 Java 代码';

  private inputN: HTMLInputElement | null = null;
  private boardEl: HTMLElement | null = null;
  private logEl: HTMLElement | null = null;
  private placedEl: HTMLElement | null = null;
  private attemptEl: HTMLElement | null = null;
  private solutionEl: HTMLElement | null = null;

  /** 持久化的棋盘 cell 网格，按 [row][col] 索引；N 变化时整体重建 */
  private cellGrid: HTMLElement[][] = [];
  /** 当前网格的维度，用于检测 N 变化触发重建 */
  private currentN = 0;

  protected initDOMElements(): void {
    if (!this.root) return;
    this.inputN = this.root.querySelector('#nqueen-input');
    this.boardEl = this.root.querySelector('#nqueen-board');
    this.logEl = this.root.querySelector('#nqueen-log');
    this.placedEl = this.root.querySelector('#placed-count');
    this.attemptEl = this.root.querySelector('#attempt-count');
    this.solutionEl = this.root.querySelector('#solution-count');
    this.bindPlaybackControls({
      reset: 'step-reset', prev: 'step-prev', play: 'step-play', next: 'step-next',
      speed: 'step-speed', speedLabel: 'step-speed-label', counter: 'step-counter', message: 'step-message',
    });
    this.root.querySelector('#nqueen-start')?.addEventListener('click', () => this.start());
  }

  protected buildSteps(): NQueenStep[] {
    let n = parseInt(this.inputN?.value || '4', 10);
    if (!Number.isFinite(n)) n = 4;
    n = Math.max(1, Math.min(8, n));
    if (this.inputN) this.inputN.value = String(n);
    this.currentN = n;
    return buildNQueenSteps(n);
  }

  protected renderStep(step: NQueenStep): void {
    const placed = step.board.reduce((sum, row) => sum + row.filter(Boolean).length, 0);
    if (this.placedEl) this.placedEl.textContent = String(placed);
    if (this.attemptEl) this.attemptEl.textContent = String(step.attempts);
    if (this.solutionEl) this.solutionEl.textContent = String(step.solutions);
    this.renderBoard(step);
    this.renderLog();
  }

  private renderBoard(step: NQueenStep): void {
    if (!this.boardEl) return;
    const n = step.board.length;

    // N 变化（或首次渲染）：清空并重建整个 cell 网格
    if (this.currentN !== n || this.cellGrid.length !== n) {
      this.currentN = n;
      this.boardEl.innerHTML = '';
      this.boardEl.style.gridTemplateColumns = `repeat(${n}, minmax(34px, 48px))`;
      this.cellGrid = [];
      for (let r = 0; r < n; r++) {
        const row: HTMLElement[] = [];
        for (let c = 0; c < n; c++) {
          const cell = document.createElement('div');
          cell.className = `nq-cell ${(r + c) % 2 === 0 ? 'light' : 'dark'}`;
          this.boardEl.appendChild(cell);
          row.push(cell);
        }
        this.cellGrid.push(row);
      }
    }

    const conflictSet = new Set(step.conflicts.map(([r, c]) => `${r},${c}`));

    for (let r = 0; r < n; r++) {
      for (let c = 0; c < n; c++) {
        const cell = this.cellGrid[r][c];
        const shouldBeQueen = step.board[r][c] === 1;
        const wasQueen = cell.classList.contains('queen');

        // current / conflict 靠 toggle 增量切换，transition 平滑过渡
        cell.classList.toggle('current', step.row === r && step.col === c);
        cell.classList.toggle('conflict', conflictSet.has(`${r},${c}`));

        if (shouldBeQueen && !wasQueen) {
          // 新放置皇后：写入 ♛ 并重新触发 nq-drop 入场动画
          cell.textContent = '♛';
          cell.classList.remove('queen');
          // 强制 reflow，让浏览器丢弃上一轮的 animation 状态
          void cell.offsetWidth;
          cell.classList.add('queen');
        } else if (!shouldBeQueen && wasQueen) {
          // 撤销皇后：先触发 nq-fade-out 渐隐动画，结束后再清理 ♛ 与 class
          cell.classList.remove('queen');
          cell.classList.add('queen-leaving');
          // 动画结束清理（一次性监听）
          const onEnd = () => {
            cell.classList.remove('queen-leaving');
            cell.textContent = '';
            cell.removeEventListener('animationend', onEnd);
          };
          cell.addEventListener('animationend', onEnd);
        }
        // shouldBeQueen && wasQueen：保持不变，nq-pulse 等持续动画不抖动
      }
    }
  }

  protected renderLog(): void {
    if (!this.logEl) return;
    this.logEl.innerHTML = '';
    this.steps.slice(0, this.currentIndex + 1).forEach((step, index) => {
      const line = document.createElement('div');
      line.className = index === this.currentIndex ? `active ${step.action}` : step.action;
      line.textContent = `${String(index + 1).padStart(2, '0')}. ${step.log}`;
      this.logEl!.appendChild(line);
    });
    this.logEl.scrollTop = this.logEl.scrollHeight;
  }
}

registerAlgorithm({
  id: 'nqueen',
  name: 'N皇后',
  viewId: 'algo-nqueen-view',
  category: 'backtracking',
  description: '逐行放置皇后，检查列与两条对角线冲突',
  icon: '👑',
  template,
  Visualizer: NQueenVisualizer,
  difficulty: 3,
  levelOrder: 19,
  learningGoal: '掌握 N 皇后问题中约束检查的回溯框架',
});
