/**
 * 实现 strStr() — 画布适配器
 * 负责主串与模式串对齐滑动双轨及 KMP next 前缀表渲染
 */

import { SSStep } from './implement-str-str-step-compiler';

export function renderStrStrCanvas(container: HTMLElement, step: SSStep): void {
  const { haystack, needle, next, i, j, phase } = step;

  const baseCell =
    'width: 28px; height: 32px; border-radius: 6px; background: #f1f5f9; border: 1.5px solid #cbd5e1; font-family: \'JetBrains Mono\', monospace; font-size: 12px; font-weight: 700; color: #334155; display: inline-flex; flex-direction: column; align-items: center; justify-content: center; position: relative; transition: all 0.15s;';
  const styleForCell = (border: string, bg: string, color: string): string =>
    `${baseCell} border-color: ${border}; background: ${bg}; color: ${color};`;

  const isDone = phase === 'found' || phase === 'not-found';

  const haystackCells = haystack
    .split('')
    .map((ch, idx) => {
      const isI = idx === i && !isDone;
      const isMatchedPart = phase === 'found' && idx >= step.matchedIndex && idx < step.matchedIndex + needle.length;

      let style = baseCell;
      if (isMatchedPart) style = styleForCell('#10b981', '#ecfdf5', '#047857');
      else if (isI) style = styleForCell('#2563eb', '#eff6ff', '#1d4ed8');

      return `
        <div style="${style}">
          <span>${ch}</span>
          <span style="font-size: 8px; color: #94a3b8; position: absolute; bottom: 1px;">${idx}</span>
        </div>
      `;
    })
    .join('');

  const offset = Math.max(0, i - j);
  let offsetHtml = '';
  for (let k = 0; k < offset; k++) {
    offsetHtml += '<div style="width: 28px; height: 32px; flex-shrink: 0;"></div>';
  }

  const needleCells = needle
    .split('')
    .map((ch, idx) => {
      const isJ = idx === j && !isDone;
      const isMatch = (phase === 'match' && idx <= j) || phase === 'found';
      const isMismatch = phase === 'fallback' && idx === j;

      let style = baseCell;
      if (isMatch) style = styleForCell('#10b981', '#ecfdf5', '#047857');
      else if (isMismatch) style = styleForCell('#ef4444', '#fef2f2', '#b91c1c');
      else if (isJ) style = styleForCell('#9333ea', '#faf5ff', '#7e22ce');

      return `
        <div style="${style}">
          <span>${ch}</span>
          <span style="font-size: 8px; color: #94a3b8; position: absolute; bottom: 1px;">${idx}</span>
        </div>
      `;
    })
    .join('');

  const nextCells = next
    .map(
      (val, idx) => `
        <div style="min-width: 34px; padding: 2px 4px; border-radius: 6px; background: #ffffff; border: 1px solid ${
          idx === j && !isDone ? '#9333ea' : '#e2e8f0'
        }; display: flex; flex-direction: column; align-items: center; gap: 1px;">
          <span style="font-size: 9px; color: #64748b;">[${idx}] ${needle[idx]}</span>
          <span style="font-size: 13px; font-weight: 800; color: #2563eb;">${val}</span>
        </div>
      `
    )
    .join('');

  container.innerHTML = `
    <div style="display: flex; flex-direction: column; align-items: center; justify-content: space-between; gap: 6px; width: 100%; height: 100%; padding: 8px 10px; box-sizing: border-box; overflow-y: auto;">
      <div style="display: flex; flex-direction: column; gap: 4px; width: 100%; background: #ffffff; border: 1px solid #e2e8f0; border-radius: 8px; padding: 6px 10px;">
        <div style="display: flex; align-items: center; gap: 6px;">
          <span style="font-size: 10px; font-weight: 700; color: #64748b; min-width: 62px; text-transform: uppercase;">haystack:</span>
          <div style="display: flex; gap: 4px; flex-wrap: wrap;">${haystackCells}</div>
        </div>
        <div style="display: flex; align-items: center; gap: 6px;">
          <span style="font-size: 10px; font-weight: 700; color: #64748b; min-width: 62px; text-transform: uppercase;">needle:</span>
          <div style="display: flex; gap: 4px; flex-wrap: wrap;">${offsetHtml}${needleCells}</div>
        </div>
      </div>
      <div style="display: flex; flex-direction: column; align-items: flex-start; gap: 4px; width: 100%;">
        <span style="font-size: 11px; font-weight: 700; color: #64748b;">模式串前缀表 next[0..m-1]</span>
        <div style="display: flex; gap: 4px; flex-wrap: wrap; background: #ffffff; border: 1px solid #e2e8f0; border-radius: 8px; padding: 4px 8px;">${nextCells}</div>
      </div>
    </div>
  `;
}
