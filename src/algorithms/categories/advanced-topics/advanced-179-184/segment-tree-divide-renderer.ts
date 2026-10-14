/**
 * Class 181: 线段树分治 (Segment Tree Divide & Conquer)
 * 时间轴线段树挂载 + 可撤销并查集回溯 + 动态二分图判定 / 洛谷 P5787 【模板】线段树分治
 */

import { registerDeclarativeAlgorithm } from '../../../../core/declarative-algorithm-visualizer';
import { ADVANCED_179_184_PROBLEMS } from './advanced-179-184-problem-content';
import { SEGMENT_TREE_DIVIDE_CODES } from './advanced-179-184-stage-codes';
import {
  buildSegmentTreeDivideSteps,
  SegmentTreeDivideStep,
} from '../../../../core/renderers/adapters/segment-tree-divide-181-step-compiler';
import { renderSegmentTreeDivideCanvas } from '../../../../core/renderers/adapters/segment-tree-divide-181-canvas-adapter';

export { buildSegmentTreeDivideSteps, type SegmentTreeDivideStep };

export const segmentTreeDivideVisualizer = registerDeclarativeAlgorithm<SegmentTreeDivideStep>({
  id: 'segment-tree-divide-181',
  name: '线段树分治 (Segment Tree Divide / Class 181)',
  aliases: ['class181-code01', 'segment-tree-divide-181', 'timeline-segment-tree-divide'],
  category: 'tree',
  icon: '⏱️',
  difficulty: 3,
  levelOrder: 181,
  description: '左程云算法通关课 Class 181：线段树分治 (Segment Tree Divide)。通过时间轴线段树区间覆盖转化带删除操作，配合可撤销并查集回溯，优雅解决动态二分图判定。',
  learningGoal: '掌握时间轴线段树打标记、可撤销并查集 DFS 前序遍历与回溯历史栈快照一键回退',
  problemHtml: ADVANCED_179_184_PROBLEMS.segmentTreeDivide.html,
  analysisHtml: ADVANCED_179_184_PROBLEMS.segmentTreeDivide.html,
  presets: [
    { label: '3 时刻加删边 (T=1:YES, T=2:NO[奇环], T=3:YES)', values: { preset: 'timeline_3_cycle' } },
  ],
  codeLanguages: SEGMENT_TREE_DIVIDE_CODES,
  generateSteps: () => buildSegmentTreeDivideSteps(),
  renderCanvas: (container, step) => renderSegmentTreeDivideCanvas(container, step),
});
