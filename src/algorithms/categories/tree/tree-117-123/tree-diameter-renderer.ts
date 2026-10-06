/**
 * Class 123: 树的直径 (Tree Diameter - 两遍 BFS/DFS)
 * SP1437 / LeetCode 1245
 * 薄领域适配器 (Thin Domain Adapter)
 */

import { registerDeclarativeAlgorithm } from '../../../../core/declarative-algorithm-visualizer';
import { TREE_117_123_PROBLEMS } from './tree-117-123-problem-content';
import {
  TreeDiameterStep,
  TREE_DIAMETER_CODES,
  TREE_DIAMETER_LINES,
  buildTreeDiameterSteps,
} from '../../../../core/renderers/adapters/tree-diameter-step-compiler';
import { renderTreeDiameterCanvas } from '../../../../core/renderers/adapters/tree-diameter-canvas-adapter';

// 向后兼容导出
export {
  type TreeDiameterStep,
  TREE_DIAMETER_CODES,
  TREE_DIAMETER_LINES,
  buildTreeDiameterSteps,
};

export const treeDiameterVisualizer = registerDeclarativeAlgorithm<TreeDiameterStep>({
  id: 'tree-diameter-123',
  name: '树的直径 (Class 123)',
  aliases: ['class123-code01', 'tree-diameter', 'tree-diameter-123'],
  category: 'tree',
  icon: '📏',
  difficulty: 2,
  levelOrder: 123,
  learningGoal: '深刻理解两遍 BFS 求解无权/非负权树直径的数学证明与线性复杂度实现',
  problemHtml: TREE_117_123_PROBLEMS.treeDiameter.html,
  analysisHtml: TREE_117_123_PROBLEMS.treeDiameter.html,
  inputs: [
    {
      id: 'edges',
      label: '树边集合 (u-v 逗号分隔)',
      type: 'text',
      defaultValue: '1-2,1-3,2-4,2-5,3-6,3-7,5-8',
      placeholder: '格式如 1-2,1-3,2-4,2-5',
    },
    {
      id: 'root',
      label: '第一遍搜索起点',
      type: 'number',
      defaultValue: 1,
      min: 1,
      max: 20,
    },
  ],
  codeLanguages: TREE_DIAMETER_CODES,
  generateSteps: (input) => {
    const rawEdges = String(input.edges || '1-2,1-3,2-4,2-5,3-6,3-7,5-8');
    const edges: [number, number][] = rawEdges.split(',').map(pair => {
      const [a, b] = pair.split('-').map(Number);
      return [a || 1, b || 2];
    });
    const root = Number(input.root) || 1;
    return buildTreeDiameterSteps(edges, root);
  },
  renderCanvas: (container, step) => {
    renderTreeDiameterCanvas(container, step);
  },
});
