import type { SmallestRangeStep } from './smallest-range-step-compiler';

export function renderSmallestRangeCanvas(stageContainer: HTMLElement, step: SmallestRangeStep): void {
  stageContainer.innerHTML = '';

  const mainCard = document.createElement('div');
  mainCard.style.cssText = 'display: flex; flex-direction: column; gap: 12px; width: 100%; height: 100%; box-sizing: border-box;';

  // 顶部状态栏
  const bestText = step.ansR === Infinity ? '尚未形成' : `[${step.ansL}, ${step.ansR}] (跨度 ${step.ansR - step.ansL})`;
  mainCard.innerHTML = `
    <div style="display: flex; align-items: center; justify-content: space-between; padding: 8px 12px; background: #f8fafc; border-radius: 8px; border: 1px solid #e2e8f0;">
      <div style="display: flex; gap: 8px; align-items: center;">
        <span style="font-weight: 700; font-size: 13px; color: #1e293b;">当前最大值 maxVal:</span>
        <span style="font-size: 13px; font-weight: 700; color: #ef4444; font-family: 'JetBrains Mono', monospace;">${step.maxVal === -Infinity ? '-∞' : step.maxVal}</span>
      </div>
      <div style="display: flex; gap: 6px; font-family: 'JetBrains Mono', monospace; font-size: 12px; align-items: center;">
        <span style="color: #64748b;">历史最佳最小区间:</span>
        <span style="color: #059669; font-weight: 700; background: #ecfdf5; padding: 2px 8px; border-radius: 4px; border: 1px solid #10b98140;">${bestText}</span>
      </div>
    </div>
  `;

  // 中部：多路列表与游标展示
  const listsBox = document.createElement('div');
  listsBox.style.cssText = 'flex: 1; display: flex; flex-direction: column; gap: 8px; background: #ffffff; border-radius: 8px; border: 1px solid #e2e8f0; padding: 10px; overflow-y: auto;';

  step.lists.forEach((list, listIdx) => {
    const row = document.createElement('div');
    row.style.cssText = 'display: flex; align-items: center; gap: 8px;';

    const label = document.createElement('div');
    label.style.cssText = 'width: 60px; font-size: 11px; font-weight: 700; color: #475569; font-family: "JetBrains Mono", monospace;';
    label.textContent = `List #${listIdx}:`;
    row.appendChild(label);

    const itemsContainer = document.createElement('div');
    itemsContainer.style.cssText = 'display: flex; gap: 6px; flex-wrap: wrap; align-items: center;';

    // 查找该列表中当前在堆中的游标
    const heapItem = step.heap.find(h => h.listIdx === listIdx);

    list.forEach((val, elemIdx) => {
      const isCurInHeap = heapItem && heapItem.elemIdx === elemIdx;
      const isPopped = step.poppedItem && step.poppedItem.listIdx === listIdx && step.poppedItem.elemIdx === elemIdx;

      let bg = '#f8fafc';
      let border = '#e2e8f0';
      let text = '#64748b';

      if (isCurInHeap) {
        bg = '#eff6ff';
        border = '#3b82f6';
        text = '#1d4ed8';
      } else if (isPopped) {
        bg = '#fef2f2';
        border = '#ef4444';
        text = '#b91c1c';
      }

      const card = document.createElement('div');
      card.style.cssText = `min-width: 34px; height: 28px; padding: 0 6px; border-radius: 6px; background: ${bg}; border: 1.5px solid ${border}; display: flex; align-items: center; justify-content: center; font-family: 'JetBrains Mono', monospace; font-weight: 700; font-size: 12px; color: ${text}; position: relative;`;
      card.textContent = String(val);

      if (isCurInHeap) {
        const badge = document.createElement('div');
        badge.style.cssText = 'position: absolute; top: -6px; right: -4px; width: 8px; height: 8px; border-radius: 50%; background: #3b82f6; border: 1.5px solid #fff;';
        card.appendChild(badge);
      }

      itemsContainer.appendChild(card);
    });

    row.appendChild(itemsContainer);
    listsBox.appendChild(row);
  });
  mainCard.appendChild(listsBox);

  // 底部：当前小顶堆卡片
  const heapBox = document.createElement('div');
  heapBox.style.cssText = 'display: flex; align-items: center; gap: 8px; padding: 8px 12px; background: #f8fafc; border-radius: 8px; border: 1px solid #e2e8f0;';
  const heapHtml = step.heap.length === 0
    ? '<span style="color: #94a3b8; font-size: 11px;">小顶堆为空</span>'
    : step.heap.map((h, idx) => {
        const isMin = idx === 0;
        return `
          <div style="padding: 4px 8px; border-radius: 6px; background: ${isMin ? '#ecfdf5' : '#ffffff'}; border: 1.5px solid ${isMin ? '#10b981' : '#cbd5e1'}; font-family: 'JetBrains Mono', monospace; font-size: 12px; font-weight: 700; color: ${isMin ? '#047857' : '#334155'};">
            ${h.val} <span style="font-size: 9px; color: #94a3b8;">(L#${h.listIdx})</span>
          </div>
        `;
      }).join('');

  heapBox.innerHTML = `
    <span style="font-size: 11px; font-weight: 700; color: #1e293b; min-width: 70px;">小顶堆 (Heap):</span>
    <div style="display: flex; gap: 6px; flex-wrap: wrap; align-items: center;">${heapHtml}</div>
  `;
  mainCard.appendChild(heapBox);

  stageContainer.appendChild(mainCard);
}
