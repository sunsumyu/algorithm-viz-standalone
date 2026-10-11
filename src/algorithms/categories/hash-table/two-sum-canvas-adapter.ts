/**
 * 两数之和 — 画布渲染适配器
 */

import { TwoSumStep } from './two-sum-step-compiler';

export function renderTwoSumCanvas(container: HTMLElement, step: TwoSumStep): void {
  const { array, currentIndex, currentVal, complement, mapEntries, matchedIndices, status } = step;

  // 1. 原数组与指针
  const cellsHtml = array
    .map((num, idx) => {
      const isCurrent = currentIndex === idx && status !== 'found';
      const isMatched = matchedIndices && (matchedIndices[0] === idx || matchedIndices[1] === idx);

      let bg = '#ffffff';
      let border = '#cbd5e1';
      let shadow = '0 1px 2px rgba(0, 0, 0, 0.03)';
      let transform = 'none';
      let badge = '';
      if (isMatched) {
        bg = '#ecfdf5';
        border = '#10b981';
        shadow = '0 0 0 2px rgba(16, 185, 129, 0.25)';
        transform = 'scale(1.08)';
        badge =
          '<span style="background:#22c55e; color:#ffffff; font-size:8.5px; font-weight:700; padding:1px 5px; border-radius:4px; font-family:\'JetBrains Mono\', monospace;">Match</span>';
      } else if (isCurrent) {
        bg = '#eff6ff';
        border = '#2563eb';
        transform = 'scale(1.08)';
        badge =
          '<span style="background:#2563eb; color:#ffffff; font-size:8.5px; font-weight:700; padding:1px 5px; border-radius:4px; font-family:\'JetBrains Mono\', monospace;">i</span>';
      }

      return `
        <div style="display: flex; flex-direction: column; align-items: center; gap: 2px;">
          ${badge}
          <div style="width: 38px; height: 40px; border-radius: 8px; background: ${bg}; border: 1.5px solid ${border}; display: flex; flex-direction: column; align-items: center; justify-content: center; position: relative; transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1); box-shadow: ${shadow}; transform: ${transform};">
            <span style="font-size: 14px; font-weight: 800; color: #0f172a; font-family: 'JetBrains Mono', monospace;">${num}</span>
            <span style="font-size: 8.5px; font-weight: 700; color: #94a3b8; position: absolute; bottom: 2px;">[${idx}]</span>
          </div>
        </div>
      `;
    })
    .join('');

  // 2. HashMap 键值对
  const mapHtml =
    mapEntries.length === 0
      ? '<span style="color: #94a3b8; font-size: 11px;">(哈希表当前为空)</span>'
      : mapEntries
          .map(([key, valIdx]) => {
            const isTarget = (status === 'check' || status === 'found') && key === complement;
            const bg = isTarget ? '#ecfdf5' : '#eff6ff';
            const border = isTarget ? '#a7f3d0' : '#bfdbfe';
            return `
              <div style="padding: 3px 8px; border-radius: 6px; background: ${bg}; border: 1px solid ${border}; font-family: 'JetBrains Mono', monospace; font-size: 11px; font-weight: 700; display: flex; align-items: center; gap: 4px;">
                <span style="color: #3b82f6; font-weight: 700;">Key: ${key}</span>
                <span style="color: #94a3b8;">&rarr;</span>
                <span style="color: #059669; font-weight: 700;">Idx: ${valIdx}</span>
              </div>
            `;
          })
          .join('');

  container.innerHTML = `
    <div style="display: flex; flex-direction: column; gap: 10px; width: 100%; height: 100%; padding: 10px 12px; box-sizing: border-box; justify-content: center;">
      <div style="display: flex; flex-direction: column; gap: 6px;">
        <span style="font-size: 11px; font-weight: 700; color: #64748b;">数组 nums (当前遍历 nums[${currentIndex >= 0 && currentIndex < array.length ? currentIndex : 'i'}] = ${currentIndex >= 0 && currentIndex < array.length ? currentVal : '—'})</span>
        <div style="display: flex; gap: 6px; flex-wrap: wrap; justify-content: center;">${cellsHtml}</div>
      </div>
      <div style="display: flex; flex-direction: column; gap: 6px;">
        <span style="font-size: 11px; font-weight: 700; color: #64748b;">哈希映射 Map (Key: 数值 ➔ Value: 下标)</span>
        <div style="display: flex; gap: 6px; flex-wrap: wrap; min-height: 28px; align-items: center;">${mapHtml}</div>
      </div>
    </div>
  `;
}
