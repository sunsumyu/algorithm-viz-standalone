import { renderHungarianBoard } from '../../../algorithms/categories/advanced-topics/advanced-173-178/advanced-173-178-shared';
import { renderFormulaCard } from '../../../algorithms/categories/string/string-100-105/string-100-105-shared';
import { HungarianStep } from './hungarian-matching-175-step-compiler';

export function renderHungarianCanvas(container: HTMLElement, step: HungarianStep): void {
  container.innerHTML = `
    <div style="padding: 16px; background: #ffffff; border-radius: 12px;">
      ${renderHungarianBoard(step.nLeft, step.nRight, step.edges, step.matchRight, step.activeLeft, step.stage)}

      <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 12px; margin-bottom: 16px;">
        <div style="background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 10px;">
          <div style="font-size: 11px; color: #64748b;">当前算法阶段</div>
          <div style="font-size: 17px; font-weight: 700; color: #15803d;">${step.stage}</div>
        </div>
        <div style="background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 10px;">
          <div style="font-size: 11px; color: #64748b;">König 定理</div>
          <div style="font-size: 15px; font-weight: 700; color: #059669;">最大匹配 = 最小点覆盖</div>
        </div>
      </div>

      ${renderFormulaCard(
        '匈牙利增广路定理',
        `增广路定义: 起点与终点均未匹配的交替路 | 增广反转: 匹配边与未匹配边状态对调 &rArr; 匹配数 + 1 | 充要条件: 不存在增广路即为最大匹配`,
        step.decision,
        step.statusBadge
      )}
    </div>
  `;
}
