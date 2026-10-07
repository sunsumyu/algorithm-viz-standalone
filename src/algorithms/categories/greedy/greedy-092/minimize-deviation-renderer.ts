/**
 * 数组的最小偏移量 (LeetCode 1675) - 声明式教学级沙盘渲染器
 * 核心贪心：奇数乘2单调归一化 + 大顶堆贪心除2缩小极差
 * Thin Domain Adapter (< 60 LOC)
 */

import { registerDeclarativeAlgorithm } from '../../../../core/declarative-algorithm-visualizer';
import { GREEDY_092_PROBLEMS } from './greedy-092-problem-content';
import { MINIMIZE_DEVIATION_CODES } from './greedy-092-stage-codes';
import {
  MinimizeDeviationStep,
  buildMinimizeDeviationSteps,
  parseMinimizeDeviationInputs,
} from './minimize-deviation-step-compiler';
import { renderMinimizeDeviationCanvas } from './minimize-deviation-canvas-adapter';

export type { MinimizeDeviationStep };
export { buildMinimizeDeviationSteps, renderMinimizeDeviationCanvas };

export const minimizeDeviationVisualizer = registerDeclarativeAlgorithm<MinimizeDeviationStep>({
  id: 'minimize-deviation-in-array',
  name: '数组的最小偏移量 (Minimize Deviation)',
  category: 'greedy',
  icon: '📉',
  difficulty: 3,
  levelOrder: 921,
  aliases: ['class092-code01', 'minimize-deviation-1675', 'leetcode-1675', 'minimize-deviation'],
  learningGoal: '掌握全奇数乘以2的数值单调归一化与大顶堆贪心缩小极差的证明',
  problemHtml: GREEDY_092_PROBLEMS.minimizeDeviation.html,
  analysisHtml: GREEDY_092_PROBLEMS.minimizeDeviation.html,
  inputs: [
    {
      id: 'input-nums',
      label: '正整数数组 nums',
      type: 'text',
      defaultValue: '4, 1, 5, 20, 3',
      placeholder: '4, 1, 5, 20, 3',
    },
  ],
  codeLanguages: MINIMIZE_DEVIATION_CODES,
  buildSteps: (inputs: Record<string, any>) => {
    const nums = parseMinimizeDeviationInputs(inputs);
    return buildMinimizeDeviationSteps(nums);
  },
  renderCanvas: (stageContainer: HTMLElement, step: MinimizeDeviationStep) => {
    renderMinimizeDeviationCanvas(stageContainer, step);
  },
});
