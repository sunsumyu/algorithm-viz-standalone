/**
 * 长度最小的子数组 — 画布渲染适配器
 */

import { ArrayTrackAdapter } from '../../../core/renderers/adapters/array-track-adapter';
import { SWStep } from './min-subarray-len-step-compiler';

export function renderMinSubarrayLenCanvas(container: HTMLElement, step: SWStep): void {
  const isDone = step.status === 'done';
  const isOverTarget = step.sum >= step.target;

  ArrayTrackAdapter.renderTrack(container, {
    array: step.array,
    pointers: isDone
      ? []
      : [
          { name: 'R', index: step.right, color: '#2563eb', position: 'top' },
          { name: 'L', index: step.left, color: '#0d9488', position: 'bottom' },
        ],
    windowRange: isDone
      ? undefined
      : { left: step.left, right: step.right, color: isOverTarget ? '#10b981' : '#3b82f6' },
    primaryTitle: '📊 数组与动态窗口覆盖 (nums):',
  });

  const root = container.closest('#algo-min-subarray-len-view');
  if (root) {
    const sumEl = root.querySelector('#metric-cur-sum');
    const lenEl = root.querySelector('#metric-window-len');
    const minEl = root.querySelector('#metric-min-len');

    const curLen = step.right >= step.left ? step.right - step.left + 1 : 0;

    if (sumEl) sumEl.textContent = `${step.sum} / ${step.target}`;
    if (lenEl) lenEl.textContent = `${curLen}`;
    if (minEl) minEl.textContent = step.minLen === Infinity ? '∞' : `${step.minLen}`;

    // 在 Card 2 中展示当前窗口详情
    const customMetricsContainer = root.querySelector('#dsp-custom-metrics-container');
    if (customMetricsContainer) {
      customMetricsContainer.innerHTML = `
        <div style="display: flex; flex-direction: column; gap: 4px; font-size: 11px; color: #475569; padding: 4px 0;">
          <div style="display: flex; justify-content: space-between;">
            <span>活动窗口范围:</span>
            <strong style="color: #2563eb;">[${step.left} .. ${step.right}]</strong>
          </div>
          <div style="display: flex; justify-content: space-between;">
            <span>窗口状态:</span>
            <strong style="color: ${isOverTarget ? '#16a34a' : '#64748b'};">${isOverTarget ? '✓ 满足 sum ≥ target (收缩左边界)' : '向右扩展右边界'}</strong>
          </div>
        </div>
      `;
    }
  }
}
