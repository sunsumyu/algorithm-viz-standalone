import { LargestNumberStep } from './largest-number-step-compiler';
import { renderDecisionBalance } from './greedy-089-shared';

export function renderLargestNumberCanvas(container: HTMLElement, step: LargestNumberStep): void {
  const arr = step.currentArray || [];
  const pair = step.comparingPair;

  const cardsHtml = arr
    .map((item, idx) => {
      const isPair = pair && (pair[0] === item || pair[1] === item);
      const bg = isPair ? '#eff6ff' : '#ffffff';
      const border = isPair ? '#3b82f6' : '#cbd5e1';
      const textColor = isPair ? '#1d4ed8' : '#1e293b';

      return `
        <div style="display: flex; flex-direction: column; align-items: center; gap: 4px;">
          <div style="min-width: 50px; height: 48px; padding: 0 10px; border-radius: 8px; background: ${bg}; border: 2px solid ${border}; display: flex; align-items: center; justify-content: center; font-family: 'JetBrains Mono', monospace; font-weight: 800; font-size: 16px; color: ${textColor}; box-shadow: 0 2px 4px rgba(0,0,0,0.06);">
            ${item}
          </div>
          <span style="font-size: 10px; color: #94a3b8; font-family: 'JetBrains Mono', monospace;">下标[${idx}]</span>
        </div>
      `;
    })
    .join('');

  container.innerHTML = `
    <div style="width: 100%; height: 100%; display: flex; flex-direction: column; gap: 14px; box-sizing: border-box; justify-content: center;">
      <div style="display: flex; align-items: center; justify-content: space-between; border-bottom: 1px solid #f1f5f9; padding-bottom: 6px;">
        <span style="font-size: 12px; font-weight: 700; color: #475569;">当前数字卡片排列状态</span>
        <span style="font-size: 11px; color: #10b981; font-weight: 600;">已形成结果: ${step.finalAns || '推演中...'}</span>
      </div>
      <div style="display: flex; align-items: center; gap: 10px; flex-wrap: wrap; justify-content: center; padding: 10px; background: #f8fafc; border-radius: 8px; border: 1px solid #e2e8f0;">
        ${cardsHtml}
      </div>
    </div>
  `;
}

export function renderLargestNumberMetrics(container: HTMLElement, step: LargestNumberStep): void {
  if (step.balance) {
    renderDecisionBalance(container, step.balance, '拼接字典序比对');
  } else {
    container.innerHTML = `
      <div style="width: 100%; height: 100%; display: flex; align-items: center; justify-content: center; color: #94a3b8; font-size: 12px; font-style: italic;">
        ${step.message || '等待下一步操作'}
      </div>
    `;
  }
}
