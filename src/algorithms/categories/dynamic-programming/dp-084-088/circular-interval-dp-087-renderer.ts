/**
 * Class 087: 环形区间 DP 与破环成链 (Circular Interval DP)
 * 能量项链破环成链倍长与矩阵连乘聚合 / NOIP 2006 / 洛谷 P1063
 */

import { registerDeclarativeAlgorithm } from '../../../../core/declarative-algorithm-visualizer';
import { DP_084_088_PROBLEMS } from './dp-084-088-problem-content';
import { CIRCULAR_INTERVAL_087_CODES } from './dp-084-088-stage-codes';
import {
  CircularInterval087Step,
  buildCircularInterval087Steps,
} from '../../../../core/renderers/adapters/circular-interval-dp-087-step-compiler';
import { circularIntervalDp087CanvasAdapter } from '../../../../core/renderers/adapters/circular-interval-dp-087-canvas-adapter';

export type { CircularInterval087Step };
export { buildCircularInterval087Steps };

export const circularInterval087Visualizer = registerDeclarativeAlgorithm<CircularInterval087Step>({
  id: 'circular-interval-dp-087',
  name: '环形区间 DP 与破环成链 (Class 087)',
  category: 'dynamic-programming',
  difficulty: 'hard',
  aliases: ['class087-circular-dp', 'circular-interval-dp', 'energy-necklace-1063', 'luogu-p1063'],
  problemContent: DP_084_088_PROBLEMS.circularInterval087,
  sourceCodes: CIRCULAR_INTERVAL_087_CODES,
  generateSteps: buildCircularInterval087Steps,
  renderCanvas: (container, step) => circularIntervalDp087CanvasAdapter.render(container, step),
});
