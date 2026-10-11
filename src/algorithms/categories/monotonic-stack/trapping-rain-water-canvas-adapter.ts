import { type TRWStep } from './trapping-rain-water-step-compiler';

export function renderTrappingRainWaterCanvas(container: HTMLElement, step: TRWStep): void {
  const heights = step.heights;
  const stack = step.stack;
  const waterPerCol = step.waterPerColumn;
  const n = heights.length;

  if (n === 0) {
    container.innerHTML = '<div style="display:flex;align-items:center;justify-content:center;height:100%;color:#94a3b8;font-size:12px;">输入为空</div>';
    return;
  }

  const curIdx = step.currentIndex;
  const isDone = step.action === 'done';
  const maxH = Math.max(...heights, 1);

  const colsHtml = heights
    .map((h, idx) => {
      const isCurrent = idx === curIdx && !isDone;
      const isLeft = idx === step.leftIdx;
      const isMid = idx === step.midIdx;
      const inStack = stack.includes(idx);
      const waterH = waterPerCol[idx] ?? 0;

      const colHeightPx = Math.max(8, Math.round((h / (maxH + 1)) * 90));
      const waterHeightPx = Math.round((waterH / (maxH + 1)) * 90);

      let barBg = '#475569';
      let border = '#334155';

      if (isMid) {
        barBg = '#ef4444';
        border = '#dc2626';
      } else if (isLeft) {
        barBg = '#3b82f6';
        border = '#2563eb';
      } else if (isCurrent) {
        barBg = '#0284c7';
        border = '#0369a1';
      } else if (inStack) {
        barBg = '#fbbf24';
        border = '#d97706';
      }

      return `
        <div style="display: flex; flex-direction: column; align-items: center; gap: 2px; flex: 1; min-width: 22px; max-width: 44px;">
          <span style="font-size: 8.5px; font-weight: 700; color: ${waterH > 0 ? '#0284c7' : '#64748b'}; font-family: monospace;">
            ${waterH > 0 ? `+${waterH}` : ''}
          </span>
          <div style="width: 100%; height: 95px; display: flex; flex-direction: column; justify-content: flex-end; align-items: center;">
            ${waterHeightPx > 0 ? `<div style="width: 18px; height: ${waterHeightPx}px; background: rgba(56, 189, 248, 0.75); border: 1px solid #38bdf8; border-radius: 4px 4px 0 0;"></div>` : ''}
            <div style="width: 18px; height: ${colHeightPx}px; background: ${barBg}; border: 1px solid ${border}; border-radius: ${waterHeightPx > 0 ? '0' : '4px 4px 0 0'}; display: flex; align-items: center; justify-content: center; color: #ffffff; font-size: 8.5px; font-weight: 800;">
              ${h}
            </div>
          </div>
          <span style="font-size: 8.5px; color: ${isMid ? '#ef4444' : isLeft ? '#3b82f6' : isCurrent ? '#0284c7' : '#94a3b8'}; font-weight: 700;">
            ${isMid ? '底' : isLeft ? '左' : isCurrent ? '右' : `[${idx}]`}
          </span>
        </div>
      `;
    })
    .join('');

  const stackItemsHtml = stack
    .map((idx) => {
      return `
        <div style="padding: 2px 8px; border-radius: 6px; background: #fffbeb; border: 1.5px solid #fde68a; color: #b45309; font-size: 11px; font-weight: 800; font-family: 'JetBrains Mono', monospace; display: flex; align-items: center; gap: 4px;">
          <span>[${idx}]</span>
          <span style="color: #0284c7;">h=${heights[idx]}</span>
        </div>
      `;
    })
    .join('');

  container.innerHTML = `
    <div style="width: 100%; height: 100%; display: flex; flex-direction: column; justify-content: center; gap: 8px; padding: 12px; box-sizing: border-box;">
      <div style="display: flex; justify-content: space-around; align-items: flex-end; padding: 2px 0; border-bottom: 1px solid #e2e8f0;">
        ${colsHtml}
      </div>

      <div style="display: flex; align-items: center; gap: 8px; padding-top: 2px;">
        <span style="font-size: 10.5px; font-weight: 700; color: #475569; white-space: nowrap;">🥞 单调栈 (栈底 &rarr; 栈顶):</span>
        <div style="display: flex; gap: 4px; overflow-x: auto; flex: 1; align-items: center; min-height: 28px;">
          ${stack.length > 0 ? stackItemsHtml : '<span style="font-size: 10.5px; color: #94a3b8;">栈空</span>'}
        </div>
      </div>
    </div>
  `;
}
