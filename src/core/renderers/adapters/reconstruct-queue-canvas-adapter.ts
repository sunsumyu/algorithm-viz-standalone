import type { RQStep } from './reconstruct-queue-step-compiler';

/** 主视觉：排序流 + 重建队列沙盘 */
export function renderReconstructQueueCanvas(container: HTMLElement, step: RQStep): void {
  const sorted = step.sorted;
  const queue = step.queue;
  const n = sorted.length;

  if (n === 0) {
    container.innerHTML = '<div style="display:flex;align-items:center;justify-content:center;height:100%;color:#94a3b8;font-size:12px;">输入为空</div>';
    return;
  }

  const curIdx = step.currentIndex;
  const isDone = step.action === 'done';

  const sortedHtml = sorted
    .map(([h, k], idx) => {
      const isCurrent = idx === curIdx && !isDone;
      const isProcessed = idx < curIdx || isDone;

      let bg = '#ffffff';
      let borderColor = '#e2e8f0';
      let textColor = '#0f172a';

      if (isCurrent) {
        bg = '#f0fdf4';
        borderColor = '#16a34a';
        textColor = '#16a34a';
      } else if (isProcessed) {
        bg = '#f8fafc';
        borderColor = '#cbd5e1';
        textColor = '#94a3b8';
      }

      return `
        <div style="width: 44px; height: 42px; border-radius: 8px; background: ${bg}; border: 1.5px solid ${borderColor}; display: flex; flex-direction: column; align-items: center; justify-content: center; font-size: 11px; font-weight: 800; color: ${textColor}; font-family: 'JetBrains Mono', monospace; box-shadow: 0 1px 2px rgba(0,0,0,0.03);">
          <span>${h}</span>
          <span style="font-size: 8.5px; color: #64748b;">k=${k}</span>
        </div>
      `;
    })
    .join('');

  const queueHtml = queue
    .map(([h, k], idx) => {
      const isJustInserted = idx === step.insertIndex;

      let bg = '#ffffff';
      let borderColor = '#a7f3d0';
      let textColor = '#065f46';

      if (isJustInserted) {
        bg = '#ecfdf5';
        borderColor = '#10b981';
        textColor = '#047857';
      }

      return `
        <div style="display: flex; flex-direction: column; align-items: center; gap: 2px;">
          <span style="font-size: 8.5px; color: ${isJustInserted ? '#10b981' : '#94a3b8'}; font-weight: 700;">
            [${idx}]
          </span>
          <div style="width: 46px; height: 46px; border-radius: 10px; background: ${bg}; border: 2px solid ${borderColor}; display: flex; flex-direction: column; align-items: center; justify-content: center; font-size: 12px; font-weight: 800; color: ${textColor}; font-family: 'JetBrains Mono', monospace; box-shadow: 0 2px 4px rgba(0,0,0,0.04);">
            <span>h=${h}</span>
            <span style="font-size: 9px; color: #059669; font-weight: 700;">k=${k}</span>
          </div>
        </div>
      `;
    })
    .join('');

  container.innerHTML = `
    <div style="width: 100%; height: 100%; display: flex; flex-direction: column; justify-content: center; gap: 8px; padding: 12px; box-sizing: border-box;">
      <div style="display: flex; justify-content: space-between; font-size: 10.5px; font-weight: 700; color: #475569;">
        <span>1️⃣ 待插入序列 (按身高降序, k 升序):</span>
        <span style="color: #16a34a;">已处理: ${Math.min(n, Math.max(0, curIdx + 1))} / ${n}</span>
      </div>
      <div style="display: flex; gap: 6px; overflow-x: auto; padding: 2px 0;">
        ${sortedHtml}
      </div>

      <div style="display: flex; justify-content: space-between; font-size: 10.5px; font-weight: 700; color: #059669; margin-top: 4px; border-top: 1px dashed #e2e8f0; padding-top: 6px;">
        <span>2️⃣ 重建后的队列 (按照 k 值精准插入对应槽位):</span>
        <span>当前队长: ${queue.length}</span>
      </div>
      <div style="display: flex; gap: 6px; overflow-x: auto; padding: 2px 0; min-height: 52px; align-items: center;">
        ${queue.length > 0 ? queueHtml : '<span style="font-size: 11px; color: #94a3b8; padding-left: 4px;">队列初始为空...</span>'}
      </div>
    </div>
  `;
}
