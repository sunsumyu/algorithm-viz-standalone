/**
 * Class 198: CDQ 分治优化建图 (CDQ Divide and Conquer Graph Optimization)
 * 多维偏序动态连边 / CF 1198F
 */

import { registerDeclarativeAlgorithm } from '../../../../core/declarative-algorithm-visualizer';
import { ADVANCED_196_200_PROBLEMS } from './advanced-196-200-problem-content';
import { CDQ_GRAPH_CODES } from './advanced-196-200-stage-codes';
import {
  CDQGraphStep,
  buildCDQGraphSteps,
} from '../../../../core/renderers/adapters/advanced-graph-opt-family-compiler';
import { renderCDQGraphCanvas } from '../../../../core/renderers/adapters/advanced-graph-opt-family-canvas-adapter';

export type { CDQGraphStep };
export { buildCDQGraphSteps };

export const cdqGraphOptimizationVisualizer = registerDeclarativeAlgorithm<CDQGraphStep>({
  id: 'cdq-graph-optimization-198',
  name: 'CDQ 分治优化建图 (Class 198)',
  category: 'graph',
  difficulty: 'hard',
  problemContent: ADVANCED_196_200_PROBLEMS.cdqGraphOptimization,
  sourceCodes: CDQ_GRAPH_CODES,
  generateSteps: buildCDQGraphSteps,
  renderCanvas: renderCDQGraphCanvas,
});
