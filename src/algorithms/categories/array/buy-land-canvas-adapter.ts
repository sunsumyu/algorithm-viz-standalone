/**
 * 开发商购买土地 — 画布适配器
 * 负责 2D 网格沙盘、候选矩形高亮及指标联动
 */

import { BLStep } from './buy-land-step-compiler';

export function renderBuyLandCanvas(container: HTMLElement, step: BLStep): void {
  const isDone = step.status === 'done';

  const rowsHtml = step.grid
    .map((row, r) => {
      const cellsHtml = row
        .map((val, c) => {
          const inCur =
            step.phase === 'scan' &&
            !isDone &&
            r >= step.r1 &&
            r <= step.r2 &&
            c >= step.c1 &&
            c <= step.c2;

          const inBest =
            step.bestRect &&
            r >= step.bestRect[0] &&
            r <= step.bestRect[2] &&
            c >= step.bestRect[1] &&
            c <= step.bestRect[3];

          let bg = '#ffffff';
          let border = '#e2e8f0';
          let textColor = '#0f172a';

          if (inCur) {
            bg = '#eff6ff';
            border = '#3b82f6';
            textColor = '#1d4ed8';
          } else if (inBest) {
            bg = '#f0fdf4';
            border = '#86efac';
            textColor = '#166534';
          }

          return `
            <div style="width: 38px; height: 38px; border-radius: 6px; background: ${bg}; border: 1.5px solid ${border}; display: flex; align-items: center; justify-content: center; font-size: 13px; font-weight: 800; font-family: 'JetBrains Mono', monospace; color: ${textColor}; box-shadow: 0 1px 2px rgba(0,0,0,0.03);">
              ${val}
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
        ${rowsHtml}
      </div>
    </div>
  `;

  const root = container.closest('#algo-buy-land-view');
  if (root) {
    const costEl = root.querySelector('#metric-cur-cost');
    const areaEl = root.querySelector('#metric-cur-area');
    const bestEl = root.querySelector('#metric-best-area');

    if (costEl) costEl.textContent = step.currentSum > 0 ? `${step.currentSum} / ${step.budget}` : '—';
    if (areaEl) areaEl.textContent = `${step.currentArea}`;
    if (bestEl) bestEl.textContent = `${step.bestArea}`;

    const customMetricsContainer = root.querySelector('#dsp-custom-metrics-container');
    if (customMetricsContainer) {
      customMetricsContainer.innerHTML = `
        <div style="display: flex; flex-direction: column; gap: 4px; font-size: 11px; color: #475569; padding: 4px 0;">
          <div style="display: flex; justify-content: space-between;">
            <span>最佳土地坐标:</span>
            <strong style="color: #16a34a;">${step.bestRect ? `[(${step.bestRect[0]},${step.bestRect[1]})..(${step.bestRect[2]},${step.bestRect[3]})]` : '未找到'}</strong>
          </div>
          <div style="font-size: 10px; color: #64748b; margin-top: 2px;">
            • 二维容斥: sum = S[r2+1][c2+1] - S[r1][c2+1] - S[r2+1][c1] + S[r1][c1]
          </div>
        </div>
      `;
    }
  }
}
