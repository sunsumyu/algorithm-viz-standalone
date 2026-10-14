/**
 * Class 166: 卢卡斯定理 (Lucas Theorem)
 * C(n, m) = C(n/p, m/p) * C(n%p, m%p) mod p / 洛谷 P3807 【模板】卢卡斯定理
 */

import { registerDeclarativeAlgorithm } from '../../../../core/declarative-algorithm-visualizer';
import { ADVANCED_161_166_PROBLEMS } from './advanced-161-166-problem-content';
import { LUCAS_THEOREM_CODES } from './advanced-161-166-stage-codes';
import { LucasStep, buildLucasSteps } from '../../../../core/renderers/adapters/lucas-theorem-166-step-compiler';
import { renderLucasTheorem166Canvas } from '../../../../core/renderers/adapters/lucas-theorem-166-canvas-adapter';

export type { LucasStep };
export { buildLucasSteps };

export const lucasTheoremVisualizer = registerDeclarativeAlgorithm<LucasStep>({
  id: 'lucas-theorem-166',
  name: '卢卡斯定理 Lucas Theorem (Class 166)',
  aliases: ['class166-code01', 'lucas-theorem-166'],
  category: 'math',
  icon: '👑',
  difficulty: 3,
  levelOrder: 166,
  description: '左程云算法通关课 Class 166：卢卡斯定理 (Lucas Theorem)。解决大组合数模小素数问题，将大组合数按 p 进制拆分，O(p + log_p n) 极速求模。',
  learningGoal: '掌握组合数在 p 进制下各数位小组合数的乘积同余性质，理解阶乘逆元与递归展开流程',
  problemHtml: ADVANCED_161_166_PROBLEMS.lucasTheorem.html,
  analysisHtml: ADVANCED_161_166_PROBLEMS.lucasTheorem.html,
  presets: [
    { label: 'n=23, m=11, p=5 (结果: 3)', values: { preset: 'lucas_23_11_5' } },
    { label: 'n=12, m=5, p=7 (结果: 1)', values: { preset: 'lucas_12_5_7' } },
    { label: 'n=10, m=3, p=5 (结果: 0)', values: { preset: 'lucas_10_3_5' } },
  ],
  codeLanguages: LUCAS_THEOREM_CODES,
  generateSteps: (input) => {
    const preset = String(input.preset || 'lucas_23_11_5');
    if (preset === 'lucas_12_5_7') return buildLucasSteps(12, 5, 7);
    if (preset === 'lucas_10_3_5') return buildLucasSteps(10, 3, 5);
    return buildLucasSteps(23, 11, 5);
  },
  renderCanvas: renderLucasTheorem166Canvas,
});
