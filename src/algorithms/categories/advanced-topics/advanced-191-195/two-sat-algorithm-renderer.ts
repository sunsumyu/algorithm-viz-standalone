/**
 * Class 194: 2-SAT 算法基础 (2-Satisfiability Fundamentals)
 * 拆点对称建图 + Tarjan SCC 矛盾判定 + 拓扑大者取真 / 洛谷 P4782 【模板】2-SAT 问题
 */

import { registerDeclarativeAlgorithm } from '../../../../core/declarative-algorithm-visualizer';
import { ADVANCED_191_195_PROBLEMS } from './advanced-191-195-problem-content';
import { TWO_SAT_ALGORITHM_CODES } from './advanced-191-195-stage-codes';
import {
  buildTwoSatSteps,
  TwoSatStep,
} from '../../../../core/renderers/adapters/two-sat-family-compiler';
import { renderTwoSatCanvas } from '../../../../core/renderers/adapters/two-sat-family-canvas-adapter';

export { buildTwoSatSteps, type TwoSatStep };

export const twoSatAlgorithmVisualizer = registerDeclarativeAlgorithm<TwoSatStep>({
  id: 'two-sat-algorithm-194',
  name: '2-SAT 算法基础 (Class 194)',
  aliases: ['class194-code01', 'two-sat-algorithm-194', 'two-sat'],
  category: 'graph',
  icon: '⚖️',
  difficulty: 3,
  levelOrder: 194,
  description: '左程云算法通关课 Class 194：2-SAT 算法基础。布尔析取等价于对称蕴含边，Tarjan 求强连通分量，真假点同一 SCC 判定无解，拓扑序较大者取真值。',
  learningGoal: '掌握 2-SAT 对称拆点建图原理、无解充要条件以及利用 SCC 编号逆序拓扑构造可行解',
  problemHtml: ADVANCED_191_195_PROBLEMS.twoSatAlgorithm.html,
  analysisHtml: ADVANCED_191_195_PROBLEMS.twoSatAlgorithm.html,
  presets: [
    { label: '3 变量 3 子句可满足系统 (解: [0, 1, 0])', values: { preset: 'satisfiable_3' } },
  ],
  codeLanguages: TWO_SAT_ALGORITHM_CODES,
  generateSteps: () => buildTwoSatSteps(),
  renderCanvas: (container, step) => renderTwoSatCanvas(container, step),
});
