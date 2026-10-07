/**
 * Class 082: 斜率优化 DP 与单调队列凸包 (Slope Optimization DP) - 声明式沙盘渲染器
 * 点斜式线性转化与下凸壳 O(N) 动态切线维护 / 洛谷 P2365
 */

import { registerDeclarativeAlgorithm } from '../../../../core/declarative-algorithm-visualizer';
import { DP_079_083_PROBLEMS } from './dp-079-083-problem-content';
import { SLOPE_OPTIMIZATION_DP_082_CODES } from './dp-079-083-stage-codes';
import {
  buildSlopeOpt082Steps,
  type SlopeOpt082Step,
  type SlopeOpt082Input,
} from '../../../../core/renderers/adapters/slope-optimization-dp-082-step-compiler';
import { renderSlopeOptCanvas } from '../../../../core/renderers/adapters/slope-optimization-dp-082-canvas-adapter';

export type { SlopeOpt082Step, SlopeOpt082Input };
export { buildSlopeOpt082Steps };

export const slopeOptDp082Visualizer = registerDeclarativeAlgorithm<SlopeOpt082Step>({
  id: 'slope-optimization-dp-082',
  name: '斜率优化 DP 与单调队列凸包 (Class 082)',
  category: 'dynamic-programming',
  difficulty: 'hard',
  aliases: ['class082-slope-opt', 'slope-optimization-dp', 'toy-packing-slope-opt', 'luogu-p3195'],
  problemContent: DP_079_083_PROBLEMS.slopeOptDp082,
  sourceCodes: SLOPE_OPTIMIZATION_DP_082_CODES,
  generateSteps: buildSlopeOpt082Steps,
  renderCanvas: (container, step) => {
    renderSlopeOptCanvas(container, step);
  },
});
