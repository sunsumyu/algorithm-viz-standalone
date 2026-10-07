import type { GroupBuyTicketsStep } from './group-buy-tickets-step-compiler';

export function renderGroupBuyTicketsCanvas(stageContainer: HTMLElement, step: GroupBuyTicketsStep): void {
  stageContainer.innerHTML = '';

  const mainCard = document.createElement('div');
  mainCard.style.cssText = 'display: flex; flex-direction: column; gap: 12px; width: 100%; height: 100%; box-sizing: border-box;';

  // 顶部指标
  mainCard.innerHTML = `
    <div style="display: flex; align-items: center; justify-content: space-between; padding: 8px 12px; background: #f8fafc; border-radius: 8px; border: 1px solid #e2e8f0;">
      <div style="display: flex; gap: 8px; align-items: center;">
        <span style="font-weight: 700; font-size: 13px; color: #1e293b;">总人数: <b>${step.n}</b> 人</span>
        <span style="font-size: 11px; padding: 2px 8px; border-radius: 4px; background: #ecfdf5; color: #047857; font-weight: 600;">已分配: ${step.peopleAssigned.reduce((a, b) => a + b, 0)} 人</span>
      </div>
      <div style="display: flex; gap: 6px; font-family: 'JetBrains Mono', monospace; font-size: 13px; align-items: center;">
        <span style="color: #64748b;">累计保底金额:</span>
        <span style="color: #dc2626; font-weight: 800; font-size: 15px;">￥${step.totalCost}</span>
      </div>
    </div>
  `;

  // 中部项目看板
  const gamesBox = document.createElement('div');
  gamesBox.style.cssText = 'flex: 1; display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 10px; background: #ffffff; border-radius: 8px; border: 1px solid #e2e8f0; padding: 10px; overflow-y: auto;';

  step.games.forEach(([k, b], idx) => {
    const cnt = step.peopleAssigned[idx];
    const currentCost = Math.max(0, cnt * (b - k * cnt));
    const nextDelta = b - k * (2 * cnt + 1);

    const card = document.createElement('div');
    card.style.cssText = `display: flex; flex-direction: column; gap: 6px; background: #f8fafc; border: 1.5px solid #cbd5e1; border-radius: 8px; padding: 10px; box-shadow: 0 1px 2px rgba(0,0,0,0.03);`;

    card.innerHTML = `
      <div style="display: flex; justify-content: space-between; align-items: center; border-bottom: 1px dashed #e2e8f0; padding-bottom: 4px;">
        <span style="font-weight: 700; font-size: 12px; color: #1e293b;">项目 #${idx}</span>
        <span style="font-size: 11px; font-weight: 600; color: #64748b;">K=${k}, B=${b}</span>
      </div>
      <div style="display: flex; justify-content: space-between; font-size: 11px;">
        <span style="color: #64748b;">已购人数:</span>
        <span style="font-weight: 700; color: #2563eb; font-family: 'JetBrains Mono', monospace;">${cnt} 人</span>
      </div>
      <div style="display: flex; justify-content: space-between; font-size: 11px;">
        <span style="color: #64748b;">该项目总开销:</span>
        <span style="font-weight: 700; color: #059669; font-family: 'JetBrains Mono', monospace;">￥${currentCost}</span>
      </div>
      <div style="display: flex; justify-content: space-between; font-size: 11px; background: #eff6ff; padding: 3px 6px; border-radius: 4px;">
        <span style="color: #1d4ed8; font-weight: 600;">下一人增量 Δ:</span>
        <span style="font-weight: 700; color: ${nextDelta > 0 ? '#1d4ed8' : '#94a3b8'}; font-family: 'JetBrains Mono', monospace;">${nextDelta > 0 ? `+￥${nextDelta}` : '已饱和 (<=0)'}</span>
      </div>
    `;
    gamesBox.appendChild(card);
  });
  mainCard.appendChild(gamesBox);

  // 底部：大顶堆元素
  const heapBox = document.createElement('div');
  heapBox.style.cssText = 'display: flex; align-items: center; gap: 8px; padding: 8px 12px; background: #f8fafc; border-radius: 8px; border: 1px solid #e2e8f0;';
  const heapHtml = step.heap.length === 0
    ? '<span style="color: #94a3b8; font-size: 11px;">大顶堆为空 (增益已耗尽)</span>'
    : step.heap.map((h, idx) => {
        const isTop = idx === 0;
        return `
          <div style="padding: 4px 8px; border-radius: 6px; background: ${isTop ? '#fffbeb' : '#ffffff'}; border: 1.5px solid ${isTop ? '#f59e0b' : '#cbd5e1'}; font-family: 'JetBrains Mono', monospace; font-size: 12px; font-weight: 700; color: ${isTop ? '#b45309' : '#334155'};">
            +￥${h.delta} <span style="font-size: 9px; color: #94a3b8;">(项目#${h.gameIdx})</span>
          </div>
        `;
      }).join('');

  heapBox.innerHTML = `
    <span style="font-size: 11px; font-weight: 700; color: #1e293b; min-width: 90px;">大顶堆 (MaxHeap):</span>
    <div style="display: flex; gap: 6px; flex-wrap: wrap; align-items: center;">${heapHtml}</div>
  `;
  mainCard.appendChild(heapBox);

  stageContainer.appendChild(mainCard);
}
