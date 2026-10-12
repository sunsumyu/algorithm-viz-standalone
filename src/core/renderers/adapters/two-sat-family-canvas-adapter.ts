import {
  renderTwoSatBoard,
  renderTwoSatAdvancedBoard,
} from '../../../algorithms/categories/advanced-topics/advanced-191-195/advanced-191-195-shared';
import { renderFormulaCard } from '../../../algorithms/categories/string/string-100-105/string-100-105-shared';
import {
  TwoSatStep,
  TwoSatAdvancedStep,
} from './two-sat-family-compiler';

export function renderTwoSatCanvas(container: HTMLElement, step: TwoSatStep): void {
  container.innerHTML = `
    <div style="padding: 16px; background: #ffffff; border-radius: 12px;">
      ${renderTwoSatBoard(
        step.vars,
        step.clauses,
        step.sccId,
        step.assignment,
        step.isSatisfiable,
        step.stage
      )}

      <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 12px; margin-bottom: 16px;">
        <div style="background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 10px;">
          <div style="font-size: 11px; color: #64748b;">当前算法阶段</div>
          <div style="font-size: 17px; font-weight: 700; color: #047857;">${step.stage}</div>
        </div>
        <div style="background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 10px;">
          <div style="font-size: 11px; color: #64748b;">取值准则</div>
          <div style="font-size: 15px; font-weight: 700; color: #059669;">sccId[X] < sccId[~X] 取 TRUE</div>
        </div>
      </div>

      ${renderFormulaCard(
        '2-SAT 蕴含与矛盾充要定理',
        '(A \\lor B) \\iff (\\neg A \\to B) \\land (\\neg B \\to A); \\quad \\text{无解 } \\iff \\exists i, \\text{scc}[2i] = \\text{scc}[2i+1]',
        step.decision,
        step.statusBadge
      )}
    </div>
  `;
}

export function renderTwoSatAdvancedCanvas(container: HTMLElement, step: TwoSatAdvancedStep): void {
  container.innerHTML = `
    <div style="padding: 16px; background: #ffffff; border-radius: 12px;">
      ${renderTwoSatAdvancedBoard(
        step.vars,
        step.atMostOneSet,
        step.assignment,
        step.stage
      )}

      <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 12px; margin-bottom: 16px;">
        <div style="background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 10px;">
          <div style="font-size: 11px; color: #64748b;">当前算法阶段</div>
          <div style="font-size: 17px; font-weight: 700; color: #7c3aed;">${step.stage}</div>
        </div>
        <div style="background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 10px;">
          <div style="font-size: 11px; color: #64748b;">排他建模优化</div>
          <div style="font-size: 15px; font-weight: 700; color: #059669;">两两排他 O(K^2) => 前缀链 O(K)</div>
        </div>
      </div>

      ${renderFormulaCard(
        '前缀优化“至多选一个”核心逻辑',
        'X_i \\to \\text{pre}_i; \\quad \\text{pre}_{i-1} \\to \\text{pre}_i; \\quad X_i \\to \\neg \\text{pre}_{i-1} \\quad (O(K) \\text{ 边})',
        step.decision,
        step.statusBadge
      )}
    </div>
  `;
}
