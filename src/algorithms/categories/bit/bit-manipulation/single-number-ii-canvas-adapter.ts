/**
 * 只出现一次的数字 II (Single Number II) - 视觉适配器
 */

import { SingleNumberIIStep } from './single-number-ii-step-compiler';
import { renderBitGrid } from './bit-shared';

export function renderSingleNumberIICanvas(stageContainer: HTMLElement, step: SingleNumberIIStep): void {
  stageContainer.innerHTML = '';

  const root = document.createElement('div');
  root.style.cssText = 'display: flex; flex-direction: column; gap: 12px; width: 100%; height: 100%; box-sizing: border-box;';

  // 1. 数组元素卡片列表
  const arrayCard = document.createElement('div');
  arrayCard.style.cssText = 'padding: 12px 14px; background: #ffffff; border-radius: 8px; border: 1px solid #e2e8f0;';
  const items = step.nums.map((val, idx) => {
    const isCur = step.stateView?.curIndex === idx;
    return `
      <div style="min-width: 44px; padding: 6px; border-radius: 6px; text-align: center; font-family: monospace; background: ${isCur ? '#fef3c7' : '#f8fafc'}; border: 1.5px solid ${isCur ? '#f59e0b' : '#cbd5e1'};">
        <div style="font-size: 10px; color: #64748b;">[${idx}]</div>
        <div style="font-size: 14px; font-weight: 800; color: ${isCur ? '#b45309' : '#1e293b'};">${val}</div>
      </div>
    `;
  }).join('');
  arrayCard.innerHTML = `
    <div style="font-size: 12px; font-weight: 700; color: #1e293b; margin-bottom: 8px;">📊 数组遍历进度:</div>
    <div style="display: flex; gap: 6px; overflow-x: auto; padding-bottom: 4px;">${items}</div>
  `;
  root.appendChild(arrayCard);

  // 2. 状态寄存器对比
  if (step.stateView) {
    const stateCard = document.createElement('div');
    stateCard.style.cssText = 'display: grid; grid-template-columns: 1fr 1fr; gap: 10px;';

    const onesVal = step.stateView.ones ?? 0;
    const twosVal = step.stateView.twos ?? 0;

    stateCard.innerHTML = `
      <div style="padding: 10px 14px; background: #eff6ff; border: 1.5px solid #3b82f6; border-radius: 8px;">
        <div style="font-size: 11px; font-weight: 700; color: #1d4ed8; margin-bottom: 4px;">⚡ 出现 1 次寄存器 (ones)</div>
        <div style="font-size: 18px; font-weight: 800; color: #1e40af; font-family: monospace;">${onesVal}</div>
        <div style="font-size: 11px; color: #3b82f6; font-family: monospace;">0b${(onesVal >>> 0).toString(2).padStart(8, '0')}</div>
      </div>
      <div style="padding: 10px 14px; background: #fdf4ff; border: 1.5px solid #c084fc; border-radius: 8px;">
        <div style="font-size: 11px; font-weight: 700; color: #7e22ce; margin-bottom: 4px;">🌀 出现 2 次寄存器 (twos)</div>
        <div style="font-size: 18px; font-weight: 800; color: #6b21a8; font-family: monospace;">${twosVal}</div>
        <div style="font-size: 11px; color: #a855f7; font-family: monospace;">0b${(twosVal >>> 0).toString(2).padStart(8, '0')}</div>
      </div>
    `;
    root.appendChild(stateCard);
  }

  // 3. 当前二进制视效
  if (step.bitView) {
    renderBitGrid(root, step.bitView.title || '二进制', step.bitView.num, step.bitView.bitsCount || 16, step.bitView.highlightMask || 0);
  }

  // 4. 决策提示
  const info = document.createElement('div');
  info.style.cssText = 'padding: 8px 12px; background: #f8fafc; border-radius: 6px; border-left: 3px solid #3b82f6; font-size: 12px; color: #334155;';
  info.textContent = step.decision;
  root.appendChild(info);

  stageContainer.appendChild(root);
}
