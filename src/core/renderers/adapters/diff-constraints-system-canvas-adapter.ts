/**
 * Class 142: 差分约束系统与负环判定 领域视觉适配器
 * 核心：约束状态网格、松弛状态指示、公式卡片与状态指示器
 */

import { DiffConstraintsStep } from './diff-constraints-system-step-compiler';
import { renderDiffConstraintsBoard } from '../../../algorithms/categories/advanced-topics/advanced-142-148/advanced-142-148-shared';
import { renderFormulaCard } from '../../../algorithms/categories/string/string-100-105/string-100-105-shared';

export function renderDiffConstraintsCanvas(container: HTMLElement, step: DiffConstraintsStep): void {
  container.innerHTML = `
    <div style="padding: 16px; background: #ffffff; border-radius: 12px;">
      ${renderDiffConstraintsBoard(
        step.n,
        step.dist,
        step.count,
        step.inQueue,
        step.activeNode,
        step.edges,
        step.hasNegativeCycle
      )}

      <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 12px; margin-bottom: 16px;">
        <div style="background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 10px;">
          <div style="font-size: 11px; color: #64748b;">当前松弛活跃节点</div>
          <div style="font-size: 18px; font-weight: 700; color: #4338ca;">
            ${step.activeNode > 0 ? `变量 x${step.activeNode}` : '等待队列出队'}
          </div>
        </div>
        <div style="background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 10px;">
          <div style="font-size: 11px; color: #64748b;">约束系统状态</div>
          <div style="font-size: 16px; font-weight: 700; color: ${step.hasNegativeCycle ? '#dc2626' : '#059669'};">
            ${step.hasNegativeCycle ? '存在负权环 (矛盾)' : '约束正常满足'}
          </div>
        </div>
      </div>

      ${renderFormulaCard(
        '差分约束 SPFA 松弛引擎',
        `三角不等式准则: dist[v] <= dist[u] + w | 负环充要条件: 某节点入队松弛次数 >= N(${step.n})`,
        step.decision,
        step.statusBadge
      )}
    </div>
  `;
}
