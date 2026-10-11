import { CSStep } from './counting-sort-step-compiler';

const CELL_BASE =
  'min-width: 32px; height: 32px; padding: 0 4px; border-radius: 6px; display: flex; flex-direction: column; align-items: center; justify-content: center; font-family: \'JetBrains Mono\', monospace; font-size: 11.5px; font-weight: 800; transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1); box-sizing: border-box;';

function cellBox(val: string, sub: string, bg: string, border: string, color: string, extraStyle = ''): string {
  return `
    <div style="${CELL_BASE} background: ${bg}; border: 1.5px solid ${border}; color: ${color}; ${extraStyle}">
      <span>${val}</span>
      <span style="font-size: 8.5px; font-weight: 600; color: #94a3b8;">${sub}</span>
    </div>
  `;
}

export function renderCountingSortCanvas(container: HTMLElement, step: CSStep): void {
  const { array, count, output, minVal, srcIdx, countIdx, outIdx, phase } = step;

  const srcHtml = array
    .map((val, idx) => {
      const isActive = idx === srcIdx && phase !== 'done';
      return cellBox(String(val), `[${idx}]`, isActive ? '#eff6ff' : '#ffffff', isActive ? '#3b82f6' : '#cbd5e1', '#0f172a');
    })
    .join('');

  const countHtml = count
    .map((freq, idx) => {
      const isActive = idx === countIdx && phase !== 'done';
      return cellBox(String(freq), `${idx + minVal}`, isActive ? '#fef9c3' : '#ffffff', isActive ? '#eab308' : '#cbd5e1', '#0f172a');
    })
    .join('');

  const outHtml = output
    .map((val, idx) => {
      const isFilled = val !== null;
      const isCurrentTarget = idx === outIdx && phase === 'build-out';
      return cellBox(
        val !== null ? String(val) : '—',
        `[${idx}]`,
        isFilled ? '#f0fdf4' : '#ffffff',
        isFilled ? '#22c55e' : '#cbd5e1',
        '#0f172a',
        isCurrentTarget ? 'box-shadow: 0 0 0 2px rgba(16,185,129,0.5); transform: scale(1.08);' : '',
      );
    })
    .join('');

  container.innerHTML = `
    <div style="width: 100%; height: 100%; display: flex; flex-direction: column; justify-content: center; gap: 14px; padding: 16px 12px; box-sizing: border-box; overflow-y: auto;">
      <div style="display: flex; flex-direction: column; align-items: center; gap: 4px;">
        <div style="font-size: 10px; font-weight: 700; color: #64748b;">原输入数组 arr:</div>
        <div style="display: flex; align-items: center; justify-content: center; gap: 6px; width: 100%; flex-wrap: wrap;">${srcHtml}</div>
      </div>
      <div style="display: flex; flex-direction: column; align-items: center; gap: 4px;">
        <div style="font-size: 10px; font-weight: 700; color: #64748b;">计数/前缀和数组 count:</div>
        <div style="display: flex; align-items: center; justify-content: center; gap: 6px; width: 100%; flex-wrap: wrap;">${countHtml}</div>
      </div>
      <div style="display: flex; flex-direction: column; align-items: center; gap: 4px;">
        <div style="font-size: 10px; font-weight: 700; color: #64748b;">排序输出数组 output:</div>
        <div style="display: flex; align-items: center; justify-content: center; gap: 6px; width: 100%; flex-wrap: wrap;">${outHtml}</div>
      </div>
    </div>
  `;
}
