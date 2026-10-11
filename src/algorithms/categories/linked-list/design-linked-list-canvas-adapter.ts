/**
 * 设计链表 — 画布渲染适配器
 */

import { DLLStep } from './design-linked-list-step-compiler';

export function renderDesignLinkedListCanvas(container: HTMLElement, step: DLLStep): void {
  const values = step.values;

  // 虚拟头节点
  const dummyHtml = `
    <div style="display: flex; flex-direction: column; align-items: center; gap: 3px;">
      <div style="min-height: 14px; display: flex; gap: 2px;">
        <span style="background:#f59e0b; color:#ffffff; padding:1px 4px; border-radius:4px; font-size:9px; font-weight:800;">dummyHead</span>
      </div>
      <div style="min-width: 44px; height: 44px; padding: 0 8px; border-radius: 10px; background: #fffbeb; border: 2px dashed #f59e0b; display: flex; flex-direction: column; align-items: center; justify-content: center; box-shadow: 0 1px 3px rgba(0,0,0,0.03);">
        <span style="font-size: 13px; font-weight: 800; color: #b45309; font-family: 'JetBrains Mono', monospace;">0</span>
        <span style="font-size: 8.5px; color: #d97706; font-family: monospace;">[dummy]</span>
      </div>
    </div>
  `;

  const nodesHtml = values.map((val, idx) => {
    let borderColor = '#e2e8f0';
    let bgColor = '#ffffff';
    let badgeHtml = '';

    if (step.highlightIndex === idx) {
      if (step.highlightKind === 'add') {
        borderColor = '#10b981';
        bgColor = '#ecfdf5';
        badgeHtml = '<span style="background:#059669; color:#ffffff; padding:1px 4px; border-radius:4px; font-size:9px; font-weight:800;">+插入</span>';
      } else if (step.highlightKind === 'del') {
        borderColor = '#ef4444';
        bgColor = '#fef2f2';
        badgeHtml = '<span style="background:#ef4444; color:#ffffff; padding:1px 4px; border-radius:4px; font-size:9px; font-weight:800;">-删除</span>';
      } else if (step.highlightKind === 'get') {
        borderColor = '#2563eb';
        bgColor = '#eff6ff';
        badgeHtml = '<span style="background:#2563eb; color:#ffffff; padding:1px 4px; border-radius:4px; font-size:9px; font-weight:800;">?查询</span>';
      }
    }

    return `
      <div style="display: flex; align-items: center; color: #94a3b8; font-size: 14px; margin-top: 14px;">▶</div>
      <div style="display: flex; flex-direction: column; align-items: center; gap: 3px; position: relative;">
        <div style="min-height: 14px; display: flex; gap: 2px;">
          ${badgeHtml}
        </div>
        <div style="min-width: 44px; height: 44px; padding: 0 8px; border-radius: 10px; background: ${bgColor}; border: 2px solid ${borderColor}; display: flex; flex-direction: column; align-items: center; justify-content: center; box-shadow: 0 1px 3px rgba(0,0,0,0.03);">
          <span style="font-size: 13px; font-weight: 800; color: #0f172a; font-family: 'JetBrains Mono', monospace;">${val}</span>
          <span style="font-size: 8.5px; color: #94a3b8; font-family: monospace;">[${idx}]</span>
        </div>
      </div>
    `;
  });

  const nullHtml = `
    <div style="display: flex; align-items: center; color: #94a3b8; font-size: 14px; margin-top: 14px;">▶</div>
    <div style="display: flex; flex-direction: column; align-items: center; gap: 3px;">
      <div style="min-height: 14px;"></div>
      <div style="min-width: 40px; height: 44px; padding: 0 8px; border-radius: 10px; background: #f1f5f9; border: 1px dashed #cbd5e1; display: flex; align-items: center; justify-content: center;">
        <span style="font-size: 11px; font-weight: 700; color: #64748b; font-family: monospace;">null</span>
      </div>
    </div>
  `;

  container.innerHTML = `
    <div style="display: flex; align-items: center; gap: 6px; width: 100%; min-height: 100%;">
      ${dummyHtml}
      ${nodesHtml.join('')}
      ${nullHtml}
    </div>
  `;
}
