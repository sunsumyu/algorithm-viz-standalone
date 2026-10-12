import { renderBlockCutBoard } from '../../../algorithms/categories/advanced-topics/advanced-173-178/advanced-173-178-shared';
import { renderFormulaCard } from '../../../algorithms/categories/string/string-100-105/string-100-105-shared';
import { BlockCutStep } from './block-cut-tree-178-step-compiler';

export function renderBlockCutCanvas(container: HTMLElement, step: BlockCutStep): void {
  container.innerHTML = `
    <div style="padding: 16px; background: #ffffff; border-radius: 12px;">
      ${renderBlockCutBoard(step.origNodes, step.blocks, step.stage)}

      <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 12px; margin-bottom: 16px;">
        <div style="background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 10px;">
          <div style="font-size: 11px; color: #64748b;">当前算法阶段</div>
          <div style="font-size: 17px; font-weight: 700; color: #047857;">${step.stage}</div>
        </div>
        <div style="background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 10px;">
          <div style="font-size: 11px; color: #64748b;">降维打击能力</div>
          <div style="font-size: 15px; font-weight: 700; color: #059669;">仙人掌/一般图 &rarr; 树上倍增</div>
        </div>
      </div>

      ${renderFormulaCard(
        '圆方树拓扑与路径映射定理',
        `圆点: 原图所有顶点 | 方点: 原图极大点双连通分量 (BCC) | 连边: 方点向所属 BCC 内所有圆点连边 | 简单路径交集 &equiv; 树上圆点路径`,
        step.decision,
        step.statusBadge
      )}
    </div>
  `;
}
