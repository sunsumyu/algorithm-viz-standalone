/**
 * Class 079: 数位 DP 基础模型 (Digit DP) - 声明式沙盘渲染器
 * 数位拆分与记忆化递归树 / LeetCode 233
 */

import { registerDeclarativeAlgorithm } from '../../../../core/declarative-algorithm-visualizer';
import { DP_079_083_PROBLEMS } from './dp-079-083-problem-content';
import { DIGIT_DP_079_CODES } from './dp-079-083-stage-codes';
import {
  buildDigitDp079Steps,
  type DigitDp079Step,
} from '../../../../core/renderers/adapters/digit-dp-basic-079-step-compiler';
import { renderDigitDpCanvas } from '../../../../core/renderers/adapters/digit-dp-basic-079-canvas-adapter';

export type { DigitDp079Step };
export { buildDigitDp079Steps };

export const digitDp079Visualizer = registerDeclarativeAlgorithm<DigitDp079Step>({
  id: 'digit-dp-basic-079',
  name: '数位 DP 基础模型 (Class 079)',
  category: 'dynamic-programming',
  difficulty: 'hard',
  aliases: ['class079-digit-dp', 'digit-dp-basic', 'count-digit-one-233', 'leetcode-233'],
  problemContent: DP_079_083_PROBLEMS.digitDp079,
  sourceCodes: DIGIT_DP_079_CODES,
  generateSteps: buildDigitDp079Steps,
  renderCanvas: (container, step) => {
    renderDigitDpCanvas(container, step);
  },
});
