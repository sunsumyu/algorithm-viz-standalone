/**
 * Class 104: 扩展 KMP (Z 算法 / Z-Algorithm)
 * 洛谷 P5410
 */

import { registerDeclarativeAlgorithm } from '../../../../core/declarative-algorithm-visualizer';
import { STRING_100_105_PROBLEMS } from './string-100-105-problem-content';
import { Z_ALGORITHM_CODES } from './string-100-105-stage-codes';
import {
  ZAlgorithmStep,
  buildZAlgorithmSteps,
} from './z-algorithm-step-compiler';
import { renderZAlgorithmCanvas } from './z-algorithm-canvas-adapter';

export type { ZAlgorithmStep };
export { buildZAlgorithmSteps, renderZAlgorithmCanvas };

export const zAlgorithmVisualizer = registerDeclarativeAlgorithm<ZAlgorithmStep>({
  id: 'z-algorithm',
  name: '扩展 KMP / Z 算法 (Class 104)',
  category: 'string',
  icon: '📦',
  difficulty: 2,
  levelOrder: 104,
  aliases: ['class104-code01', 'z-algorithm', 'extended-kmp', 'luogu-p5410'],
  learningGoal: '理解 Z-Box 匹配盒机制、后缀与前缀 LCP 的线性递推原理及其与 KMP、Manacher 的对偶设计思想',
  problemHtml: STRING_100_105_PROBLEMS.zAlgorithm.html,
  analysisHtml: STRING_100_105_PROBLEMS.zAlgorithm.html,
  inputs: [
    {
      id: 's',
      label: '输入字符串 (s)',
      type: 'text',
      defaultValue: 'abacaba',
      placeholder: '请输入待计算 Z 数组的字符串',
    },
  ],
  codeLanguages: Z_ALGORITHM_CODES,
  generateSteps: (input) => {
    const s = String(input.s || 'abacaba');
    return buildZAlgorithmSteps(s);
  },
  renderCanvas: (container, step) => {
    renderZAlgorithmCanvas(container, step);
  },
});
