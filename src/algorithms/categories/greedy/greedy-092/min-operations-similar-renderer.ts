/**
 * 使数组相似的最少操作次数 (LeetCode 2449) - 声明式教学级沙盘渲染器
 * 核心贪心：奇偶分离独立排序 + 顺位对齐累加正差值之和 / 2
 * Thin Domain Adapter (< 60 LOC)
 */

import { registerDeclarativeAlgorithm } from '../../../../core/declarative-algorithm-visualizer';
import { GREEDY_092_PROBLEMS } from './greedy-092-problem-content';
import { MIN_OPERATIONS_SIMILAR_CODES } from './greedy-092-stage-codes';
import {
  PairMatch,
  MinOperationsSimilarStep,
  buildMinOperationsSimilarSteps,
  parseMinOperationsSimilarInputs,
} from './min-operations-similar-step-compiler';
import { renderMinOperationsSimilarCanvas } from './min-operations-similar-canvas-adapter';

export type { PairMatch, MinOperationsSimilarStep };
export { buildMinOperationsSimilarSteps, renderMinOperationsSimilarCanvas };

export const minOperationsSimilarVisualizer = registerDeclarativeAlgorithm<MinOperationsSimilarStep>({
  id: 'minimum-operations-to-make-similar',
  name: '使数组相似的最少操作次数',
  category: 'greedy',
  icon: '🔄',
  difficulty: 3,
  levelOrder: 923,
  aliases: ['class092-code03', 'min-operations-similar-2449', 'leetcode-2449', 'make-array-similar'],
  learningGoal: '掌握奇偶分类独立排序与排序不等式顺位对齐的正差值累加贪心法',
  problemHtml: GREEDY_092_PROBLEMS.minOperationsSimilar.html,
  analysisHtml: GREEDY_092_PROBLEMS.minOperationsSimilar.html,
  inputs: [
    {
      id: 'input-nums',
      label: '原数组 nums',
      type: 'text',
      defaultValue: '8, 12, 6',
      placeholder: '8, 12, 6',
    },
    {
      id: 'input-target',
      label: '目标数组 target',
      type: 'text',
      defaultValue: '2, 14, 10',
      placeholder: '2, 14, 10',
    },
  ],
  codeLanguages: MIN_OPERATIONS_SIMILAR_CODES,
  buildSteps: (inputs: Record<string, any>) => {
    const { nums, target } = parseMinOperationsSimilarInputs(inputs);
    return buildMinOperationsSimilarSteps(nums, target);
  },
  renderCanvas: (stageContainer: HTMLElement, step: MinOperationsSimilarStep) => {
    renderMinOperationsSimilarCanvas(stageContainer, step);
  },
});
