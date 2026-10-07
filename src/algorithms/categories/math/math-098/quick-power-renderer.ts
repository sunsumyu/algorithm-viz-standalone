/**
 * 二进制快速幂 (Quick Power) - 声明式教学级沙盘渲染器
 * 核心原理：将指数拆分为二进制权重，底数反复平方累乘，实现 O(log b) 极速幂运算
 */

import { registerDeclarativeAlgorithm } from '../../../../core/declarative-algorithm-visualizer';
import { MATH_098_PROBLEMS } from './math-098-problem-content';
import { QUICK_POWER_CODES } from './math-098-stage-codes';
import {
  QuickPowerStep,
  buildQuickPowerSteps,
} from '../../../../core/renderers/adapters/quick-power-098-step-compiler';
import { quickPower098CanvasAdapter } from '../../../../core/renderers/adapters/quick-power-098-canvas-adapter';

export type { QuickPowerStep };
export { buildQuickPowerSteps };

export const quickPowerVisualizer = registerDeclarativeAlgorithm<QuickPowerStep>({
  id: 'quick-power-098',
  name: '二进制快速幂 (Quick Power)',
  category: 'math',
  icon: '⚡',
  difficulty: 2,
  levelOrder: 981,
  aliases: ['class098-code01', 'quick-power', 'powx-n-50', 'leetcode-50'],
  learningGoal: '深刻理解指数二进制权值拆解与底数逐轮自乘平方的高效性',
  problemHtml: MATH_098_PROBLEMS.quickPower.html,
  analysisHtml: MATH_098_PROBLEMS.quickPower.html,
  inputs: [
    {
      id: 'input-a',
      label: '底数 a',
      type: 'number',
      defaultValue: 3,
      min: 1,
      max: 100000,
      step: 1,
      placeholder: '例如 3',
    },
    {
      id: 'input-b',
      label: '指数 b',
      type: 'number',
      defaultValue: 13,
      min: 0,
      max: 1000000,
      step: 1,
      placeholder: '例如 13',
    },
    {
      id: 'input-mod',
      label: '模数 mod',
      type: 'number',
      defaultValue: 1000000007,
      min: 2,
      max: 1000000007,
      step: 1,
      placeholder: '例如 1000000007',
    },
  ],
  codeLanguages: QUICK_POWER_CODES,
  buildSteps: (inputs: Record<string, any>) => {
    const a = parseInt(String(inputs?.['input-a'] ?? '3'), 10) || 3;
    const b = parseInt(String(inputs?.['input-b'] ?? '13'), 10) || 13;
    const mod = parseInt(String(inputs?.['input-mod'] ?? '1000000007'), 10) || 1000000007;
    return buildQuickPowerSteps(a, b, mod);
  },
  renderCanvas: (stageContainer: HTMLElement, step: QuickPowerStep) => {
    quickPower098CanvasAdapter.render(stageContainer, step);
  },
});
