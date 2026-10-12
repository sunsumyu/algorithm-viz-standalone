/**
 * Class 179: 树上点分治 (Centroid Decomposition)
 * 重心分治 + 子树容斥 + 路径计数 / 洛谷 P3806 【模板】点分治1
 */

import { registerDeclarativeAlgorithm } from '../../../../core/declarative-algorithm-visualizer';
import { ADVANCED_179_184_PROBLEMS } from './advanced-179-184-problem-content';
import { CENTROID_DECOMPOSITION_CODES } from './advanced-179-184-stage-codes';
import {
  buildCentroidSteps,
  CentroidStep,
} from '../../../../core/renderers/adapters/centroid-decomposition-179-step-compiler';
import { renderCentroidCanvas } from '../../../../core/renderers/adapters/centroid-decomposition-179-canvas-adapter';

export { buildCentroidSteps, type CentroidStep };

export const centroidDecompositionVisualizer = registerDeclarativeAlgorithm<CentroidStep>({
  id: 'centroid-decomposition-179',
  name: '点分治 (Centroid Decomposition / Class 179)',
  aliases: ['class179-code01', 'centroid-decomposition-179', 'tree-centroid-decomposition'],
  category: 'tree',
  icon: '🌲',
  difficulty: 3,
  levelOrder: 179,
  description: '左程云算法通关课 Class 179：树上点分治 (Centroid Decomposition)。通过重心分割递归树，保证 O(log N) 递归深度，优雅统计树上所有合法路径。',
  learningGoal: '掌握树上点分治重心求解、子树路径统计、容斥去重与全局递归分治',
  problemHtml: ADVANCED_179_184_PROBLEMS.centroidDecomposition.html,
  analysisHtml: ADVANCED_179_184_PROBLEMS.centroidDecomposition.html,
  inputs: [
    {
      id: 'preset',
      label: '树拓扑与目标距离',
      type: 'select',
      defaultValue: 'tree_5node_target3',
      options: [
        { label: '5 节点树，目标距离 K=3 (求得 3 条路径)', value: 'tree_5node_target3' },
      ],
    },
  ],
  codeLanguages: CENTROID_DECOMPOSITION_CODES,
  generateSteps: () => buildCentroidSteps(),
  renderCanvas: (container, step) => renderCentroidCanvas(container, step),
});
