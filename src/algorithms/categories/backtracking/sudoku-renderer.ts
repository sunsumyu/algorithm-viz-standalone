/**
 * 解数独可视化器（回溯）
 * LeetCode 37 · 找空格、尝试 1-9、合法则递归，失败后撤销
 */

import { StepVisualizer } from '../../../core/step-visualizer';
import { registerAlgorithm } from '../../../core/registry';
import template from './sudoku.html?raw';

export interface SudokuStep {
  board: string[][];
  fixed: boolean[][];
  row: number | null;
  col: number | null;
  candidate: string | null;
  conflicts: Array<[number, number]>;
  action: 'start' | 'scan' | 'try' | 'place' | 'reject' | 'backtrack' | 'solved' | 'truncated';
  attempts: number;
  filled: number;
  message: string;
  log: string;
  codeLine: number | number[];
}

export const DEFAULT_PUZZLE = '53..7....\n6..195...\n.98....6.\n8...6...3\n4..8.3..1\n7...2...6\n.6....28.\n...419..5\n....8..79';
export const EASY_PUZZLE = '..3.2.6..\n9..3.5..1\n..18.64..\n..81.29..\n7.......8\n..67.82..\n..26.95..\n8..2.3..9\n..5.1.3..';
export const MAX_STEPS = 2200;

export function parsePuzzle(text: string): string[][] {
  const chars = text.replace(/[^0-9.]/g, '').slice(0, 81).padEnd(81, '.');
  const board: string[][] = [];
  for (let r = 0; r < 9; r++) {
    board.push(chars.slice(r * 9, r * 9 + 9).split('').map((c) => (c === '0' ? '.' : c)));
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
    log: string,
    codeLine: number | number[],
  ) => {
    if (steps.length >= MAX_STEPS) {
      truncated = true;
      return;
    }
    steps.push({
      board: board.map((r) => [...r]),
      fixed: fixed.map((r) => [...r]),
      row, col, candidate,
      conflicts: conflicts.map(([r, c]) => [r, c]),
      action,
      attempts,
      filled: countFilled(),
      message,
      log,
      codeLine,
    });
  };

  const findEmpty = (): [number, number] | null => {
    for (let r = 0; r < 9; r++) {
      for (let c = 0; c < 9; c++) {
        if (board[r][c] === '.') return [r, c];
      }
    }
    return null;
  };

  const conflictCells = (row: number, col: number, val: string): Array<[number, number]> => {
    const conflicts: Array<[number, number]> = [];
    for (let i = 0; i < 9; i++) {
      if (board[row][i] === val) conflicts.push([row, i]);
      if (board[i][col] === val) conflicts.push([i, col]);
    }
    const br = Math.floor(row / 3) * 3;
    const bc = Math.floor(col / 3) * 3;
    for (let r = br; r < br + 3; r++) {
      for (let c = bc; c < bc + 3; c++) {
        if (board[r][c] === val) conflicts.push([r, c]);
      }
    }
    return Array.from(new Map(conflicts.map((p) => [`${p[0]},${p[1]}`, p])).values());
  };

  const backtrack = (): boolean => {
    if (truncated) return true;
    const empty = findEmpty();
    if (!empty) {
      snapshot('solved', null, null, null, [], '数独已解出。', '解出数独', 6);
      return true;
    }

    const [row, col] = empty;
    snapshot('scan', row, col, null, [], `找到空格 (${row + 1},${col + 1})，尝试 1-9。`, `空格 (${row + 1},${col + 1})`, 10);

    for (let num = 1; num <= 9; num++) {
      const value = String(num);
      attempts++;
      const conflicts = conflictCells(row, col, value);
      snapshot('try', row, col, value, conflicts, `尝试 ${value} 填入 (${row + 1},${col + 1})。`, `尝试 ${value}`, 11);
      if (conflicts.length > 0) {
        snapshot('reject', row, col, value, conflicts, `${value} 与同行/同列/同宫已有数字冲突，跳过。`, `冲突 ${value}`, 12);
        continue;
      }
      board[row][col] = value;
      snapshot('place', row, col, value, [], `填入 ${value}，递归求解下一个空格。`, `填 ${value}`, 13);
      if (backtrack()) return true;
      board[row][col] = '.';
      snapshot('backtrack', row, col, value, [], `后续无解，撤销 (${row + 1},${col + 1}) 的 ${value}。`, `撤销 ${value}`, 15);
    }

    return false;
  };

  snapshot('start', null, null, null, [], '开始解数独：固定数字不可修改，空格通过回溯填充。', '开始', [1, 2]);
  backtrack();
  if (truncated) {
    const final: SudokuStep = {
      board: board.map((r) => [...r]), fixed: fixed.map((r) => [...r]), row: null, col: null, candidate: null,
      conflicts: [], action: 'truncated', attempts, filled: countFilled(),
      message: `演示超过 ${MAX_STEPS} 步，已截断。`, log: '演示截断', codeLine: 16,
    };
    steps.push(final);
  }
  return steps;
}

export class SudokuVisualizer extends StepVisualizer<SudokuStep> {
  protected codeLines = [
    'public void solveSudoku(char[][] board) {',
    '    backtrack(board);',
    '}',
    '',
    'boolean backtrack(char[][] board) {',
    '    for (int row = 0; row < 9; row++) {',
    '        for (int col = 0; col < 9; col++) {',
    '            if (board[row][col] == \'.\') {',
    '                for (char c = \'1\'; c <= \'9\'; c++) {',
    '                    if (isValid(board, row, col, c)) {',
    '                        board[row][col] = c;',
    '                        if (backtrack(board)) return true;',
    '                        board[row][col] = \'.\';',
    '                    }',
    '                }',
    '                return false;',
    '            }',
    '        }',
    '    }',
    '    return true;',
    '}',
  ];
  protected codePanelTitle = '解数独回溯 Java 代码';

  private textarea: HTMLTextAreaElement | null = null;
  private boardEl: HTMLElement | null = null;
  private logEl: HTMLElement | null = null;
  private attemptsEl: HTMLElement | null = null;
  private filledEl: HTMLElement | null = null;
  private currentEl: HTMLElement | null = null;
  private candidateEl: HTMLElement | null = null;

  /** 持久化的 9x9 cell 网格，首次渲染创建后永远复用 */
  private cellGrid: HTMLElement[][] = [];

  protected initDOMElements(): void {
    if (!this.root) return;
    this.textarea = this.root.querySelector('#sudoku-input');
    this.boardEl = this.root.querySelector('#sudoku-board');
    this.logEl = this.root.querySelector('#sudoku-log');
    this.attemptsEl = this.root.querySelector('#sudoku-attempts');
    this.filledEl = this.root.querySelector('#sudoku-filled');
    this.currentEl = this.root.querySelector('#sudoku-current');
    this.candidateEl = this.root.querySelector('#sudoku-candidate');
    this.bindPlaybackControls({
      reset: 'step-reset',
      prev: 'step-prev',
      play: 'step-play',
      next: 'step-next',
      speed: 'sd-speed',
      speedLabel: 'sd-speed-label',
      message: 'step-message'
    });
    this.root.querySelector('#sudoku-start')?.addEventListener('click', () => this.start());
    this.root.querySelector('#sudoku-example-default')?.addEventListener('click', () => {
      if (this.textarea) this.textarea.value = DEFAULT_PUZZLE;
      this.start();
    });
    this.root.querySelector('#sudoku-example-easy')?.addEventListener('click', () => {
      if (this.textarea) this.textarea.value = EASY_PUZZLE;
      this.start();
    });
  }

  protected buildSteps(): SudokuStep[] {
    const text = this.textarea?.value || DEFAULT_PUZZLE;
    return buildSudokuSteps(parsePuzzle(text));
  }

  protected renderStep(step: SudokuStep): void {
    if (this.attemptsEl) this.attemptsEl.textContent = String(step.attempts);
    if (this.filledEl) this.filledEl.textContent = `${step.filled}/81`;
    if (this.currentEl) this.currentEl.textContent = step.row == null ? '-' : `(${step.row + 1},${(step.col || 0) + 1})`;
    if (this.candidateEl) this.candidateEl.textContent = step.candidate || '-';
    this.renderBoard(step);
    this.renderLog();
  }

  private renderBoard(step: SudokuStep): void {
    if (!this.boardEl) return;

    // 首次渲染：创建 9x9=81 个 cell 并 append。box-right/box-bottom 是固定布局，只设一次
    if (this.cellGrid.length === 0) {
      this.cellGrid = [];
      for (let r = 0; r < 9; r++) {
        const row: HTMLElement[] = [];
        for (let c = 0; c < 9; c++) {
          const cell = document.createElement('div');
          cell.className = 'sd-cell';
          if ((r + 1) % 3 === 0 && r !== 8) cell.classList.add('box-bottom');
          if ((c + 1) % 3 === 0 && c !== 8) cell.classList.add('box-right');
          this.boardEl.appendChild(cell);
          row.push(cell);
        }
        this.cellGrid.push(row);
      }
    }

    const conflictSet = new Set(step.conflicts.map(([r, c]) => `${r},${c}`));

    for (let r = 0; r < 9; r++) {
      for (let c = 0; c < 9; c++) {
        const cell = this.cellGrid[r][c];
        const val = step.board[r][c];
        const isFilled = val !== '.';
        const text = isFilled ? val : '';
        // 注意：wasFilled 必须在修改 textContent 之前读取
        const wasFilled = cell.textContent !== '' && cell.textContent !== null;
        const isConflict = conflictSet.has(`${r},${c}`);

        // fixed 在换题时会变（某些格从空变固定 / 反之），每步 toggle 保证同步
        cell.classList.toggle('fixed', step.fixed[r][c]);
        // current / conflict 靠 toggle 增量切换，transition 平滑过渡
        cell.classList.toggle('current', step.row === r && step.col === c);
        cell.classList.toggle('conflict', isConflict);

        // placed（sd-place-pop）是 entrance 动画；conflict（sd-conflict-shake）
        // 也是 animation。同元素上后定义的 animation 会覆盖前者，所以冲突时
        // 必须移除 placed，否则 shake 不会播放。
        if (isConflict) {
          cell.classList.remove('placed');
          cell.classList.remove('leaving');
          if (cell.textContent !== text) cell.textContent = text;
        } else if (isFilled && !wasFilled) {
          // 空格 -> 数字：新填入，触发 sd-place-pop 入场动画（动画重启技巧）
          cell.classList.remove('leaving');
          cell.textContent = text;
          cell.classList.remove('placed');
          void cell.offsetWidth;
          cell.classList.add('placed');
        } else if (!isFilled && wasFilled) {
          // 数字 -> 空格（backtrack）：先触发 sd-fade-out 渐隐，结束后再清空
          cell.classList.remove('placed');
          cell.classList.remove('leaving');
          void cell.offsetWidth;
          cell.classList.add('leaving');
          const onEnd = () => {
            cell.textContent = text;
            cell.classList.remove('leaving');
            cell.removeEventListener('animationend', onEnd);
          };
          cell.addEventListener('animationend', onEnd);
        } else {
          // 状态不变：仅同步文本（保险）
          if (cell.textContent !== text) cell.textContent = text;
        }
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
  id: 'sudoku',
  name: '解数独',
  viewId: 'algo-sudoku-view',
  category: 'backtracking',
  description: 'LeetCode 37 · 找空格、试数字、合法递归、失败回溯',
  icon: '🔢',
  template,
  Visualizer: SudokuVisualizer,
  difficulty: 3,
  levelOrder: 20,
  learningGoal: '理解数独求解中行/列/宫三维约束的回溯',
});
