/**
 * Class 120: 树的重心 (Tree Centroid)
 * POJ 1655 / 洛谷 P1395
 * 薄领域适配器 (Thin Domain Adapter)
 */

import { registerDeclarativeAlgorithm } from '../../../../core/declarative-algorithm-visualizer';
import { TREE_117_123_PROBLEMS } from './tree-117-123-problem-content';
import {
  TreeCentroidStep,
  TREE_CENTROID_CODES,
  TREE_CENTROID_LINES,
  buildTreeCentroidSteps,
} from '../../../../core/renderers/adapters/tree-centroid-step-compiler';
import { renderTreeCentroidCanvas } from '../../../../core/renderers/adapters/tree-centroid-canvas-adapter';

// 向后兼容导出
export {
  type TreeCentroidStep,
  TREE_CENTROID_CODES,
  TREE_CENTROID_LINES,
  buildTreeCentroidSteps,
};

export const treeCentroidVisualizer = registerDeclarativeAlgorithm<TreeCentroidStep>({
  id: 'tree-centroid-120',
  name: '树的重心 (Class 120)',
  aliases: ['class120-code01', 'tree-centroid', 'tree-centroid-120'],
  category: 'tree',
  icon: '⚖️',
  difficulty: 2,
  levelOrder: 120,
  learningGoal: '掌握树形 DP 统计子树大小与上方连通块，确定删除后最大连通块最小的重心节点',
  problemHtml: TREE_117_123_PROBLEMS.treeCentroid.html,
  analysisHtml: TREE_117_123_PROBLEMS.treeCentroid.html,
  inputs: [
    {
      id: 'edges',
      label: '树边集合 (u-v 逗号分隔)',
      type: 'text',
      defaultValue: '1-2,1-3,2-4,2-5,3-6,3-7,5-8',
      placeholder: '格式如 1-2,1-3,2-4,2-5',
    },
  ],
  codeLanguages: TREE_CENTROID_CODES,
  generateSteps: (input) => {
    const raw = String(input.edges || '1-2,1-3,2-4,2-5,3-6,3-7,5-8');
    const edges: [number, number][] = raw.split(',').map(pair => {
      const [a, b] = pair.split('-').map(Number);
      return [a || 1, b || 2];
    });
    return buildTreeCentroidSteps(edges);
  },
  renderCanvas: (container, step) => {
    renderTreeCentroidCanvas(container, step);
  },
});
