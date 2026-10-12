import { renderEulerianPathBoard } from '../../../algorithms/categories/advanced-topics/advanced-185-190/advanced-185-190-shared';
import { renderFormulaCard } from '../../../algorithms/categories/string/string-100-105/string-100-105-shared';
import { EulerianStep } from './eulerian-path-circuit-187-step-compiler';

export function renderEulerianPathCanvas(container: HTMLElement, step: EulerianStep): void {
  container.innerHTML = `
    <div style="padding: 16px; background: #ffffff; border-radius: 12px;">
      ${renderEulerianPathBoard(
        step.nodes,
        step.edges,
        step.inDeg,
        step.outDeg,
        step.pathStack,
        step.stage
      )}

      <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 12px; margin-bottom: 16px;">
        <div style="background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 10px;">
          <div style="font-size: 11px; color: #64748b;">当前算法阶段</div>
          <div style="font-size: 17px; font-weight: 700; color: #047857;">${step.stage}</div>
        </div>
        <div style="background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 10px;">
          <div style="font-size: 11px; color: #64748b;">当前弧优化</div>
          <div style="font-size: 15px; font-weight: 700; color: #059669;">边使用即删，杜绝 O(E^2) 死循环</div>
        </div>
      </div>

      ${renderFormulaCard(
        '有向图欧拉路径充要判定定理',
        '恰有一个点 out = in + 1 (起点), 恰有一个点 in = out + 1 (终点), 其余点 in == out',
        step.decision,
        step.statusBadge
      )}
    </div>
  `;
}
