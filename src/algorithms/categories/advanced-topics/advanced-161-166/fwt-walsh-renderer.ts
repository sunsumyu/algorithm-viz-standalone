/**
 * Class 163: 快速沃尔什变换 (FWT / Fast Walsh-Hadamard Transform)
 * 位运算卷积 (OR / AND / XOR) / 洛谷 P4717 【模板】快速沃尔什变换
 */

import { registerDeclarativeAlgorithm } from '../../../../core/declarative-algorithm-visualizer';
import { ADVANCED_161_166_PROBLEMS } from './advanced-161-166-problem-content';
import { FWT_WALSH_CODES } from './advanced-161-166-stage-codes';
import { FWTStep, buildFWTSteps } from '../../../../core/renderers/adapters/fwt-walsh-step-compiler';
import { renderFWTWalshCanvas } from '../../../../core/renderers/adapters/fwt-walsh-canvas-adapter';

export type { FWTStep };
export { buildFWTSteps };

export const fwtWalshVisualizer = registerDeclarativeAlgorithm<FWTStep>({
  id: 'fwt-walsh-163',
  name: '快速沃尔什变换 FWT (Class 163)',
  aliases: ['class163-code01', 'fwt-walsh-163', 'fwt'],
  category: 'math',
  icon: '🧬',
  difficulty: 3,
  levelOrder: 163,
  description: '左程云算法通关课 Class 163：快速沃尔什变换 (FWT)。利用蝶形矩阵正交基变换，在 O(N log N) 时间内计算 OR、AND、XOR 位运算卷积。',
  learningGoal: '掌握三种位运算基变换矩阵与逆变换公式，理解集合幂级数卷积在二进制维度的折半合并思想',
  problemHtml: ADVANCED_161_166_PROBLEMS.fwtWalsh.html,
  analysisHtml: ADVANCED_161_166_PROBLEMS.fwtWalsh.html,
  inputs: [
    {
      id: 'opType',
      label: '位运算卷积类型',
      type: 'select',
      defaultValue: 'XOR',
      options: [
        { label: '异或 XOR 卷积 (C_k = sum_{i^j=k} A_i*B_j)', value: 'XOR' },
        { label: '按位或 OR 卷积 (C_k = sum_{i|j=k} A_i*B_j)', value: 'OR' },
        { label: '按位与 AND 卷积 (C_k = sum_{i&j=k} A_i*B_j)', value: 'AND' },
      ],
    },
  ],
  presets: [
    { label: '4 维全 1 测试 (A=[1,2,3,4], B=[1,1,1,1])', values: { preset: 'vec_4' } },
    { label: '4 维低位测试 (A=[1,2,0,0], B=[3,4,0,0])', values: { preset: 'vec_low' } },
  ],
  codeLanguages: FWT_WALSH_CODES,
  generateSteps: (input) => {
    const op = (String(input.opType || 'XOR')) as 'XOR' | 'OR' | 'AND';
    const preset = String(input.preset || 'vec_4');
    if (preset === 'vec_low') return buildFWTSteps([1, 2, 0, 0], [3, 4, 0, 0], op);
    return buildFWTSteps([1, 2, 3, 4], [1, 1, 1, 1], op);
  },
  renderCanvas: renderFWTWalshCanvas,
});
