import { TwoCityStep } from './two-city-scheduling-step-compiler';

export function renderTwoCityCanvas(container: HTMLElement, step: TwoCityStep): void {
  const people = step.people || [];
  const assignedA = step.assignedA || [];
  const assignedB = step.assignedB || [];
  const halfN = Math.floor(people.length / 2);

  const aCardsHtml = assignedA.length === 0
    ? '<span style="color: #64748b; font-size: 11px; font-style: italic;">暂无旅客登机</span>'
    : assignedA.map((id) => {
        const p = people.find((item) => item.id === id);
        return `
          <div style="display: flex; align-items: center; justify-content: space-between; padding: 5px 10px; border-radius: 6px; background: rgba(59, 130, 246, 0.12); border: 1px solid rgba(59, 130, 246, 0.35); font-family: 'JetBrains Mono', monospace; font-size: 11px;">
            <div style="display: flex; align-items: center; gap: 6px;">
              <span style="font-weight: 800; color: #60a5fa;">🎫 P${id}</span>
              <span style="font-size: 10px; color: #94a3b8;">登机牌</span>
            </div>
            <span style="color: #38bdf8; font-weight: 800;">$${p ? p.costA : 0}</span>
          </div>
        `;
      }).join('');

  const bCardsHtml = assignedB.length === 0
    ? '<span style="color: #64748b; font-size: 11px; font-style: italic;">暂无旅客登机</span>'
    : assignedB.map((id) => {
        const p = people.find((item) => item.id === id);
        return `
          <div style="display: flex; align-items: center; justify-content: space-between; padding: 5px 10px; border-radius: 6px; background: rgba(16, 185, 129, 0.12); border: 1px solid rgba(16, 185, 129, 0.35); font-family: 'JetBrains Mono', monospace; font-size: 11px;">
            <div style="display: flex; align-items: center; gap: 6px;">
              <span style="font-weight: 800; color: #34d399;">🎫 P${id}</span>
              <span style="font-size: 10px; color: #94a3b8;">登机牌</span>
            </div>
            <span style="color: #10b981; font-weight: 800;">$${p ? p.costB : 0}</span>
          </div>
        `;
      }).join('');

  container.innerHTML = `
    <div style="width: 100%; height: 100%; display: flex; flex-direction: column; gap: 10px; box-sizing: border-box; background: #0f172a; padding: 12px; border-radius: 8px; border: 1px solid #1e293b;">
      <div style="display: flex; align-items: center; justify-content: space-between; font-size: 12px; font-weight: 700; color: #cbd5e1; border-bottom: 1px solid #1e293b; padding-bottom: 6px;">
        <div style="display: flex; align-items: center; gap: 8px;">
          <span>✈️ 双航站楼旅客调度沙盘 (2N = ${people.length} 人)</span>
          <span style="font-size: 10px; color: #94a3b8; font-weight: 600;">各需分配 ${halfN} 人</span>
        </div>
        <div style="display: flex; align-items: center; gap: 6px;">
          <span style="font-size: 10px; color: #94a3b8;">当前累计总支出:</span>
          <span style="color: #34d399; font-family: 'JetBrains Mono', monospace; font-weight: 800; font-size: 13px; background: rgba(16,185,129,0.15); padding: 2px 8px; border-radius: 4px; border: 1px solid rgba(16,185,129,0.3);">$${step.totalCost}</span>
        </div>
      </div>

      <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 12px; flex: 1;">
        <!-- A 城市登机口 -->
        <div style="display: flex; flex-direction: column; gap: 8px; padding: 10px; border-radius: 8px; background: #020617; border: 1.5px solid rgba(59, 130, 246, 0.4); box-shadow: 0 0 10px rgba(59,130,246,0.1);">
          <div style="display: flex; align-items: center; justify-content: space-between; font-size: 12px; font-weight: 700; color: #60a5fa; border-bottom: 1px solid rgba(59, 130, 246, 0.2); padding-bottom: 4px;">
            <span>🏙️ 航站楼 A (${assignedA.length} / ${halfN})</span>
            <span style="font-family: 'JetBrains Mono', monospace; color: #38bdf8;">支出: $${step.totalCostA}</span>
          </div>
          <div style="display: flex; flex-direction: column; gap: 5px; overflow-y: auto; max-height: 160px;">
            ${aCardsHtml}
          </div>
        </div>

        <!-- B 城市登机口 -->
        <div style="display: flex; flex-direction: column; gap: 8px; padding: 10px; border-radius: 8px; background: #020617; border: 1.5px solid rgba(16, 185, 129, 0.4); box-shadow: 0 0 10px rgba(16,185,129,0.1);">
          <div style="display: flex; align-items: center; justify-content: space-between; font-size: 12px; font-weight: 700; color: #34d399; border-bottom: 1px solid rgba(16, 185, 129, 0.2); padding-bottom: 4px;">
            <span>🏖️ 航站楼 B (${assignedB.length} / ${halfN})</span>
            <span style="font-family: 'JetBrains Mono', monospace; color: #10b981;">支出: $${step.totalCostB}</span>
          </div>
          <div style="display: flex; flex-direction: column; gap: 5px; overflow-y: auto; max-height: 160px;">
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
      let bg = '#1e293b';
      let border = '#334155';
      let tagBg = 'rgba(100, 116, 139, 0.2)';
      let tagColor = '#94a3b8';
      let deltaColor = p.delta < 0 ? '#34d399' : '#f59e0b';

      if (isB) {
        bg = 'rgba(16, 185, 129, 0.12)';
        border = '#10b981';
        tagBg = 'rgba(16, 185, 129, 0.2)';
        tagColor = '#34d399';
      } else if (isA) {
        bg = 'rgba(59, 130, 246, 0.12)';
        border = '#3b82f6';
        tagBg = 'rgba(59, 130, 246, 0.2)';
        tagColor = '#60a5fa';
      }

      return `
        <div style="display: flex; align-items: center; justify-content: space-between; padding: 5px 10px; border-radius: 6px; background: ${bg}; border: 1.5px solid ${border}; font-family: 'JetBrains Mono', monospace; font-size: 11px;">
          <span style="font-weight: 800; color: #f8fafc;">P${p.id}</span>
          <span style="color: #94a3b8;">[A:$${p.costA}, B:$${p.costB}]</span>
          <span style="font-weight: 800; color: ${deltaColor};">Δ=${p.delta > 0 ? '+' : ''}${p.delta}</span>
          <span style="font-size: 10px; font-weight: 700; padding: 2px 6px; border-radius: 4px; background: ${tagBg}; color: ${tagColor};">${p.assigned ? `➔ 登机 ${p.assigned} 市` : '待派发'}</span>
        </div>
      `;
    })
    .join('');

  container.innerHTML = `
    <div style="width: 100%; height: 100%; display: flex; flex-direction: column; gap: 8px; overflow-y: auto; background: #0f172a; padding: 12px; border-radius: 8px; border: 1px solid #1e293b;">
      <div style="display: flex; align-items: center; justify-content: space-between; font-size: 11px; font-weight: 700; color: #cbd5e1; border-bottom: 1px solid #1e293b; padding-bottom: 4px;">
        <span>💱 改派差额 Δ=(costB - costA) 升序调度队列</span>
        <span style="font-size: 10px; color: #38bdf8;">负值代表改去B更省钱</span>
      </div>
      <div style="display: flex; flex-direction: column; gap: 5px; flex: 1; overflow-y: auto;">
        ${deltaBars}
      </div>
    </div>
  `;
}
