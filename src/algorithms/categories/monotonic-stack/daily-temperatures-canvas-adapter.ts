import { type DailyTempStep } from './daily-temperatures-step-compiler';

export function renderDailyTemperaturesCanvas(container: HTMLElement, step: DailyTempStep): void {
  const temps = step.temperatures;
  const stack = step.stack;
  const result = step.result;
  const n = temps.length;

  if (n === 0) {
    container.innerHTML = '<div style="display:flex;align-items:center;justify-content:center;height:100%;color:#94a3b8;font-size:12px;">输入为空</div>';
    return;
  }

  const curIdx = step.currentIndex;
  const isDone = step.action === 'done';

  const maxT = Math.max(...temps, 100);
  const minT = Math.min(...temps, 30);
  const range = Math.max(1, maxT - minT);

  const barsHtml = temps
    .map((t, idx) => {
      const isCurrent = idx === curIdx && !isDone;
      const inStack = stack.includes(idx);
      const isPopped = idx === step.poppedIndex;
      const waitDays = result[idx];

      const heightPercent = Math.max(18, Math.min(100, Math.round(((t - minT) / range) * 70 + 20)));

      let barBg = '#e2e8f0';
      let textColor = '#64748b';
      let borderColor = 'transparent';

      if (isCurrent) {
        barBg = '#ea580c';
        textColor = '#ea580c';
        borderColor = '#ea580c';
      } else if (isPopped) {
        barBg = '#10b981';
        textColor = '#059669';
        borderColor = '#10b981';
      } else if (inStack) {
        barBg = '#fbbf24';
        textColor = '#d97706';
        borderColor = '#f59e0b';
      } else if (waitDays > 0) {
        barBg = '#d1fae5';
        textColor = '#059669';
      }

      return `
        <div style="display: flex; flex-direction: column; align-items: center; gap: 2px; flex: 1; min-width: 28px; max-width: 48px;">
          <span style="font-size: 9px; font-weight: 700; color: ${textColor}; font-family: monospace;">${t}°</span>
          <div style="width: 100%; height: 75px; display: flex; align-items: flex-end; justify-content: center;">
            <div style="width: 22px; height: ${heightPercent}%; background: ${barBg}; border-radius: 6px 6px 2px 2px; border: 1.5px solid ${borderColor}; transition: all 0.2s; display: flex; align-items: center; justify-content: center; color: #ffffff; font-size: 8.5px; font-weight: 800;">
              ${waitDays > 0 ? waitDays : ''}
            </div>
          </div>
          <span style="font-size: 8.5px; color: ${isCurrent ? '#ea580c' : '#94a3b8'}; font-weight: 700;">
            [${idx}]
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
          <span style="color: #ea580c;">${temps[idx]}°C</span>
        </div>
      `;
    })
    .join('');

  container.innerHTML = `
    <div style="width: 100%; height: 100%; display: flex; flex-direction: column; justify-content: center; gap: 8px; padding: 12px; box-sizing: border-box;">
      <div style="display: flex; justify-content: space-around; align-items: flex-end; padding: 2px 0; border-bottom: 1px solid #e2e8f0;">
        ${barsHtml}
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
