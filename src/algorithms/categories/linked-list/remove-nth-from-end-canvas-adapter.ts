/**
 * 删除链表的倒数第 N 个结点 — 画布渲染适配器
 */

import { RNStep } from './remove-nth-from-end-step-compiler';

export function renderRemoveNthFromEndCanvas(container: HTMLElement, step: RNStep): void {
  const originalValues = step.originalValues ?? step.values;
  const fast = step.fast;
  const slow = step.slow;
  const removed = step.removedIndex;
  const isDone = step.action === 'done';

  const nodesHtml = originalValues
    .map((val, idx) => {
      const isFast = fast === idx;
      const isSlow = slow === idx;
      const isTarget = removed === idx;

      const pointerBadges: string[] = [];
      if (isSlow) pointerBadges.push('<span style="background: #059669; color: #ffffff; padding: 1px 4px; border-radius: 4px; font-size: 9px; font-weight: 800;">slow</span>');
      if (isFast) pointerBadges.push('<span style="background: #2563eb; color: #ffffff; padding: 1px 4px; border-radius: 4px; font-size: 9px; font-weight: 800;">fast</span>');

      return `
        <div style="display: flex; align-items: center; gap: 6px;">
          <!-- 节点盒 -->
          <div style="display: flex; flex-direction: column; align-items: center; gap: 3px;">
            <div style="min-height: 14px; display: flex; gap: 2px;">
              ${pointerBadges.join('')}
            </div>

            <div style="min-width: 44px; height: 44px; padding: 0 10px; border-radius: 10px; background: ${isTarget ? '#fef2f2' : isFast ? '#eff6ff' : isSlow ? '#ecfdf5' : '#ffffff'}; border: 2px ${isTarget ? 'dashed #ef4444' : isFast ? 'solid #2563eb' : isSlow ? 'solid #059669' : 'solid #e2e8f0'}; display: flex; flex-direction: column; align-items: center; justify-content: center; opacity: ${isDone && isTarget ? 0.35 : 1}; box-shadow: 0 2px 4px rgba(0,0,0,0.04);">
              <span style="font-size: 13.5px; font-weight: 800; color: ${isTarget ? '#ef4444' : isFast ? '#1d4ed8' : isSlow ? '#047857' : '#0f172a'}; font-family: 'JetBrains Mono', monospace; text-decoration: ${isDone && isTarget ? 'line-through' : 'none'};">
                ${val}
              </span>
              <span style="font-size: 8.5px; color: #94a3b8; font-family: monospace;">idx:${idx}</span>
            </div>

            <div style="font-size: 9px; color: ${isTarget ? '#ef4444' : '#64748b'}; font-weight: 700;">
              ${isTarget ? '待删' : `第 ${idx + 1} 项`}
            </div>
          </div>

          <!-- 连接箭头 -->
          ${
            idx < originalValues.length - 1
              ? `<div style="font-size: 14px; font-weight: 800; color: ${isDone && isTarget ? '#ef4444' : '#cbd5e1'};">▶</div>`
              : ''
          }
        </div>
      `;
    })
    .join('');

  container.innerHTML = `
    <div style="display: flex; flex-direction: column; gap: 8px;">
      <div style="display: flex; align-items: center; gap: 6px; overflow-x: auto; padding: 6px 2px; min-height: 80px;">
        <!-- dummyHead 节点 -->
        <div style="display: flex; flex-direction: column; align-items: center; gap: 3px;">
          <div style="min-height: 14px; display: flex; gap: 2px;">
            ${slow === -1 ? '<span style="background: #059669; color: #ffffff; padding: 1px 4px; border-radius: 4px; font-size: 9px; font-weight: 800;">slow</span>' : ''}
            ${fast === -1 ? '<span style="background: #2563eb; color: #ffffff; padding: 1px 4px; border-radius: 4px; font-size: 9px; font-weight: 800;">fast</span>' : ''}
          </div>
          <div style="min-width: 44px; height: 44px; border-radius: 10px; background: #f8fafc; border: 2px solid #64748b; display: flex; flex-direction: column; align-items: center; justify-content: center;">
            <span style="font-size: 11px; font-weight: 800; color: #334155; font-family: monospace;">dummy</span>
            <span style="font-size: 8.5px; color: #64748b;">(0)</span>
          </div>
          <div style="font-size: 9px; color: #64748b; font-weight: 700;">虚拟头</div>
        </div>

        <div style="font-size: 14px; font-weight: 800; color: #94a3b8;">▶</div>

        ${nodesHtml}

        <div style="font-size: 14px; font-weight: 800; color: #cbd5e1;">▶</div>

        <!-- 末尾 null -->
        <div style="display: flex; flex-direction: column; align-items: center; gap: 3px;">
          <div style="min-height: 14px;">
            ${fast >= originalValues.length ? '<span style="background: #2563eb; color: #ffffff; padding: 1px 4px; border-radius: 4px; font-size: 9px; font-weight: 800;">fast</span>' : ''}
          </div>
          <div style="min-width: 40px; height: 44px; border-radius: 10px; background: #f1f5f9; border: 1.5px dashed #cbd5e1; display: flex; align-items: center; justify-content: center; font-size: 11px; font-weight: 700; color: #94a3b8; font-family: monospace;">
            null
          </div>
          <div style="font-size: 9px; color: #94a3b8;">末尾终止</div>
        </div>
      </div>
    </div>
  `;
}
