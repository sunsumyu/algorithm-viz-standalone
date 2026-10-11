/**
 * 四数相加 II — 画布渲染适配器
 */

import { FourSumIIStep } from './four-sum-ii-step-compiler';

export function renderFourSumIICanvas(container: HTMLElement, step: FourSumIIStep): void {
  const { a, b, c, d, idxA, idxB, idxC, idxD, mapEntries, target } = step;

  // 1. 渲染 4 数组
  const renderRow = (arr: number[], activeIdx: number) =>
    arr
      .map((num, idx) => {
        const isActive = idx === activeIdx;
        return `
          <div style="width: 28px; height: 28px; border-radius: 6px; display: inline-flex; align-items: center; justify-content: center; font-family: 'JetBrains Mono', monospace; font-size: 11.5px; font-weight: 800; color: ${isActive ? '#1d4ed8' : '#334155'}; background: ${isActive ? '#eff6ff' : '#ffffff'}; border: 1px solid ${isActive ? '#2563eb' : '#cbd5e1'}; transition: all 0.15s; box-shadow: ${isActive ? '0 0 0 2px rgba(37, 99, 235, 0.25)' : '0 1px 2px rgba(0, 0, 0, 0.03)'}; transform: ${isActive ? 'scale(1.08)' : 'none'};">
            <span>${num}</span>
          </div>
        `;
      })
      .join('');

  const arrayCol = (title: string, arr: number[], activeIdx: number) => `
    <div style="padding: 2px; display: flex; flex-direction: column; align-items: center; gap: 5px;">
      <span style="font-size: 10.5px; font-weight: 700; color: #64748b; text-transform: uppercase;">${title}</span>
      <div style="display: flex; gap: 5px; flex-wrap: wrap; justify-content: center;">${renderRow(arr, activeIdx)}</div>
    </div>
  `;

  // 2. 渲染 Map
  const mapHtml =
    mapEntries.length === 0
      ? '<span style="color: #94a3b8; font-size: 10.5px;">(Map 当前为空)</span>'
      : mapEntries
          .map(([k, v]) => {
            const isTarget = target !== undefined && k === target;
            return `
              <div style="padding: 3px 8px; border-radius: 6px; background: ${isTarget ? '#ecfdf5' : '#ffffff'}; border: 1px solid ${isTarget ? '#10b981' : '#cbd5e1'}; font-family: 'JetBrains Mono', monospace; font-size: 11px; font-weight: 700; display: inline-flex; align-items: center; gap: 3px; transition: all 0.15s; box-shadow: ${isTarget ? '0 0 0 2px rgba(16, 185, 129, 0.2)' : '0 1px 2px rgba(0, 0, 0, 0.03)'};">
                <span style="color: #3b82f6; font-weight: 700;">sum=${k}</span>
                <span style="color: #94a3b8;">:</span>
                <span style="color: #10b981; font-weight: 700;">freq=${v}</span>
              </div>
            `;
          })
          .join('');

  container.innerHTML = `
    <div style="display: flex; flex-direction: column; justify-content: center; gap: 14px; height: 100%; width: 100%; padding: 12px; box-sizing: border-box;">
      <div style="display: grid; grid-template-columns: repeat(4, 1fr); gap: 8px; width: 100%;">
        ${arrayCol('nums1 (a)', a, idxA)}
        ${arrayCol('nums2 (b)', b, idxB)}
        ${arrayCol('nums3 (c)', c, idxC)}
        ${arrayCol('nums4 (d)', d, idxD)}
      </div>
      <div style="font-size: 11px; font-weight: 700; color: #64748b; align-self: flex-start;">
        哈希表 Map (Key: a+b 和, Value: 出现次数)
      </div>
      <div style="display: flex; gap: 6px; flex-wrap: wrap; width: 100%; min-height: 28px; align-items: center;">
        ${mapHtml}
      </div>
    </div>
  `;
}
