/**
 * 二分查找 - 视觉适配器
 * 基于 ArrayTrackAdapter 渲染有序数组条带与折半区间沙盘
 */

import { ArrayTrackAdapter } from '../../../core/renderers/adapters/array-track-adapter';
import { BSStep } from './binary-search-step-compiler';

export function renderBinarySearchCanvas(container: HTMLElement, step: BSStep): void {
  const isFound = step.phase === 'found';
  const hasMid = step.mid >= 0;

  const highlights = new Map<number, { bg?: string; border?: string; color?: string }>();
  if (isFound) {
    highlights.set(step.mid, { bg: '#f0fdf4', border: '#86efac', color: '#166534' });
  } else if (hasMid) {
    highlights.set(step.mid, { bg: '#fffbeb', border: '#fde68a', color: '#b45309' });
  }

  const pointers = [];
  if (step.left <= step.right && step.left >= 0) {
    pointers.push({ name: 'L', index: step.left, color: '#2563eb', position: 'top' as const });
    pointers.push({ name: 'R', index: step.right, color: '#0d9488', position: 'top' as const });
  }
  if (hasMid) {
    pointers.push({ name: 'mid', index: step.mid, color: '#f59e0b', position: 'bottom' as const });
  }

  ArrayTrackAdapter.renderTrack(container, {
    array: step.array,
    pointers,
    windowRange:
      step.left <= step.right && step.left >= 0
        ? { left: step.left, right: step.right, color: '#3b82f6' }
        : undefined,
    itemHighlights: highlights,
    primaryTitle: '📊 升序排布数组条带 (nums):',
  });

  const root = container.closest('#algo-binary-search-view');
  if (root) {
    const midEl = root.querySelector('#metric-mid-val');
    const countEl = root.querySelector('#metric-compare-count');
    const resEl = root.querySelector('#metric-search-result') as HTMLElement | null;

    if (midEl) midEl.textContent = hasMid ? `nums[${step.mid}] = ${step.array[step.mid]}` : '—';
    if (countEl) countEl.textContent = `${step.comparisons} 次`;
    if (resEl) {
      resEl.textContent = isFound ? `命中下标 [${step.foundIndex}]` : step.phase === 'not-found' ? '未找到 (-1)' : '折半查找中';
      resEl.style.color = isFound ? '#16a34a' : step.phase === 'not-found' ? '#ef4444' : '#2563eb';
    }

    // 在 Card 2 中展示折半区间关系
    const customMetricsContainer = root.querySelector('#dsp-custom-metrics-container');
    if (customMetricsContainer) {
      customMetricsContainer.innerHTML = `
        <div style="display: flex; flex-direction: column; gap: 4px; font-size: 11px; color: #475569; padding: 4px 0;">
          <div style="display: flex; justify-content: space-between;">
            <span>当前有效搜索范围:</span>
            <strong style="color: #2563eb;">[${step.left} .. ${step.right}]</strong>
          </div>
          <div style="display: flex; justify-content: space-between;">
            <span>中点折半公式:</span>
            <strong style="font-family: monospace; color: #f59e0b;">mid = L + (R - L) / 2</strong>
          </div>
        </div>
      `;
    }
  }
}
