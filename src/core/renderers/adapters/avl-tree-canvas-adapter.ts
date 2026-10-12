import { AVLStep } from './avl-tree-step-compiler';
import { renderAVLTreeBoard } from '../../../algorithms/categories/advanced-topics/advanced-142-148/advanced-142-148-shared';
import { renderFormulaCard } from '../../../algorithms/categories/string/string-100-105/string-100-105-shared';

export function renderAVLTreeCanvas(container: HTMLElement, step: AVLStep): void {
  container.innerHTML = `
    <div style="padding: 16px; background: #ffffff; border-radius: 12px;">
      ${renderAVLTreeBoard(step.root, step.activeKey, step.rotationType)}

      <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 12px; margin-bottom: 16px;">
        <div style="background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 10px;">
          <div style="font-size: 11px; color: #64748b;">当前操作键值</div>
          <div style="font-size: 18px; font-weight: 700; color: #4338ca;">
            ${step.activeKey >= 0 ? `Key = ${step.activeKey}` : '调整就绪'}
          </div>
        </div>
        <div style="background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 10px;">
          <div style="font-size: 11px; color: #64748b;">平衡旋转状态</div>
          <div style="font-size: 16px; font-weight: 700; color: ${step.rotationType !== 'None' ? '#b45309' : '#059669'};">
            ${step.rotationType !== 'None' ? step.rotationType : '平衡维持良好'}
          </div>
        </div>
      </div>

      ${renderFormulaCard(
        'AVL 严格平衡因子维护',
        `平衡准则: |b| = |h(left) - h(right)| &le; 1 | 四种失衡修正: LL(右单旋), RR(左单旋), LR(双旋), RL(双旋)`,
        step.decision,
        step.statusBadge
      )}
    </div>
  `;
}
