/**
 * 数组理论基础 — 画布适配器
 * 负责物理内存沙盘（十六进制地址 + 单元格状态）渲染
 */

import { ATStep } from './array-theory-step-compiler';

const CELL_BASE =
  'min-width: 42px; height: 44px; padding: 2px 4px; border-radius: 8px; display: flex; flex-direction: column; align-items: center; justify-content: center; font-family: \'JetBrains Mono\', monospace; transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1); box-sizing: border-box;';

export function renderArrayTheoryCanvas(container: HTMLElement, step: ATStep): void {
  const { array, index, status } = step;

  const cellsHtml = array
    .map((num, idx) => {
      const hexAddr = `0x${(0x1000 + idx * 4).toString(16).toUpperCase()}`;
      const isActive = index === idx && status !== 'done';
      const isShifting = status.includes('shift') && index === idx;

      let bg = '#ffffff';
      let border = '#cbd5e1';
      let color = '#0f172a';
      let transform = 'none';
      if (isShifting) {
        bg = '#fef3c7';
        border = '#f59e0b';
        color = '#b45309';
        transform = 'translateY(-3px)';
      } else if (isActive) {
        bg = '#eff6ff';
        border = '#3b82f6';
        color = '#1d4ed8';
      }

      return `
        <div style="display: flex; flex-direction: column; align-items: center; gap: 3px;">
          <span style="font-size: 8.5px; font-family: monospace; color: #2563eb; font-weight: 700;">${hexAddr}</span>
          <div style="${CELL_BASE} background: ${bg}; border: 1.5px solid ${border}; color: ${color}; transform: ${transform};">
            <span style="font-size: 14px; font-weight: 800;">${num !== null ? num : '—'}</span>
            <span style="font-size: 9px; color: #94a3b8;">[${idx}]</span>
          </div>
        </div>
      `;
    })
    .join('');

  container.innerHTML = `
    <div style="width: 100%; height: 100%; display: flex; align-items: center; justify-content: center; gap: 8px; padding: 14px; box-sizing: border-box; flex-wrap: wrap;">
      ${cellsHtml}
    </div>
  `;
}
