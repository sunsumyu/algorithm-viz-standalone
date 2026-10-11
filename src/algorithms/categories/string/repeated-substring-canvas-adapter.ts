/**
 * 重复的子字符串 — 画布适配器
 * 负责字符 + next 前缀表网格与周期拆解平铺渲染
 */

import { RPSStep } from './repeated-substring-step-compiler';

export function renderRepeatedSubstringCanvas(container: HTMLElement, step: RPSStep): void {
  const { s, next, n, patternLen, tiles, phase } = step;

  const trackCells = s
    .split('')
    .map((ch, idx) => {
      const inPattern =
        patternLen > 0 && idx < patternLen && (phase === 'check-period' || phase === 'found');
      const isLastNode = idx === n - 1;

      let style =
        'width: 38px; height: 44px; border-radius: 8px; background: #ffffff; border: 2px solid #cbd5e1; display: flex; flex-direction: column; align-items: center; justify-content: center; position: relative; transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);';
      if (inPattern) style += ' border-color: #2563eb; background: #eff6ff;';
      if (isLastNode) style += ' border-color: #9333ea; background: #faf5ff; box-shadow: 0 0 0 2px rgba(147, 51, 234, 0.2);';

      const nextVal = next[idx] !== undefined ? next[idx] : '-';

      return `
        <div style="${style}">
          <span style="font-size: 15px; font-weight: 800; color: #0f172a; font-family: 'JetBrains Mono', monospace;">${ch}</span>
          <span style="font-size: 9px; font-weight: 700; color: #94a3b8; position: absolute; bottom: 2px;">next:${nextVal}</span>
        </div>
      `;
    })
    .join('');

  const tileHtml =
    tiles.length === 0
      ? '<span style="color:#94a3b8; font-size:11px; font-style:italic;">(等待周期整除分析...)</span>'
      : tiles
          .map(
            (t, tIdx) => `
        <div style="padding: 3px 8px; border-radius: 6px; background: #eff6ff; border: 1px solid #bfdbfe; color: #1e40af; font-family: 'JetBrains Mono', monospace; font-size: 11px; font-weight: 700;">
          <span>[${tIdx + 1}] "${t}"</span>
        </div>
      `
          )
          .join('');

  container.innerHTML = `
    <div style="display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 12px; width: 100%; height: 100%; padding: 10px 12px; box-sizing: border-box; overflow: auto;">
      <div style="display: flex; align-items: center; gap: 4px; flex-wrap: wrap; justify-content: center;">${trackCells}</div>
      <div style="display: flex; align-items: center; gap: 6px; flex-wrap: wrap; justify-content: center;">${tileHtml}</div>
    </div>
  `;
}
