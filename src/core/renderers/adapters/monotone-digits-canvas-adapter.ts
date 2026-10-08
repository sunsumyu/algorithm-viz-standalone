import type { MonotoneStep } from './monotone-digits-step-compiler';

/** 主视觉：数字位数沙盘 */
export function renderMonotoneDigitsCanvas(container: HTMLElement, step: MonotoneStep): void {
  const digits = step.digits;
  const n = digits.length;

  if (n === 0) {
    container.innerHTML = '<div style="display:flex;align-items:center;justify-content:center;height:100%;color:#94a3b8;font-size:12px;">输入为空</div>';
    return;
  }

  const curIdx = step.checkIndex;
  const isDone = step.action === 'done';

  const digitsHtml = digits
    .map((d, idx) => {
      const isComparing = curIdx > 0 && (idx === curIdx || idx === curIdx - 1) && !isDone;
      const isFilled9 = idx >= step.flag && (step.action === 'fill_9' || isDone);

      let bg = '#ffffff';
      let borderColor = '#e2e8f0';
      let textColor = '#0f172a';

      if (isFilled9) {
        bg = '#ecfdf5';
        borderColor = '#10b981';
        textColor = '#059669';
      } else if (isComparing) {
        bg = '#fdf4ff';
        borderColor = '#c026d3';
        textColor = '#a21caf';
      }

      return `
        <div style="display: flex; flex-direction: column; align-items: center; gap: 4px;">
          <span style="font-size: 9px; color: ${isComparing ? '#c026d3' : isFilled9 ? '#059669' : '#94a3b8'}; font-weight: 700;">
            ${isComparing ? (idx === curIdx - 1 ? '高位[i-1]' : '低位[i]') : `[${idx}]`}
          </span>
          <div style="width: 52px; height: 56px; border-radius: 12px; background: ${bg}; border: 2px solid ${borderColor}; display: flex; flex-direction: column; align-items: center; justify-content: center; font-size: 20px; font-weight: 800; color: ${textColor}; font-family: 'JetBrains Mono', monospace; box-shadow: 0 2px 4px rgba(0,0,0,0.04);">
            <span>${d}</span>
          </div>
          <span style="font-size: 8.5px; color: ${idx === step.flag ? '#c026d3' : '#94a3b8'}; font-weight: 700;">
            ${idx === step.flag ? '🚩 flag' : ''}
          </span>
        </div>
      `;
    })
    .join('');

  container.innerHTML = `
    <div style="width: 100%; height: 100%; display: flex; flex-direction: column; justify-content: center; gap: 8px; padding: 12px; box-sizing: border-box;">
      <div style="display: flex; align-items: center; justify-content: space-between; font-size: 11px; font-weight: 700; color: #475569;">
        <span>原输入数值: <strong style="color: #0f172a; font-family: monospace;">${step.originalNum}</strong></span>
        <span>置9起始位 flag: <strong style="color: #c026d3; font-family: monospace;">[${step.flag < n ? step.flag : '无'}]</strong></span>
      </div>

      <div style="display: flex; gap: 8px; overflow-x: auto; justify-content: center; padding: 4px 0;">
        ${digitsHtml}
      </div>
    </div>
  `;
}
