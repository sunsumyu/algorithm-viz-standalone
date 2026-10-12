import { MorrisStep } from './morris-traversal-step-compiler';
import { renderMorrisTreeVisual } from '../../../algorithms/categories/advanced-topics/advanced-124-134/advanced-124-134-shared';
import { renderFormulaCard } from '../../../algorithms/categories/string/string-100-105/string-100-105-shared';

export function renderMorrisTraversalCanvas(container: HTMLElement, step: MorrisStep): void {
  container.innerHTML = `
    <div style="padding: 16px; background: #ffffff; border-radius: 12px;">
      ${renderMorrisTreeVisual(step.nodes, step.curId, step.mostRightId, step.traversalList)}

      ${renderFormulaCard(
        'Morris 遍历线索化执行引擎',
        `当前节点游标: ${step.curId ? `#${step.curId}` : 'null (遍历结束)'} | 最右前驱 mostRight: ${step.mostRightId ? `#${step.mostRightId}` : '无'}`,
        step.decision,
        step.statusBadge
      )}
    </div>
  `;
}
