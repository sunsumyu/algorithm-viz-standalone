import { renderSegmentTreeDivideBoard } from '../../../algorithms/categories/advanced-topics/advanced-179-184/advanced-179-184-shared';
import { renderFormulaCard } from '../../../algorithms/categories/string/string-100-105/string-100-105-shared';
import { SegmentTreeDivideStep } from './segment-tree-divide-181-step-compiler';

export function renderSegmentTreeDivideCanvas(container: HTMLElement, step: SegmentTreeDivideStep): void {
  container.innerHTML = `
    <div style="padding: 16px; background: #ffffff; border-radius: 12px;">
      ${renderSegmentTreeDivideBoard(
        step.totalTime,
        step.curTime,
        step.edges,
        step.activeEdges,
        step.isBipartite,
        step.stage
      )}

      <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 12px; margin-bottom: 16px;">
        <div style="background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 10px;">
          <div style="font-size: 11px; color: #64748b;">当前算法阶段</div>
          <div style="font-size: 17px; font-weight: 700; color: #b45309;">${step.stage}</div>
        </div>
        <div style="background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 10px;">
          <div style="font-size: 11px; color: #64748b;">离线化优势</div>
          <div style="font-size: 15px; font-weight: 700; color: #059669;">将删边转化为只增不减+回退</div>
        </div>
      </div>

      ${renderFormulaCard(
        '线段树分治核心范式',
        '每条边挂载在 O(log T) 个区间节点 | 前序遍历 DFS + 历史栈回滚',
        step.decision,
        step.statusBadge
      )}
    </div>
  `;
}
