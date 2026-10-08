import type { JumpStep } from './jump-game-step-compiler';

export function renderJumpGameCanvas(container: HTMLElement, step: JumpStep): void {
  const arr = step.array;
  const n = arr.length;

  if (n === 0) {
    container.innerHTML =
      '<div style="display:flex;align-items:center;justify-content:center;height:100%;color:#94a3b8;font-size:12px;">输入为空</div>';
    return;
  }

  const curIdx = step.currentIndex;
  const curBound = step.currentBoundary;
  const nextBound = step.nextBoundary;
  const isDone = step.action === 'done';

  const cellsHtml = arr
    .map((val, idx) => {
      const isCurrent = idx === curIdx && !isDone;
      const isAtCurBound = idx === curBound;
      const isWithinCurBound = idx <= curBound;
      const isTarget = idx === n - 1;

      let bg = '#ffffff';
      let borderColor = '#e2e8f0';
      let textColor = '#0f172a';
      let shadow = '0 2px 5px rgba(0,0,0,0.04)';

      if (isCurrent) {
        bg = 'linear-gradient(135deg, #3b82f6, #2563eb)';
        borderColor = '#1d4ed8';
        textColor = '#ffffff';
        shadow = '0 4px 12px rgba(59,130,246,0.3)';
      } else if (isAtCurBound) {
        bg = 'linear-gradient(135deg, #a78bfa, #7c3aed)';
        borderColor = '#6d28d9';
        textColor = '#ffffff';
        shadow = '0 4px 12px rgba(124,58,237,0.3)';
      } else if (isWithinCurBound) {
        bg = '#f5f3ff';
        borderColor = '#c4b5fd';
        textColor = '#5b21b6';
      }

      if (isDone && isTarget) {
        bg = 'linear-gradient(135deg, #10b981, #059669)';
        borderColor = '#047857';
        textColor = '#ffffff';
        shadow = '0 4px 12px rgba(16,185,129,0.3)';
      }

      return `
        <div style="display: flex; flex-direction: column; align-items: center; gap: 6px;">
          <span style="font-size: 10px; color: ${isCurrent ? '#2563eb' : isAtCurBound ? '#7c3aed' : '#94a3b8'}; font-weight: 700;">
            ${isCurrent ? '📍 当前' : isAtCurBound ? '🚪 边界' : isTarget ? '🏁 终点' : `[${idx}]`}
          </span>
          <div style="width: 56px; height: 56px; border-radius: 12px; background: ${bg}; border: 2px solid ${borderColor}; display: flex; flex-direction: column; align-items: center; justify-content: center; font-size: 18px; font-weight: 800; color: ${textColor}; font-family: 'JetBrains Mono', monospace; box-shadow: ${shadow}; transition: all 0.2s;">
            <span>${val}</span>
            <span style="font-size: 9px; color: ${isCurrent || isAtCurBound || (isDone && isTarget) ? 'rgba(255,255,255,0.8)' : '#94a3b8'}; font-weight: 600;">+${val}</span>
          </div>
          <span style="font-size: 10px; color: ${isWithinCurBound ? '#7c3aed' : '#cbd5e1'}; font-weight: 700;">
            ${isWithinCurBound ? '✓ 可达' : '✗ 未及'}
          </span>
        </div>
      `;
    })
    .join('');

  container.innerHTML = `
    <div style="width: 100%; height: 100%; display: flex; flex-direction: column; gap: 12px; padding: 16px; box-sizing: border-box;">
      <!-- 边界双指示条 -->
      <div style="display: flex; align-items: center; justify-content: space-between; padding: 10px 14px; background: linear-gradient(135deg, #f8fafc, #f1f5f9); border-radius: 10px; border: 1px solid #e2e8f0; font-size: 12px; font-weight: 700; color: #475569;">
        <span style="display: flex; align-items: center; gap: 6px;">
          <span style="width: 8px; height: 8px; border-radius: 50%; background: #7c3aed;"></span>
          🚪 当前步边界: 下标 <strong style="color: #7c3aed; font-family: monospace; font-size: 13px;">[${curBound}]</strong>
        </span>
        <span style="display: flex; align-items: center; gap: 6px;">
          <span style="width: 8px; height: 8px; border-radius: 50%; background: #059669;"></span>
          🌐 下一步最远: 下标 <strong style="color: #059669; font-family: monospace; font-size: 13px;">[${nextBound}]</strong>
        </span>
      </div>

      <!-- 单元格水平条 -->
      <div style="flex: 1; display: flex; align-items: center; justify-content: center; background: #fafafa; border-radius: 10px; border: 1px solid #e2e8f0; padding: 16px;">
        <div style="display: flex; gap: 12px; overflow-x: auto; padding: 8px 0;">
          ${cellsHtml}
        </div>
      </div>
    </div>
  `;
}
