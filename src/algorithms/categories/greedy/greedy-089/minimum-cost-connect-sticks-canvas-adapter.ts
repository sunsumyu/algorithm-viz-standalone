import { ConnectSticksStep } from './minimum-cost-connect-sticks-step-compiler';
import { renderDualHeapVisual } from './greedy-089-shared';

export function renderConnectSticksCanvas(container: HTMLElement, step: ConnectSticksStep): void {
  const history = step.mergeHistory || [];
  const last = history[history.length - 1];

  const historyItems = history
    .map((h, idx) => `
      <div style="display: inline-flex; align-items: center; gap: 8px; padding: 6px 12px; border-radius: 6px; background: #1e293b; border: 1.5px solid #334155; font-family: 'JetBrains Mono', monospace; font-size: 11px;">
        <span style="color: #64748b; font-size: 10px;">步骤 #${idx + 1}</span>
        <span style="font-weight: 700; color: #f8fafc;">${h.leftVal} + ${h.rightVal}</span>
        <span style="color: #38bdf8; font-weight: 800;">➔ ${h.val}</span>
      </div>
    `)
    .join('');

  container.innerHTML = `
    <div style="width: 100%; height: 100%; display: flex; flex-direction: column; gap: 12px; box-sizing: border-box; justify-content: center; background: #0f172a; padding: 12px; border-radius: 8px; border: 1px solid #1e293b;">
      <div style="display: flex; align-items: center; justify-content: space-between; border-bottom: 1px solid #1e293b; padding-bottom: 6px;">
        <span style="font-size: 12px; font-weight: 700; color: #cbd5e1;">🪵 木棒哈夫曼两两合并工坊 (Lumber Fusion Mill)</span>
        <div style="display: flex; align-items: center; gap: 6px;">
          <span style="font-size: 10px; color: #94a3b8;">累计总代价:</span>
          <span style="font-size: 12px; font-weight: 800; color: #34d399; font-family: 'JetBrains Mono', monospace; background: rgba(16,185,129,0.15); padding: 2px 8px; border-radius: 4px; border: 1px solid rgba(16,185,129,0.3);">${step.totalCost}</span>
        </div>
      </div>

      ${last ? `
        <div style="display: flex; align-items: center; justify-content: center; gap: 10px; padding: 14px; border-radius: 8px; background: rgba(16, 185, 129, 0.1); border: 2px solid #10b981; box-shadow: 0 0 14px rgba(16, 185, 129, 0.2);">
          <span style="font-size: 13px; font-weight: 800; color: #34d399;">⚡ 当前两两融合：</span>
          <span style="font-size: 18px; font-family: 'JetBrains Mono', monospace; font-weight: 900; color: #f8fafc;">
            <span style="color: #38bdf8;">${last.leftVal}</span> + <span style="color: #38bdf8;">${last.rightVal}</span> <span style="color: #10b981;">➔</span> <span style="color: #34d399; text-shadow: 0 0 8px rgba(52,211,153,0.6);">${last.val}</span>
          </span>
        </div>
      ` : '<div style="text-align: center; color: #64748b; font-size: 12px; font-style: italic; padding: 14px; background: #020617; border-radius: 8px; border: 1px solid #1e293b;">等待合并第一对最短木棒...</div>'}

      <div style="display: flex; flex-direction: column; gap: 6px;">
        <span style="font-size: 11px; font-weight: 700; color: #94a3b8;">融合历史流水线 (Merge History):</span>
        <div style="display: flex; align-items: center; gap: 8px; flex-wrap: wrap; padding: 10px; background: #020617; border-radius: 8px; border: 1px solid #1e293b; max-height: 120px; overflow-y: auto;">
          ${historyItems || '<span style="color: #64748b; font-size: 11px;">暂无历史合并记录</span>'}
        </div>
      </div>
      <div style="font-size: 10px; color: #64748b; line-height: 1.4; border-top: 1px solid #1e293b; padding-top: 4px;">
        💡 哈夫曼贪心原理：越早合并的木棒长度，会在后续每一次合并中被反复累加，因此必须保证每次从堆中取出最短的两根进行合并。
      </div>
    </div>
  `;
}

export function renderConnectSticksMetrics(container: HTMLElement, step: ConnectSticksStep): void {
  const heapItems = step.heap || [];
  renderDualHeapVisual(container, heapItems, 'min', '小根堆 (维护当前所有木棒长度)');
}
