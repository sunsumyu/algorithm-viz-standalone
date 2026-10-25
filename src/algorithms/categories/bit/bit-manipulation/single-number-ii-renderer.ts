/**
 * 只出现一次的数字 II (Single Number II) - 声明式教学级沙盘渲染器
 * 核心原理：
 * 其余元素出现 3 次，唯独一个出现 1 次。
 * 运用有限状态自动机维护每一位的模 3 状态：
 * 计数状态：00 -> 01 -> 10 -> 00
 * 状态方程：
 * ones = (ones ^ num) & ~twos;
 * twos = (twos ^ num) & ~ones;
 */

import { registerDeclarativeAlgorithm } from '../../../../core/declarative-algorithm-visualizer';
import { BIT_PROBLEMS } from './bit-problem-content';
import { SINGLE_NUMBER_II_CODES } from './bit-stage-codes';
import {
  type SingleNumberIIStep,
  buildSingleNumberIISteps,
} from './single-number-ii-step-compiler';
import { renderSingleNumberIICanvas } from './single-number-ii-canvas-adapter';

export {
  type SingleNumberIIStep,
  buildSingleNumberIISteps,
  renderSingleNumberIICanvas,
};

export const singleNumberIIRenderer = registerDeclarativeAlgorithm<SingleNumberIIStep>({
  id: 'single-number-ii',
  title: BIT_PROBLEMS.singleNumberII.title,
  category: 'bit',
  categoryName: '位运算与状态压缩',
  description: '只出现一次的数字 II：模 3 状态机位运算常数空间解法',
  aliases: ['class031-code01', 'single-number-137', 'leetcode-137', 'single-number-2', '137'],
  hasDeductionTree: true,
  timeComplexity: BIT_PROBLEMS.singleNumberII.timeComplexity,
  spaceComplexity: BIT_PROBLEMS.singleNumberII.spaceComplexity,
  analysisHtml: BIT_PROBLEMS.singleNumberII.html,
  inputs: [
    {
      id: 'input-nums',
      label: '整数数组 (其余数出现3次，唯一数出现1次)',
      type: 'text',
      defaultValue: '2, 2, 3, 2',
      placeholder: '例如 2, 2, 3, 2 或 0, 1, 0, 1, 0, 1, 99',
    },
  ],
  codeLanguages: SINGLE_NUMBER_II_CODES,
  buildSteps: (inputs: Record<string, any>) => {
    const raw = String(inputs?.['input-nums'] ?? '2, 2, 3, 2');
    const nums = raw.split(/[,，\s]+/).map(s => parseInt(s.trim(), 10)).filter(n => !isNaN(n));
    return buildSingleNumberIISteps(nums.length > 0 ? nums : [2, 2, 3, 2]);
  },
  renderCanvas: (stageContainer: HTMLElement, step: SingleNumberIIStep) => {
    renderSingleNumberIICanvas(stageContainer, step);
  },
});
