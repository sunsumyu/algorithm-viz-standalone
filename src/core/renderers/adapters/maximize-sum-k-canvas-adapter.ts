import type { MaxSumKStep } from './maximize-sum-k-step-compiler';

export function renderMaximizeSumKCanvas(container: HTMLElement, step: MaxSumKStep): void {
  const arr = step.array;
  const n = arr.length;

  if (n === 0) {
    container.innerHTML = '<div style="display:flex;align-items:center;justify-content:center;height:100%;color:#94a3b8;font-size:12px;">输入为空</div>';
    return;
  }

  const curIdx = step.currentIndex;
  const isDone = step.action === 'done';

  const cellsHtml = arr
    .map((val, idx) => {
      const isCurrent = idx === curIdx && !isDone;
      const isFlipped = step.flippedIndices.includes(idx);
      const isNegative = val < 0;

      let bg = '#ffffff';
      let borderColor = '#e2e8f0';
      let textColor = '#0f172a';

      if (isCurrent) {
        bg = '#fff1f2';
        borderColor = '#e11d48';
        textColor = '#e11d48';
      } else if (isFlipped) {
        bg = '#ecfdf5';
        borderColor = '#10b981';
        textColor = '#059669';
      } else if (isNegative) {
        bg = '#fef2f2';
        borderColor = '#fca5a5';
        textColor = '#dc2626';
      }

      return `
        <div style="display: flex; flex-direction: column; align-items: center; gap: 4px;">
          <span style="font-size: 9.5px; color: ${isCurrent ? '#e11d48' : '#94a3b8'}; font-weight: 700;">
            ${isCurrent ? '📍 当前' : `|${Math.abs(val)}|`}
          </span>
          <div style="width: 48px; height: 48px; border-radius: 12px; background: ${bg}; border: 2px solid ${borderColor}; display: flex; flex-direction: column; align-items: center; justify-content: center; font-size: 16px; font-weight: 800; color: ${textColor}; font-family: 'JetBrains Mono', monospace; box-shadow: 0 2px 5px rgba(0,0,0,0.04); transition: all 0.15s;">
            <span>${val > 0 ? `+${val}` : val}</span>
          </div>
          <span style="font-size: 9px; color: ${isFlipped ? '#059669' : isNegative ? '#dc2626' : '#64748b'}; font-weight: 700;">
            ${isFlipped ? '✓ 翻转' : isNegative ? '⚠️ 负数' : '正数'}
          </span>
        </div>
      `;
    })
    .join('');

  container.innerHTML = `
    <div style="width: 100%; height: 100%; display: flex; flex-direction: column; justify-content: center; gap: 8px; padding: 12px; box-sizing: border-box;">
      <div style="display: flex; align-items: center; justify-content: space-between; font-size: 11px; font-weight: 700; color: #475569;">
        <span>按绝对值降序排列: <code style="color:#e11d48;">|x| desc</code></span>
        <span>当前数组和: <strong style="color: #059669; font-family: monospace; font-size: 12.5px;">${step.currentSum}</strong></span>
      </div>

      <div style="display: flex; gap: 10px; overflow-x: auto; justify-content: center; padding: 6px 0;">
        ${cellsHtml}
      </div>
    </div>
  `;
}
