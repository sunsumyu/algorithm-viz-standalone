import { ConnectSticksStep } from './minimum-cost-connect-sticks-step-compiler';
import { renderDualHeapVisual } from './greedy-089-shared';

export function renderConnectSticksCanvas(container: HTMLElement, step: ConnectSticksStep): void {
  const history = step.mergeHistory || [];
  const last = history[history.length - 1];

  const historyItems = history
    .map((h, idx) => `
      <div style="display: inline-flex; align-items: center; gap: 6px; padding: 4px 10px; border-radius: 6px; background: #ffffff; border: 1.5px solid #cbd5e1; font-family: 'JetBrains Mono', monospace; font-size: 11px;">
        <span style="color: #64748b; font-size: 10px;">#${idx + 1}</span>
        <span style="font-weight: 700; color: #1e293b;">${h.leftVal} + ${h.rightVal}</span>
        <span style="color: #3b82f6; font-weight: 800;">➔ ${h.val}</span>
      </div>
    `)
    .join('');

  container.innerHTML = `
    <div style="width: 100%; height: 100%; display: flex; flex-direction: column; gap: 12px; box-sizing: border-box; justify-content: center;">
      <div style="display: flex; align-items: center; justify-content: space-between; border-bottom: 1px solid #f1f5f9; padding-bottom: 4px;">
        <span style="font-size: 12px; font-weight: 700; color: #475569;">🌲 哈夫曼合并历史记录</span>
        <span style="font-size: 12px; font-weight: 800; color: #10b981; font-family: 'JetBrains Mono', monospace;">累计总费用: ${step.totalCost}</span>
      </div>

      ${last ? `
        <div style="display: flex; align-items: center; justify-content: center; gap: 8px; padding: 12px; border-radius: 8px; background: #f0fdf4; border: 2px solid #86efac;">
          <span style="font-size: 13px; font-weight: 700; color: #166534;">当前合并：</span>
          <span style="font-size: 16px; font-family: 'JetBrains Mono', monospace; font-weight: 800; color: #15803d;">${last.leftVal} + ${last.rightVal} ➔ ${last.val}</span>
        </div>
      ` : '<div style="text-align: center; color: #94a3b8; font-size: 12px; font-style: italic;">等待合并开始...</div>'}

      <div style="display: flex; align-items: center; gap: 8px; flex-wrap: wrap; padding: 8px; background: #f8fafc; border-radius: 8px; border: 1px solid #e2e8f0; max-height: 120px; overflow-y: auto;">
        ${historyItems || '<span style="color: #94a3b8; font-size: 11px;">暂无历史合并</span>'}
      </div>
    </div>
  `;
}

export function renderConnectSticksMetrics(container: HTMLElement, step: ConnectSticksStep): void {
  const heapItems = step.heap || [];
  renderDualHeapVisual(container, heapItems, 'min', '小根堆 (维护当前所有木棒长度)');
}
