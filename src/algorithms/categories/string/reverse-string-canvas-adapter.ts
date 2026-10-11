/**
 * 反转字符串 — 画布适配器
 * 负责首尾双指针与字符单元格对撞沙盘渲染
 */

import { ReverseStringStep } from './reverse-string-step-compiler';

export function renderReverseStringCanvas(container: HTMLElement, step: ReverseStringStep): void {
  const { s, left, right, swapping, status } = step;

  const cellsHtml = s
    .map((ch, idx) => {
      const isLeft = idx === left && status !== 'done';
      const isRight = idx === right && status !== 'done';
      const isSwapping = swapping && (idx === left || idx === right);

      let border = '#cbd5e1';
      let bg = '#ffffff';
      let transform = 'none';
      let boxShadow = 'none';
      if (isSwapping) {
        border = '#10b981';
        bg = '#ecfdf5';
        transform = 'translateY(-3px) scale(1.05)';
        boxShadow = '0 4px 10px rgba(16, 185, 129, 0.2)';
      } else if (isLeft) {
        border = '#2563eb';
        bg = '#eff6ff';
      } else if (isRight) {
        border = '#f59e0b';
        bg = '#fffbeb';
      }

      let ptrTags = '';
      if (isLeft && isRight) {
        ptrTags =
          '<span style="font-size: 9.5px; font-weight: 800; font-family: \'JetBrains Mono\', monospace; padding: 1px 5px; border-radius: 4px; color: #ffffff; background: #2563eb; box-shadow: 0 1px 2px rgba(0,0,0,0.1);">L</span>' +
          '<span style="font-size: 9.5px; font-weight: 800; font-family: \'JetBrains Mono\', monospace; padding: 1px 5px; border-radius: 4px; color: #ffffff; background: #f59e0b; box-shadow: 0 1px 2px rgba(0,0,0,0.1);">R</span>';
      } else if (isLeft) {
        ptrTags =
          '<span style="font-size: 9.5px; font-weight: 800; font-family: \'JetBrains Mono\', monospace; padding: 1px 5px; border-radius: 4px; color: #ffffff; background: #2563eb; box-shadow: 0 1px 2px rgba(0,0,0,0.1);">left</span>';
      } else if (isRight) {
        ptrTags =
          '<span style="font-size: 9.5px; font-weight: 800; font-family: \'JetBrains Mono\', monospace; padding: 1px 5px; border-radius: 4px; color: #ffffff; background: #f59e0b; box-shadow: 0 1px 2px rgba(0,0,0,0.1);">right</span>';
      }

      return `
        <div style="display: flex; flex-direction: column; align-items: center; gap: 4px;">
          <div style="min-height: 18px; display: flex; align-items: center; gap: 3px;">${ptrTags}</div>
          <div style="width: 44px; height: 48px; border-radius: 10px; background: ${bg}; border: 2px solid ${border}; display: flex; flex-direction: column; align-items: center; justify-content: center; position: relative; transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1); transform: ${transform}; box-shadow: ${boxShadow};">
            <span style="font-size: 16px; font-weight: 800; color: #0f172a; font-family: 'JetBrains Mono', monospace;">${ch}</span>
            <span style="font-size: 9px; font-weight: 700; color: #94a3b8; position: absolute; bottom: 2px;">${idx}</span>
          </div>
        </div>
      `;
    })
    .join('');

  container.innerHTML = `
    <div style="display: flex; align-items: flex-end; gap: 8px; flex-wrap: wrap; justify-content: center; height: 100%; padding: 12px; box-sizing: border-box;">
      ${cellsHtml}
    </div>
  `;
}
