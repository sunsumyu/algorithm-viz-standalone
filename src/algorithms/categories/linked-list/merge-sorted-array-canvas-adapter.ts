/**
 * 合并两个有序数组 — 画布渲染适配器
 */

import { MSAStep } from './merge-sorted-array-step-compiler';

export function renderMergeSortedArrayCanvas(container: HTMLElement, step: MSAStep): void {
  const totalLen1 = step.nums1.length;
  const len2 = step.nums2.length;

  let html = `
    <div style="display: flex; flex-direction: column; gap: 16px; width: 100%; height: 100%; align-items: center; justify-content: center; padding: 10px; box-sizing: border-box;">

      <div style="display: flex; flex-direction: column; align-items: center; gap: 6px;">
        <div style="font-size: 11.5px; font-weight: 700; color: #1e293b; display: flex; align-items: center; gap: 6px;">
          <span>nums1 物理存储区 (长度 ${totalLen1})</span>
          <span style="font-size: 10.5px; font-weight: normal; color: #64748b;">(前 ${step.m} 个有效，后 ${step.n} 个待写入)</span>
        </div>
        <div style="display: flex; gap: 6px; position: relative;">
  `;

  for (let i = 0; i < totalLen1; i++) {
    const val = step.nums1[i];
    const isP1 = step.p1 === i;
    const isK = step.k === i;
    const isFilledInStep = step.k === i && (step.action === 'fill_p1' || step.action === 'fill_p2');

    let bg = '#ffffff';
    let border = '2px solid #cbd5e1';
    let textColor = '#0f172a';

    if (val === null) {
      bg = '#f8fafc';
      border = '2px dashed #94a3b8';
      textColor = '#94a3b8';
    }

    if (isK) {
      border = '2px solid #f59e0b';
      bg = isFilledInStep ? '#fef3c7' : '#fffbeb';
    } else if (isP1) {
      border = '2px solid #3b82f6';
      bg = '#eff6ff';
    }

    html += `
      <div style="display: flex; flex-direction: column; align-items: center; width: 38px; position: relative;">
        <div style="height: 18px; display: flex; align-items: center; justify-content: center;">
          ${isP1 ? '<span style="background: #3b82f6; color: white; font-size: 9px; font-weight: bold; padding: 1px 4px; border-radius: 4px;">p1</span>' : ''}
          ${isK ? '<span style="background: #f59e0b; color: white; font-size: 9px; font-weight: bold; padding: 1px 4px; border-radius: 4px; margin-left: 2px;">k</span>' : ''}
        </div>
        <div style="width: 38px; height: 38px; border-radius: 8px; background: ${bg}; border: ${border}; display: flex; align-items: center; justify-content: center; font-size: 14px; font-weight: 700; color: ${textColor}; box-shadow: 0 1px 2px rgba(0,0,0,0.05); transition: all 0.2s ease;">
          ${val !== null ? val : '∅'}
        </div>
        <div style="font-size: 10px; color: #64748b; margin-top: 2px; font-family: monospace;">[${i}]</div>
      </div>
    `;
  }

  html += `
        </div>
      </div>

      <div style="display: flex; align-items: center; gap: 6px; color: #94a3b8; font-size: 11px;">
        <span>↑ 逆向合并与数据回填</span>
      </div>

      <div style="display: flex; flex-direction: column; align-items: center; gap: 6px;">
        <div style="font-size: 11.5px; font-weight: 700; color: #1e293b; display: flex; align-items: center; gap: 6px;">
          <span>nums2 来源数组 (长度 ${len2})</span>
        </div>
        <div style="display: flex; gap: 6px; position: relative;">
  `;

  for (let j = 0; j < len2; j++) {
    const val = step.nums2[j];
    const isP2 = step.p2 === j;

    let bg = '#ffffff';
    let border = '2px solid #cbd5e1';

    if (isP2) {
      border = '2px solid #10b981';
      bg = '#ecfdf5';
    }

    html += `
      <div style="display: flex; flex-direction: column; align-items: center; width: 38px; position: relative;">
        <div style="height: 18px; display: flex; align-items: center; justify-content: center;">
          ${isP2 ? '<span style="background: #10b981; color: white; font-size: 9px; font-weight: bold; padding: 1px 4px; border-radius: 4px;">p2</span>' : ''}
        </div>
        <div style="width: 38px; height: 38px; border-radius: 8px; background: ${bg}; border: ${border}; display: flex; align-items: center; justify-content: center; font-size: 14px; font-weight: 700; color: #0f172a; box-shadow: 0 1px 2px rgba(0,0,0,0.05); transition: all 0.2s ease;">
          ${val}
        </div>
        <div style="font-size: 10px; color: #64748b; margin-top: 2px; font-family: monospace;">[${j}]</div>
      </div>
    `;
  }

  html += `
        </div>
      </div>
    </div>
  `;

  container.innerHTML = html;
}
