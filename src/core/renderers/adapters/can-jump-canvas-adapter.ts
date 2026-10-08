import type { CanJumpStep } from './can-jump-step-compiler';

export function renderCanJumpCanvas(container: HTMLElement, step: CanJumpStep): void {
  const arr = step.array;
  const n = arr.length;

  if (n === 0) {
    container.innerHTML =
      '<div style="display:flex;align-items:center;justify-content:center;height:100%;color:#94a3b8;font-size:12px;">输入为空</div>';
    return;
  }

  const curIdx = step.currentIndex;
  const maxReach = step.maxReach;
  const isSuccess = step.action === 'success';
  const isBlocked = step.action === 'blocked';

  const cellsHtml = arr
    .map((val, idx) => {
      const isCurrent = idx === curIdx && !isSuccess && !isBlocked;
      const isCovered = idx <= maxReach;
      const isTarget = idx === n - 1;

      let bg = '#ffffff';
      let borderColor = '#e2e8f0';
      let textColor = '#0f172a';

      if (isCurrent) {
        bg = '#eff6ff';
        borderColor = '#2563eb';
        textColor = '#2563eb';
      } else if (isCovered) {
        bg = isSuccess && isTarget ? '#ecfdf5' : '#f5f3ff';
        borderColor = isSuccess && isTarget ? '#10b981' : '#c084fc';
        textColor = isSuccess && isTarget ? '#059669' : '#7e22ce';
      }

      return `
        <div style="display: flex; flex-direction: column; align-items: center; gap: 4px;">
          <span style="font-size: 9.5px; color: ${isCurrent ? '#2563eb' : '#94a3b8'}; font-weight: 700;">
            ${isCurrent ? '📍 当前' : isTarget ? '🏁 终点' : `[${idx}]`}
          </span>
          <div style="width: 48px; height: 48px; border-radius: 12px; background: ${bg}; border: 2px solid ${borderColor}; display: flex; flex-direction: column; align-items: center; justify-content: center; font-size: 16px; font-weight: 800; color: ${textColor}; font-family: 'JetBrains Mono', monospace; box-shadow: 0 2px 5px rgba(0,0,0,0.04); transition: all 0.15s;">
            <span>${val}</span>
            <span style="font-size: 8.5px; color: #94a3b8; font-weight: 600;">+${val}</span>
          </div>
          <span style="font-size: 9px; color: ${isCovered ? '#7e22ce' : '#cbd5e1'}; font-weight: 700;">
            ${isCovered ? '✓ 覆盖' : '未达'}
          </span>
        </div>
      `;
    })
    .join('');

  const coverPercent = Math.min(100, ((maxReach + 1) / n) * 100);

  container.innerHTML = `
    <div style="width: 100%; height: 100%; display: flex; flex-direction: column; justify-content: center; gap: 8px; padding: 12px; box-sizing: border-box;">
      <!-- 覆盖范围标尺带 -->
      <div style="display: flex; align-items: center; justify-content: space-between; font-size: 11px; font-weight: 700; color: #475569;">
        <span>🌐 当前最远覆盖范围: 下标 0 ~ <strong style="color: #7e22ce; font-family: monospace;">${maxReach}</strong></span>
        <span style="color: ${isSuccess ? '#059669' : isBlocked ? '#dc2626' : '#2563eb'};">${coverPercent.toFixed(0)}% 进度</span>
      </div>
      <div style="background: #f1f5f9; border-radius: 999px; height: 8px; overflow: hidden; border: 1px solid #e2e8f0;">
        <div style="background: linear-gradient(90deg, #3b82f6, #a855f7); width: ${coverPercent}%; height: 100%; transition: width 0.2s;"></div>
      </div>

      <!-- 单元格水平条 -->
      <div style="display: flex; gap: 10px; overflow-x: auto; justify-content: center; padding: 6px 0;">
        ${cellsHtml}
      </div>
    </div>
  `;
}
