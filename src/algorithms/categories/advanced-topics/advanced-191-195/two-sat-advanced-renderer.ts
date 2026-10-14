/**
 * Class 195: 2-SAT 进阶应用与方案构造 (2-SAT Advanced Applications)
 * 前缀虚点优化“至多选一个” + 方案构造 / 洛谷 P6378 [PA2010] Riddles
 */

import { registerDeclarativeAlgorithm } from '../../../../core/declarative-algorithm-visualizer';
import { ADVANCED_191_195_PROBLEMS } from './advanced-191-195-problem-content';
import { TWO_SAT_ADVANCED_CODES } from './advanced-191-195-stage-codes';
import {
  buildTwoSatAdvancedSteps,
  TwoSatAdvancedStep,
} from '../../../../core/renderers/adapters/two-sat-family-compiler';
import { renderTwoSatAdvancedCanvas } from '../../../../core/renderers/adapters/two-sat-family-canvas-adapter';

export { buildTwoSatAdvancedSteps, type TwoSatAdvancedStep };

export const twoSatAdvancedVisualizer = registerDeclarativeAlgorithm<TwoSatAdvancedStep>({
  id: 'two-sat-advanced-195',
  name: '2-SAT 进阶应用与方案构造 (Class 195)',
  aliases: ['class195-code01', 'two-sat-advanced-195', 'two-sat-prefix-optimization'],
  category: 'graph',
  icon: '👑',
  difficulty: 3,
  levelOrder: 195,
  description: '左程云算法通关课 Class 195：2-SAT 进阶应用与方案构造。前缀虚点链解决“至多选一个”排他约束，将 O(K^2) 降解为 O(K)，严密输出高阶无冲突布尔方案。',
  learningGoal: '掌握前缀优化 2-SAT 解决“至多/恰好选一个”的建模套路以及全局对称赋值的高阶技巧',
  problemHtml: ADVANCED_191_195_PROBLEMS.twoSatAdvanced.html,
  analysisHtml: ADVANCED_191_195_PROBLEMS.twoSatAdvanced.html,
  presets: [
    { label: '4 变量，{X1, X2, X3} 至多选一个 (解: X2=1, 其它=0)', values: { preset: 'at_most_one_set' } },
  ],
  codeLanguages: TWO_SAT_ADVANCED_CODES,
  generateSteps: () => buildTwoSatAdvancedSteps(),
  renderCanvas: (container, step) => renderTwoSatAdvancedCanvas(container, step),
});
