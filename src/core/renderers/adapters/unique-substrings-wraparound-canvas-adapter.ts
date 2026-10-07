/**
 * 环绕字符串中唯一的子字符串 (LeetCode 467)
 * Canvas Adapter: 26 槽位字母网格与字符扫描序列渲染器
 */

import { renderAlphabetSlotGrid } from '../../../algorithms/categories/dynamic-programming/dp-066/dp-066-shared';
import { type UniqueSubstringsWraparoundStep } from './unique-substrings-wraparound-step-compiler';

export function renderUniqueSubstringsWraparoundCanvas(
  container: HTMLElement,
  step: UniqueSubstringsWraparoundStep
): void {
  const { s, currentI, curChar = '', curLen, dp, totalAns } = step;

  const charBadges = s.split('').map((ch, idx) => {
    const isCur = idx === currentI;
    return `
      <div style="
        display:flex; flex-direction:column; align-items:center; justify-content:center;
        width:36px; height:46px; border-radius:6px;
        background:${isCur ? '#eff6ff' : '#f8fafc'};
        border:1.5px solid ${isCur ? '#3b82f6' : '#cbd5e1'};
        font-family:monospace; font-weight:700;
      ">
        <span style="font-size:16px; color:${isCur ? '#1d4ed8' : '#334155'};">${ch}</span>
        <span style="font-size:10px; color:#94a3b8;">#${idx}</span>
      </div>
    `;
  }).join('');

  const alphabetGridHtml = renderAlphabetSlotGrid({
    dp,
    curChar,
    curLen,
    totalAns,
  });

  container.innerHTML = `
    <div style="display:flex; flex-direction:column; gap:10px; width:100%;">
      <div style="display:flex; flex-direction:column; gap:6px; padding:10px; background:#ffffff; border-radius:8px; border:1px solid #e2e8f0;">
        <div style="font-weight:700; font-size:13px; color:#1e293b;">🔡 待匹配母串 "${s}" 扫描序列：</div>
        <div style="display:flex; gap:6px; overflow-x:auto;">${charBadges}</div>
      </div>
      ${alphabetGridHtml}
    </div>
  `;
}
