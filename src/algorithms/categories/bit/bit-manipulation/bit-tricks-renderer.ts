/**
 * 位运算核心神技 (Brian Kernighan & Bit Tricks) - 声明式教学级沙盘渲染器
 * 核心神技：
 * 1. 提取最右侧的 1：x & (-x)
 * 2. 抹除最右侧的 1：x & (x - 1)
 * 3. 2 的幂次判定：x > 0 && (x & (x - 1)) == 0
 */

import { registerDeclarativeAlgorithm } from '../../../../core/declarative-algorithm-visualizer';
import { BIT_PROBLEMS } from './bit-problem-content';
import { BIT_TRICKS_CODES } from './bit-stage-codes';
import {
  type BitTricksStep,
  buildBitTricksSteps,
} from './bit-tricks-step-compiler';
import { renderBitTricksCanvas } from './bit-tricks-canvas-adapter';

export {
  type BitTricksStep,
  buildBitTricksSteps,
  renderBitTricksCanvas,
};

export const bitTricksRenderer = registerDeclarativeAlgorithm<BitTricksStep>({
  id: 'bit-tricks',
  title: BIT_PROBLEMS.bitTricks.title,
  category: 'bit',
  categoryName: '位运算与状态压缩',
  description: 'Brian Kernighan 算法与最右侧 1 的提取、抹除与 2 的幂判定',
  aliases: ['class030-code01', 'class002-code01', 'brian-kernighan', 'bit-tricks-030', '191', 'leetcode-191', '231', 'leetcode-231'],
  hasDeductionTree: true,
  timeComplexity: BIT_PROBLEMS.bitTricks.timeComplexity,
  spaceComplexity: BIT_PROBLEMS.bitTricks.spaceComplexity,
  analysisHtml: BIT_PROBLEMS.bitTricks.html,
  inputs: [
    {
      id: 'input-x',
      label: '分析整数 x',
      type: 'number',
      defaultValue: 40,
      min: 1,
      max: 65535,
      step: 1,
      placeholder: '例如 40 (二进制 0010 1000)',
    },
  ],
  codeLanguages: BIT_TRICKS_CODES,
  buildSteps: (inputs: Record<string, any>) => {
    const x = Math.max(1, parseInt(String(inputs?.['input-x'] ?? '40'), 10) || 40);
    return buildBitTricksSteps(x);
  },
  renderCanvas: (stageContainer: HTMLElement, step: BitTricksStep) => {
    renderBitTricksCanvas(stageContainer, step);
  },
});
