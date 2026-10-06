/**
 * Class 113: 区间合并线段树 (Interval Merge Segment Tree)
 * 洛谷 P4513 小白逛公园 / GSS1
 */

import { registerDeclarativeAlgorithm } from '../../../../core/declarative-algorithm-visualizer';
import { TREE_108_116_PROBLEMS } from './tree-108-116-problem-content';
import {
  IntervalMergeNode,
  IntervalMergeStep,
  buildIntervalMergeSteps,
  INTERVAL_MERGE_SEGMENT_TREE_CODES,
} from '../../../../core/renderers/adapters/interval-merge-step-compiler';
import { renderIntervalMergeCanvas } from '../../../../core/renderers/adapters/interval-merge-canvas-adapter';

export type { IntervalMergeNode, IntervalMergeStep };
export { buildIntervalMergeSteps };

export const intervalMergeVisualizer = registerDeclarativeAlgorithm<IntervalMergeStep>({
  id: 'interval-merge-segment-tree-113',
  name: '区间合并线段树 (Class 113)',
  aliases: ['class113-code01', 'interval-merge-segment-tree', 'interval-merge-segment-tree-113', 'max-subarray-sum-seg-tree'],
  category: 'tree',
  icon: '🧩',
  difficulty: 3,
  levelOrder: 113,
  learningGoal: '掌握线段树四元组 (sum, lmax, rmax, maxSum) 的合并定理与跨越中点动态拼接技巧',
  problemHtml: TREE_108_116_PROBLEMS.intervalMerge.html,
  analysisHtml: TREE_108_116_PROBLEMS.intervalMerge.html,
  inputs: [
    {
      id: 'nums',
      label: '输入序列 (含正负数，逗号分隔)',
      type: 'text',
      defaultValue: '2,-4,3,-1,2,-3,4,-1',
      placeholder: '如 2,-4,3,-1,2,-3,4,-1',
    },
  ],
  codeLanguages: INTERVAL_MERGE_SEGMENT_TREE_CODES,
  generateSteps: (input) => {
    const nums = String(input.nums || '2,-4,3,-1,2,-3,4,-1').split(',').map(Number).filter(n => !isNaN(n));
    return buildIntervalMergeSteps(nums);
  },
  renderCanvas: (container, step) => {
    renderIntervalMergeCanvas(container, step);
  },
});
