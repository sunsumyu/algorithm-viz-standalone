/**
 * 赎金信 — 画布渲染适配器
 */

import { RansomNoteStep } from './ransom-note-step-compiler';

export function renderRansomNoteCanvas(container: HTMLElement, step: RansomNoteStep): void {
  const { ransomNote, magazine, phase, charIndex, targetSlot, record, overdraftSlot } = step;

  // 1. 渲染 magazine 和 ransomNote 字符流
  const renderTrack = (str: string, activePhase: 'stock-mag' | 'deduct-ran') =>
    str
      .split('')
      .map((ch, idx) => {
        const isActive = phase === activePhase && charIndex === idx;
        const bg = isActive ? '#eff6ff' : '#ffffff';
        const border = isActive ? '#3b82f6' : '#cbd5e1';
        const color = isActive ? '#2563eb' : '#0f172a';
        const transform = isActive ? 'scale(1.1)' : 'none';
        const shadow = isActive ? '0 2px 4px rgba(37, 99, 235, 0.2)' : 'none';
        return `
          <div style="width: 28px; height: 32px; border-radius: 6px; background: ${bg}; border: 1.5px solid ${border}; display: flex; align-items: center; justify-content: center; font-family: 'JetBrains Mono', monospace; font-size: 13px; font-weight: 800; color: ${color}; transition: all 0.2s; transform: ${transform}; box-shadow: ${shadow};">
            <span>${ch}</span>
          </div>
        `;
      })
      .join('');

  // 2. 渲染 26 字符库存网格
  const bucketsHtml = record
    .map((count, idx) => {
      const char = String.fromCharCode(97 + idx);
      const isTarget = targetSlot === idx;
      const isOverdraft = overdraftSlot === idx;

      let bg = '#ffffff';
      let border = '#e2e8f0';
      let countColor = '#0f172a';
      let boxShadow = 'none';
      let transform = 'none';
      if (isOverdraft) {
        bg = '#fef2f2';
        border = '#ef4444';
        countColor = '#dc2626';
      } else if (count > 0) {
        bg = '#eff6ff';
        border = '#93c5fd';
        countColor = '#2563eb';
      }
      if (isTarget) {
        boxShadow = '0 0 0 2px #3b82f6';
        transform = 'scale(1.08)';
      }
      return `
        <div style="border-radius: 6px; background: ${bg}; border: 1px solid ${border}; padding: 3px 1px; display: flex; flex-direction: column; align-items: center; font-family: 'JetBrains Mono', monospace; transition: all 0.2s; box-shadow: ${boxShadow}; transform: ${transform};">
          <span style="font-size: 9.5px; font-weight: 700; color: #64748b;">${char}</span>
          <span style="font-size: 11px; font-weight: 800; color: ${countColor};">${count}</span>
        </div>
      `;
    })
    .join('');

  container.innerHTML = `
    <div style="display: flex; flex-direction: column; gap: 8px; width: 100%; height: 100%; padding: 10px 12px; box-sizing: border-box; justify-content: center;">
      <div style="display: flex; flex-direction: column; gap: 6px; width: 100%;">
        <div style="display: flex; align-items: center; gap: 8px;">
          <span style="font-size: 11px; font-weight: 700; color: #64748b; min-width: 30px; text-transform: uppercase;">MAG</span>
          <div style="display: flex; gap: 5px; flex-wrap: wrap;">${renderTrack(magazine, 'stock-mag')}</div>
        </div>
        <div style="display: flex; align-items: center; gap: 8px;">
          <span style="font-size: 11px; font-weight: 700; color: #64748b; min-width: 30px; text-transform: uppercase;">RAN</span>
          <div style="display: flex; gap: 5px; flex-wrap: wrap;">${renderTrack(ransomNote, 'deduct-ran')}</div>
        </div>
      </div>
      <div style="display: flex; flex-direction: column; gap: 5px;">
        <span style="font-size: 11px; font-weight: 700; color: #64748b;">record[26] 字符库存表</span>
        <div style="display: grid; grid-template-columns: repeat(13, 1fr); gap: 4px; width: 100%; max-width: 540px; margin: 0 auto;">${bucketsHtml}</div>
      </div>
    </div>
  `;
}
