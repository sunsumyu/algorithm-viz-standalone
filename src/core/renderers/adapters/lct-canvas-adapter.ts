/**
 * Class 155: 动态树 Link-Cut Tree (LCT) 领域视觉适配器
 * 核心：LCT 森林实链画板、当前操作节点指示卡、动态操作阶段卡与实链引擎公式卡
 */

import { LCTStep } from './lct-step-compiler';
import { renderLCTBoard } from '../../../algorithms/categories/advanced-topics/advanced-155-160/advanced-155-160-shared';
import { renderFormulaCard } from '../../../algorithms/categories/string/string-100-105/string-100-105-shared';

export function renderLCTCanvas(container: HTMLElement, step: LCTStep): void {
  container.innerHTML = `
    <div style="padding: 16px; background: #ffffff; border-radius: 12px;">
      ${renderLCTBoard(step.nodes, step.edges, step.activeNode, step.accessPath, step.actionName)}

      <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 12px; margin-bottom: 16px;">
        <div style="background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 10px;">
          <div style="font-size: 11px; color: #64748b;">当前操作节点</div>
          <div style="font-size: 18px; font-weight: 700; color: #4338ca;">
            ${step.activeNode > 0 ? `Node ${step.activeNode}` : '就绪'}
          </div>
        </div>
        <div style="background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 10px;">
          <div style="font-size: 11px; color: #64748b;">动态操作阶段</div>
          <div style="font-size: 16px; font-weight: 700; color: #059669;">${step.actionName}</div>
        </div>
      </div>

      ${renderFormulaCard(
        'LCT 动态树实链引擎',
        `实链准则: 每个节点至多连一条实儿子边 | Access(x): 根到 x 全打通为实链 | 均摊复杂度: O(log N)`,
        step.decision,
        step.statusBadge
      )}
    </div>
  `;
}
