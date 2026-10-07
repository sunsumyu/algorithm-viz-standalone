/**
 * Class 081: 期望 DP 与马尔可夫决策过程 (Expected Value DP) - 声明式沙盘渲染器
 * 棋盘走日等权全概率扩散与留存期望 / LeetCode 688
 */

import { registerDeclarativeAlgorithm } from '../../../../core/declarative-algorithm-visualizer';
import { DP_079_083_PROBLEMS } from './dp-079-083-problem-content';
import { EXPECTED_VALUE_DP_081_CODES } from './dp-079-083-stage-codes';
import {
  buildExpectedValue081Steps,
  type ExpectedValue081Step,
  type ExpectedValue081Input,
} from '../../../../core/renderers/adapters/expected-value-dp-081-step-compiler';
import { renderExpectedValueDpCanvas } from '../../../../core/renderers/adapters/expected-value-dp-081-canvas-adapter';

export type { ExpectedValue081Step, ExpectedValue081Input };
export { buildExpectedValue081Steps };

export const expectedValueDp081Visualizer = registerDeclarativeAlgorithm<ExpectedValue081Step>({
  id: 'expected-value-dp-081',
  name: '期望 DP 与马尔可夫决策 (Class 081)',
  category: 'dynamic-programming',
  difficulty: 'medium',
  aliases: ['class081-expected-dp', 'expected-value-dp', 'knight-probability-in-chessboard-688', 'leetcode-688'],
  problemContent: DP_079_083_PROBLEMS.expectedValueDp081,
  sourceCodes: EXPECTED_VALUE_DP_081_CODES,
  generateSteps: buildExpectedValue081Steps,
  renderCanvas: (container, step) => {
    renderExpectedValueDpCanvas(container, step);
  },
});
