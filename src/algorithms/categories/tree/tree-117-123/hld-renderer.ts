/**
 * Class 121: 树链剖分 / 重链剖分 (Heavy-Light Decomposition, HLD)
 * 洛谷 P3384 【模板】重链剖分
 * 薄领域适配器 (Thin Domain Adapter)
 */

import { registerDeclarativeAlgorithm } from '../../../../core/declarative-algorithm-visualizer';
import { TREE_117_123_PROBLEMS } from './tree-117-123-problem-content';
import {
  HldStep,
  HLD_CODES,
  HLD_LINES,
  buildHldSteps,
} from '../../../../core/renderers/adapters/hld-step-compiler';
import { renderHldCanvas } from '../../../../core/renderers/adapters/hld-canvas-adapter';

// 向后兼容导出
export {
  type HldStep,
  HLD_CODES,
  HLD_LINES,
  buildHldSteps,
};

export const hldVisualizer = registerDeclarativeAlgorithm<HldStep>({
  id: 'hld-heavy-light-decomposition-121',
  name: '重链剖分 / 树链剖分 (Class 121)',
  aliases: ['class121-code01', 'hld', 'hld-heavy-light-decomposition-121', 'heavy-light-decomposition'],
  category: 'tree',
  icon: '⛓️',
  difficulty: 3,
  levelOrder: 121,
  learningGoal: '深刻理解两遍 DFS 计算子树重儿子、重链顶端与连续 DFN 序的剖分机制',
  problemHtml: TREE_117_123_PROBLEMS.hld.html,
  analysisHtml: TREE_117_123_PROBLEMS.hld.html,
  inputs: [
    {
      id: 'edges',
      label: '树边集合 (u-v 逗号分隔)',
      type: 'text',
      defaultValue: '1-2,1-3,2-4,2-5,3-6,3-7,5-8',
      placeholder: '格式如 1-2,1-3,2-4,2-5',
    },
  ],
  codeLanguages: HLD_CODES,
  generateSteps: (input) => {
    const raw = String(input.edges || '1-2,1-3,2-4,2-5,3-6,3-7,5-8');
    const edges: [number, number][] = raw.split(',').map(pair => {
      const [a, b] = pair.split('-').map(Number);
      return [a || 1, b || 2];
    });
    return buildHldSteps(edges);
  },
  renderCanvas: (container, step) => {
    renderHldCanvas(container, step);
  },
});
