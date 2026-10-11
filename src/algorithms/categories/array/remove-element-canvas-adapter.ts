/**
 * 移除元素 — 画布渲染适配器
 */

import { ArrayTrackAdapter } from '../../../core/renderers/adapters/array-track-adapter';
import { RemoveStep } from './remove-element-step-compiler';

export function renderRemoveElementCanvas(container: HTMLElement, step: RemoveStep): void {
  const isDone = step.status === 'done';
  const highlights = new Map<number, { bg?: string; border?: string; color?: string }>();

  // 为有效前缀 [0..slow-1] 标记绿色
  for (let i = 0; i < step.slow; i++) {
    highlights.set(i, { bg: '#f0fdf4', border: '#86efac', color: '#166534' });
  }

  if (step.fast < step.array.length && !isDone) {
    if (step.status === 'skip') {
      highlights.set(step.fast, { bg: '#fef2f2', border: '#fca5a5', color: '#991b1b' });
    }
  }

  ArrayTrackAdapter.renderTrack(container, {
    array: step.array,
    pointers: isDone
      ? [{ name: 'k', index: step.slow, color: '#16a34a', position: 'top' }]
      : [
          { name: 'fast', index: step.fast, color: '#2563eb', position: 'top' },
          { name: 'slow', index: step.slow, color: '#0d9488', position: 'bottom' },
        ],
    itemHighlights: highlights,
    primaryTitle: '📊 原地数组条带 (nums):',
  });

  const root = container.closest('#algo-remove-element-view');
  if (root) {
    const fastEl = root.querySelector('#metric-fast-idx');
    const slowEl = root.querySelector('#metric-slow-idx');
    const actEl = root.querySelector('#metric-action-state');

    if (fastEl) fastEl.textContent = `${step.fast}`;
    if (slowEl) slowEl.textContent = `${step.slow}`;
    if (actEl) {
      actEl.textContent =
        step.status === 'copy'
          ? `覆写 nums[${step.slow}] = ${step.array[step.slow]}`
          : step.status === 'skip'
            ? `跳过 val=${step.val}`
            : step.status === 'done'
              ? `完成 (有效长度 ${step.slow})`
              : '检查中';
    }

    // 在 Card 2 中展示当前有效数组前缀
    const customMetricsContainer = root.querySelector('#dsp-custom-metrics-container');
    if (customMetricsContainer) {
      const validItems = step.array.slice(0, step.slow);
      customMetricsContainer.innerHTML = `
        <div style="display: flex; flex-direction: column; gap: 4px; padding: 4px 0;">
          <div style="display: flex; align-items: center; justify-content: space-between;">
            <span style="font-size: 10.5px; font-weight: 700; color: #475569;">有效前缀 [0..${Math.max(0, step.slow - 1)}]:</span>
            <span style="font-size: 10px; color: #16a34a; font-family: monospace;">长度 k = ${step.slow}</span>
          </div>
          <div style="padding: 4px 8px; background: #ffffff; border: 1px solid #cbd5e1; border-radius: 4px; font-family: 'JetBrains Mono', monospace; font-size: 11px; font-weight: 700; color: #16a34a;">
            [ ${validItems.join(', ')} ]
          </div>
        </div>
      `;
    }
  }
}
