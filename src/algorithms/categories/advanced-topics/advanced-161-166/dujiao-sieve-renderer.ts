/**
 * Class 164: 杜教筛 (Dujiao Sieve)
 * 亚线性 O(n^(2/3)) 计算积性函数前缀和 / 洛谷 P4213 【模板】杜教筛
 */

import { registerDeclarativeAlgorithm } from '../../../../core/declarative-algorithm-visualizer';
import { ADVANCED_161_166_PROBLEMS } from './advanced-161-166-problem-content';
import { DUJIAO_SIEVE_CODES } from './advanced-161-166-stage-codes';
import { DujiaoStep, buildDujiaoSteps } from '../../../../core/renderers/adapters/dujiao-sieve-step-compiler';
import { renderDujiaoSieveCanvas } from '../../../../core/renderers/adapters/dujiao-sieve-canvas-adapter';

export type { DujiaoStep };
export { buildDujiaoSteps };

export const dujiaoSieveVisualizer = registerDeclarativeAlgorithm<DujiaoStep>({
  id: 'dujiao-sieve-164',
  name: '杜教筛 (Class 164)',
  aliases: ['class164-code01', 'dujiao-sieve-164', 'dujiao-sieve'],
  category: 'math',
  icon: '🎯',
  difficulty: 3,
  levelOrder: 164,
  description: '左程云算法通关课 Class 164：杜教筛。构造狄利克雷卷积方程 mu * 1 = e，配合数论分块与哈希记忆化，亚线性 O(n^(2/3)) 求解积性函数前缀和。',
  learningGoal: '掌握狄利克雷卷积恒等式构造技巧，理解数论分块在商不变区间的加速机制与哈希记忆化剪枝',
  problemHtml: ADVANCED_161_166_PROBLEMS.dujiaoSieve.html,
  analysisHtml: ADVANCED_161_166_PROBLEMS.dujiaoSieve.html,
  inputs: [
    {
      id: 'targetN',
      label: '前缀和询问规模 N',
      type: 'select',
      defaultValue: '50',
      options: [
        { label: 'N = 50 (标准亚线性分块示例)', value: '50' },
        { label: 'N = 100 (中等规模分块示例)', value: '100' },
        { label: 'N = 25 (小规模演示示例)', value: '25' },
      ],
    },
  ],
  codeLanguages: DUJIAO_SIEVE_CODES,
  generateSteps: (input) => {
    const n = Math.max(1, parseInt(String(input.targetN || '50'), 10));
    return buildDujiaoSteps(n);
  },
  renderCanvas: renderDujiaoSieveCanvas,
});
