import type { LongestSameZerosOnesStep } from './longest-same-zeros-ones-step-compiler';
import { renderDecisionBalance } from './greedy-091-shared';

export function renderLongestSameZerosOnesCanvas(stageContainer: HTMLElement, step: LongestSameZerosOnesStep): void {
  stageContainer.innerHTML = '';

  const mainCard = document.createElement('div');
  mainCard.style.cssText = 'display: flex; flex-direction: column; gap: 12px; width: 100%; height: 100%; box-sizing: border-box;';

  // 顶部状态栏
  mainCard.innerHTML = `
    <div style="display: flex; align-items: center; justify-content: space-between; padding: 8px 12px; background: #f8fafc; border-radius: 8px; border: 1px solid #e2e8f0;">
      <div style="display: flex; gap: 8px; align-items: center;">
        <span style="font-weight: 700; font-size: 13px; color: #1e293b;">数组规模 n = <b>${step.arr.length}</b></span>
        <span style="font-size: 11px; padding: 2px 8px; border-radius: 4px; background: #eff6ff; color: #1d4ed8; font-weight: 600;">首位 arr[0]=${step.arr[0]} | 末位 arr[n-1]=${step.arr[step.arr.length - 1]}</span>
      </div>
      <div style="display: flex; gap: 6px; font-family: 'JetBrains Mono', monospace; font-size: 13px; align-items: center;">
        <span style="color: #64748b;">最大区间长度:</span>
        <span style="color: #059669; font-weight: 800; font-size: 16px;">${step.maxLen}</span>
      </div>
    </div>
  `;

  // 中部 01 序列卡片
  const arrBox = document.createElement('div');
  arrBox.style.cssText = 'display: flex; flex-wrap: wrap; gap: 6px; justify-content: center; align-items: center; padding: 12px; background: #ffffff; border-radius: 8px; border: 1px solid #e2e8f0;';

  step.arr.forEach((val, idx) => {
    const isFirst = idx === 0;
    const isLast = idx === step.arr.length - 1;

    let border = '#cbd5e1';
    let bg = val === 0 ? '#f0fdf4' : '#eff6ff';
    let color = val === 0 ? '#15803d' : '#1d4ed8';

    if (isFirst || isLast) {
      border = '#f59e0b';
    }

    const item = document.createElement('div');
    item.style.cssText = `min-width: 36px; height: 36px; display: flex; flex-direction: column; align-items: center; justify-content: center; background: ${bg}; border: 2px solid ${border}; border-radius: 6px; font-family: 'JetBrains Mono', monospace; font-weight: 800; font-size: 13px; color: ${color}; position: relative;`;
    item.textContent = String(val);

    if (isFirst) {
      const tag = document.createElement('span');
      tag.style.cssText = 'position: absolute; top: -14px; font-size: 9px; color: #f59e0b; font-weight: 700;';
      tag.textContent = '首';
      item.appendChild(tag);
    }
    if (isLast) {
      const tag = document.createElement('span');
      tag.style.cssText = 'position: absolute; top: -14px; font-size: 9px; color: #f59e0b; font-weight: 700;';
      tag.textContent = '尾';
      item.appendChild(tag);
    }

    arrBox.appendChild(item);
  });
  mainCard.appendChild(arrBox);

  // 底部区间比对天平
  if (step.intervalA && step.intervalB) {
    const balanceBox = document.createElement('div');
    balanceBox.style.cssText = 'flex: 1;';
    renderDecisionBalance(balanceBox, {
      leftTitle: `${step.intervalA.name} [${step.intervalA.l}..${step.intervalA.r}]`,
      leftVal: `0: ${step.intervalA.zeros}个, 1: ${step.intervalA.ones}个`,
      rightTitle: `${step.intervalB.name} [${step.intervalB.l}..${step.intervalB.r}]`,
      rightVal: `0: ${step.intervalB.zeros}个, 1: ${step.intervalB.ones}个`,
      winner: 'equal',
      reason: step.reasonText,
    });
    mainCard.appendChild(balanceBox);
  }

  stageContainer.appendChild(mainCard);
}
