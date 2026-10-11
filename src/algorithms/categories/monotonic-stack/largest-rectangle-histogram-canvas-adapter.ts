import { type LRHStep } from './largest-rectangle-histogram-step-compiler';

export function renderLargestRectangleHistogramCanvas(
  container: HTMLElement,
  step: LRHStep
): void {
  const paddedHeights = step.paddedHeights;
  const stack = step.stack;
  const n = paddedHeights.length;

  if (n === 0) {
    container.innerHTML = '<div style="display:flex;align-items:center;justify-content:center;height:100%;color:#94a3b8;font-size:12px;">输入为空</div>';
    return;
  }

  const curIdx = step.currentIndex;
  const isDone = step.action === 'done';
  const isPopCalc = step.action === 'pop_calc';
  const maxH = Math.max(...paddedHeights, 1);

  const colsHtml = paddedHeights
    .map((h, idx) => {
      const isSentinel = idx === 0 || idx === n - 1;
      const isCurrent = idx === curIdx && !isDone;
      const isMid = idx === step.midIdx;
      const isLeft = idx === step.leftIdx;
      const isRight = idx === step.rightIdx;
      const inStack = stack.includes(idx);

      const inCurrentRect =
        isPopCalc && step.leftIdx !== null && step.rightIdx !== null && idx > step.leftIdx && idx < step.rightIdx;

      const colHeightPx = isSentinel ? 6 : Math.max(10, Math.round((h / (maxH + 1)) * 90));

      let barBg = '#475569';
      let border = '#334155';

      if (isSentinel) {
        barBg = '#cbd5e1';
        border = '#94a3b8';
      } else if (isMid) {
        barBg = '#ef4444';
        border = '#dc2626';
      } else if (inCurrentRect) {
        barBg = '#f87171';
        border = '#ef4444';
      } else if (isLeft || isRight) {
        barBg = '#3b82f6';
        border = '#2563eb';
      } else if (isCurrent) {
        barBg = '#f59e0b';
        border = '#d97706';
      } else if (inStack) {
        barBg = '#fbbf24';
        border = '#d97706';
      }

      return `
        <div style="display: flex; flex-direction: column; align-items: center; gap: 2px; flex: 1; min-width: 24px; max-width: 46px;">
          <span style="font-size: 8.5px; font-weight: 700; color: ${isMid ? '#ef4444' : inCurrentRect ? '#f87171' : '#64748b'}; font-family: monospace;">
            ${isMid ? `h=${h}` : isSentinel ? '哨兵' : `[${idx}]`}
          </span>
          <div style="width: 100%; height: 95px; display: flex; flex-direction: column; justify-content: flex-end; align-items: center;">
            <div style="width: 22px; height: ${colHeightPx}px; background: ${barBg}; border: 1.5px solid ${border}; border-radius: 4px 4px 0 0; display: flex; align-items: center; justify-content: center; color: ${isSentinel ? '#475569' : '#ffffff'}; font-size: 9px; font-weight: 800; box-shadow: 0 1px 2px rgba(0,0,0,0.05);">
              ${h}
            </div>
          </div>
          <span style="font-size: 8.5px; color: ${isMid ? '#ef4444' : isLeft ? '#2563eb' : isRight ? '#2563eb' : isCurrent ? '#d97706' : '#94a3b8'}; font-weight: 700;">
            ${isMid ? '基准' : isLeft ? '左矮' : isRight ? '右矮' : isCurrent ? '当前' : isSentinel ? '0' : `h:${h}`}
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
          <span style="color: #ef4444;">h=${paddedHeights[idx]}</span>
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
        <span style="font-size: 10.5px; font-weight: 700; color: #475569; white-space: nowrap;">🥞 单调递增栈 (栈底 &rarr; 栈顶):</span>
        <div style="display: flex; gap: 4px; overflow-x: auto; flex: 1; align-items: center; min-height: 28px;">
          ${stack.length > 0 ? stackItemsHtml : '<span style="font-size: 10.5px; color: #94a3b8;">栈空</span>'}
        </div>
      </div>
    </div>
  `;
}
