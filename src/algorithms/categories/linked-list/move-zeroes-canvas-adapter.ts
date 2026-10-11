/**
 * 移动零 — 画布渲染适配器
 */

import { MoveZeroesStep } from './move-zeroes-step-compiler';

export function renderMoveZeroesCanvas(container: HTMLElement, step: MoveZeroesStep): void {
  const n = step.nums.length;
  let html = `
    <div style="display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 16px; padding: 12px; width: 100%; height: 100%; box-sizing: border-box;">
      <div style="font-size: 11.5px; font-weight: 700; color: #1e293b; display: flex; align-items: center; gap: 6px;">
        <span>数组内存结构 (长度 ${n})</span>
        <span style="font-size: 10.5px; font-weight: normal; color: #64748b;">[0..slow-1 为已整理非零区]</span>
      </div>
      <div style="display: flex; gap: 6px; position: relative; flex-wrap: wrap; justify-content: center;">
  `;

  for (let i = 0; i < n; i++) {
    const val = step.nums[i];
    const isSlow = step.slow === i;
    const isFast = step.fast === i;
    const isSwapped = (isSlow || isFast) && step.action === 'swap';

    let bg = '#ffffff';
    let border = '2px solid #cbd5e1';
    let textColor = '#0f172a';

    if (val === 0) {
      textColor = '#94a3b8';
      bg = '#f8fafc';
    } else {
      textColor = '#2563eb';
      bg = '#eff6ff';
    }

    if (isSwapped) {
      border = '2px solid #f59e0b';
      bg = '#fef3c7';
    } else if (isFast) {
      border = '2px solid #10b981';
    } else if (isSlow) {
      border = '2px solid #6366f1';
    }

    html += `
      <div style="display: flex; flex-direction: column; align-items: center; width: 40px; position: relative;">
        <div style="height: 18px; display: flex; align-items: center; justify-content: center; gap: 2px;">
          ${isSlow ? '<span style="background: #6366f1; color: white; font-size: 8.5px; font-weight: bold; padding: 1px 3px; border-radius: 4px;">slow</span>' : ''}
          ${isFast ? '<span style="background: #10b981; color: white; font-size: 8.5px; font-weight: bold; padding: 1px 3px; border-radius: 4px;">fast</span>' : ''}
        </div>
        <div style="width: 40px; height: 40px; border-radius: 8px; background: ${bg}; border: ${border}; display: flex; align-items: center; justify-content: center; font-size: 15px; font-weight: 700; color: ${textColor}; box-shadow: 0 1px 2px rgba(0,0,0,0.05); transition: all 0.2s ease;">
          ${val}
        </div>
        <div style="font-size: 10px; color: #64748b; margin-top: 2px; font-family: monospace;">[${i}]</div>
      </div>
    `;
  }

  html += `
      </div>
    </div>
  `;

  container.innerHTML = html;
}
