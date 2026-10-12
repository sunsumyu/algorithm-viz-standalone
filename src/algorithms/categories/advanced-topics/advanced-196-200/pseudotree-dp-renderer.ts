/**
 * Class 199: 基环树与基环树 DP (Pseudotree DP)
 * 拓扑剥皮找环 + 子树树形 DP + 环上破环成链 / 洛谷 P1453 骑士 / 最大权独立集
 */

import { registerDeclarativeAlgorithm } from '../../../../core/declarative-algorithm-visualizer';
import { ADVANCED_196_200_PROBLEMS } from './advanced-196-200-problem-content';
import { PSEUDOTREE_DP_CODES } from './advanced-196-200-stage-codes';
import {
  PseudotreeDPStep,
  buildPseudotreeDPSteps,
} from '../../../../core/renderers/adapters/pseudotree-cactus-dp-family-compiler';
import { renderPseudotreeDPCanvas } from '../../../../core/renderers/adapters/pseudotree-cactus-dp-family-canvas-adapter';

export type { PseudotreeDPStep };
export { buildPseudotreeDPSteps };

export const pseudotreeDPVisualizer = registerDeclarativeAlgorithm<PseudotreeDPStep>({
  id: 'pseudotree-dp-199',
  name: '基环树与基环树 DP (Class 199)',
  category: 'tree',
  difficulty: 'hard',
  problemContent: ADVANCED_196_200_PROBLEMS.pseudotreeDP,
  sourceCodes: PSEUDOTREE_DP_CODES,
  generateSteps: buildPseudotreeDPSteps,
  renderCanvas: renderPseudotreeDPCanvas,
});
