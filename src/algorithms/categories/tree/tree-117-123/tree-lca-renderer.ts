/**
 * Class 118: 树上倍增求最近公共祖先 (LCA)
 * 洛谷 P3379 【模板】最近公共祖先
 * 薄领域适配器 (Thin Domain Adapter)
 */

import { registerDeclarativeAlgorithm } from '../../../../core/declarative-algorithm-visualizer';
import { TREE_117_123_PROBLEMS } from './tree-117-123-problem-content';
import {
  TreeLcaStep,
  TREE_LCA_CODES,
  TREE_LCA_LINES,
  buildTreeLcaSteps,
} from '../../../../core/renderers/adapters/tree-lca-step-compiler';
import { renderTreeLcaCanvas } from '../../../../core/renderers/adapters/tree-lca-canvas-adapter';

// 向后兼容导出
export {
  type TreeLcaStep,
  TREE_LCA_CODES,
  TREE_LCA_LINES,
  buildTreeLcaSteps,
};

export const treeLcaVisualizer = registerDeclarativeAlgorithm<TreeLcaStep>({
  id: 'tree-lca-binary-lifting-118',
  name: '树上倍增求 LCA (Class 118)',
  aliases: ['class118-code01', 'tree-lca', 'tree-lca-binary-lifting-118', 'lowest-common-ancestor-binary-lifting'],
  category: 'tree',
  icon: '🌳',
  difficulty: 2,
  levelOrder: 118,
  learningGoal: '深刻理解树上倍增深度二进制对齐与同步倍增逼近 LCA 的核心原理与 O(log N) 复杂度证明',
  problemHtml: TREE_117_123_PROBLEMS.treeLca.html,
  analysisHtml: TREE_117_123_PROBLEMS.treeLca.html,
  inputs: [
    {
      id: 'edges',
      label: '树边集合 (u-v 逗号分隔)',
      type: 'text',
      defaultValue: '1-2,1-3,2-4,2-5,3-6,3-7,5-8',
      placeholder: '格式如 1-2,1-3,2-4,2-5',
    },
    {
      id: 'u',
      label: '查询节点 u',
      type: 'number',
      defaultValue: 8,
      min: 1,
      max: 20,
    },
    {
      id: 'v',
      label: '查询节点 v',
      type: 'number',
      defaultValue: 4,
      min: 1,
      max: 20,
    },
  ],
  codeLanguages: TREE_LCA_CODES,
  generateSteps: (input) => {
    const raw = String(input.edges || '1-2,1-3,2-4,2-5,3-6,3-7,5-8');
    const edges: [number, number][] = raw.split(',').map(pair => {
      const [a, b] = pair.split('-').map(Number);
      return [a || 1, b || 2];
    });
    const u = Number(input.u) || 8;
    const v = Number(input.v) || 4;
    return buildTreeLcaSteps(edges, u, v);
  },
  renderCanvas: (container, step) => {
    renderTreeLcaCanvas(container, step);
  },
});
