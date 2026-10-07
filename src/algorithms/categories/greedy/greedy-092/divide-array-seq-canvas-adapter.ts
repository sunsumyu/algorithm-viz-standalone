import { DivideArraySeqStep } from './divide-array-seq-step-compiler';
import { renderDecisionBalance } from './greedy-092-shared';

export function renderDivideArraySeqCanvas(stageContainer: HTMLElement, step: DivideArraySeqStep): void {
  stageContainer.innerHTML = '';

  const mainCard = document.createElement('div');
  mainCard.style.cssText = 'display: flex; flex-direction: column; gap: 12px; width: 100%; height: 100%; box-sizing: border-box;';

  // 顶部状态栏
  const reqLen = step.maxFreq * step.k;
  mainCard.innerHTML = `
    <div style="display: flex; align-items: center; justify-content: space-between; padding: 8px 12px; background: #f8fafc; border-radius: 8px; border: 1px solid #e2e8f0;">
      <div style="display: flex; gap: 8px; align-items: center;">
        <span style="font-weight: 700; font-size: 13px; color: #1e293b;">数组长度: <b>${step.nums.length}</b></span>
        <span style="color: #cbd5e1;">|</span>
        <span style="font-size: 11px; padding: 2px 8px; border-radius: 4px; background: #eff6ff; color: #1d4ed8; font-weight: 600;">最高频次: ${step.maxFreq} (数字 ${step.maxFreqVal})</span>
        <span style="font-size: 11px; padding: 2px 8px; border-radius: 4px; background: #fdf4ff; color: #8b5cf6; font-weight: 600;">最少所需长度: ${reqLen}</span>
      </div>
      <div style="display: flex; gap: 6px; font-family: 'JetBrains Mono', monospace; font-size: 13px; align-items: center;">
        <span style="color: #64748b;">能否划分:</span>
        <span style="color: ${step.canDivide ? '#059669' : '#dc2626'}; font-weight: 800; font-size: 15px;">${step.canDivide ? 'TRUE (可以)' : 'FALSE (不可)'}</span>
      </div>
    </div>
  `;

  // 中部序列展示
  const numsBox = document.createElement('div');
  numsBox.style.cssText = 'flex: 1; display: flex; flex-wrap: wrap; gap: 6px; justify-content: center; align-items: center; padding: 12px; background: #ffffff; border-radius: 8px; border: 1px solid #e2e8f0;';

  step.nums.forEach((val, idx) => {
    const isCur = step.curIdx === idx;
    const isMaxFreq = val === step.maxFreqVal;

    let border = '#cbd5e1';
    let bg = '#f8fafc';
    let color = '#334155';

    if (isCur) {
      border = '#3b82f6';
      bg = '#eff6ff';
      color = '#1d4ed8';
    } else if (isMaxFreq) {
      border = '#f59e0b';
      bg = '#fffbeb';
      color = '#b45309';
    }

    const item = document.createElement('div');
    item.style.cssText = `min-width: 38px; height: 38px; display: flex; align-items: center; justify-content: center; background: ${bg}; border: 2px solid ${border}; border-radius: 6px; font-family: 'JetBrains Mono', monospace; font-weight: 800; font-size: 13px; color: ${color}; position: relative;`;
    item.textContent = String(val);

    if (isCur) {
      const tag = document.createElement('span');
      tag.style.cssText = 'position: absolute; top: -12px; font-size: 9px; color: #3b82f6; font-weight: 700;';
      tag.textContent = '▲';
      item.appendChild(tag);
    }

    numsBox.appendChild(item);
  });
  mainCard.appendChild(numsBox);

  // 底部天平比较
  const balanceBox = document.createElement('div');
  renderDecisionBalance(balanceBox, {
    leftTitle: '实际总长度 nums.length',
    leftVal: `${step.nums.length} 个元素`,
    rightTitle: '最小需求长度 maxFreq * k',
    rightVal: `${step.maxFreq} * ${step.k} = ${reqLen} 个元素`,
    winner: step.canDivide ? 'left' : 'right',
    reason: step.canDivide ? `n(${step.nums.length}) >= ${reqLen} (容量充裕)` : `n(${step.nums.length}) < ${reqLen} (容量不足)`,
  });
  mainCard.appendChild(balanceBox);

  stageContainer.appendChild(mainCard);
}
