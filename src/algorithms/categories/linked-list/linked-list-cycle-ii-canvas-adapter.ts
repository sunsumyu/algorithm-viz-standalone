/**
 * 环形链表 II — 画布渲染适配器
 */

import { CycleStep } from './linked-list-cycle-ii-step-compiler';

export function renderLinkedListCycleIICanvas(container: HTMLElement, step: CycleStep): void {
  const values = step.values;
  const pos = step.pos;
  const isPhase2 = step.phase === 'find_entry' || step.phase === 'done_entrance';

  const nodesHtml = values
    .map((val, idx) => {
      const isEntrance = pos !== -1 && idx === pos;
      const isMeetNode = step.meetIndex !== -1 && idx === step.meetIndex;

      const pointerBadges: string[] = [];
      if (step.slow === idx) {
        pointerBadges.push(
          `<span style="background:#059669; color:#ffffff; padding:1px 4px; border-radius:4px; font-size:9px; font-weight:800;">${isPhase2 ? 'idx1' : 'slow'}</span>`
        );
      }
      if (step.fast === idx) {
        pointerBadges.push(
          `<span style="background:#2563eb; color:#ffffff; padding:1px 4px; border-radius:4px; font-size:9px; font-weight:800;">${isPhase2 ? 'idx2' : 'fast'}</span>`
        );
      }

      let borderColor = '#e2e8f0';
      let bgColor = '#ffffff';
      if (isEntrance) {
        borderColor = '#ec4899';
        bgColor = '#fdf2f8';
      }
      if (isMeetNode) {
        borderColor = '#8b5cf6';
      }

      return `
        <div style="display: flex; flex-direction: column; align-items: center; gap: 3px; position: relative;">
          <div style="min-height: 14px; display: flex; gap: 2px;">
            ${pointerBadges.join('')}
          </div>
          <div style="min-width: 44px; height: 44px; padding: 0 8px; border-radius: 10px; background: ${bgColor}; border: 2px solid ${borderColor}; display: flex; flex-direction: column; align-items: center; justify-content: center; box-shadow: 0 1px 3px rgba(0,0,0,0.03);">
            <span style="font-size: 13px; font-weight: 800; color: ${isEntrance ? '#be185d' : '#0f172a'}; font-family: 'JetBrains Mono', monospace;">
              ${val}
            </span>
            <span style="font-size: 8.5px; color: #94a3b8; font-family: monospace;">[${idx}]</span>
          </div>
          ${isEntrance ? '<span style="font-size: 9px; color: #ec4899; font-weight: 800;">入环点</span>' : ''}
          ${isMeetNode ? '<span style="font-size: 9px; color: #8b5cf6; font-weight: 800;">相遇点</span>' : ''}
        </div>
      `;
    })
    .join(`
      <div style="display: flex; align-items: center; color: #94a3b8; font-size: 14px; margin-top: 14px;">▶</div>
    `);

  const loopBackHtml =
    pos !== -1
      ? `
    <div style="width: 100%; display: flex; align-items: center; justify-content: center; margin-top: 8px;">
      <div style="display: flex; align-items: center; gap: 6px; padding: 4px 12px; border-radius: 20px; background: #fdf2f8; border: 1px dashed #ec4899; color: #be185d; font-size: 10.5px; font-weight: 700;">
        <span>↩ 末尾节点 [${values.length - 1}] 指向入环节点 [${pos}] (构成环状闭合)</span>
      </div>
    </div>
  `
      : `
    <div style="width: 100%; display: flex; align-items: center; justify-content: center; margin-top: 8px;">
      <div style="display: flex; align-items: center; gap: 6px; padding: 4px 12px; border-radius: 20px; background: #f1f5f9; border: 1px dashed #cbd5e1; color: #64748b; font-size: 10.5px;">
        <span>末尾节点指向 null (无环线性单链表)</span>
      </div>
    </div>
  `;

  container.innerHTML = `
    <div style="display: flex; flex-direction: column; align-items: center; gap: 8px; width: 100%;">
      <div style="display: flex; align-items: center; gap: 8px; overflow-x: auto; padding: 6px 0;">
        ${nodesHtml}
      </div>
      ${loopBackHtml}
    </div>
  `;
}
