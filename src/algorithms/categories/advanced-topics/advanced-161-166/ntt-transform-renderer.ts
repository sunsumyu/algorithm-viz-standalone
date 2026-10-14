/**
 * Class 161: 快速数论变换 (NTT / Number Theoretic Transform)
 * 模 998244353 原根 g=3 / 洛谷 P3803 【模板】多项式乘法 NTT
 */

import { registerDeclarativeAlgorithm } from '../../../../core/declarative-algorithm-visualizer';
import { ADVANCED_161_166_PROBLEMS } from './advanced-161-166-problem-content';
import { NTT_CODES } from './advanced-161-166-stage-codes';
import { NTTStep, buildNTTSteps } from '../../../../core/renderers/adapters/ntt-transform-step-compiler';
import { renderNTTTransformCanvas } from '../../../../core/renderers/adapters/ntt-transform-canvas-adapter';

export type { NTTStep };
export { buildNTTSteps };

export const nttTransformVisualizer = registerDeclarativeAlgorithm<NTTStep>({
  id: 'ntt-transform-161',
  name: '快速数论变换 NTT (Class 161)',
  aliases: ['class161-code01', 'ntt-transform-161', 'ntt'],
  category: 'math',
  icon: '⚡',
  difficulty: 3,
  levelOrder: 161,
  description: '左程云算法通关课 Class 161：快速数论变换 (NTT)。基于特殊质数 P=998244353 与原根 g=3，在整数模域消除浮点误差，O(N log N) 极速完成多项式乘法。',
  learningGoal: '掌握原根同构复数单位根性质，理解位逆序置换与模运算蝶形网络结构，掌握 INTT 逆变换归一化流程',
  problemHtml: ADVANCED_161_166_PROBLEMS.nttTransform.html,
  analysisHtml: ADVANCED_161_166_PROBLEMS.nttTransform.html,
  presets: [
    { label: 'A=[1, 2, 3], B=[2, 1] (结果: [2, 5, 8, 3])', values: { preset: 'poly_3x2' } },
    { label: 'A=[1, 1], B=[1, 1] (结果: [1, 2, 1])', values: { preset: 'poly_simple' } },
    { label: 'A=[3, 4], B=[1, 2] (结果: [3, 10, 8])', values: { preset: 'poly_sample2' } },
  ],
  codeLanguages: NTT_CODES,
  generateSteps: (input) => {
    const preset = String(input.preset || 'poly_3x2');
    if (preset === 'poly_simple') return buildNTTSteps([1, 1], [1, 1]);
    if (preset === 'poly_sample2') return buildNTTSteps([3, 4], [1, 2]);
    return buildNTTSteps([1, 2, 3], [2, 1]);
  },
  renderCanvas: renderNTTTransformCanvas,
});
