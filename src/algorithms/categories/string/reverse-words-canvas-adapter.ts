/**
 * 翻转字符串里的单词 — 画布适配器
 * 负责字符数组三阶段反转轨迹（指针徽章 + 单词窗口高亮）
 */

import { ReverseWordsStep } from './reverse-words-step-compiler';

export function renderReverseWordsCanvas(container: HTMLElement, step: ReverseWordsStep): void {
  const { chars, left, right, wordStart, wordEnd, swapping, phase } = step;

  const cellsHtml = chars
    .map((ch, idx) => {
      const isSpace = ch === ' ';
      const inWordWindow =
        wordStart !== undefined && wordEnd !== undefined && idx >= wordStart && idx <= wordEnd;
      const isLeft = idx === left && phase !== 'done';
      const isRight = idx === right && phase !== 'done';
      const isSwapping = swapping && (idx === left || idx === right);

      let style =
        'width: 32px; height: 40px; border-radius: 8px; background: #ffffff; border: 2px solid #cbd5e1; display: flex; flex-direction: column; align-items: center; justify-content: center; position: relative; transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);';
      if (isSpace) style += ' background: #f1f5f9; border-style: dashed; color: #94a3b8;';
      if (inWordWindow) style += ' border-color: #818cf8; background: #eef2ff;';
      if (isSwapping) {
        style +=
          ' border-color: #10b981; background: #ecfdf5; transform: translateY(-3px) scale(1.05); box-shadow: 0 4px 10px rgba(16, 185, 129, 0.2);';
      } else if (isLeft) {
        style += ' border-color: #2563eb; background: #eff6ff;';
      } else if (isRight) {
        style += ' border-color: #f59e0b; background: #fffbeb;';
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
          <div style="${style}">
            <span style="font-size: 14px; font-weight: 800; color: ${isSpace ? '#94a3b8' : '#0f172a'}; font-family: 'JetBrains Mono', monospace;">${isSpace ? '␣' : ch}</span>
            <span style="font-size: 8.5px; font-weight: 700; color: #94a3b8; position: absolute; bottom: 2px;">${idx}</span>
          </div>
        </div>
      `;
    })
    .join('');

  container.innerHTML = `
    <div style="display: flex; align-items: flex-end; gap: 6px; flex-wrap: wrap; justify-content: center; width: 100%; height: 100%; padding: 12px; box-sizing: border-box; overflow: auto;">
      ${cellsHtml}
    </div>
  `;
}
