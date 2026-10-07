/**
 * Class 083: 四边形不等式与决策单调性优化 (Knuth's Quadrangle Inequality) - 声明式沙盘渲染器
 * 石子合并与区间划分决策点严格单调区间剪枝 / 经典区间 DP
 */

import { registerDeclarativeAlgorithm } from '../../../../core/declarative-algorithm-visualizer';
import { DP_079_083_PROBLEMS } from './dp-079-083-problem-content';
import { KNUTH_QUADRANGLE_083_CODES } from './dp-079-083-stage-codes';
import {
  buildKnuth083Steps,
  type Knuth083Step,
} from '../../../../core/renderers/adapters/knuth-quadrangle-inequality-083-step-compiler';
import { renderKnuthQuadrangleCanvas } from '../../../../core/renderers/adapters/knuth-quadrangle-inequality-083-canvas-adapter';

export type { Knuth083Step };
export { buildKnuth083Steps };

export const knuthQuadrangle083Visualizer = registerDeclarativeAlgorithm<Knuth083Step>({
  id: 'knuth-quadrangle-inequality-083',
  name: '四边形不等式优化 (Class 083)',
  category: 'dynamic-programming',
  difficulty: 'hard',
  aliases: ['class083-quadrangle', 'knuth-quadrangle-inequality', 'stone-merging-quadrangle', 'quadrangle-inequality-083'],
  problemContent: DP_079_083_PROBLEMS.knuthQuadrangle083,
  sourceCodes: KNUTH_QUADRANGLE_083_CODES,
  generateSteps: buildKnuth083Steps,
  renderCanvas: (container, step) => {
    renderKnuthQuadrangleCanvas(container, step);
  },
});
