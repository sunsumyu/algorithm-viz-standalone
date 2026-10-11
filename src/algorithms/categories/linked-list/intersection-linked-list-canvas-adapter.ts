/**
 * 链表相交 — 画布渲染适配器
 */

import { ILLStep } from './intersection-linked-list-step-compiler';

export function renderIntersectionLinkedListCanvas(container: HTMLElement, step: ILLStep): void {
  const listA = step.listA;
  const listB = step.listB;
  const skipA = step.skipA;
  const skipB = step.skipB;
  const pa = step.pa;
  const pb = step.pb;
  const paOnList = step.paOnList;
  const pbOnList = step.pbOnList;

  const renderTrack = (title: string, list: number[], skip: number, listName: 'A' | 'B') => {
    const nodes = list
      .map((val, idx) => {
        const isIntersectNode = skip !== -1 && idx >= skip;
        const hasPa = paOnList === listName && pa === idx;
        const hasPb = pbOnList === listName && pb === idx;

        const pointerBadges: string[] = [];
        if (hasPa) pointerBadges.push('<span style="background:#2563eb; color:#ffffff; padding:1px 4px; border-radius:4px; font-size:9px; font-weight:800;">pA</span>');
        if (hasPb) pointerBadges.push('<span style="background:#059669; color:#ffffff; padding:1px 4px; border-radius:4px; font-size:9px; font-weight:800;">pB</span>');

        return `
          <div style="display: flex; align-items: center; gap: 4px;">
            <div style="display: flex; flex-direction: column; align-items: center; gap: 2px;">
              <div style="min-height: 12px; display: flex; gap: 2px;">
                ${pointerBadges.join('')}
              </div>
              <div style="min-width: 38px; height: 38px; padding: 0 8px; border-radius: 8px; background: ${isIntersectNode ? '#fdf2f8' : '#ffffff'}; border: 2px ${isIntersectNode ? 'solid #ec4899' : 'solid #e2e8f0'}; display: flex; flex-direction: column; align-items: center; justify-content: center; box-shadow: 0 1px 3px rgba(0,0,0,0.03);">
                <span style="font-size: 12px; font-weight: 800; color: ${isIntersectNode ? '#be185d' : '#0f172a'}; font-family: 'JetBrains Mono', monospace;">
                  ${val}
                </span>
                <span style="font-size: 8px; color: #94a3b8; font-family: monospace;">${listName}[${idx}]</span>
              </div>
            </div>
            ${idx < list.length - 1 ? '<span style="color:#cbd5e1; font-size:12px;">▶</span>' : ''}
          </div>
        `;
      })
      .join('');

    return `
      <div style="display: flex; align-items: center; gap: 8px;">
        <span style="font-size: 11px; font-weight: 800; color: #475569; min-width: 44px;">${title}:</span>
        <div style="display: flex; align-items: center; gap: 4px; overflow-x: auto; padding: 4px 0;">
          ${nodes}
          <span style="color:#cbd5e1; font-size:12px;">▶</span>
          <div style="min-width: 34px; height: 38px; border-radius: 8px; background: #f1f5f9; border: 1px dashed #cbd5e1; display: flex; align-items: center; justify-content: center; font-size: 10px; color: #94a3b8; font-family: monospace;">null</div>
        </div>
      </div>
    `;
  };

  container.innerHTML = `
    <div style="display: flex; flex-direction: column; gap: 10px;">
      ${renderTrack('链表 A', listA, skipA, 'A')}
      ${renderTrack('链表 B', listB, skipB, 'B')}
    </div>
  `;
}
