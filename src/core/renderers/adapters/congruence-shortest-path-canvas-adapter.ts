import { CongruenceStep } from './congruence-shortest-path-step-compiler';
import { renderCongruenceBoard } from '../../../algorithms/categories/advanced-topics/advanced-142-148/advanced-142-148-shared';
import { renderFormulaCard } from '../../../algorithms/categories/string/string-100-105/string-100-105-shared';

export function renderCongruenceShortestPathCanvas(container: HTMLElement, step: CongruenceStep): void {
  container.innerHTML = `
    <div style="padding: 16px; background: #ffffff; border-radius: 12px;">
      ${renderCongruenceBoard(
        step.x,
        step.y,
        step.z,
        step.h,
        step.dist,
        step.curU,
        step.ansSoFar
      )}

      <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 12px; margin-bottom: 16px;">
        <div style="background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 10px;">
          <div style="font-size: 11px; color: #64748b;">基准同余系模数 x</div>
          <div style="font-size: 18px; font-weight: 700; color: #4338ca;">mod ${step.x}</div>
        </div>
        <div style="background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 10px;">
          <div style="font-size: 11px; color: #64748b;">当前累计可达楼层数</div>
          <div style="font-size: 18px; font-weight: 700; color: #059669;">${step.ansSoFar}</div>
        </div>
      </div>

      ${renderFormulaCard(
        '同余最短路降维引擎',
        `各余数类独立累加: Count(r) = floor((H - dist[r]) / x) + 1 | 总楼层 = &sum; Count(r)`,
        step.decision,
        step.statusBadge
      )}
    </div>
  `;
}
