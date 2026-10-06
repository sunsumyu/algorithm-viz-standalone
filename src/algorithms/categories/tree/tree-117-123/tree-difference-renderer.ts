/**
 * Class 122: 树上差分 (Tree Difference - 点差分)
 * 洛谷 P3128 [USACO15DEC] Max Flow P
 * 薄领域适配器 (Thin Domain Adapter)
 */

import { registerDeclarativeAlgorithm } from '../../../../core/declarative-algorithm-visualizer';
import { TREE_117_123_PROBLEMS } from './tree-117-123-problem-content';
import {
  TreeDiffStep,
  TREE_DIFFERENCE_CODES,
  buildTreeDiffSteps,
} from '../../../../core/renderers/adapters/tree-difference-step-compiler';
import { renderTreeDiffCanvas } from '../../../../core/renderers/adapters/tree-difference-canvas-adapter';

// 向后兼容导出
export { type TreeDiffStep, buildTreeDiffSteps };

export const treeDifferenceVisualizer = registerDeclarativeAlgorithm<TreeDiffStep>({
  id: 'tree-difference-122',
  name: '树上差分 (Class 122)',
  aliases: ['class122-code01', 'tree-difference', 'tree-difference-122'],
  category: 'tree',
  icon: '🔀',
  difficulty: 3,
  levelOrder: 122,
  learningGoal: '深刻理解树上点差分 diff[u]++, diff[v]++, diff[lca]--, diff[fa]-- 规则及子树后序累加',
  problemHtml: TREE_117_123_PROBLEMS.treeDifference.html,
  analysisHtml: TREE_117_123_PROBLEMS.treeDifference.html,
  inputs: [
    {
      id: 'edges',
      label: '树边集合 (u-v 逗号分隔)',
      type: 'text',
      defaultValue: '1-2,1-3,2-4,2-5,3-6,3-7,5-8',
      placeholder: '格式如 1-2,1-3,2-4,2-5',
    },
    {
      id: 'paths',
      label: '操作路径列表 (u-v 逗号分隔)',
      type: 'text',
      defaultValue: '4-7,8-6',
      placeholder: '格式如 4-7,8-6',
    },
  ],
  codeLanguages: TREE_DIFFERENCE_CODES,
  generateSteps: (input) => {
    const rawEdges = String(input.edges || '1-2,1-3,2-4,2-5,3-6,3-7,5-8');
    const edges: [number, number][] = rawEdges.split(',').map(pair => {
      const [a, b] = pair.split('-').map(Number);
      return [a || 1, b || 2];
    });

    const rawPaths = String(input.paths || '4-7,8-6');
    const paths: [number, number][] = rawPaths.split(',').map(pair => {
      const [a, b] = pair.split('-').map(Number);
      return [a || 1, b || 1];
    });

    return buildTreeDiffSteps(edges, paths);
  },
  renderCanvas: (container, step) => {
    renderTreeDiffCanvas(container, step);
  },
});
