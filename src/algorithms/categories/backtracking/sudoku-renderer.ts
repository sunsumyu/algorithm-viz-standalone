/**
 * 解数独可视化器（回溯算法）— 4-Card 标准现代架构
 * LeetCode 37：填充 9×9 空白格，满足行、列、3×3 宫不重复
 * 核心：双重循环遍历棋盘 + 1-9 候选数字合法性校验 (isValid) + 立即返回剪枝
 */

import { StepVisualizer } from '../../../core/step-visualizer';
import { registerAlgorithm } from '../../../core/registry';
import {
  DarkCodeTerminalPresenter,
  DarkCodeTerminalInstance,
} from '../../../core/renderers/dark-code-terminal-presenter';
import {
  BacktrackStateSpacePresenter,
  BacktrackLogItem,
} from '../../../core/renderers/backtrack-state-space-presenter';
import {
  SUDOKU_PROBLEM_HTML,
  SUDOKU_ANALYSIS_HTML,
  SUDOKU_CODE_LANGUAGES,
} from './sudoku-problem-content';
import template from './sudoku.html?raw';

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

/* ── Visualizer class ─────────────────────────────────────── */
export class SudokuVisualizer extends StepVisualizer<SudokuStep> {
  protected codeLanguages = SUDOKU_CODE_LANGUAGES;
  protected codeLines = SUDOKU_CODE_LANGUAGES['java'];
  protected codePanelTitle = '解数独 代码调试';

  private terminalInstance: DarkCodeTerminalInstance | null = null;
  private boardContainer: HTMLElement | null = null;
  private pathStackContainer: HTMLElement | null = null;
  private constraintMonitorContainer: HTMLElement | null = null;
  private metricsContainer: HTMLElement | null = null;
  private logContainer: HTMLElement | null = null;
  private logCountEl: HTMLElement | null = null;
  private cachedLogs: BacktrackLogItem[] = [];
  private currentRawPuzzle: string = DEFAULT_PUZZLE;

  protected initDOMElements(): void {
    if (!this.root) return;
    this.boardContainer = this.root.querySelector('#sd-board-container');
    this.pathStackContainer = this.root.querySelector('#sd-path-stack-container');
    this.constraintMonitorContainer = this.root.querySelector('#sd-constraint-monitor-container');
    this.metricsContainer = this.root.querySelector('#sd-metrics-container');
    this.logContainer = this.root.querySelector('#log-container');
    this.logCountEl = this.root.querySelector('#log-count');

    // 绑定播放控制
    this.bindPlaybackControls();

    // 绑定生成与重置
    this.root.querySelector('#btn-generate')?.addEventListener('click', () => this.start());
    this.root.querySelector('#btn-reset')?.addEventListener('click', () => this.reset());

    // 绑定 Scrubber 进度条
    const slider = this.root.querySelector('#slider-progress') as HTMLInputElement | null;
    if (slider) {
      slider.addEventListener('input', (e) => {
        const val = parseInt((e.target as HTMLInputElement).value, 10);
        if (!isNaN(val) && val >= 0 && val < this.steps.length) {
          this.goToStep(val);
        }
      });
    }

    // 绑定前进后退按钮
    this.root.querySelector('#btn-step-prev')?.addEventListener('click', () => this.prevStep());
    this.root.querySelector('#btn-step-next')?.addEventListener('click', () => this.nextStep());
    this.root.querySelector('#btn-play-pause')?.addEventListener('click', () => this.togglePlay());

    // 示例 Chips
    this.root.querySelectorAll<HTMLButtonElement>('.sd-chip').forEach((btn) => {
      btn.addEventListener('click', () => {
        const preset = btn.dataset.preset;
        if (preset === 'easy') this.currentRawPuzzle = EASY_PUZZLE;
        else if (preset === 'simple') this.currentRawPuzzle = SIMPLE_PUZZLE;
        else this.currentRawPuzzle = DEFAULT_PUZZLE;
        this.start();
      });
    });

    // 挂载暗色代码终端深模块
    this.terminalInstance = DarkCodeTerminalPresenter.mount(this.root, {
      codeLanguages: this.codeLanguages,
      problemHtml: SUDOKU_PROBLEM_HTML,
      analysisHtml: SUDOKU_ANALYSIS_HTML,
      initialLang: 'java',
    });
  }

  protected buildSteps(): SudokuStep[] {
    const initialBoard = parsePuzzle(this.currentRawPuzzle);
    const steps = buildSudokuSteps(initialBoard);

    // 预计算日志流
    this.cachedLogs = steps.map((st, idx) => {
      let type: BacktrackLogItem['type'] = 'info';
      if (st.action === 'place') type = 'push';
      else if (st.action === 'backtrack') type = 'pop';
      else if (st.action === 'solved') type = 'collect';
      else if (st.action === 'reject') type = 'prune';

      return {
        stepIndex: idx + 1,
        type,
        text: st.message,
      };
    });

    return steps;
  }

  protected renderStep(step: SudokuStep): void {
    const conflictSet = new Set(step.conflicts.map(([r, c]) => `${r},${c}`));
    const isTrying = step.action === 'try' || step.action === 'reject';
    const curR = step.row;
    const curC = step.col;

    // 1. 渲染 9x9 数独棋盘沙盘 (Card 1)
    if (this.boardContainer) {
      let gridHtml = `
        <div style="display: grid; grid-template-columns: repeat(9, minmax(0, 1fr)); width: 100%; max-width: 360px; aspect-ratio: 1; border: 2.5px solid #0f172a; border-radius: 8px; overflow: hidden; background: #0f172a; gap: 1px; box-shadow: 0 4px 14px rgba(0,0,0,0.15);">
      `;

      for (let r = 0; r < 9; r++) {
        for (let c = 0; c < 9; c++) {
          const isFixed = step.fixed[r][c];
          const val = step.board[r][c];
          const isConflictCell = conflictSet.has(`${r},${c}`);
          const isCurrentFocus = curR === r && curC === c;
          const isRejectFocus = isCurrentFocus && step.action === 'reject';

          // 3x3 粗边框分隔
          const borderRight = c % 3 === 2 && c !== 8 ? 'border-right: 2px solid #334155;' : '';
          const borderBottom = r % 3 === 2 && r !== 8 ? 'border-bottom: 2px solid #334155;' : '';

          let bg = (Math.floor(r / 3) + Math.floor(c / 3)) % 2 === 0 ? '#ffffff' : '#f8fafc';
          if (isConflictCell || isRejectFocus) {
            bg = '#fee2e2';
          } else if (isCurrentFocus) {
            bg = '#fef08a';
          } else if (!isFixed && val !== '.') {
            bg = '#eff6ff';
          }

          let textColor = '#0f172a';
          let fontWeight = '600';
          if (isFixed) {
            textColor = '#0f172a';
            fontWeight = '900';
          } else if (isConflictCell || isRejectFocus) {
            textColor = '#dc2626';
            fontWeight = '800';
          } else if (isCurrentFocus) {
            textColor = '#b45309';
            fontWeight = '800';
          } else if (val !== '.') {
            textColor = '#2563eb';
            fontWeight = '800';
          }

          const displayChar = isCurrentFocus && isTrying ? step.candidate || '?' : val === '.' ? '' : val;

          gridHtml += `
            <div style="background: ${bg}; ${borderRight} ${borderBottom} display: flex; align-items: center; justify-content: center; font-size: 14px; font-family: 'JetBrains Mono', monospace; font-weight: ${fontWeight}; color: ${textColor}; user-select: none; transition: background 0.12s;">
              ${displayChar}
            </div>
          `;
        }
      }
      gridHtml += `</div>`;
      this.boardContainer.innerHTML = gridHtml;
    }

    // 2. 渲染当前填充路径栈 (Card 2 Left)
    if (this.pathStackContainer) {
      const placedStack: string[] = [];
      for (let r = 0; r < 9; r++) {
        for (let c = 0; c < 9; c++) {
          if (!step.fixed[r][c] && step.board[r][c] !== '.') {
            placedStack.push(`(${r},${c})=${step.board[r][c]}`);
          }
        }
      }
      BacktrackStateSpacePresenter.renderPathStack(this.pathStackContainer, placedStack);
    }

    // 3. 渲染行/列/宫约束监视器 (Card 2 Center)
    if (this.constraintMonitorContainer) {
      const isConflict = step.action === 'reject';
      this.constraintMonitorContainer.innerHTML = `
        <div style="display: flex; flex-direction: column; gap: 6px; font-size: 11px; color: #334155;">
          <div style="display: flex; justify-content: space-between; align-items: center;">
            <span>当前尝试格: <strong style="color: #0f172a; font-family: monospace;">${curR !== null ? `(${curR}, ${curC})` : '全局扫描'}</strong></span>
            <span style="padding: 2px 6px; border-radius: 4px; font-weight: 700; font-size: 10.5px; background: ${isConflict ? '#fef2f2' : '#ecfdf5'}; color: ${isConflict ? '#dc2626' : '#059669'}; border: 1px solid ${isConflict ? '#fecaca' : '#a7f3d0'};">
              ${isConflict ? '⚔️ 触发冲突 (剪枝)' : step.action === 'place' ? '✍️ 合法填入' : '✓ 校验通过'}
            </span>
          </div>
          <div style="font-size: 10.5px; color: #64748b; line-height: 1.4; border-top: 1px dashed #e2e8f0; padding-top: 4px;">
            <div>• 行列排他: <code style="color:#b45309; font-family:monospace;">board[r][i] != k &amp;&amp; board[i][c] != k</code></div>
            <div>• 3×3宫排他: <code style="color:#b45309; font-family:monospace;">(r/3)*3 + i, (c/3)*3 + j</code></div>
          </div>
        </div>
      `;
    }

    // 4. 渲染求解进度与统计看板 (Card 2 Bottom)
    if (this.metricsContainer) {
      const percent = Math.min(100, (step.filled / 81) * 100);
      this.metricsContainer.innerHTML = `
        <div style="display: flex; flex-direction: column; gap: 6px; font-size: 11px; color: #334155;">
          <div style="display: flex; justify-content: space-between; align-items: center;">
            <span>棋盘填充率: <strong style="color: #0f172a; font-family: monospace; font-size: 12px;">${step.filled}</strong> / 81</span>
            <span style="font-size: 10.5px; font-weight: 700; color: #2563eb;">${percent.toFixed(0)}% 完成 (尝试: ${step.attempts} 次)</span>
          </div>
          <div style="background: #f1f5f9; border-radius: 6px; height: 6px; overflow: hidden;">
            <div style="background: #2563eb; width: ${percent}%; height: 100%; transition: width 0.2s;"></div>
          </div>
        </div>
      `;
    }

    const badgeProgress = this.root?.querySelector('#badge-progress-count');
    if (badgeProgress) {
      badgeProgress.textContent = `填充: ${step.filled} / 81`;
    }

    // 5. 更新 Scrubber 进度条
    const slider = this.root?.querySelector('#slider-progress') as HTMLInputElement | null;
    const stepCur = this.root?.querySelector('#step-cur') as HTMLElement | null;
    const stepTotal = this.root?.querySelector('#step-total') as HTMLElement | null;
    const playIcon = this.root?.querySelector('#play-icon') as HTMLElement | null;

    if (slider) {
      slider.max = String(Math.max(0, this.steps.length - 1));
      slider.value = String(this.currentIndex);
    }
    if (stepCur) stepCur.textContent = String(this.currentIndex + 1);
    if (stepTotal) stepTotal.textContent = String(this.steps.length);
    if (playIcon) {
      playIcon.className = this.isPlaying ? 'fa-solid fa-pause text-[12px]' : 'fa-solid fa-play text-[12px]';
    }

    // 6. 暗色终端代码行高亮
    this.terminalInstance?.highlightLine(step.codeLine);

    // 7. 渲染执行日志流 (Card 4)
    if (this.logContainer) {
      BacktrackStateSpacePresenter.renderBacktrackLogStream(
        this.logContainer,
        this.cachedLogs.slice(0, this.currentIndex + 1),
        this.currentIndex
      );
    }
    if (this.logCountEl) {
      this.logCountEl.textContent = `${this.currentIndex + 1} / ${this.steps.length} 记录`;
    }
  }

  public reset(): void {
    super.reset();
    if (this.boardContainer) this.boardContainer.innerHTML = '';
  }
}

registerAlgorithm({
  id: 'sudoku',
  name: '解数独',
  viewId: 'algo-sudoku-view',
  category: 'backtracking',
  description: '9×9 棋盘填数回溯，行、列、3×3 宫合法性约束与递归立即返回',
  icon: '🧩',
  template,
  Visualizer: SudokuVisualizer,
  difficulty: 3,
  levelOrder: 17,
  learningGoal: '掌握二维双重循环回溯、布尔返回值剪枝与九宫格坐标映射机制',
});
