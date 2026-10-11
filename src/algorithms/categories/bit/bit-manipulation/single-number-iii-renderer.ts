/**
 * 只出现一次的数字 III (Single Number III) - 声明式教学级沙盘渲染器
 * 核心原理：
 * 数组中只有两个数字 a 和 b 出现 1 次，其余数字出现 2 次。
 * 1. 全员异或得 xor = a ^ b
 * 2. 提取最右侧的 1: diff = xor & (-xor)
 * 3. 按照该位是否为 1 将所有数字划分为两组，分别异或得到 a 和 b
 */

import { registerDeclarativeAlgorithm } from '../../../../core/declarative-algorithm-visualizer';
import { BIT_PROBLEMS } from './bit-problem-content';
import { SINGLE_NUMBER_III_CODES } from './bit-stage-codes';
import {
  type SingleNumberIIIStep,
  buildSingleNumberIIISteps,
} from './single-number-iii-step-compiler';
import { renderSingleNumberIIICanvas } from './single-number-iii-canvas-adapter';

export {
  type SingleNumberIIIStep,
  buildSingleNumberIIISteps,
  renderSingleNumberIIICanvas,
};

export const singleNumberIIIRenderer = registerDeclarativeAlgorithm<SingleNumberIIIStep>({
  id: 'single-number-iii',
  title: BIT_PROBLEMS.singleNumberIII.title,
  category: 'bit',
  categoryName: '位运算与状态压缩',
  description: '只出现一次的数字 III：异或分组与最低位 1 的分流算法',
  aliases: ['class032-code01', 'single-number-260', 'leetcode-260', 'single-number-3'],
  timeComplexity: BIT_PROBLEMS.singleNumberIII.timeComplexity,
  spaceComplexity: BIT_PROBLEMS.singleNumberIII.spaceComplexity,
  analysisHtml: BIT_PROBLEMS.singleNumberIII.html,
  inputs: [
    {
      id: 'input-nums',
      label: '整数数组 (两数出现1次，其余出现2次)',
      type: 'text',
      defaultValue: '1, 2, 1, 3, 2, 5',
      placeholder: '例如 1, 2, 1, 3, 2, 5',
    },
  ],
  codeLanguages: SINGLE_NUMBER_III_CODES,
  buildSteps: (inputs: Record<string, any>) => {
    const raw = String(inputs?.['input-nums'] ?? '1, 2, 1, 3, 2, 5');
    const nums = raw.split(/[,，\s]+/).map(s => parseInt(s.trim(), 10)).filter(n => !isNaN(n));
    return buildSingleNumberIIISteps(nums.length > 0 ? nums : [1, 2, 1, 3, 2, 5]);
  },
  renderCanvas: (stageContainer: HTMLElement, step: SingleNumberIIIStep) => {
    renderSingleNumberIIICanvas(stageContainer, step);
  },
});
