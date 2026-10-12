/**
 * 解数独画布适配器
 * 负责渲染 9×9 数独棋盘沙盘
 */

import { SudokuStep } from './sudoku-step-compiler';

/** 主视觉：9×9 数独棋盘沙盘 */
export function renderSudokuCanvas(container: HTMLElement, step: SudokuStep): void {
  const conflictSet = new Set(step.conflicts.map(([r, c]) => `${r},${c}`));
  const isTrying = step.action === 'try' || step.action === 'reject';
  const curR = step.row;
  const curC = step.col;

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

  container.innerHTML = `
    <div style="width: 100%; height: 100%; display: flex; align-items: center; justify-content: center; padding: 12px; box-sizing: border-box; overflow: auto;">
      ${gridHtml}
    </div>
  `;
}
