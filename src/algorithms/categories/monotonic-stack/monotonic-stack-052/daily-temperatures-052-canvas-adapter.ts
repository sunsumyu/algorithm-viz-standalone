import { type DailyTemp052Step } from './daily-temperatures-052-step-compiler';

export function renderDailyTemperatures052Canvas(container: HTMLElement, step: DailyTemp052Step): void {
  const temps = step.temperatures;
  const stack = step.stack;
  const result = step.result;
  const n = temps.length;

  if (n === 0) {
    container.innerHTML = '<div style="padding: 16px; color: #94a3b8; font-size: 12px; text-align: center;">输入为空</div>';
    return;
  }

  const curIdx = step.currentIndex;
  const maxT = Math.max(...temps, 100);
  const minT = Math.min(...temps, 30);
  const range = Math.max(1, maxT - minT);

  const barsHtml = temps
    .map((t, idx) => {
      const isCurrent = idx === curIdx && curIdx < n;
      const inStack = stack.includes(idx);
      const isPopped = idx === step.poppedIndex;
      const waitDays = result[idx];
      const heightPercent = Math.max(16, Math.min(100, Math.round(((t - minT) / range) * 72 + 20)));

      let barBg = '#e2e8f0';
      let textColor = '#64748b';
      let border = 'transparent';

      if (isCurrent) {
        barBg = '#ea580c';
        textColor = '#ea580c';
        border = '#ea580c';
      } else if (isPopped) {
        barBg = '#10b981';
        textColor = '#059669';
        border = '#10b981';
      } else if (inStack) {
        barBg = '#fbbf24';
        textColor = '#d97706';
        border = '#f59e0b';
      } else if (waitDays > 0) {
        barBg = '#d1fae5';
        textColor = '#059669';
      }

      return `
        <div style="display: flex; flex-direction: column; align-items: center; gap: 2px; flex: 1; min-width: 32px; max-width: 54px;">
          <span style="font-size: 10px; font-weight: 800; color: ${textColor}; font-family: monospace;">${t}°C</span>
          <div style="width: 100%; height: 90px; display: flex; align-items: flex-end; justify-content: center;">
            <div style="width: 26px; height: ${heightPercent}%; background: ${barBg}; border-radius: 6px 6px 2px 2px; border: 1.5px solid ${border}; transition: all 0.2s; display: flex; align-items: center; justify-content: center; color: #ffffff; font-size: 9px; font-weight: 800;">
              ${waitDays > 0 ? `+${waitDays}天` : ''}
            </div>
          </div>
          <span style="font-size: 9px; color: ${isCurrent ? '#ea580c' : '#94a3b8'}; font-weight: 700; font-family: monospace;">
            [${idx}]
          </span>
        </div>
      `;
    })
    .join('');

  const stackItemsHtml = stack
    .map((idx) => {
      return `
        <div style="padding: 2px 8px; border-radius: 6px; background: #fffbeb; border: 1.5px solid #fde68a; color: #b45309; font-size: 11px; font-weight: 800; font-family: monospace; display: flex; align-items: center; gap: 4px;">
          <span>[${idx}]</span>
          <span style="color: #ea580c;">${temps[idx]}°C</span>
        </div>
      `;
    })
    .join('');

  const resultCardsHtml = result
    .map((days, idx) => {
      const isSettled = days > 0;
      return `
        <div style="display: flex; flex-direction: column; align-items: center; gap: 2px; min-width: 30px;">
          <div style="width: 26px; height: 26px; border-radius: 4px; background: ${isSettled ? '#ecfdf5' : '#f8fafc'}; border: 1px solid ${isSettled ? '#a7f3d0' : '#e2e8f0'}; display: flex; align-items: center; justify-content: center; font-size: 11px; font-weight: 800; color: ${isSettled ? '#059669' : '#94a3b8'}; font-family: monospace;">
            ${days}
          </div>
          <span style="font-size: 8.5px; color: #94a3b8;">[${idx}]</span>
        </div>
      `;
    })
    .join('');

  container.innerHTML = `
    <div style="width: 100%; display: flex; flex-direction: column; gap: 12px; padding: 12px; box-sizing: border-box;">
      <div style="background: #ffffff; border: 1px solid #e2e8f0; border-radius: 10px; padding: 12px; box-shadow: 0 1px 3px rgba(0,0,0,0.03);">
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px;">
          <span style="font-size: 11px; font-weight: 800; color: #475569;">🌡️ 每日气温直方柱</span>
          <span style="font-size: 10px; background: #ffedd5; color: #c2410c; padding: 2px 8px; border-radius: 12px; font-weight: 700;">🔻 底到顶递减栈（遇升温出栈结算等待天数）</span>
        </div>
        <div style="display: flex; justify-content: space-around; align-items: flex-end; padding: 6px 0; border-bottom: 1.5px solid #e2e8f0;">
          ${barsHtml}
        </div>
      </div>

      <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 12px;">
        <div style="background: #ffffff; border: 1px solid #e2e8f0; border-radius: 10px; padding: 12px; display: flex; flex-direction: column;">
          <span style="font-size: 11px; font-weight: 800; color: #475569; margin-bottom: 8px;">🥞 单调递减栈 (栈底 &rarr; 栈顶)</span>
          <div style="display: flex; gap: 6px; overflow-x: auto; flex: 1; align-items: center; min-height: 36px; background: #f8fafc; padding: 6px; border-radius: 8px; border: 1.5px dashed #cbd5e1;">
            ${stack.length > 0 ? stackItemsHtml : '<span style="font-size: 11px; color: #94a3b8; font-style: italic;">（栈空）</span>'}
          </div>
        </div>

        <div style="background: #ffffff; border: 1px solid #e2e8f0; border-radius: 10px; padding: 12px; display: flex; flex-direction: column;">
          <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px;">
            <span style="font-size: 11px; font-weight: 800; color: #475569;">📋 等待天数结果数组 answer</span>
            <span style="font-size: 10px; color: #059669; font-weight: 700;">已结算: ${result.filter((x) => x > 0).length} / ${n}</span>
          </div>
          <div style="display: flex; gap: 4px; overflow-x: auto; align-items: center; min-height: 36px; padding: 4px;">
            ${resultCardsHtml}
          </div>
        </div>
      </div>
    </div>
  `;
}
