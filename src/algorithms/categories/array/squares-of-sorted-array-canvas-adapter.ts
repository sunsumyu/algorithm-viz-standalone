/**
 * 有序数组的平方 — 画布渲染适配器
 */

import { ArrayTrackAdapter } from '../../../core/renderers/adapters/array-track-adapter';
import { SSQStep } from './squares-of-sorted-array-step-compiler';

export function renderSortedSquaresCanvas(container: HTMLElement, step: SSQStep): void {
  const isDone = step.status === 'done';
  const safeDisplayResult = step.result.map((v) => (v === null ? '—' : v));

  const primaryHighlights = new Map<number, { bg?: string; border?: string; color?: string }>();
  if (!isDone) {
    primaryHighlights.set(step.left, { bg: '#eff6ff', border: '#93c5fd', color: '#1d4ed8' });
    primaryHighlights.set(step.right, { bg: '#f0fdf4', border: '#86efac', color: '#166534' });
  }

  const secondaryHighlights = new Map<number, { bg?: string; border?: string; color?: string }>();
  if (step.writeIdx >= 0 && !isDone) {
    secondaryHighlights.set(step.writeIdx, { bg: '#fffbeb', border: '#fde68a', color: '#b45309' });
  }

  ArrayTrackAdapter.renderTrack(container, {
    array: step.arr,
    pointers: isDone
      ? []
      : [
          { name: 'left', index: step.left, color: '#2563eb', position: 'top' },
          { name: 'right', index: step.right, color: '#0d9488', position: 'bottom' },
        ],
    itemHighlights: primaryHighlights,
    primaryTitle: '📊 原始数组 (原序列):',
    secondaryArray: safeDisplayResult,
    secondaryTitle: '📦 平方结果数组 (倒序填充):',
  });
}

export function renderSortedSquaresAuxiliary(container: HTMLElement, step: SSQStep): void {
  const isDone = step.status === 'done';
  const lsq = step.left < step.arr.length ? step.arr[step.left] ** 2 : '—';
  const rsq = step.right >= 0 ? step.arr[step.right] ** 2 : '—';
  const decisionText = isDone
    ? '✓ 全部元素平方已倒序写入完成'
    : typeof lsq === 'number' && typeof rsq === 'number'
      ? lsq > rsq
        ? `左侧 ${lsq} > 右侧 ${rsq} (选取左侧平方，左指针右移)`
        : `右侧 ${rsq} ≥ 左侧 ${lsq} (选取右侧平方，右指针左移)`
      : '—';

  container.innerHTML = `
    <div style="display: flex; flex-direction: column; gap: 6px; font-size: 11.5px; color: #334155; padding: 4px 0;">
      <div style="display: flex; justify-content: space-between; align-items: center;">
        <span style="font-weight: 600; color: #64748b;">双指针状态:</span>
        <strong style="color: #2563eb; font-family: monospace;">left=${step.left}, right=${step.right}</strong>
      </div>
      <div style="display: flex; justify-content: space-between; align-items: center;">
        <span style="font-weight: 600; color: #64748b;">比较决策:</span>
        <strong style="color: #16a34a; font-weight: 700;">${decisionText}</strong>
      </div>
    </div>
  `;
}
