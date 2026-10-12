/**
 * Morris 遍历线索化执行引擎领域视觉适配器
 * 负责 Morris 树拓扑及游标状态渲染
 */

import { MorrisStep } from './morris-traversal-step-compiler';
import { renderMorrisTreeVisual } from '../../../algorithms/categories/advanced-topics/advanced-124-134/advanced-124-134-shared';
import { composeUnifiedCanvas } from './unified-canvas-composer';

export function renderMorrisTraversalCanvas(container: HTMLElement, step: MorrisStep): void {
  composeUnifiedCanvas(container, {
    mainBoardHtml: renderMorrisTreeVisual(step.nodes, step.curId, step.mostRightId, step.traversalList),
    formula: {
      title: 'Morris 遍历线索化执行引擎',
      equation: `当前节点游标: ${step.curId ? `#${step.curId}` : 'null (遍历结束)'} | 最右前驱 mostRight: ${step.mostRightId ? `#${step.mostRightId}` : '无'}`,
      explanation: step.decision,
      statusBadge: step.statusBadge,
    },
  });
}
