import { renderMCMFBoard } from '../../../algorithms/categories/advanced-topics/advanced-173-178/advanced-173-178-shared';
import { renderFormulaCard } from '../../../algorithms/categories/string/string-100-105/string-100-105-shared';
import { MCMFStep } from './mcmf-cost-flow-174-step-compiler';

export function renderMCMFCanvas(container: HTMLElement, step: MCMFStep): void {
  container.innerHTML = `
    <div style="padding: 16px; background: #ffffff; border-radius: 12px;">
      ${renderMCMFBoard(step.nodes, step.edges, step.totalFlow, step.totalCost, step.stage)}

      <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 12px; margin-bottom: 16px;">
        <div style="background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 10px;">
          <div style="font-size: 11px; color: #64748b;">当前算法阶段</div>
          <div style="font-size: 17px; font-weight: 700; color: #b45309;">${step.stage}</div>
        </div>
        <div style="background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 10px;">
          <div style="font-size: 11px; color: #64748b;">费用最优化准则</div>
          <div style="font-size: 15px; font-weight: 700; color: #059669;">无负费用增广圈</div>
        </div>
      </div>

      ${renderFormulaCard(
        'MCMF 最小费用流定理',
        `增广准则: 每次沿残量网络中以单位费用为边权的单源最短路增广 | 反向费用: cost(v, u) = -cost(u, v) | 终止条件: 不存在增广路`,
        step.decision,
        step.statusBadge
      )}
    </div>
  `;
}
