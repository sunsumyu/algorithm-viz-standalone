import type { MSSStep } from './max-subarray-step-compiler';

export function renderMaxSubarrayCanvas(container: HTMLElement, step: MSSStep): void {
  const arr = step.array;
  const n = arr.length;

  if (n === 0) {
    container.innerHTML =
      '<div style="display:flex;align-items:center;justify-content:center;height:100%;color:#94a3b8;font-size:12px;">输入为空</div>';
    return;
  }

  const isDone = step.phase === 'done';
  const curIdx = step.currentIndex;
  const curStart = step.currentStart;
  const maxStart = step.maxStart;
  const maxEnd = step.maxEnd;

  const maxAbs = Math.max(...arr.map((v) => Math.abs(v)), 1);

  const barsHtml = arr
    .map((val, idx) => {
      const isCurrentCursor = !isDone && idx === curIdx;
      const isInCurrentWindow = !isDone && idx >= curStart && idx <= curIdx;
      const isInBestWindow = isDone || (idx >= maxStart && idx <= maxEnd);

      const barHeight = Math.max(12, (Math.abs(val) / maxAbs) * 60);

      let barBg = '#94a3b8';
      let borderColor = '#cbd5e1';
      let textColor = '#0f172a';

      if (isCurrentCursor) {
        barBg = '#3b82f6';
        borderColor = '#1d4ed8';
        textColor = '#1d4ed8';
      } else if (isInBestWindow && isDone) {
        barBg = '#10b981';
        borderColor = '#059669';
        textColor = '#059669';
      } else if (isInCurrentWindow) {
        barBg = '#60a5fa';
        borderColor = '#3b82f6';
        textColor = '#2563eb';
      } else if (val < 0) {
        barBg = '#f87171';
        borderColor = '#ef4444';
        textColor = '#dc2626';
      }

      return `
        <div style="display: flex; flex-direction: column; align-items: center; gap: 4px;">
          <span style="font-size: 10px; font-weight: 800; color: ${textColor}; font-family: 'JetBrains Mono', monospace;">
            ${val}
          </span>
          <div style="width: 28px; height: 70px; display: flex; align-items: ${val >= 0 ? 'flex-end' : 'flex-start'}; justify-content: center; background: #f1f5f9; border-radius: 6px; padding: 2px;">
            <div style="width: 100%; height: ${barHeight}px; background: ${barBg}; border: 1px solid ${borderColor}; border-radius: 4px; transition: all 0.15s;"></div>
          </div>
          <span style="font-size: 8.5px; color: ${isCurrentCursor ? '#2563eb' : '#94a3b8'}; font-weight: 700; font-family: monospace;">
            [${idx}]
          </span>
        </div>
      `;
    })
    .join('');

  container.innerHTML = `
    <div style="width: 100%; height: 100%; display: flex; flex-direction: column; justify-content: center; gap: 8px; padding: 12px; box-sizing: border-box;">
      <div style="display: flex; gap: 6px; overflow-x: auto; justify-content: center; padding-bottom: 4px;">
        ${barsHtml}
      </div>
      <div style="display: flex; justify-content: space-between; font-size: 10.5px; color: #64748b; border-top: 1px dashed #e2e8f0; padding-top: 4px;">
        <span>当前扫描区间: <strong style="color:#2563eb; font-family:monospace;">[${curStart}..${curIdx >= 0 ? curIdx : 0}]</strong></span>
        <span>历史最大区间: <strong style="color:#059669; font-family:monospace;">[${maxStart}..${maxEnd}]</strong></span>
      </div>
    </div>
  `;
}
