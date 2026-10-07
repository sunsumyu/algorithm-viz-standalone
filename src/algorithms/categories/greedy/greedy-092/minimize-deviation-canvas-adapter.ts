import { MinimizeDeviationStep } from './minimize-deviation-step-compiler';

export function renderMinimizeDeviationCanvas(stageContainer: HTMLElement, step: MinimizeDeviationStep): void {
  stageContainer.innerHTML = '';

  const mainCard = document.createElement('div');
  mainCard.style.cssText = 'display: flex; flex-direction: column; gap: 12px; width: 100%; height: 100%; box-sizing: border-box;';

  // 顶部状态指标
  mainCard.innerHTML = `
    <div style="display: flex; align-items: center; justify-content: space-between; padding: 8px 12px; background: #f8fafc; border-radius: 8px; border: 1px solid #e2e8f0;">
      <div style="display: gap: 8px; align-items: center;">
        <span style="font-weight: 700; font-size: 13px; color: #1e293b;">极值跨度:</span>
        <span style="font-size: 12px; padding: 2px 6px; border-radius: 4px; background: #eff6ff; color: #1d4ed8; font-family: 'JetBrains Mono', monospace; font-weight: 700;">min=${step.minVal}</span>
        <span style="font-size: 12px; padding: 2px 6px; border-radius: 4px; background: #fef2f2; color: #dc2626; font-family: 'JetBrains Mono', monospace; font-weight: 700;">max=${step.maxVal}</span>
      </div>
      <div style="display: flex; gap: 6px; font-family: 'JetBrains Mono', monospace; font-size: 13px; align-items: center;">
        <span style="color: #64748b;">历史最小偏移量:</span>
        <span style="color: #059669; font-weight: 800; font-size: 16px;">${step.ans === Infinity ? '计算中' : step.ans}</span>
      </div>
    </div>
  `;

  // 中部：当前堆中元素排序状态
  const heapBox = document.createElement('div');
  heapBox.style.cssText = 'flex: 1; display: flex; flex-wrap: wrap; gap: 8px; justify-content: center; align-items: center; padding: 12px; background: #ffffff; border-radius: 8px; border: 1px solid #e2e8f0;';

  step.heap.forEach((val, idx) => {
    const isTop = idx === 0;
    const isMin = val === step.minVal;
    const isOdd = val % 2 !== 0;

    let bg = '#f8fafc';
    let border = '#cbd5e1';
    let color = '#334155';

    if (isTop) {
      bg = isOdd ? '#fef3c7' : '#fee2e2';
      border = isOdd ? '#f59e0b' : '#ef4444';
      color = isOdd ? '#b45309' : '#b91c1c';
    } else if (isMin) {
      bg = '#eff6ff';
      border = '#3b82f6';
      color = '#1d4ed8';
    }

    const item = document.createElement('div');
    item.style.cssText = `min-width: 44px; height: 42px; display: flex; flex-direction: column; align-items: center; justify-content: center; background: ${bg}; border: 2px solid ${border}; border-radius: 8px; font-family: 'JetBrains Mono', monospace; font-weight: 800; font-size: 14px; color: ${color}; position: relative; box-shadow: 0 1px 2px rgba(0,0,0,0.05);`;

    item.innerHTML = `
      <span>${val}</span>
      <span style="font-size: 9px; font-weight: 600; color: #94a3b8;">${isOdd ? '奇数 (封顶)' : '偶数 (可/2)'}</span>
    `;

    if (isTop) {
      const tag = document.createElement('span');
      tag.style.cssText = 'position: absolute; top: -10px; background: #ef4444; color: #fff; font-size: 9px; padding: 1px 4px; border-radius: 3px; font-weight: 700;';
      tag.textContent = '堆顶 MAX';
      item.appendChild(tag);
    }
    if (isMin && !isTop) {
      const tag = document.createElement('span');
      tag.style.cssText = 'position: absolute; bottom: -10px; background: #3b82f6; color: #fff; font-size: 9px; padding: 1px 4px; border-radius: 3px; font-weight: 700;';
      tag.textContent = 'MIN';
      item.appendChild(tag);
    }

    heapBox.appendChild(item);
  });
  mainCard.appendChild(heapBox);

  stageContainer.appendChild(mainCard);
}
