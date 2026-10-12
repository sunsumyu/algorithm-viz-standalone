/**
 * Class 186: 树上边分治与边分树 (Edge Decomposition)
 * 三度化转换 + 重心边断开 + 严格二叉重构树 / SPOJ Free Tour II
 */

import { registerDeclarativeAlgorithm } from '../../../../core/declarative-algorithm-visualizer';
import { ADVANCED_185_190_PROBLEMS } from './advanced-185-190-problem-content';
import { EDGE_DECOMPOSITION_CODES } from './advanced-185-190-stage-codes';
import {
  buildEdgeDecompSteps,
  EdgeDecompStep,
} from '../../../../core/renderers/adapters/edge-decomposition-186-step-compiler';
import { renderEdgeDecompCanvas } from '../../../../core/renderers/adapters/edge-decomposition-186-canvas-adapter';

export { buildEdgeDecompSteps, type EdgeDecompStep };

export const edgeDecompositionVisualizer = registerDeclarativeAlgorithm<EdgeDecompStep>({
  id: 'edge-decomposition-186',
  name: '树上边分治与边分树 (Class 186)',
  aliases: ['class186-code01', 'edge-decomposition-186', 'edge-centroid-decomposition'],
  category: 'tree',
  icon: '✂️',
  difficulty: 3,
  levelOrder: 186,
  description: '左程云算法通关课 Class 186：树上边分治与边分树。多叉树三度化重构，选择重心边断开实现严格二等分，天然生成高度 O(log N) 的二叉重构树。',
  learningGoal: '掌握多叉树虚点三度化技巧、重心边选择策略以及边分治严格二叉合并的高效性',
  problemHtml: ADVANCED_185_190_PROBLEMS.edgeDecomposition.html,
  analysisHtml: ADVANCED_185_190_PROBLEMS.edgeDecomposition.html,
  inputs: [
    {
      id: 'preset',
      label: '树拓扑预设',
      type: 'select',
      defaultValue: 'tree_4node_chain',
      options: [
        { label: '4 节点三度化链 (重心边: 2-3, 左右对半分)', value: 'tree_4node_chain' },
      ],
    },
  ],
  codeLanguages: EDGE_DECOMPOSITION_CODES,
  generateSteps: () => buildEdgeDecompSteps(),
  renderCanvas: (container, step) => renderEdgeDecompCanvas(container, step),
});
