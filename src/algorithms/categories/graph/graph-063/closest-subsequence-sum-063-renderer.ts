/**
 * 左程云算法通关课 Class 063: 最接近目标值的子序列和 (LeetCode 1755 · Closest Subsequence Sum)
 * 领域适配器 (Thin Domain Adapter)
 */

import { registerDeclarativeAlgorithm } from '../../../../core/declarative-algorithm-visualizer';
import { GRAPH_063_PROBLEMS } from './graph-063-problem-content';
import { CLOSEST_SUBSEQUENCE_SUM_063_CODES } from './graph-063-stage-codes';
import { renderMeetInTheMiddleArrayView } from './graph-063-shared';
import {
  ClosestSumStep,
  buildClosestSubsequenceSum063Steps,
} from './closest-subsequence-sum-063-step-compiler';

export type { ClosestSumStep };
export { buildClosestSubsequenceSum063Steps };

export const closestSubsequenceSum063Visualizer = registerDeclarativeAlgorithm<ClosestSumStep>({
  id: 'closest-subsequence-sum-063',
  name: '最接近目标值的子序列和 (折半搜索)',
  category: 'graph',
  difficulty: '困难',
  description: '左程云 Class 063 Code03：折半搜索 Meet in the Middle + 双指针相向逼近，时间复杂度 O(2^(N/2) * log(2^(N/2))) (LeetCode 1755)',
  aliases: ['class063-code03', 'closest-subsequence-sum-063', 'closest-subsequence-sum', 'min-abs-subsequence-sum-1755', 'leetcode-1755'],
  problemHtml: GRAPH_063_PROBLEMS['closest-subsequence-sum-063'].problemHtml,
  analysisHtml: GRAPH_063_PROBLEMS['closest-subsequence-sum-063'].complexityHtml,
  codeLanguages: CLOSEST_SUBSEQUENCE_SUM_063_CODES,
  inputs: [
    {
      id: 'preset',
      label: '用例选择',
      type: 'select',
      defaultValue: 'leetcode_example_1',
      options: [
        { label: '例题一 ([5, -7, 3, 5], 目标 6)', value: 'leetcode_example_1' },
        { label: '例题二 ([7, -9, 15, -2], 目标 -5)', value: 'leetcode_example_2' },
        { label: '全正数用例 ([1, 2, 4, 8], 目标 11)', value: 'positive_only' },
      ],
    },
  ],
  presets: [
    { label: '例题一 ([5, -7, 3, 5], 目标 6)', values: { preset: 'leetcode_example_1' } },
    { label: '例题二 ([7, -9, 15, -2], 目标 -5)', values: { preset: 'leetcode_example_2' } },
    { label: '全正数用例 ([1, 2, 4, 8], 目标 11)', values: { preset: 'positive_only' } },
  ],
  generateSteps: (inputs: Record<string, any>) => buildClosestSubsequenceSum063Steps(inputs?.preset),
  renderCanvas: (container: HTMLElement, step: ClosestSumStep) => {
    container.innerHTML = renderMeetInTheMiddleArrayView({
      lsum: step.lsum,
      rsum: step.rsum,
      activeLeftIdx: step.leftPtr,
      activeRightIdx: step.rightPtr,
      curLeftVal: step.curLeftVal,
      curRightVal: step.curRightVal,
      targetOrGoal: step.goal,
      currentAns: `最小差 = ${step.bestDiff}${step.curSum !== undefined ? ` (当前和 ${step.curSum})` : ''}`,
      modeTitle: '最接近目标值子序列和 · 双指针相向逼近沙盘',
    });
  },
});
