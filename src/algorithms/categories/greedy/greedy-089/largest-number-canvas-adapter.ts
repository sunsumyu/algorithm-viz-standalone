import { LargestNumberStep } from './largest-number-step-compiler';
import { renderDecisionBalance } from './greedy-089-shared';

export function renderLargestNumberCanvas(container: HTMLElement, step: LargestNumberStep): void {
  const arr = step.currentArray || [];
  const pair = step.comparingPair;

  const cardsHtml = arr
    .map((item, idx) => {
      const isPair = pair && (pair[0] === item || pair[1] === item);
      const isFirstOfPair = pair && pair[0] === item;
      const isSecondOfPair = pair && pair[1] === item;
      let bg = '#1e293b';
      let border = '#334155';
      let textColor = '#f8fafc';
      let glow = 'none';
      let tagHtml = `<span style="font-size: 10px; color: #64748b; font-family: 'JetBrains Mono', monospace;">下标[${idx}]</span>`;

      if (isPair) {
        bg = 'rgba(56, 189, 248, 0.15)';
        border = '#38bdf8';
        textColor = '#38bdf8';
        glow = '0 0 14px rgba(56, 189, 248, 0.4)';
        const role = isFirstOfPair ? '元素 a' : '元素 b';
        tagHtml = `<span style="font-size: 10px; color: #38bdf8; font-weight: 800; font-family: 'JetBrains Mono', monospace;">${role}</span>`;
      }

      return `
        <div style="display: flex; flex-direction: column; align-items: center; gap: 4px;">
          <div style="min-width: 56px; height: 50px; padding: 0 12px; border-radius: 8px; background: ${bg}; border: 2px solid ${border}; display: flex; align-items: center; justify-content: center; font-family: 'JetBrains Mono', monospace; font-weight: 800; font-size: 18px; color: ${textColor}; box-shadow: ${glow}; transition: all 0.2s ease;">
            ${item}
          </div>
          ${tagHtml}
        </div>
      `;
    })
    .join('');

  container.innerHTML = `
    <div style="width: 100%; height: 100%; display: flex; flex-direction: column; gap: 12px; box-sizing: border-box; justify-content: center; background: #0f172a; padding: 12px; border-radius: 8px; border: 1px solid #1e293b;">
      <div style="display: flex; align-items: center; justify-content: space-between; border-bottom: 1px solid #1e293b; padding-bottom: 6px;">
        <span style="font-size: 12px; font-weight: 700; color: #cbd5e1;">🎴 物理数字骨牌队列与当前序列滑轨</span>
        <div style="display: flex; align-items: center; gap: 6px;">
          <span style="font-size: 10px; color: #94a3b8;">当前结果串:</span>
          <span style="font-size: 12px; color: #10b981; font-weight: 800; font-family: 'JetBrains Mono', monospace; background: rgba(16,185,129,0.15); padding: 2px 8px; border-radius: 4px; border: 1px solid rgba(16,185,129,0.3);">${step.finalAns || '拼装推演中...'}</span>
        </div>
      </div>
      <div style="display: flex; align-items: center; gap: 12px; flex-wrap: wrap; justify-content: center; padding: 14px 10px; background: #020617; border-radius: 8px; border: 1px solid #1e293b; min-height: 80px;">
        ${cardsHtml}
      </div>
      <div style="display: flex; align-items: center; justify-content: space-between; font-size: 11px; color: #64748b; padding: 0 4px;">
        <span>💡 贪心策略：通过局部两两拼接 (b+a) 与 (a+b) 比较确定最高权位</span>
        <span>${pair ? `正在比对: [${pair[0]}] 与 [${pair[1]}]` : '排序完成'}</span>
      </div>
    </div>
  `;
}

export function renderLargestNumberMetrics(container: HTMLElement, step: LargestNumberStep): void {
  if (step.balance) {
    renderDecisionBalance(container, step.balance, '拼接字典序比对');
  } else {
    container.innerHTML = `
      <div style="width: 100%; height: 100%; display: flex; align-items: center; justify-content: center; color: #64748b; font-size: 12px; font-style: italic; background: #0f172a; padding: 12px; border-radius: 8px; border: 1px solid #1e293b;">
        ${step.message || '等待下一步操作'}
      </div>
    `;
  }
}
