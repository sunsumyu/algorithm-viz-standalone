import { TwoCityStep } from './two-city-scheduling-step-compiler';

export function renderTwoCityCanvas(container: HTMLElement, step: TwoCityStep): void {
  const people = step.people || [];
  const assignedA = step.assignedA || [];
  const assignedB = step.assignedB || [];

  const aCardsHtml = assignedA.length === 0
    ? '<span style="color: #94a3b8; font-size: 11px; font-style: italic;">暂无分配</span>'
    : assignedA.map((id) => {
        const p = people.find((item) => item.id === id);
        return `
          <div style="display: flex; align-items: center; justify-content: space-between; padding: 4px 8px; border-radius: 6px; background: #eff6ff; border: 1px solid #93c5fd; font-family: 'JetBrains Mono', monospace; font-size: 11px;">
            <span style="font-weight: 700; color: #1e40af;">P${id}</span>
            <span style="color: #2563eb; font-weight: 600;">$${p ? p.costA : 0}</span>
          </div>
        `;
      }).join('');

  const bCardsHtml = assignedB.length === 0
    ? '<span style="color: #94a3b8; font-size: 11px; font-style: italic;">暂无分配</span>'
    : assignedB.map((id) => {
        const p = people.find((item) => item.id === id);
        return `
          <div style="display: flex; align-items: center; justify-content: space-between; padding: 4px 8px; border-radius: 6px; background: #ecfdf5; border: 1px solid #6ee7b7; font-family: 'JetBrains Mono', monospace; font-size: 11px;">
            <span style="font-weight: 700; color: #065f46;">P${id}</span>
            <span style="color: #059669; font-weight: 600;">$${p ? p.costB : 0}</span>
          </div>
        `;
      }).join('');

  container.innerHTML = `
    <div style="width: 100%; height: 100%; display: flex; flex-direction: column; gap: 10px; box-sizing: border-box;">
      <div style="display: flex; align-items: center; justify-content: space-between; font-size: 12px; font-weight: 700; color: #475569; border-bottom: 1px solid #f1f5f9; padding-bottom: 4px;">
        <span>✈️ 两地调度分配看板 (总计 2N = ${people.length} 人)</span>
        <span style="color: #10b981; font-family: 'JetBrains Mono', monospace;">当前总花费: $${step.totalCost}</span>
      </div>

      <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 12px; flex: 1;">
        <div style="display: flex; flex-direction: column; gap: 6px; padding: 8px; border-radius: 8px; background: #f8fafc; border: 1.5px solid #bfdbfe;">
          <div style="display: flex; align-items: center; justify-content: space-between; font-size: 12px; font-weight: 700; color: #1e3a8a;">
            <span>🏙️ A 城市 (${assignedA.length} / ${Math.floor(people.length / 2)})</span>
            <span style="font-family: 'JetBrains Mono', monospace; color: #2563eb;">小计: $${step.totalCostA}</span>
          </div>
          <div style="display: flex; flex-direction: column; gap: 4px; overflow-y: auto; max-height: 160px;">
            ${aCardsHtml}
          </div>
        </div>

        <div style="display: flex; flex-direction: column; gap: 6px; padding: 8px; border-radius: 8px; background: #f8fafc; border: 1.5px solid #a7f3d0;">
          <div style="display: flex; align-items: center; justify-content: space-between; font-size: 12px; font-weight: 700; color: #064e3b;">
            <span>🏖️ B 城市 (${assignedB.length} / ${Math.floor(people.length / 2)})</span>
            <span style="font-family: 'JetBrains Mono', monospace; color: #059669;">小计: $${step.totalCostB}</span>
          </div>
          <div style="display: flex; flex-direction: column; gap: 4px; overflow-y: auto; max-height: 160px;">
            ${bCardsHtml}
          </div>
        </div>
      </div>
    </div>
  `;
}

export function renderTwoCityMetrics(container: HTMLElement, step: TwoCityStep): void {
  const people = step.people || [];
  const deltaBars = people
    .map((p) => {
      const isB = p.assigned === 'B';
      const isA = p.assigned === 'A';
      let bg = '#ffffff';
      let border = '#cbd5e1';
      let tagColor = '#64748b';
      if (isB) {
        bg = '#ecfdf5';
        border = '#10b981';
        tagColor = '#059669';
      } else if (isA) {
        bg = '#eff6ff';
        border = '#3b82f6';
        tagColor = '#2563eb';
      }

      return `
        <div style="display: flex; align-items: center; justify-content: space-between; padding: 4px 8px; border-radius: 6px; background: ${bg}; border: 1.5px solid ${border}; font-family: 'JetBrains Mono', monospace; font-size: 11px;">
          <span style="font-weight: 700; color: #334155;">P${p.id}</span>
          <span style="color: #64748b;">[A:$${p.costA}, B:$${p.costB}]</span>
          <span style="font-weight: 800; color: ${p.delta < 0 ? '#10b981' : '#b45309'};">Δ=${p.delta > 0 ? '+' : ''}${p.delta}</span>
          <span style="font-size: 10px; font-weight: 700; color: ${tagColor};">${p.assigned ? `➔ ${p.assigned}市` : '待定'}</span>
        </div>
      `;
    })
    .join('');

  container.innerHTML = `
    <div style="width: 100%; height: 100%; display: flex; flex-direction: column; gap: 6px; overflow-y: auto;">
      <div style="font-size: 11px; font-weight: 600; color: #475569; margin-bottom: 2px;">
        改派差额 Δ=(costB - costA) 升序列表：
      </div>
      ${deltaBars}
    </div>
  `;
}
