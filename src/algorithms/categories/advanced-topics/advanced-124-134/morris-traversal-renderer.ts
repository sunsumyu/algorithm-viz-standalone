/**
 * Class 124: Morris 遍历 (Morris Traversal)
 * LeetCode 94 / 144 / 145 / 洛谷 B3642
 */

import { registerDeclarativeAlgorithm } from '../../../../core/declarative-algorithm-visualizer';
import { ADVANCED_124_134_PROBLEMS } from './advanced-124-134-problem-content';
import { MORRIS_CODES } from './advanced-124-134-stage-codes';
import {
  MorrisStep,
  buildMorrisSteps,
} from '../../../../core/renderers/adapters/morris-traversal-step-compiler';
import { renderMorrisTraversalCanvas } from '../../../../core/renderers/adapters/morris-traversal-canvas-adapter';

export type { MorrisStep };
export { buildMorrisSteps };

export const morrisVisualizer = registerDeclarativeAlgorithm<MorrisStep>({
  id: 'morris-traversal-124',
  name: 'Morris 遍历 (Class 124)',
  aliases: ['class124-code01', 'morris-traversal', 'morris-traversal-124', 'inorder-morris'],
  category: 'tree',
  icon: '🧵',
  difficulty: 3,
  levelOrder: 124,
  learningGoal: '深刻理解 Morris 遍历利用叶子节点空闲右指针建立线索与拆除恢复二叉树结构、实现 O(1) 空间中序遍历的精妙机制',
  problemHtml: ADVANCED_124_134_PROBLEMS.morris.html,
  analysisHtml: ADVANCED_124_134_PROBLEMS.morris.html,
  inputs: [
    {
      id: 'treePreset',
      label: '二叉树结构预设',
      type: 'select',
      defaultValue: 'classic_7node',
      options: [
        { label: '经典 7 节点满二叉树 (1,2,3,4,5,6,7)', value: 'classic_7node' },
        { label: '倾斜二叉树 (包含单支与分支)', value: 'skew_tree' },
      ],
    },
  ],
  codeLanguages: MORRIS_CODES,
  generateSteps: (input) => {
    const preset = String(input.treePreset || 'classic_7node');
    if (preset === 'skew_tree') {
      const tree = [
        { id: 1, val: 10, left: 2, right: 3 },
        { id: 2, val: 5, left: 4 },
        { id: 4, val: 2 },
        { id: 3, val: 15, right: 5 },
        { id: 5, val: 20 },
      ];
      return buildMorrisSteps(tree, 1);
    }
    const classicTree = [
      { id: 1, val: 4, left: 2, right: 3 },
      { id: 2, val: 2, left: 4, right: 5 },
      { id: 3, val: 6, left: 6, right: 7 },
      { id: 4, val: 1 },
      { id: 5, val: 3 },
      { id: 6, val: 5 },
      { id: 7, val: 7 },
    ];
    return buildMorrisSteps(classicTree, 1);
  },
  renderCanvas: (container, step) => {
    renderMorrisTraversalCanvas(container, step);
  },
});
