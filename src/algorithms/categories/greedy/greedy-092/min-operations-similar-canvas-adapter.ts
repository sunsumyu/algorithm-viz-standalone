import { MinOperationsSimilarStep } from './min-operations-similar-step-compiler';

export function renderMinOperationsSimilarCanvas(stageContainer: HTMLElement, step: MinOperationsSimilarStep): void {
  stageContainer.innerHTML = '';

  const mainCard = document.createElement('div');
  mainCard.style.cssText = 'display: flex; flex-direction: column; gap: 12px; width: 100%; height: 100%; box-sizing: border-box;';

  // 顶部状态栏
  mainCard.innerHTML = `
    <div style="display: flex; align-items: center; justify-content: space-between; padding: 8px 12px; background: #f8fafc; border-radius: 8px; border: 1px solid #e2e8f0;">
      <div style="display: flex; gap: 8px; align-items: center;">
        <span style="font-weight: 700; font-size: 13px; color: #1e293b;">奇数组: <b>${step.oddNums.length}</b> 对</span>
        <span style="color: #cbd5e1;">|</span>
        <span style="font-weight: 700; font-size: 13px; color: #1e293b;">偶数组: <b>${step.evenNums.length}</b> 对</span>
      </div>
      <div style="display: flex; gap: 6px; font-family: 'JetBrains Mono', monospace; font-size: 13px; align-items: center;">
        <span style="color: #64748b;">最少操作次数:</span>
        <span style="color: #2563eb; font-weight: 800; font-size: 16px;">${step.totalOps} 次</span>
      </div>
    </div>
  `;

  // 中部配对看板
  const pairsBox = document.createElement('div');
  pairsBox.style.cssText = 'flex: 1; display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 10px; background: #ffffff; border-radius: 8px; border: 1px solid #e2e8f0; padding: 10px; overflow-y: auto;';

  if (step.pairs.length === 0) {
    pairsBox.innerHTML = '<div style="color: #94a3b8; font-size: 12px; font-style: italic; display: flex; align-items: center; justify-content: center; width: 100%;">等待奇偶配对计算...</div>';
  } else {
    step.pairs.forEach((p) => {
      const isOdd = p.type === 'odd';
      const card = document.createElement('div');
      card.style.cssText = `display: flex; flex-direction: column; gap: 6px; background: ${isOdd ? '#fdf4ff' : '#f0fdf4'}; border: 1.5px solid ${isOdd ? '#c084fc' : '#86efac'}; border-radius: 8px; padding: 10px; box-shadow: 0 1px 2px rgba(0,0,0,0.03);`;

      card.innerHTML = `
        <div style="display: flex; justify-content: space-between; align-items: center; border-bottom: 1px dashed #e2e8f0; padding-bottom: 4px;">
          <span style="font-weight: 700; font-size: 12px; color: #1e293b;">${isOdd ? '🟣 奇数对' : '🟢 偶数对'} #${p.idx}</span>
          <span style="font-size: 10px; font-weight: 700; color: ${p.diff > 0 ? '#ef4444' : '#64748b'};">差值: ${p.diff >= 0 ? `+${p.diff}` : p.diff}</span>
        </div>
        <div style="display: flex; align-items: center; justify-content: space-around; margin: 4px 0; font-family: 'JetBrains Mono', monospace; font-size: 13px; font-weight: 700;">
          <span style="color: #1d4ed8; background: #eff6ff; padding: 2px 8px; border-radius: 4px; border: 1px solid #bfdbfe;">${p.num}</span>
          <span style="color: #94a3b8;">➔</span>
          <span style="color: #059669; background: #ecfdf5; padding: 2px 8px; border-radius: 4px; border: 1px solid #a7f3d0;">${p.target}</span>
        </div>
        <div style="display: flex; justify-content: space-between; font-size: 11px; background: #ffffff; padding: 3px 6px; border-radius: 4px; border: 1px solid #e2e8f0;">
          <span style="color: #64748b; font-weight: 600;">操作次数:</span>
          <span style="font-weight: 800; color: #2563eb; font-family: 'JetBrains Mono', monospace;">+${p.ops} 次</span>
        </div>
      `;
      pairsBox.appendChild(card);
    });
  }
  mainCard.appendChild(pairsBox);

  stageContainer.appendChild(mainCard);
}
