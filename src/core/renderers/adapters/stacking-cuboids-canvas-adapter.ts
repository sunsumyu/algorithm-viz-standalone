/**
 * 左程云 Class 072 Code01: 堆叠长方体的最大高度 CanvasAdapter
 * 职责：纯粹的 3D 长方体状态卡片流沙盘渲染
 */

import { CuboidStep } from './stacking-cuboids-step-compiler';

export function renderStackingCuboidsCanvas(container: HTMLElement, step: CuboidStep): void {
  const cuboidCards = step.cuboids
    .map((c, idx) => {
      const isCurrent = idx === step.currentIdx;
      const isCompare = idx === step.compareIdx;

      let borderColor = '#334155';
      let bgColor = 'rgba(30, 41, 59, 0.7)';
      if (isCurrent) {
        borderColor = '#38bdf8';
        bgColor = 'rgba(14, 165, 233, 0.18)';
      } else if (isCompare) {
        borderColor = '#f59e0b';
        bgColor = 'rgba(245, 158, 11, 0.18)';
      }

      return `
        <div style="
          display: flex;
          flex-direction: column;
          align-items: center;
          background: ${bgColor};
          border: 1.5px solid ${borderColor};
          border-radius: 8px;
          padding: 8px 12px;
          min-width: 90px;
          transition: all 0.25s ease;
        ">
          <div style="font-size: 11px; color: #94a3b8; font-family: monospace;">#${idx}</div>
          <div style="font-size: 14px; font-weight: 700; color: #f8fafc; margin: 4px 0; font-family: monospace;">
            ${c[0]} × ${c[1]} × <span style="color: #38bdf8;">${c[2]}</span>
          </div>
          <div style="font-size: 11px; color: #4ade80; font-family: monospace; border-top: 1px solid rgba(148, 163, 184, 0.15); width: 100%; text-align: center; padding-top: 4px;">
            dp: ${step.dp[idx] ?? '-'}
          </div>
        </div>
      `;
    })
    .join('');

  container.innerHTML = `
    <div style="width: 100%; height: 100%; display: flex; flex-direction: column; background: #0f172a; color: #f8fafc; padding: 12px; box-sizing: border-box; overflow-y: auto;">
      <div style="
        display: flex;
        flex-wrap: wrap;
        gap: 12px;
        justify-content: center;
        padding: 16px;
        background: rgba(15, 23, 42, 0.6);
        border: 1px solid #334155;
        border-radius: 10px;
      ">
        ${cuboidCards}
      </div>
    </div>
  `;
}
