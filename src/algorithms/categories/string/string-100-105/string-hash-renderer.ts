/**
 * Class 105: 字符串哈希与滚动哈希 (Rolling Hash & 双哈希)
 * 洛谷 P3370 / LeetCode 187
 */

import { registerDeclarativeAlgorithm } from '../../../../core/declarative-algorithm-visualizer';
import { STRING_100_105_PROBLEMS } from './string-100-105-problem-content';
import { STRING_HASH_CODES } from './string-100-105-stage-codes';
import {
  StringHashStep,
  BASE,
  MOD,
  buildStringHashSteps,
} from './string-hash-step-compiler';
import { renderStringHashCanvas } from './string-hash-canvas-adapter';

export type { StringHashStep };
export { BASE, MOD, buildStringHashSteps, renderStringHashCanvas };

export const stringHashVisualizer = registerDeclarativeAlgorithm<StringHashStep>({
  id: 'string-hash',
  name: '字符串哈希与滚动哈希 (Class 105)',
  category: 'string',
  icon: '🗝️',
  difficulty: 2,
  levelOrder: 105,
  aliases: ['class105-code01', 'string-hash', 'rolling-hash', 'luogu-p3370'],
  learningGoal: '掌握 P 进制字符串哈希与前缀累加模型，学会利用乘方差分在 O(1) 常数时间内精确提取并比对任意子串',
  problemHtml: STRING_100_105_PROBLEMS.stringHash.html,
  analysisHtml: STRING_100_105_PROBLEMS.stringHash.html,
  inputs: [
    {
      id: 's',
      label: '输入字符串 (s)',
      type: 'text',
      defaultValue: 'abcdeabcf',
      placeholder: '请输入字符串',
    },
    {
      id: 'range1',
      label: '子串 1 范围 (l1,r1 从0开始)',
      type: 'text',
      defaultValue: '0,2',
      placeholder: '如 0,2 代表 s[0..2]',
    },
    {
      id: 'range2',
      label: '子串 2 范围 (l2,r2 从0开始)',
      type: 'text',
      defaultValue: '5,7',
      placeholder: '如 5,7 代表 s[5..7]',
    },
  ],
  codeLanguages: STRING_HASH_CODES,
  generateSteps: (input) => {
    const s = String(input.s || 'abcdeabcf');
    const [l1, r1] = String(input.range1 || '0,2').split(',').map(Number);
    const [l2, r2] = String(input.range2 || '5,7').split(',').map(Number);
    return buildStringHashSteps(s, l1 ?? 0, r1 ?? 2, l2 ?? 5, r2 ?? 7);
  },
  renderCanvas: (container, step) => {
    renderStringHashCanvas(container, step);
  },
});
