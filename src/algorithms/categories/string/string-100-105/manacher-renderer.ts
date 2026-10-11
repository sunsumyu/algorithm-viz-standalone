/**
 * Class 103: Manacher 最长回文子串线性算法
 * 洛谷 P3805 / LeetCode 5
 */

import { registerDeclarativeAlgorithm } from '../../../../core/declarative-algorithm-visualizer';
import { STRING_100_105_PROBLEMS } from './string-100-105-problem-content';
import { MANACHER_CODES } from './string-100-105-stage-codes';
import {
  ManacherStep,
  buildManacherString,
  buildManacherSteps,
} from './manacher-step-compiler';
import { renderManacherCanvas } from './manacher-canvas-adapter';

export type { ManacherStep };
export { buildManacherString, buildManacherSteps, renderManacherCanvas };

export const manacherVisualizer = registerDeclarativeAlgorithm<ManacherStep>({
  id: 'manacher-algo',
  name: 'Manacher 最长回文子串算法 (Class 103)',
  category: 'string',
  icon: '🪞',
  difficulty: 2,
  levelOrder: 103,
  aliases: ['class103-code01', 'manacher-algo', 'manacher', 'leetcode-5', 'longest-palindromic-substring'],
  learningGoal: '掌握特殊占位符转化、对称中心 C 与右边界 R 维护、以及利用镜像点 i\' 的 O(1) 继承与 O(N) 线性时间证明',
  problemHtml: STRING_100_105_PROBLEMS.manacher.html,
  analysisHtml: STRING_100_105_PROBLEMS.manacher.html,
  inputs: [
    {
      id: 's',
      label: '输入字符串 (s)',
      type: 'text',
      defaultValue: 'babad',
      placeholder: '请输入测试字符串，如 babad 或 abacaba',
    },
  ],
  codeLanguages: MANACHER_CODES,
  generateSteps: (input) => {
    const s = String(input.s || 'babad');
    return buildManacherSteps(s);
  },
  renderCanvas: (container, step) => {
    renderManacherCanvas(container, step);
  },
});
