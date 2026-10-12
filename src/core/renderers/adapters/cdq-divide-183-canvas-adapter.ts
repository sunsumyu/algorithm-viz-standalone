import { renderCDQDivideBoard } from '../../../algorithms/categories/advanced-topics/advanced-179-184/advanced-179-184-shared';
import { renderFormulaCard } from '../../../algorithms/categories/string/string-100-105/string-100-105-shared';
import { CDQDivideStep } from './cdq-divide-183-step-compiler';

export function renderCDQDivideCanvas(container: HTMLElement, step: CDQDivideStep): void {
  container.innerHTML = `
    <div style="padding: 16px; background: #ffffff; border-radius: 12px;">
      ${renderCDQDivideBoard(
        step.points,
        step.l,
        step.r,
        step.mid,
        step.stage
      )}

      <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 12px; margin-bottom: 16px;">
        <div style="background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 10px;">
          <div style="font-size: 11px; color: #64748b;">当前算法阶段</div>
          <div style="font-size: 17px; font-weight: 700; color: #7e22ce;">${step.stage}</div>
        </div>
        <div style="background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 10px;">
          <div style="font-size: 11px; color: #64748b;">偏序降维技巧</div>
          <div style="font-size: 15px; font-weight: 700; color: #059669;">第一维排序 + 归并第二维 + 树状数组第三维</div>
        </div>
      </div>

      ${renderFormulaCard(
        '三维偏序 CDQ 降维法',
        '第 1 维: 全局排序 => 第 2 维: 归并排序 => 第 3 维: 树状数组维护',
        step.decision,
        step.statusBadge
      )}
    </div>
  `;
}
