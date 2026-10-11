import { MSStep } from './merge-sort-step-compiler';

const CELL_BASE =
  'width: 38px; height: 38px; border-radius: 8px; display: flex; flex-direction: column; align-items: center; justify-content: center; font-family: \'JetBrains Mono\', monospace; font-size: 13px; font-weight: 800; transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1); box-sizing: border-box;';

function msCell(val: string, idx: string, bg: string, border: string, color: string): string {
  return `
    <div style="${CELL_BASE} background: ${bg}; border: 1.5px solid ${border}; color: ${color};">
      <span>${val}</span>
      <span style="font-size: 8.5px; font-weight: 600; color: #94a3b8;">${idx}</span>
    </div>
  `;
}

export function renderMergeSortCanvas(container: HTMLElement, step: MSStep): void {
  const { array, temp, left, mid, right, p1, p2, phase } = step;

  const mainHtml = array
    .map((val, idx) => {
      const inLeftSeg = left >= 0 && mid >= 0 && idx >= left && idx <= mid;
      const inRightSeg = mid >= 0 && right >= 0 && idx > mid && idx <= right;
      const isP1 = idx === p1;
      const isP2 = idx === p2;
      const isCopiedBack = phase === 'copy-back' && idx >= left && idx <= right;

      if (isCopiedBack) return msCell(String(val), `${idx}`, '#faf5ff', '#a855f7', '#7e22ce');
      if (isP1) return msCell(String(val), `${idx}`, '#eff6ff', '#3b82f6', '#1d4ed8');
      if (isP2) return msCell(String(val), `${idx}`, '#faf5ff', '#a855f7', '#7e22ce');
      if (inLeftSeg) return msCell(String(val), `${idx}`, '#eff6ff', '#93c5fd', '#1e40af');
      if (inRightSeg) return msCell(String(val), `${idx}`, '#faf5ff', '#d8b4fe', '#6b21a8');
      return msCell(String(val), `${idx}`, '#ffffff', '#cbd5e1', '#0f172a');
    })
    .join('');

  const tempHtml = temp
    .map((val, idx) =>
      val !== null
        ? msCell(String(val), `${idx}`, '#f0fdf4', '#22c55e', '#15803d')
        : msCell('—', `${idx}`, '#ffffff', '#cbd5e1', '#cbd5e1'),
    )
    .join('');

  container.innerHTML = `
    <div style="width: 100%; height: 100%; display: flex; flex-direction: column; justify-content: center; gap: 14px; padding: 16px 12px; box-sizing: border-box; overflow-y: auto;">
      <div style="display: flex; flex-direction: column; align-items: center; gap: 4px;">
        <div style="font-size: 10px; font-weight: 700; color: #64748b;">原数组 arr (分治区间 [L..R]):</div>
        <div style="display: flex; align-items: center; justify-content: center; gap: 6px; width: 100%; flex-wrap: wrap;">${mainHtml}</div>
      </div>
      <div style="display: flex; flex-direction: column; align-items: center; gap: 4px;">
        <div style="font-size: 10px; font-weight: 700; color: #64748b;">辅助 temp 归并缓冲区:</div>
        <div style="display: flex; align-items: center; justify-content: center; gap: 6px; width: 100%; flex-wrap: wrap;">${tempHtml}</div>
      </div>
    </div>
  `;
}
