/**
 * N 皇后可视化器（回溯算法）— 4-Card 标准现代架构
 * LeetCode 51：在 N×N 棋盘上放置 N 个皇后，使得彼此不能相互攻击
 * 核心：逐行放置 + 三方向对角线冲突判定 (isValid)
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
  NQUEEN_PROBLEM_HTML,
  NQUEEN_ANALYSIS_HTML,
  NQUEEN_CODE_LANGUAGES,
} from './nqueen-problem-content';
import template from './nqueen.html?raw';

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

/* ── Visualizer class ─────────────────────────────────────── */
export class NQueenVisualizer extends StepVisualizer<NQueenStep> {
  protected codeLanguages = NQUEEN_CODE_LANGUAGES;
  protected codeLines = NQUEEN_CODE_LANGUAGES['java'];
  protected codePanelTitle = 'N 皇后 代码调试';

  private boardContainer: HTMLElement | null = null;
  private pathStackContainer: HTMLElement | null = null;
  private constraintMonitorContainer: HTMLElement | null = null;
  private resultCollectionContainer: HTMLElement | null = null;
  private logContainer: HTMLElement | null = null;
  private logCountEl: HTMLElement | null = null;
  private cachedLogs: BacktrackLogItem[] = [];

  protected initDOMElements(): void {
    if (!this.root) return;
    this.boardContainer = this.root.querySelector('#nq-board-container');
    this.pathStackContainer = this.root.querySelector('#nq-path-stack-container');
    this.constraintMonitorContainer = this.root.querySelector('#nq-constraint-monitor-container');
    this.resultCollectionContainer = this.root.querySelector('#nq-result-collection-container');
    this.logContainer = this.root.querySelector('#log-container');
    this.logCountEl = this.root.querySelector('#log-count');

    // 智能绑定播放控制 (包括生成、重置、前进/后退、播放/暂停、进度条与速度选择)
    this.bindPlaybackControls();

    // 示例 Chips
    this.root.querySelectorAll<HTMLButtonElement>('.nq-chip').forEach((btn) => {
      btn.addEventListener('click', () => {
        const nEl = this.root?.querySelector('#input-n') as HTMLInputElement | null;
        if (nEl) nEl.value = btn.dataset.n || '4';
        this.start();
      });
    });

    // 挂载暗色代码终端深模块
    this.mountTerminal({
      codeLanguages: this.codeLanguages,
      problemHtml: NQUEEN_PROBLEM_HTML,
      analysisHtml: NQUEEN_ANALYSIS_HTML,
      initialLang: 'java',
    });
  }

  protected buildSteps(): NQueenStep[] {
    const nEl = this.root?.querySelector('#input-n') as HTMLInputElement | null;
    const n = Math.min(8, Math.max(1, parseInt(nEl?.value || '4', 10) || 4));

    const steps = buildNQueenSteps(n);

    // 预计算日志流
    this.cachedLogs = steps.map((st, idx) => {
      let type: BacktrackLogItem['type'] = 'info';
      if (st.action === 'place') type = 'push';
      else if (st.action === 'backtrack') type = 'pop';
      else if (st.action === 'solution') type = 'collect';
      else if (st.action === 'conflict') type = 'prune';

      return {
        stepIndex: idx + 1,
        type,
        text: st.message,
      };
    });

    return steps;
  }

  protected renderStep(step: NQueenStep): void {
    const index = this.currentIndex;
    const n = step.board.length;

    // 1. 渲染 N×N 动态棋盘沙盘 (Card 1)
    if (this.boardContainer) {
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
      this.boardContainer.innerHTML = boardHtml;
    }

    // 2. 渲染当前皇后位置栈 (Card 2 Left)
    if (this.pathStackContainer) {
      const queensFormatted = step.queens.map(([r, c]) => `(${r}, ${c})`);
      BacktrackStateSpacePresenter.renderPathStack(this.pathStackContainer, queensFormatted);
    }

    // 3. 渲染冲突与占用掩码 (Card 2 Center)
    if (this.constraintMonitorContainer) {
      const isConflict = step.action === 'conflict';
      const colsUsed = new Set(step.queens.map(([_, c]) => c));
      const colMaskStr = Array.from({ length: n }, (_, i) => (colsUsed.has(i) ? '1' : '0')).join('');

      this.constraintMonitorContainer.innerHTML = `
        <div style="display: flex; flex-direction: column; gap: 6px; font-size: 11px; color: #334155;">
          <div style="display: flex; justify-content: space-between; align-items: center;">
            <span>当前校验状态:</span>
            <span style="padding: 2px 6px; border-radius: 4px; font-weight: 700; font-size: 10.5px; background: ${isConflict ? '#fef2f2' : '#ecfdf5'}; color: ${isConflict ? '#dc2626' : '#059669'}; border: 1px solid ${isConflict ? '#fecaca' : '#a7f3d0'};">
              ${isConflict ? '⚔️ 发生冲突 (剪枝)' : '✓ 无冲突 (合法)'}
            </span>
          </div>
          <div style="display: flex; align-items: center; justify-content: space-between;">
            <span style="color: #64748b;">列占用位图:</span>
            <span style="font-family: monospace; font-weight: 700; color: #2563eb; background: #eff6ff; padding: 1px 6px; border-radius: 4px;">${colMaskStr}</span>
          </div>
          <div style="font-size: 10px; color: #64748b; line-height: 1.4; border-top: 1px dashed #e2e8f0; padding-top: 4px;">
            <div>• 正上方列: <code style="color:#b45309; font-family:monospace;">board[r][col] == 1</code></div>
            <div>• 45°与135°斜线: <code style="color:#b45309; font-family:monospace;">(r-1, c-1) &amp; (r-1, c+1)</code></div>
          </div>
        </div>
      `;
    }

    // 4. 渲染实时合法解集箱 (Card 2 Bottom)
    const solutionsUpToNow: Array<Array<[number, number]>> = [];
    for (let i = 0; i <= index; i++) {
      const st = this.steps[i];
      if (st.action === 'solution') {
        solutionsUpToNow.push([...st.queens]);
      }
    }

    if (this.resultCollectionContainer) {
      const formattedSolutions = solutionsUpToNow.map((qList) =>
        qList.map(([r, c]) => `(${r},${c})`)
      );
      BacktrackStateSpacePresenter.renderResultCollection(
        this.resultCollectionContainer,
        formattedSolutions,
        -1,
        (solIdx: number) => {
          for (let stepIdx = 0; stepIdx < this.steps.length; stepIdx++) {
            if (
              this.steps[stepIdx].action === 'solution' &&
              JSON.stringify(this.steps[stepIdx].queens) === JSON.stringify(solutionsUpToNow[solIdx])
            ) {
              this.goToStep(stepIdx);
              break;
            }
          }
        }
      );
    }

    const badgeCount = this.root?.querySelector('#badge-result-count');
    if (badgeCount) {
      badgeCount.textContent = `解集: ${solutionsUpToNow.length}`;
    }

    // 5. 渲染执行日志流 (Card 4)
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
  id: 'nqueen',
  name: 'N 皇后',
  viewId: 'algo-nqueen-view',
  category: 'backtracking',
  description: '在 N×N 棋盘上放置 N 个皇后，逐行放置与三方向对角线冲突剪枝',
  icon: '👑',
  template,
  Visualizer: NQueenVisualizer,
  difficulty: 3,
  levelOrder: 16,
  learningGoal: '掌握二维棋盘回溯模型的按行递归与三方向 (列、主副对角线) 冲突检验机制',
});
