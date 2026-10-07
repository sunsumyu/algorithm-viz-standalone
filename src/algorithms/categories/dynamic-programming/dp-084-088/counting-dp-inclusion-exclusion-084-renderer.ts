/**
 * Class 084: 计数 DP 与错排问题 (Derangement & Counting DP)
 * 错排递推公式与容斥原理展开 / 洛谷 P1595
 */

import { registerDeclarativeAlgorithm } from '../../../../core/declarative-algorithm-visualizer';
import { DP_084_088_PROBLEMS } from './dp-084-088-problem-content';
import { COUNTING_DP_084_CODES } from './dp-084-088-stage-codes';
import {
  Counting084Step,
  buildCounting084Steps,
} from '../../../../core/renderers/adapters/counting-dp-inclusion-exclusion-084-step-compiler';
import { countingDp084CanvasAdapter } from '../../../../core/renderers/adapters/counting-dp-inclusion-exclusion-084-canvas-adapter';

export type { Counting084Step };
export { buildCounting084Steps };

export const countingDp084Visualizer = registerDeclarativeAlgorithm<Counting084Step>({
  id: 'counting-dp-inclusion-exclusion-084',
  name: '计数 DP 与错排问题 (Class 084)',
  category: 'dynamic-programming',
  difficulty: 'medium',
  aliases: ['class084-counting-dp', 'counting-dp-derangement', 'derangement-problem', 'inclusion-exclusion-084'],
  problemContent: DP_084_088_PROBLEMS.countingDp084,
  sourceCodes: COUNTING_DP_084_CODES,
  generateSteps: buildCounting084Steps,
  renderCanvas: (container, step) => countingDp084CanvasAdapter.render(container, step),
});
