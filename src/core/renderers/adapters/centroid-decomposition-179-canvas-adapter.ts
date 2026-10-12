import { renderCentroidBoard } from '../../../algorithms/categories/advanced-topics/advanced-179-184/advanced-179-184-shared';
import { renderFormulaCard } from '../../../algorithms/categories/string/string-100-105/string-100-105-shared';
import { CentroidStep } from './centroid-decomposition-179-step-compiler';

export function renderCentroidCanvas(container: HTMLElement, step: CentroidStep): void {
  container.innerHTML = `
    <div style="padding: 16px; background: #ffffff; border-radius: 12px;">
      ${renderCentroidBoard(
        step.nodes,
        step.centroid,
        step.visitedCentroids,
        step.validPaths,
        step.stage
      )}

      <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 12px; margin-bottom: 16px;">
        <div style="background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 10px;">
          <div style="font-size: 11px; color: #64748b;">当前算法阶段</div>
          <div style="font-size: 17px; font-weight: 700; color: #0284c7;">${step.stage}</div>
        </div>
        <div style="background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 10px;">
          <div style="font-size: 11px; color: #64748b;">递归深度保障</div>
          <div style="font-size: 15px; font-weight: 700; color: #059669;">重心子树 <= N/2, 深度 <= log N</div>
        </div>
      </div>

      ${renderFormulaCard(
        '点分治复杂度保证',
        '递归深度: O(log N) | 每层统计: O(N) | 总时间复杂度: O(N log N)',
        step.decision,
        step.statusBadge
      )}
    </div>
  `;
}
