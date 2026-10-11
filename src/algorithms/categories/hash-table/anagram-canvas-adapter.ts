/**
 * 有效的字母异位词 — 画布渲染适配器
 */

import { AnagramStep } from './anagram-step-compiler';

export function renderAnagramCanvas(container: HTMLElement, step: AnagramStep): void {
  const { s, t, phase, charIndex, targetSlot, record } = step;

  // 1. 渲染 s 和 t 字符串轨道
  const renderTrack = (str: string, activePhase: 'scan-s' | 'scan-t') =>
    str
      .split('')
      .map((ch, idx) => {
        const isActive = phase === activePhase && charIndex === idx;
        const bg = isActive ? '#eff6ff' : '#ffffff';
        const border = isActive ? '#2563eb' : '#cbd5e1';
        const color = isActive ? '#1d4ed8' : '#334155';
        const transform = isActive ? 'scale(1.08)' : 'none';
        const shadow = isActive ? '0 2px 6px rgba(37, 99, 235, 0.2)' : '0 1px 2px rgba(0, 0, 0, 0.03)';
        return `
          <div style="width: 26px; height: 28px; border-radius: 6px; background: ${bg}; border: 1px solid ${border}; font-family: 'JetBrains Mono', monospace; font-size: 12px; font-weight: 800; color: ${color}; display: inline-flex; align-items: center; justify-content: center; transition: all 0.15s; box-shadow: ${shadow}; transform: ${transform};">
            <span>${ch}</span>
          </div>
        `;
      })
      .join('');

  // 2. 渲染 26 字符哈希桶
  const bucketsHtml = record
    .map((count, idx) => {
      const char = String.fromCharCode(97 + idx);
      const isTarget = targetSlot === idx;
      let bg = '#ffffff';
      let border = '#cbd5e1';
      let countColor = '#334155';
      let transform = 'none';
      if (count > 0) {
        bg = '#eff6ff';
        border = '#93c5fd';
        countColor = '#1d4ed8';
      } else if (count < 0) {
        bg = '#fef2f2';
        border = '#fca5a5';
        countColor = '#b91c1c';
      }
      if (isTarget) {
        border = '#2563eb';
        bg = '#eff6ff';
        transform = 'scale(1.08)';
      }
      return `
        <div style="display: flex; flex-direction: column; align-items: center; border-radius: 6px; background: ${bg}; border: 1px solid ${border}; padding: 3px 0; font-family: 'JetBrains Mono', monospace; font-size: 10.5px; transition: all 0.15s; box-shadow: 0 1px 2px rgba(0, 0, 0, 0.03); transform: ${transform};">
          <span style="font-weight: 800; color: #475569;">${char}</span>
          <span style="font-weight: 800; font-size: 10.5px; color: ${countColor};">${count}</span>
        </div>
      `;
    })
    .join('');

  container.innerHTML = `
    <div style="display: flex; flex-direction: column; gap: 8px; width: 100%; height: 100%; padding: 10px 12px; box-sizing: border-box; justify-content: center;">
      <div style="display: flex; flex-direction: column; gap: 6px; width: 100%;">
        <div style="display: flex; align-items: center; gap: 8px;">
          <span style="font-size: 11px; font-weight: 700; color: #64748b; min-width: 30px; text-transform: uppercase;">S</span>
          <div style="display: flex; gap: 5px; flex-wrap: wrap;">${renderTrack(s, 'scan-s')}</div>
        </div>
        <div style="display: flex; align-items: center; gap: 8px;">
          <span style="font-size: 11px; font-weight: 700; color: #64748b; min-width: 30px; text-transform: uppercase;">T</span>
          <div style="display: flex; gap: 5px; flex-wrap: wrap;">${renderTrack(t, 'scan-t')}</div>
        </div>
      </div>
      <div style="display: flex; flex-direction: column; gap: 5px;">
        <span style="font-size: 11px; font-weight: 700; color: #64748b;">record[26] 字符频次哈希数组</span>
        <div style="display: grid; grid-template-columns: repeat(13, 1fr); gap: 5px; width: 100%;">${bucketsHtml}</div>
      </div>
    </div>
  `;
}
