/**
 * 两个数组的交集 — 画布渲染适配器
 */

import { IntersectionStep } from './intersection-of-two-arrays-step-compiler';

export function renderIntersectionCanvas(container: HTMLElement, step: IntersectionStep): void {
  const { nums1, nums2, phase, idx1, idx2, currentVal, set1, resultSet, isHit } = step;

  // 1. 渲染 nums1 和 nums2 数组卡槽
  const renderCells = (arr: number[], activeIdx: number, ptrLabel: string) =>
    arr
      .map((num, idx) => {
        const isCur = idx === activeIdx;
        const isHitCell = isCur && isHit;
        let border = '#cbd5e1';
        let bg = '#ffffff';
        let boxShadow = '0 1px 2px rgba(0, 0, 0, 0.03)';
        let transform = 'none';
        if (isHitCell) {
          border = '#10b981';
          bg = '#ecfdf5';
          transform = 'scale(1.08)';
          boxShadow = '0 2px 6px rgba(16, 185, 129, 0.25)';
        } else if (isCur) {
          border = '#2563eb';
          bg = '#eff6ff';
          transform = 'scale(1.08)';
          boxShadow = '0 2px 6px rgba(37, 99, 235, 0.2)';
        }
        const ptrTag = isCur ? (isHitCell ? '🎯命中' : `▼${ptrLabel}`) : '';
        return `
          <div style="display: flex; flex-direction: column; align-items: center; gap: 2px;">
            <div style="width: 36px; height: 38px; border-radius: 8px; background: ${bg}; border: 1.5px solid ${border}; display: flex; flex-direction: column; align-items: center; justify-content: center; transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1); box-shadow: ${boxShadow}; transform: ${transform};">
              <span style="font-size: 13px; font-weight: 800; color: #0f172a; font-family: 'JetBrains Mono', monospace; line-height: 1.1;">${num}</span>
              <span style="font-size: 8.5px; font-weight: 700; color: #94a3b8;">[${idx}]</span>
            </div>
            <span style="font-size: 8.5px; font-family: 'JetBrains Mono', monospace; font-weight: 800; color: #2563eb; height: 12px; line-height: 12px;">${ptrTag}</span>
          </div>
        `;
      })
      .join('');

  // 2. 渲染 set1 与 resultSet 芯片
  const set1Html =
    set1.length === 0
      ? '<span style="color:#94a3b8; font-size:11px; padding: 4px 8px;">(空集合 ∅)</span>'
      : set1
          .map((num) => {
            const isNew = phase === 'build-set1' && num === currentVal;
            const border = isNew ? '#2563eb' : '#bfdbfe';
            const bg = isNew ? '#dbeafe' : '#eff6ff';
            return `<div style="padding: 3px 10px; border-radius: 6px; background: ${bg}; border: 1px solid ${border}; color: #1e40af; font-family: 'JetBrains Mono', monospace; font-size: 11.5px; font-weight: 800; display: inline-flex; align-items: center; gap: 3px; transition: all 0.2s;"><span style="color:#3b82f6;">#</span> ${num}</div>`;
          })
          .join('');

  const resultHtml =
    resultSet.length === 0
      ? '<span style="color:#94a3b8; font-size:11px; padding: 4px 8px;">(暂无交集)</span>'
      : resultSet
          .map((num) => {
            const isNew = phase === 'scan-nums2' && isHit && num === currentVal;
            const border = isNew ? '#10b981' : '#a7f3d0';
            const bg = isNew ? '#d1fae5' : '#ecfdf5';
            return `<div style="padding: 3px 10px; border-radius: 6px; background: ${bg}; border: 1px solid ${border}; color: #047857; font-family: 'JetBrains Mono', monospace; font-size: 11.5px; font-weight: 800; display: inline-flex; align-items: center; gap: 3px; transition: all 0.2s;"><span>✨</span> ${num}</div>`;
          })
          .join('');

  container.innerHTML = `
    <div style="display: flex; flex-direction: column; gap: 10px; width: 100%; height: 100%; padding: 10px 12px; box-sizing: border-box; justify-content: center;">
      <div style="display: flex; flex-direction: column; gap: 6px;">
        <span style="font-size: 11px; font-weight: 700; color: #64748b;">nums1 (遍历建集合)</span>
        <div style="display: flex; gap: 6px; flex-wrap: wrap;">${renderCells(nums1, idx1, 'i')}</div>
      </div>
      <div style="display: flex; flex-direction: column; gap: 6px;">
        <span style="font-size: 11px; font-weight: 700; color: #64748b;">nums2 (查询 set1)</span>
        <div style="display: flex; gap: 6px; flex-wrap: wrap;">${renderCells(nums2, idx2, 'j')}</div>
      </div>
      <div style="display: flex; align-items: center; gap: 16px; width: 100%; padding-top: 4px; border-top: 1px dashed #e2e8f0;">
        <div style="display: flex; align-items: center; gap: 8px; flex: 1;">
          <span style="font-size: 11px; font-weight: 700; color: #475569; white-space: nowrap;">set1</span>
          <div style="display: flex; gap: 6px; align-items: center; flex-wrap: wrap; min-height: 32px;">${set1Html}</div>
        </div>
        <div style="display: flex; align-items: center; gap: 8px; flex: 1;">
          <span style="font-size: 11px; font-weight: 700; color: #475569; white-space: nowrap;">resultSet</span>
          <div style="display: flex; gap: 6px; align-items: center; flex-wrap: wrap; min-height: 32px;">${resultHtml}</div>
        </div>
      </div>
    </div>
  `;
}
