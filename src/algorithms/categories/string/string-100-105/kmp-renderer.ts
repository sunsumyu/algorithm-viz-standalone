/**
 * Class 100: KMP 算法核心原理与 next 数组动态递推
 * 洛谷 P3375 / LeetCode 28
 */

import { registerDeclarativeAlgorithm } from '../../../../core/declarative-algorithm-visualizer';
import { STRING_100_105_PROBLEMS } from './string-100-105-problem-content';
import { KMP_CODES } from './string-100-105-stage-codes';
import {
  KmpStep,
  computeNextArray,
  buildKmpSteps,
} from './kmp-step-compiler';
import { renderKmpCanvas } from './kmp-canvas-adapter';

export type { KmpStep };
export { computeNextArray, buildKmpSteps, renderKmpCanvas };

export const kmpVisualizer = registerDeclarativeAlgorithm<KmpStep>({
  id: 'kmp-algo',
  name: 'KMP 算法核心原理 (Class 100)',
  category: 'string',
  icon: '⚡',
  difficulty: 2,
  levelOrder: 100,
  aliases: ['class100-code01', 'kmp-algo', 'kmp', 'leetcode-28', 'luogu-p3375'],
  learningGoal: '彻底掌握 KMP 线性字符串匹配原理、next 数组最长公共前后缀推导与指针不回退加速机制',
  problemHtml: STRING_100_105_PROBLEMS.kmp.html,
  analysisHtml: STRING_100_105_PROBLEMS.kmp.html,
  inputs: [
    {
      id: 's1',
      label: '主文本串 (s1)',
      type: 'text',
      defaultValue: 'ABABABCABA',
      placeholder: '请输入主文本串',
    },
    {
      id: 's2',
      label: '模式串 (s2)',
      type: 'text',
      defaultValue: 'ABABC',
      placeholder: '请输入模式串',
    },
  ],
  codeLanguages: KMP_CODES,
  generateSteps: (input) => {
    const s1 = String(input.s1 || 'ABABABCABA');
    const s2 = String(input.s2 || 'ABABC');
    return buildKmpSteps(s1, s2);
  },
  renderCanvas: (container, step) => {
    renderKmpCanvas(container, step);
  },
});
