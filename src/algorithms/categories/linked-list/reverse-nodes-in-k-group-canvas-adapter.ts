/**
 * K 个一组翻转链表 — 画布渲染适配器
 */

import { KGroupStep } from './reverse-nodes-in-k-group-step-compiler';

export function renderReverseKGroupCanvas(container: HTMLElement, step: KGroupStep): void {
  const currentRange = step.groupRange;
  container.innerHTML = `
    <div style="height: 100%; display: flex; flex-direction: column; align-items: center; justify-content: center; padding: 8px; box-sizing: border-box; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">
      <div style="font-size: 11.5px; font-weight: 700; color: #334155; margin-bottom: 10px; display: flex; align-items: center; gap: 8px;">
        <span>单链表动态拓扑结构</span>
        <span style="font-size: 10px; font-weight: 600; color: #64748b; background: #f1f5f9; padding: 2px 8px; border-radius: 999px;">彩色边框指示当前活跃组</span>
      </div>

      <div style="display: flex; gap: 8px; align-items: center; flex-wrap: nowrap; overflow-x: auto; max-width: 100%; padding: 16px 20px; background: #ffffff; border: 1px solid #e2e8f0; border-radius: 12px; box-shadow: 0 2px 8px rgba(0,0,0,0.04); box-sizing: border-box;">
        <!-- dummy head -->
        <div style="display: flex; flex-direction: column; align-items: center; gap: 4px; flex-shrink: 0;">
          <div style="padding: 5px 8px; background: #f1f5f9; border: 1px dashed #94a3b8; color: #475569; border-radius: 8px; font-size: 11px; font-weight: 700;">
            dummy(0)
          </div>
          <span style="font-size: 8.5px; color: #94a3b8; font-family: monospace;">哨兵头</span>
        </div>
        <span style="color: #94a3b8; font-size: 14px; font-weight: bold; flex-shrink: 0;">➔</span>

        ${step.nodes
          .map((val, idx) => {
            const inRange = currentRange && idx >= currentRange[0] && idx <= currentRange[1];
            const isReversedGroup = inRange && step.isReversed;

            let bg = '#ffffff';
            let border = '1px solid #cbd5e1';
            let textCol = '#0f172a';
            let shadow = '0 1px 3px rgba(0,0,0,0.03)';

            if (isReversedGroup) {
              bg = '#ecfdf5';
              border = '2px solid #10b981';
              textCol = '#065f46';
              shadow = '0 2px 8px rgba(16, 185, 129, 0.25)';
            } else if (inRange) {
              bg = '#f0f9ff';
              border = '2px solid #0284c7';
              textCol = '#0369a1';
              shadow = '0 2px 8px rgba(2, 132, 199, 0.25)';
            }

            return `
            <div style="display: flex; align-items: center; gap: 8px; flex-shrink: 0;">
              <div style="display: flex; flex-direction: column; align-items: center; gap: 4px;">
                <div style="
                  width: 42px;
                  height: 42px;
                  background: ${bg};
                  border: ${border};
                  border-radius: 9px;
                  color: ${textCol};
                  display: flex;
                  flex-direction: column;
                  align-items: center;
                  justify-content: center;
                  box-shadow: ${shadow};
                  transition: all 0.2s ease;
                ">
                  <span style="font-size: 14px; font-weight: 800; font-family: 'JetBrains Mono', monospace;">${val}</span>
                  <span style="font-size: 8.5px; color: #64748b; font-weight: 600;">#${idx}</span>
                </div>
                ${inRange ? `<span style="font-size: 9px; font-weight: 700; color: ${isReversedGroup ? '#059669' : '#0284c7'};">组${Math.floor(idx / step.k) + 1}</span>` : '<span style="font-size: 9px; color: transparent;">-</span>'}
              </div>
              ${
                idx < step.nodes.length - 1
                  ? '<span style="color: #3b82f6; font-size: 14px; font-weight: bold;">➔</span>'
                  : '<span style="color: #64748b; font-size: 10px; font-weight: 700; background: #f1f5f9; padding: 2px 5px; border-radius: 4px;">➔ null</span>'
              }
            </div>
          `;
          })
          .join('')}
      </div>
    </div>
  `;
}

export function renderReverseKGroupAuxiliary(container: HTMLElement, step: KGroupStep): void {
  container.innerHTML = `
    <div style="padding: 10px 12px; background: #ffffff; border: 1px solid #e2e8f0; border-radius: 10px; box-shadow: 0 1px 3px rgba(0,0,0,0.04);">
      <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 6px;">
        <span style="font-size: 11px; font-weight: 700; color: #1e293b;">💡 局部翻转与边界缝合精髓</span>
        ${step.statusBadge ? `<span style="font-size: 10px; font-weight: 700; padding: 2px 6px; border-radius: 999px; background: #eff6ff; color: #1d4ed8; border: 1px solid #bfdbfe;">${step.statusBadge.text}</span>` : ''}
      </div>
      <div style="font-size: 11px; color: #475569; line-height: 1.6;">
        每组由 <code>pre</code> 定位前驱、<code>end</code> 探查向前推进 <code>k</code> 步；若节点不足直接 break 终止；若充足断开 <code>end.next</code> 局部反转，将新尾节点与后续组缝合，实现 $O(N)$ 一趟线性扫描且空间严格 $O(1)$！
      </div>
      <div style="margin-top: 8px; font-size: 11.5px; font-weight: 600; color: #2563eb; background: #eff6ff; padding: 6px 10px; border-radius: 6px; border: 1px solid #bfdbfe;">
        ${step.decision}
      </div>
    </div>
  `;
}
