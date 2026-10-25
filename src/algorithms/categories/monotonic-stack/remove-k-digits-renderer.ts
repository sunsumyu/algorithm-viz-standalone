/**
 * 移掉 K 位数字 (Remove K Digits)
 * LeetCode 402 (Medium / 单调栈贪心与高位逆序剥离经典)
 */

import { registerDeclarativeAlgorithm } from '../../../core/declarative-algorithm-visualizer';
import {
  type RemoveKDigitsStep,
  REMOVE_K_DIGITS_CODES,
  REMOVE_K_DIGITS_CODE_LINES,
  buildRemoveKDigitsSteps,
} from './remove-k-digits-step-compiler';
import { renderRemoveKDigitsCanvas } from './remove-k-digits-canvas-adapter';

export {
  type RemoveKDigitsStep,
  REMOVE_K_DIGITS_CODES,
  REMOVE_K_DIGITS_CODE_LINES,
  buildRemoveKDigitsSteps,
  renderRemoveKDigitsCanvas,
};

const { Visualizer } = registerDeclarativeAlgorithm({
  id: 'remove-k-digits',
  name: '移掉 K 位数字',
  category: 'monotonic-stack',
  difficulty: 2,
  learningGoal: 'LeetCode 402: 移掉 k 位数字使得剩下的数字最小。利用单调递增栈在 O(N) 时间内贪心剔除逆序高位，并剥离前导零。',
  aliases: ['remove-k-digits-053', 'class053-code03', 'leetcode-402', '402'],
  hasDeductionTree: true,
  codeLanguages: REMOVE_K_DIGITS_CODES,
  generateSteps: (inputs) => {
    const rawNum = inputs?.num as string | undefined;
    const rawK = Number(inputs?.k ?? 3);
    const num = typeof rawNum === 'string' && rawNum.trim().length > 0 ? rawNum.trim() : '1432219';
    const k = isNaN(rawK) || rawK < 0 ? 3 : Math.min(rawK, num.length);
    return buildRemoveKDigitsSteps(num, k);
  },
  renderCanvas: (container: HTMLElement, step: RemoveKDigitsStep) => {
    container.innerHTML = renderRemoveKDigitsCanvas(step);
  },
  inputs: [
    {
      id: 'num',
      label: '输入数字字符串',
      type: 'text',
      defaultValue: '1432219',
      placeholder: '例如: 1432219',
    },
    {
      id: 'k',
      label: '移除位数 k',
      type: 'number',
      defaultValue: 3,
      placeholder: '需移除的数字个数',
    },
  ],
});

export { Visualizer as RemoveKDigitsVisualizer };
