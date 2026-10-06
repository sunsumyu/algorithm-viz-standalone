/**
 * Class 115: 扫描线求矩形面积并 (Sweep Line) 画布渲染适配器
 * 负责二维平面矩形投影与扫描线游标位置、面积切片看板渲染
 */

import { SweepLineStep } from './sweep-line-step-compiler';
import { renderFormulaCard } from '../../../algorithms/categories/string/string-100-105/string-100-105-shared';

export function renderSweepLineCanvas(container: HTMLElement, step: SweepLineStep): void {
  const scale = 5;
  const offsetX = 5;
  const offsetY = 5;

  container.innerHTML = `
    <div style="padding: 16px; background: #ffffff; border-radius: 12px;">
      <div style="font-size: 13px; font-weight: 700; color: #334155; margin-bottom: 8px;">
        🗺️ 二维平面矩形投影与扫描线位置 (当前 X = ${step.curX})
      </div>
      <div style="position: relative; width: 100%; height: 320px; background: #f8fafc; border: 1px solid #cbd5e1; border-radius: 10px; overflow: hidden;">
        <!-- 矩形集合 -->
        ${step.rectangles.map((r, idx) => `
          <div style="position: absolute; left: ${(r.x1 - offsetX) * scale}px; top: ${(r.y1 - offsetY) * scale}px; width: ${(r.x2 - r.x1) * scale}px; height: ${(r.y2 - r.y1) * scale}px; background: rgba(99, 102, 241, 0.15); border: 2px solid #6366f1; border-radius: 4px;">
            <span style="font-size: 10px; color: #4338ca; padding: 2px 4px; font-weight: 700;">R${idx + 1}</span>
          </div>
        `).join('')}

        <!-- 扫描线游标 -->
        ${step.curX > 0 ? `
          <div style="position: absolute; left: ${(step.curX - offsetX) * scale}px; top: 0; bottom: 0; width: 3px; background: #ef4444; box-shadow: 0 0 12px rgba(239, 68, 68, 0.8); z-index: 10;">
            <div style="position: absolute; top: 6px; left: 6px; background: #fee2e2; color: #b91c1c; border: 1px solid #ef4444; border-radius: 4px; font-size: 10px; font-weight: 700; padding: 2px 6px; white-space: nowrap;">
              X = ${step.curX}
            </div>
          </div>
        ` : ''}
      </div>

      ${renderFormulaCard(
        '扫描线切片积分计算',
        `切片范围: [${step.curX} .. ${step.nextX}] (Δx = ${step.nextX - step.curX}) | 纵向覆盖高 H = ${step.activeCoverLen} | 本步增量面积: ${step.stepArea} | 累计并集总面积: ${step.totalArea}`,
        step.decision,
        step.statusBadge
      )}
    </div>
  `;
}
