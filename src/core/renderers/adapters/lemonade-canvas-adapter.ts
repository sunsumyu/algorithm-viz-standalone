import type { LemonadeStep } from './lemonade-step-compiler';

export function renderLemonadeCanvas(container: HTMLElement, step: LemonadeStep): void {
  const bills = step.bills;
  const n = bills.length;

  if (n === 0) {
    container.innerHTML =
      '<div style="display:flex;align-items:center;justify-content:center;height:100%;color:#94a3b8;font-size:12px;">没有顾客排队</div>';
    return;
  }

  const curIdx = step.currentIndex;
  const isDone = step.action === 'done';
  const isFail = step.action === 'fail';

  const customersHtml = bills
    .map((b, idx) => {
      const isCurrent = idx === curIdx && !isDone;
      const isProcessed = idx < curIdx || (idx === curIdx && isDone);

      let bg = '#ffffff';
      let borderColor = '#e2e8f0';
      let textColor = '#0f172a';

      if (isCurrent) {
        bg = isFail ? '#fef2f2' : '#fefce8';
        borderColor = isFail ? '#ef4444' : '#ca8a04';
        textColor = isFail ? '#dc2626' : '#a16207';
      } else if (isProcessed) {
        bg = '#f8fafc';
        borderColor = '#cbd5e1';
        textColor = '#64748b';
      }

      const billBadgeColor = b === 5 ? '#10b981' : b === 10 ? '#3b82f6' : '#ca8a04';

      return `
        <div style="display: flex; flex-direction: column; align-items: center; gap: 4px;">
          <span style="font-size: 9px; color: ${isCurrent ? '#ca8a04' : '#94a3b8'}; font-weight: 700;">
            ${isCurrent ? '📍 购买' : `[${idx}]`}
          </span>
          <div style="width: 48px; height: 50px; border-radius: 12px; background: ${bg}; border: 2px solid ${borderColor}; display: flex; flex-direction: column; align-items: center; justify-content: center; font-size: 14px; font-weight: 800; color: ${textColor}; font-family: 'JetBrains Mono', monospace; box-shadow: 0 2px 4px rgba(0,0,0,0.04); gap: 1px;">
            <span style="font-size: 9.5px; color: ${billBadgeColor}; font-weight: 700;">支付</span>
            <span style="font-size: 13px; color: ${billBadgeColor}; font-weight: 800;">$${b}</span>
          </div>
          <span style="font-size: 8.5px; color: ${isProcessed ? '#059669' : '#94a3b8'}; font-weight: 700;">
            ${isProcessed ? '✓ 完成' : '等待'}
          </span>
        </div>
      `;
    })
    .join('');

  container.innerHTML = `
    <div style="width: 100%; height: 100%; display: flex; flex-direction: column; justify-content: center; gap: 8px; padding: 12px; box-sizing: border-box;">
      <!-- 钱箱储备条 -->
      <div style="display: flex; align-items: center; justify-content: space-between; font-size: 11px; font-weight: 700; color: #475569;">
        <span>💵 收银台现钞储备: <strong style="color: #10b981;">$5 &times; ${step.fiveCount}</strong> | <strong style="color: #3b82f6;">$10 &times; ${step.tenCount}</strong></span>
        <span>找零吐钞: <strong style="color: #ca8a04; font-family: monospace;">${step.changeGiven.length ? step.changeGiven.map((c) => `$${c}`).join(' + ') : '无'}</strong></span>
      </div>

      <!-- 顾客水平流 -->
      <div style="display: flex; gap: 8px; overflow-x: auto; justify-content: center; padding: 4px 0;">
        ${customersHtml}
      </div>
    </div>
  `;
}
