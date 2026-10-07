import type { SplitMinAvgSumStep } from './split-min-avg-sum-step-compiler';

export function renderSplitMinAvgSumCanvas(stageContainer: HTMLElement, step: SplitMinAvgSumStep): void {
  stageContainer.innerHTML = '';

  const mainCard = document.createElement('div');
  mainCard.style.cssText = 'display: flex; flex-direction: column; gap: 12px; width: 100%; height: 100%; box-sizing: border-box;';

  // 顶部指标栏
  mainCard.innerHTML = `
    <div style="display: flex; align-items: center; justify-content: space-between; padding: 8px 12px; background: #f8fafc; border-radius: 8px; border: 1px solid #e2e8f0;">
      <div style="display: flex; gap: 8px; align-items: center;">
        <span style="font-weight: 700; font-size: 13px; color: #1e293b;">升序序列:</span>
        <span style="font-family: 'JetBrains Mono', monospace; font-size: 12px; color: #2563eb; background: #eff6ff; padding: 2px 6px; border-radius: 4px;">[${step.sortedArr.join(', ')}]</span>
      </div>
      <div style="display: flex; gap: 6px; font-family: 'JetBrains Mono', monospace; font-size: 13px; align-items: center;">
        <span style="color: #64748b;">累计平均值之和:</span>
        <span style="color: #059669; font-weight: 800; font-size: 15px;">${step.totalAvgSum}</span>
      </div>
    </div>
  `;

  // 中部各集合展示卡片
  const groupsBox = document.createElement('div');
  groupsBox.style.cssText = 'flex: 1; display: grid; grid-template-columns: repeat(auto-fit, minmax(220px, 1fr)); gap: 10px; background: #ffffff; border-radius: 8px; border: 1px solid #e2e8f0; padding: 10px; overflow-y: auto;';

  if (step.groups.length === 0) {
    groupsBox.innerHTML = '<div style="color: #94a3b8; font-size: 12px; font-style: italic; display: flex; align-items: center; justify-content: center; width: 100%;">集合待划分...</div>';
  } else {
    step.groups.forEach((g) => {
      const isDiluted = g.count > 1;
      const card = document.createElement('div');
      card.style.cssText = `display: flex; flex-direction: column; gap: 6px; background: ${isDiluted ? '#fdf4ff' : '#f8fafc'}; border: 1.5px solid ${isDiluted ? '#c084fc' : '#cbd5e1'}; border-radius: 8px; padding: 10px;`;

      card.innerHTML = `
        <div style="display: flex; justify-content: space-between; align-items: center; border-bottom: 1px dashed #e2e8f0; padding-bottom: 4px;">
          <span style="font-weight: 700; font-size: 12px; color: #1e293b;">集合 #${g.id} ${isDiluted ? '(大集合稀释)' : '(小值独占)'}</span>
          <span style="font-size: 11px; font-weight: 600; color: #64748b;">容量: ${g.count}</span>
        </div>
        <div style="display: flex; gap: 4px; flex-wrap: wrap; margin: 4px 0;">
          ${g.elements.map(e => `
            <span style="padding: 2px 6px; border-radius: 4px; background: #ffffff; border: 1px solid #cbd5e1; font-family: 'JetBrains Mono', monospace; font-size: 11px; font-weight: 700; color: #334155;">${e}</span>
          `).join('')}
        </div>
        <div style="display: flex; justify-content: space-between; font-size: 11px; margin-top: auto; padding-top: 4px; border-top: 1px dashed #e2e8f0;">
          <span style="color: #64748b;">计算算式:</span>
          <span style="font-family: 'JetBrains Mono', monospace; color: #475569;">⌊${g.sum}/${g.count}⌋</span>
        </div>
        <div style="display: flex; justify-content: space-between; font-size: 12px; background: #ffffff; padding: 3px 6px; border-radius: 4px; border: 1px solid #e2e8f0;">
          <span style="color: #64748b; font-weight: 600;">平均值 Contribution:</span>
          <span style="font-weight: 800; color: #059669; font-family: 'JetBrains Mono', monospace;">+${g.avg}</span>
        </div>
      `;
      groupsBox.appendChild(card);
    });
  }
  mainCard.appendChild(groupsBox);

  stageContainer.appendChild(mainCard);
}
