/**
 * N 皇后画布适配器
 * 负责渲染 N×N 动态棋盘沙盘
 */

import { NQueenStep } from './nqueen-step-compiler';

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
