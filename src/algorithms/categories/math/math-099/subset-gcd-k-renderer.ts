/**
 * 子集 GCD 为 K 的方案数 (Subset GCD K) - 声明式教学级沙盘渲染器
 * 核心原理：倍数计数 + 容斥原理倒序消除，dp[x] = (2^cnt[x] - 1) - sum(dp[2x, 3x, ...])
 */

import { registerDeclarativeAlgorithm } from '../../../../core/declarative-algorithm-visualizer';
import { MATH_099_PROBLEMS } from './math-099-problem-content';
import { SUBSET_GCD_K_CODES } from './math-099-stage-codes';
import {
  SubsetGcdStep,
  buildSubsetGcdSteps,
} from '../../../../core/renderers/adapters/subset-gcd-k-099-step-compiler';
import { subsetGcdK099CanvasAdapter } from '../../../../core/renderers/adapters/subset-gcd-k-099-canvas-adapter';

export type { SubsetGcdStep };
export { buildSubsetGcdSteps };

export const subsetGcdKVisualizer = registerDeclarativeAlgorithm<SubsetGcdStep>({
  id: 'subset-gcd-k-099',
  name: '子集 GCD 为 K 方案数 (Subset GCD K)',
  category: 'math',
  icon: '🧮',
  difficulty: 3,
  levelOrder: 994,
  aliases: ['class099-code04', 'subset-gcd-k', 'subset-gcd-inclusion-exclusion'],
  learningGoal: '掌握倍数计数向公约数计数的倒序容斥转化与多项式去重',
  problemHtml: MATH_099_PROBLEMS.subsetGcdK.html,
  analysisHtml: MATH_099_PROBLEMS.subsetGcdK.html,
  inputs: [
    {
      id: 'input-nums',
      label: '数组元素 (逗号隔开)',
      type: 'text',
      defaultValue: '2, 4, 6, 8, 10',
      placeholder: '例如 2, 4, 6, 8, 10',
    },
    {
      id: 'input-k',
      label: '目标最大公约数 k',
      type: 'number',
      defaultValue: 2,
      min: 1,
      max: 100,
      step: 1,
      placeholder: '例如 2',
    },
  ],
  codeLanguages: SUBSET_GCD_K_CODES,
  buildSteps: (inputs: Record<string, any>) => {
    const raw = String(inputs?.['input-nums'] ?? '2, 4, 6, 8, 10');
    const nums = raw
      .split(/[,，\s]+/)
      .map(s => parseInt(s.trim(), 10))
      .filter(n => !isNaN(n) && n > 0);
    const k = Math.max(1, parseInt(String(inputs?.['input-k'] ?? '2'), 10) || 2);
    return buildSubsetGcdSteps(nums.length > 0 ? nums : [2, 4, 6, 8, 10], k);
  },
  renderCanvas: (stageContainer: HTMLElement, step: SubsetGcdStep) => {
    subsetGcdK099CanvasAdapter.render(stageContainer, step);
  },
});
