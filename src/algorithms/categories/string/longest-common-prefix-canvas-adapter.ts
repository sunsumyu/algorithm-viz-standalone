/**
 * 最长公共前缀 — 画布适配器
 * 负责多字符串矩阵纵向逐列扫描沙盘渲染
 */

import { LCPStep } from './longest-common-prefix-step-compiler';

export function renderLongestCommonPrefixCanvas(container: HTMLElement, step: LCPStep): void {
  const { strs, col, row, matchedLen, isMismatch, phase } = step;

  const rowsHtml = strs
    .map((str, rIdx) => {
      const cellsHtml = str
        .split('')
        .map((ch, cIdx) => {
          const inCurCol = cIdx === col && phase !== 'done';
          const isActiveCell = rIdx === row && cIdx === col;
          const isMatchedPrefix = cIdx < matchedLen;
          const isCellMismatch = isMismatch && rIdx === row && cIdx === col;

          let style =
            'width: 28px; height: 30px; border-radius: 6px; background: #ffffff; border: 1.5px solid #cbd5e1; display: inline-flex; align-items: center; justify-content: center; font-family: \'JetBrains Mono\', monospace; font-size: 12.5px; font-weight: 700; color: #334155; transition: all 0.15s;';
          if (isCellMismatch) {
            style += ' background: #fef2f2; border-color: #ef4444; color: #b91c1c;';
          } else if (isMatchedPrefix) {
            style += ' background: #ecfdf5; border-color: #10b981; color: #047857;';
          } else if (isActiveCell) {
            style += ' background: #dbeafe; border-color: #2563eb; color: #1e40af; box-shadow: 0 0 0 2px rgba(37, 99, 235, 0.25);';
          } else if (inCurCol) {
            style += ' background: #eff6ff; border-color: #93c5fd; color: #1d4ed8;';
          }

          return `<div style="${style}"><span>${ch}</span></div>`;
        })
        .join('');

      return `
        <div style="display: flex; align-items: center; gap: 8px;">
          <span style="font-size: 10.5px; font-family: 'JetBrains Mono', monospace; font-weight: 700; color: #64748b; min-width: 60px;">strs[${rIdx}]:</span>
          <div style="display: flex; gap: 4px;">${cellsHtml}</div>
        </div>
      `;
    })
    .join('');

  container.innerHTML = `
    <div style="display: flex; align-items: center; justify-content: center; width: 100%; height: 100%; padding: 10px 12px; box-sizing: border-box; overflow: auto;">
      <div style="display: flex; flex-direction: column; gap: 6px; width: 100%; max-width: 440px;">
        ${rowsHtml}
      </div>
    </div>
  `;
}
