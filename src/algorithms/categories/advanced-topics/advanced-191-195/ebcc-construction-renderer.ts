/**
 * Class 191: 边双连通缩点与加边构造 (e-BCC Construction)
 * Tarjan 边双缩点成树 + 叶子匹配消除割边 / 洛谷 P2860 [USACO06JAN] Redundant Paths
 */

import { registerDeclarativeAlgorithm } from '../../../../core/declarative-algorithm-visualizer';
import { ADVANCED_191_195_PROBLEMS } from './advanced-191-195-problem-content';
import { EBCC_CONSTRUCTION_CODES } from './advanced-191-195-stage-codes';
import {
  buildEBCCConstructionSteps,
  EBCCConstructionStep,
} from '../../../../core/renderers/adapters/graph-construction-optimization-compiler';
import { renderEBCCConstructionCanvas } from '../../../../core/renderers/adapters/graph-construction-optimization-canvas-adapter';

export { buildEBCCConstructionSteps, type EBCCConstructionStep };

export const ebccConstructionVisualizer = registerDeclarativeAlgorithm<EBCCConstructionStep>({
  id: 'ebcc-construction-191',
  name: '边双连通缩点与加边构造 (Class 191)',
  aliases: ['class191-code01', 'ebcc-construction-191', 'ebcc-add-edges'],
  category: 'graph',
  icon: '🌲',
  difficulty: 3,
  levelOrder: 191,
  description: '左程云算法通关课 Class 191：边双连通缩点与加边构造。Tarjan 缩点为树，统计叶子节点数 L，最少添加 ceil(L/2) 条边使全图变为边双连通图。',
  learningGoal: '掌握无向图边双缩点成树的性质、叶子度数判定与 ceil(L/2) 最优连边数学证明',
  problemHtml: ADVANCED_191_195_PROBLEMS.ebccConstruction.html,
  analysisHtml: ADVANCED_191_195_PROBLEMS.ebccConstruction.html,
  inputs: [
    {
      id: 'preset',
      label: '缩点树结构预设',
      type: 'select',
      defaultValue: 'tree_3leaves',
      options: [
        { label: '3 叶子星形树 (最少加边: 2 条)', value: 'tree_3leaves' },
      ],
    },
  ],
  codeLanguages: EBCC_CONSTRUCTION_CODES,
  generateSteps: () => buildEBCCConstructionSteps(),
  renderCanvas: (container, step) => renderEBCCConstructionCanvas(container, step),
});
