/**
 * 螺旋矩阵 II — 画布适配器
 * 负责 2D 网格填充状态展示、边界变化与指标联动
 */

import { SpiralStep } from './spiral-matrix-ii-step-compiler';

export function renderSpiralMatrixIICanvas(container: HTMLElement, step: SpiralStep): void {
  const n = step.n;
  const isDone = step.status === 'done';

  const gridRowsHtml = step.matrix
    .map((row, r) => {
      const cellsHtml = row
        .map((val, c) => {
          const isCur = r === step.currentRow && c === step.currentCol && !isDone;
          const isFilled = val > 0;

          let bg = '#ffffff';
          let border = '#e2e8f0';
          let textColor = '#64748b';

          if (isCur) {
            bg = '#fffbeb';
            border = '#f59e0b';
            textColor = '#b45309';
          } else if (isFilled) {
            bg = '#f0fdf4';
            border = '#86efac';
            textColor = '#166534';
          }

          return `
            <div style="width: 38px; height: 38px; border-radius: 6px; background: ${bg}; border: 1.5px solid ${border}; display: flex; align-items: center; justify-content: center; font-size: 13px; font-weight: 800; font-family: 'JetBrains Mono', monospace; color: ${textColor}; box-shadow: 0 1px 2px rgba(0,0,0,0.03);">
              ${val > 0 ? val : '·'}
            </div>
          `;
        })
        .join('');

      return `<div style="display: flex; gap: 4px;">${cellsHtml}</div>`;
    })
    .join('');

  container.innerHTML = `
    <div style="display: flex; flex-direction: column; width: 100%; height: 100%; align-items: center; justify-content: center; gap: 6px; box-sizing: border-box;">
      <div style="display: flex; flex-direction: column; gap: 4px; padding: 6px;">
        ${gridRowsHtml}
      </div>
    </div>
  `;

  const root = container.closest('#algo-spiral-matrix-ii-view');
  if (root) {
    const posEl = root.querySelector('#metric-cur-pos');
    const dirEl = root.querySelector('#metric-fill-dir');
    const progEl = root.querySelector('#metric-fill-progress');

    if (posEl) posEl.textContent = step.currentRow >= 0 ? `(${step.currentRow}, ${step.currentCol})` : '—';
    if (dirEl) dirEl.textContent = step.dir;
    if (progEl) progEl.textContent = `${step.num} / ${n * n}`;

    const customMetricsContainer = root.querySelector('#dsp-custom-metrics-container');
    if (customMetricsContainer) {
      customMetricsContainer.innerHTML = `
        <div style="display: flex; flex-direction: column; gap: 4px; font-size: 11px; color: #475569; padding: 4px 0;">
          <div style="display: flex; justify-content: space-between;">
            <span>四边界坐标:</span>
            <strong style="font-family: monospace; color: #2563eb;">T:${step.top}, B:${step.bottom}, L:${step.left}, R:${step.right}</strong>
          </div>
          <div style="display: flex; justify-content: space-between;">
            <span>当前写入值:</span>
            <strong style="font-family: monospace; color: #16a34a;">${step.num > 0 ? step.num : '准备就绪'}</strong>
          </div>
        </div>
      `;
    }
  }
}
