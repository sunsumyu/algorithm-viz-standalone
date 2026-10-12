/**
 * Class 167: 扩展卢卡斯定理 (EXLucas / Extended Lucas Theorem)
 * 任意模数 P 组合数 / 洛谷 P4720 【模板】扩展卢卡斯定理
 */

import { registerDeclarativeAlgorithm } from '../../../../core/declarative-algorithm-visualizer';
import { ADVANCED_167_172_PROBLEMS } from './advanced-167-172-problem-content';
import { EXLUCAS_CODES } from './advanced-167-172-stage-codes';
import { buildEXLucasSteps, EXLucasStep } from '../../../../core/renderers/adapters/exlucas-step-compiler';
import { renderEXLucasCanvas } from '../../../../core/renderers/adapters/exlucas-canvas-adapter';

export { buildEXLucasSteps, type EXLucasStep };

export const exLucasVisualizer = registerDeclarativeAlgorithm<EXLucasStep>({
  id: 'exlucas-theorem-167',
  name: '扩展卢卡斯定理 EXLucas (Class 167)',
  aliases: ['class167-code01', 'exlucas-theorem-167', 'exlucas'],
  category: 'math',
  icon: '👑',
  difficulty: 3,
  levelOrder: 167,
  description: '左程云算法通关课 Class 167：扩展卢卡斯定理 (EXLucas)。针对任意模数合数 P，通过质因数分解、阶乘剥离质因子与 CRT 中国剩余定理合并求解组合数模。',
  learningGoal: '掌握任意合数质因数分解、阶乘中提取素因子循环节递归求逆与 CRT 唯一合并大架构',
  problemHtml: ADVANCED_167_172_PROBLEMS.exLucas.html,
  analysisHtml: ADVANCED_167_172_PROBLEMS.exLucas.html,
  inputs: [
    {
      id: 'preset',
      label: '大组合数与合数模数',
      type: 'select',
      defaultValue: 'lucas_7_3_10',
      options: [
        { label: 'n=7, m=3, P=10 (合数 2*5, 结果: 5)', value: 'lucas_7_3_10' },
        { label: 'n=6, m=2, P=9 (含重质因子 3^2, 结果: 6)', value: 'lucas_6_2_9' },
        { label: 'n=10, m=3, P=12 (合数 2^2*3, 结果: 0)', value: 'lucas_10_3_12' },
      ],
    },
  ],
  codeLanguages: EXLUCAS_CODES,
  generateSteps: (input) => {
    const preset = String(input.preset || 'lucas_7_3_10');
    if (preset === 'lucas_6_2_9') return buildEXLucasSteps(6, 2, 9);
    if (preset === 'lucas_10_3_12') return buildEXLucasSteps(10, 3, 12);
    return buildEXLucasSteps(7, 3, 10);
  },
  renderCanvas: (container, step) => renderEXLucasCanvas(container, step),
});
