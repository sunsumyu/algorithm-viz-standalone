/**
 * Class 200: 仙人掌图与仙人掌 DP (Cactus Graph DP)
 * DFS 树边转移 + 返祖边找环 + 环上单调队列破环成链 / 洛谷 P4244 【模板】仙人掌直径 / 左程云《算法通关课》第200讲大结局
 */

import { registerDeclarativeAlgorithm } from '../../../../core/declarative-algorithm-visualizer';
import { ADVANCED_196_200_PROBLEMS } from './advanced-196-200-problem-content';
import { CACTUS_GRAPH_DP_CODES } from './advanced-196-200-stage-codes';
import {
  CactusGraphDPStep,
  buildCactusGraphDPSteps,
} from '../../../../core/renderers/adapters/pseudotree-cactus-dp-family-compiler';
import { renderCactusGraphDPCanvas } from '../../../../core/renderers/adapters/pseudotree-cactus-dp-family-canvas-adapter';

export type { CactusGraphDPStep };
export { buildCactusGraphDPSteps };

export const cactusGraphDPVisualizer = registerDeclarativeAlgorithm<CactusGraphDPStep>({
  id: 'cactus-graph-dp-200',
  name: '仙人掌图与仙人掌 DP (Class 200)',
  category: 'graph',
  difficulty: 'hard',
  problemContent: ADVANCED_196_200_PROBLEMS.cactusGraphDP,
  sourceCodes: CACTUS_GRAPH_DP_CODES,
  generateSteps: buildCactusGraphDPSteps,
  renderCanvas: renderCactusGraphDPCanvas,
});
