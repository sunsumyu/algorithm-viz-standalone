import { CantorStep } from './cantor-expansion-step-compiler';
import { renderCantorBoard } from '../../../algorithms/categories/advanced-topics/advanced-142-148/advanced-142-148-shared';
import { renderFormulaCard } from '../../../algorithms/categories/string/string-100-105/string-100-105-shared';

export function renderCantorExpansionCanvas(container: HTMLElement, step: CantorStep): void {
  container.innerHTML = `
    <div style="padding: 16px; background: #ffffff; border-radius: 12px;">
      ${renderCantorBoard(
        step.perm,
        step.curIndex,
        step.smallerCounts,
        step.factorialWeights,
        step.rank
      )}

      <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 12px; margin-bottom: 16px;">
        <div style="background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 10px;">
          <div style="font-size: 11px; color: #64748b;">正在考察的位索引</div>
          <div style="font-size: 18px; font-weight: 700; color: #4338ca;">
            ${step.curIndex >= 0 ? `位置 [${step.curIndex}] (值 ${step.perm[step.curIndex]})` : '展开就绪'}
          </div>
        </div>
        <div style="background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 10px;">
          <div style="font-size: 11px; color: #64748b;">当前累计字典序 Rank</div>
          <div style="font-size: 18px; font-weight: 700; color: #059669;">第 ${step.rank} 名</div>
        </div>
      </div>

      ${renderFormulaCard(
        '康托展开数码映射引擎',
        `Rank = 1 + &sum;_{i=0}^{N-1} a[i] &times; (N - 1 - i)! | a[i] 为右侧比当前数小的数字个数`,
        step.decision,
        step.statusBadge
      )}
    </div>
  `;
}
