/**
 * 替换数字 — 画布适配器
 * 负责从后向前双指针与预扩容字符槽位沙盘渲染
 */

import { ReplaceDigitsStep } from './replace-digits-step-compiler';

export function renderReplaceDigitsCanvas(container: HTMLElement, step: ReplaceDigitsStep): void {
  const { chars, oldIndex, newIndex, phase } = step;

  const cellsHtml = chars
    .map((ch, idx) => {
      const isOld = idx === oldIndex && phase !== 'done';
      const isNew = idx === newIndex && phase !== 'done';
      const isNumberToken =
        !isOld && !isNew && ['n', 'u', 'm', 'b', 'e', 'r'].includes(ch);

      let border = '#cbd5e1';
      let bg = '#ffffff';
      let valColor = '#0f172a';
      if (isOld) {
        border = '#2563eb';
        bg = '#eff6ff';
      } else if (isNew) {
        border = '#f59e0b';
        bg = '#fffbeb';
      } else if (isNumberToken) {
        border = '#10b981';
        bg = '#ecfdf5';
        valColor = '#047857';
      }

      let ptrTags = '';
      if (isOld && isNew) {
        ptrTags =
          '<span style="font-size: 9.5px; font-weight: 800; font-family: \'JetBrains Mono\', monospace; padding: 1px 5px; border-radius: 4px; color: #ffffff; background: #2563eb; box-shadow: 0 1px 2px rgba(0,0,0,0.1);">old</span>' +
          '<span style="font-size: 9.5px; font-weight: 800; font-family: \'JetBrains Mono\', monospace; padding: 1px 5px; border-radius: 4px; color: #ffffff; background: #f59e0b; box-shadow: 0 1px 2px rgba(0,0,0,0.1);">new</span>';
      } else if (isOld) {
        ptrTags =
          '<span style="font-size: 9.5px; font-weight: 800; font-family: \'JetBrains Mono\', monospace; padding: 1px 5px; border-radius: 4px; color: #ffffff; background: #2563eb; box-shadow: 0 1px 2px rgba(0,0,0,0.1);">old</span>';
      } else if (isNew) {
        ptrTags =
          '<span style="font-size: 9.5px; font-weight: 800; font-family: \'JetBrains Mono\', monospace; padding: 1px 5px; border-radius: 4px; color: #ffffff; background: #f59e0b; box-shadow: 0 1px 2px rgba(0,0,0,0.1);">new</span>';
      }

      return `
        <div style="display: flex; flex-direction: column; align-items: center; gap: 4px;">
          <div style="min-height: 18px; display: flex; align-items: center; gap: 3px;">${ptrTags}</div>
          <div style="width: 38px; height: 44px; border-radius: 8px; background: ${bg}; border: 2px solid ${border}; display: flex; flex-direction: column; align-items: center; justify-content: center; position: relative; transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);">
            <span style="font-size: 15px; font-weight: 800; color: ${valColor}; font-family: 'JetBrains Mono', monospace;">${ch || '&nbsp;'}</span>
            <span style="font-size: 9px; font-weight: 700; color: #94a3b8; position: absolute; bottom: 2px;">${idx}</span>
          </div>
        </div>
      `;
    })
    .join('');

  container.innerHTML = `
    <div style="display: flex; align-items: flex-end; gap: 6px; flex-wrap: wrap; justify-content: center; height: 100%; padding: 12px; box-sizing: border-box;">
      ${cellsHtml}
    </div>
  `;
}
