/**
 * 只出现一次的数字 III (Single Number III) - 视觉适配器
 */

import { SingleNumberIIIStep } from './single-number-iii-step-compiler';
import { renderBitGrid } from './bit-shared';

export function renderSingleNumberIIICanvas(stageContainer: HTMLElement, step: SingleNumberIIIStep): void {
  stageContainer.innerHTML = '';

  const root = document.createElement('div');
  root.style.cssText = 'display: flex; flex-direction: column; gap: 12px; width: 100%; height: 100%; box-sizing: border-box;';

  // 1. 分组卡片双栏
  if (step.groupView) {
    const groupCard = document.createElement('div');
    groupCard.style.cssText = 'display: grid; grid-template-columns: 1fr 1fr; gap: 10px;';

    const gA = step.groupView.groupA || [];
    const gB = step.groupView.groupB || [];

    groupCard.innerHTML = `
      <div style="padding: 10px 14px; background: #f0fdf4; border: 1.5px solid #22c55e; border-radius: 8px;">
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 6px;">
          <span style="font-size: 11px; font-weight: 700; color: #15803d;">🌟 组 A (第 ${step.groupView.diffBitPos} 位为 1)</span>
          <span style="font-size: 11px; font-weight: 800; color: #15803d; font-family: monospace;">异或和 = ${step.groupView.xorA ?? 0}</span>
        </div>
        <div style="display: flex; flex-wrap: wrap; gap: 4px;">
          ${gA.map(n => `<span style="padding: 2px 6px; background: #ffffff; border: 1px solid #86efac; border-radius: 4px; font-size: 12px; font-weight: 700; color: #166534; font-family: monospace;">${n}</span>`).join('') || '<span style="font-size: 11px; color: #94a3b8;">暂无元素</span>'}
        </div>
      </div>
      <div style="padding: 10px 14px; background: #eff6ff; border: 1.5px solid #3b82f6; border-radius: 8px;">
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 6px;">
          <span style="font-size: 11px; font-weight: 700; color: #1d4ed8;">⚡ 组 B (第 ${step.groupView.diffBitPos} 位为 0)</span>
          <span style="font-size: 11px; font-weight: 800; color: #1d4ed8; font-family: monospace;">异或和 = ${step.groupView.xorB ?? 0}</span>
        </div>
        <div style="display: flex; flex-wrap: wrap; gap: 4px;">
          ${gB.map(n => `<span style="padding: 2px 6px; background: #ffffff; border: 1px solid #93c5fd; border-radius: 4px; font-size: 12px; font-weight: 700; color: #1e40af; font-family: monospace;">${n}</span>`).join('') || '<span style="font-size: 11px; color: #94a3b8;">暂无元素</span>'}
        </div>
      </div>
    `;
    root.appendChild(groupCard);
  }

  // 2. 二进制位视效
  if (step.bitView) {
    renderBitGrid(root, step.bitView.title || '二进制', step.bitView.num, step.bitView.bitsCount || 16, step.bitView.highlightMask || 0);
  }

  // 3. 决策信息
  const info = document.createElement('div');
  info.style.cssText = 'padding: 8px 12px; background: #f8fafc; border-radius: 6px; border-left: 3px solid #3b82f6; font-size: 12px; color: #334155;';
  info.textContent = step.decision;
  root.appendChild(info);

  stageContainer.appendChild(root);
}
