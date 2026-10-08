import type { GasStationStep } from './gas-station-step-compiler';

export function renderGasStationCanvas(container: HTMLElement, step: GasStationStep): void {
  const gas = step.gas;
  const cost = step.cost;
  const n = gas.length;

  if (n === 0) {
    container.innerHTML =
      '<div style="display:flex;align-items:center;justify-content:center;height:100%;color:#94a3b8;font-size:12px;">输入为空</div>';
    return;
  }

  const curIdx = step.currentIndex;
  const isSuccess = step.action === 'success';
  const isFailed = step.action === 'failed';

  const stationsHtml = gas
    .map((g, idx) => {
      const c = cost[idx] ?? 0;
      const net = g - c;
      const isCurrent = idx === curIdx && !isSuccess && !isFailed;
      const isCandidateStart = idx === step.startStation;
      const isEliminated = step.failedStations.includes(idx);

      let bg = '#ffffff';
      let borderColor = '#e2e8f0';
      let textColor = '#0f172a';

      if (isCurrent) {
        bg = '#eff6ff';
        borderColor = '#2563eb';
        textColor = '#2563eb';
      } else if (isSuccess && isCandidateStart) {
        bg = '#ecfdf5';
        borderColor = '#10b981';
        textColor = '#059669';
      } else if (isCandidateStart) {
        bg = '#fffbeb';
        borderColor = '#d97706';
        textColor = '#b45309';
      } else if (isEliminated) {
        bg = '#fef2f2';
        borderColor = '#fca5a5';
        textColor = '#94a3b8';
      }

      return `
        <div style="display: flex; flex-direction: column; align-items: center; gap: 4px;">
          <span style="font-size: 9px; color: ${isCandidateStart ? '#d97706' : isCurrent ? '#2563eb' : '#94a3b8'}; font-weight: 700;">
            ${isCandidateStart ? '🚩 起点' : isCurrent ? '📍 当前' : `[${idx}]`}
          </span>
          <div style="width: 52px; height: 56px; border-radius: 12px; background: ${bg}; border: 2px solid ${borderColor}; display: flex; flex-direction: column; align-items: center; justify-content: center; font-size: 13px; font-weight: 800; color: ${textColor}; font-family: 'JetBrains Mono', monospace; box-shadow: 0 2px 4px rgba(0,0,0,0.04); gap: 1px;">
            <span style="font-size: 10px; color: #64748b;">+${g} / -${c}</span>
            <span style="font-size: 13px; color: ${net >= 0 ? '#059669' : '#dc2626'};">${net >= 0 ? `+${net}` : net}</span>
          </div>
          <span style="font-size: 8.5px; color: ${isEliminated ? '#ef4444' : net >= 0 ? '#059669' : '#64748b'}; font-weight: 700;">
            ${isEliminated ? '✕ 排除' : net >= 0 ? '盈余' : '亏损'}
          </span>
        </div>
      `;
    })
    .join('');

  container.innerHTML = `
    <div style="width: 100%; height: 100%; display: flex; flex-direction: column; justify-content: center; gap: 8px; padding: 12px; box-sizing: border-box;">
      <!-- 总体状况栏 -->
      <div style="display: flex; align-items: center; justify-content: space-between; font-size: 11px; font-weight: 700; color: #475569;">
        <span>当前候选起点: <strong style="color: #d97706; font-family: monospace;">[${step.startStation >= 0 && step.startStation < n ? step.startStation : '-'}]</strong></span>
        <span>全局净油量: <strong style="color: ${step.totalTank >= 0 ? '#059669' : '#dc2626'}; font-family: monospace;">${step.totalTank >= 0 ? `+${step.totalTank}` : step.totalTank}L</strong></span>
      </div>

      <!-- 站点水平流 -->
      <div style="display: flex; gap: 8px; overflow-x: auto; justify-content: center; padding: 4px 0;">
        ${stationsHtml}
      </div>
    </div>
  `;
}
