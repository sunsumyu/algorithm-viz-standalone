/**
 * 快乐数 — 画布渲染适配器
 */

import { HappyNumberStep } from './happy-number-step-compiler';

export function renderHappyNumberCanvas(container: HTMLElement, step: HappyNumberStep): void {
  const { n, formula, seen, cycleNode, status } = step;

  // 1. 渲染数字拆解 (当前数字 + 平方和公式)
  const formulaText = formula || '等待计算...';

  // 2. 渲染 HashSet 轨道
  const setHtml =
    seen.length === 0
      ? '<span style="color: #94a3b8; font-size: 11px;">(HashSet 当前为空)</span>'
      : seen
          .map((num) => {
            const isCycle = cycleNode === num;
            const isOne = num === 1 || (status === 'happy' && num === seen[seen.length - 1]);
            let bg = '#ffffff';
            let border = '#cbd5e1';
            let color = '#334155';
            if (isCycle) {
              border = '#ef4444';
              bg = '#fef2f2';
              color = '#b91c1c';
            } else if (isOne) {
              border = '#10b981';
              bg = '#ecfdf5';
              color = '#047857';
            }
            return `
              <div style="padding: 3px 8px; border-radius: 6px; background: ${bg}; border: 1px solid ${border}; font-family: 'JetBrains Mono', monospace; font-size: 11.5px; font-weight: 700; color: ${color}; transition: all 0.15s; box-shadow: 0 1px 2px rgba(0, 0, 0, 0.03);">
                <span>${num}</span>
              </div>
            `;
          })
          .join('');

  container.innerHTML = `
    <div style="display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 10px; width: 100%; height: 100%; padding: 10px 12px; box-sizing: border-box;">
      <div style="display: flex; align-items: center; gap: 12px; justify-content: center; width: 100%;">
        <span style="font-size: 20px; font-weight: 900; font-family: 'JetBrains Mono', monospace; color: #2563eb; padding: 2px 10px; background: #eff6ff; border: 1.5px solid #bfdbfe; border-radius: 8px; box-shadow: 0 1px 2px rgba(37, 99, 235, 0.1);">${n}</span>
        <span style="font-size: 14px; font-weight: 800; font-family: 'JetBrains Mono', monospace; color: #1e293b;">${formulaText}</span>
      </div>
      <div style="display: flex; align-items: center; gap: 6px; flex-wrap: wrap; width: 100%; min-height: 28px; justify-content: center;">
        <span style="font-size: 11px; font-weight: 700; color: #64748b;">seen 集合:</span>
        ${setHtml}
      </div>
    </div>
  `;
}
