import { renderDinicBoard } from '../../../algorithms/categories/advanced-topics/advanced-173-178/advanced-173-178-shared';
import { renderFormulaCard } from '../../../algorithms/categories/string/string-100-105/string-100-105-shared';
import { DinicStep } from './dinic-max-flow-173-step-compiler';

export function renderDinicCanvas(container: HTMLElement, step: DinicStep): void {
  container.innerHTML = `
    <div style="padding: 16px; background: #ffffff; border-radius: 12px;">
      ${renderDinicBoard(step.nodes, step.edges, step.dep, step.maxFlow, step.stage)}

      <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 12px; margin-bottom: 16px;">
        <div style="background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 10px;">
          <div style="font-size: 11px; color: #64748b;">当前算法阶段</div>
          <div style="font-size: 17px; font-weight: 700; color: #0284c7;">${step.stage}</div>
        </div>
        <div style="background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 10px;">
          <div style="font-size: 11px; color: #64748b;">当前弧优化</div>
          <div style="font-size: 15px; font-weight: 700; color: #059669;">避免重复无效深搜</div>
        </div>
      </div>

      ${renderFormulaCard(
        'Dinic 最大流与最大流最小割定理',
        `层次边条件: dep[v] = dep[u] + 1 | 反向弧退流: cap[e] -= f, cap[e ^ 1] += f | 最大流 = 最小割容量`,
        step.decision,
        step.statusBadge
      )}
    </div>
  `;
}
