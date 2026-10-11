/**
 * 区间和（前缀和）— 画布渲染适配器
 */

import { ArrayTrackAdapter } from '../../../core/renderers/adapters/array-track-adapter';
import { RSumStep } from './range-sum-step-compiler';

export function renderRangeSumCanvas(container: HTMLElement, step: RSumStep): void {
  const isQuery = step.phase === 'query' && step.L >= 0;

  ArrayTrackAdapter.renderTrack(container, {
    array: step.arr,
    windowRange: isQuery ? { left: step.L, right: step.R, color: '#3b82f6' } : undefined,
    primaryTitle: '📊 原始数组 (nums):',
    secondaryArray: step.prefix,
    secondaryTitle: '📦 前缀和数组 (prefix):',
  });

  const root = container.closest('#algo-range-sum-view');
  if (root) {
    const qRangeEl = root.querySelector('#metric-query-range');
    const formulaEl = root.querySelector('#metric-diff-formula');
    const resEl = root.querySelector('#metric-query-result');

    if (qRangeEl)
      qRangeEl.textContent = isQuery
        ? `[${step.L}, ${step.R}]`
        : step.phase === 'build'
          ? '构建前缀和中'
          : '完成';
    if (formulaEl) {
      formulaEl.textContent = isQuery ? `prefix[${step.R + 1}] - prefix[${step.L}]` : '—';
    }
    if (resEl)
      resEl.textContent = isQuery
        ? `${step.sum}`
        : step.status === 'done'
          ? `共 ${step.results.length} 次查询`
          : '—';

    // 在 Card 2 中展示查询结果序列
    const customMetricsContainer = root.querySelector('#dsp-custom-metrics-container');
    if (customMetricsContainer) {
      const resultsChips =
        step.results
          .map(
            (ans, idx) =>
              `<span style="padding: 1px 6px; background: #f0fdf4; border: 1px solid #bbf7d0; color: #166534; border-radius: 4px; font-size: 10.5px; font-family: monospace;">Q${idx + 1}: ${ans}</span>`
          )
          .join(' ') ||
        '<span style="color:#94a3b8; font-size:10.5px; font-style:italic;">等待执行查询...</span>';

      customMetricsContainer.innerHTML = `
        <div style="display: flex; flex-direction: column; gap: 4px; padding: 4px 0;">
          <span style="font-size: 10.5px; font-weight: 700; color: #475569;">已计算查询结果列表:</span>
          <div style="display: flex; flex-wrap: wrap; gap: 4px;">${resultsChips}</div>
        </div>
      `;
    }
  }
}
