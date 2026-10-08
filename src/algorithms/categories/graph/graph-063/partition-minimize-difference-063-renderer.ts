/**
 * 左程云算法通关课 Class 063: 分割数组使两个数组和的差值最小 (LeetCode 2035)
 * 领域适配器 (Thin Domain Adapter)
 */

import { registerDeclarativeAlgorithm } from '../../../../core/declarative-algorithm-visualizer';
import { GRAPH_063_PROBLEMS } from './graph-063-problem-content';
import { PARTITION_MIN_DIFF_063_CODES } from './graph-063-stage-codes';
import { renderPartitionMinDiffView } from './graph-063-shared';
import {
  PartitionMinDiffStep,
  buildPartitionMinDiff063Steps,
} from './partition-minimize-difference-063-step-compiler';

export type { PartitionMinDiffStep };
export { buildPartitionMinDiff063Steps };

export const partitionMinimizeDifference063Visualizer = registerDeclarativeAlgorithm<PartitionMinDiffStep>({
  id: 'partition-minimize-difference-063',
  name: '分割数组使差最小 (分桶折半搜索)',
  category: 'graph',
  difficulty: '困难',
  description: '左程云 Class 063 Code04：选数约束下的折半搜索 Meet in the Middle，按选数个数 k 分桶 + 二分逼近目标半和 (LeetCode 2035)',
  aliases: ['class063-code04', 'partition-minimize-difference-063', 'partition-minimize-diff-2035', 'partition-array-min-diff', 'leetcode-2035'],
  problemHtml: GRAPH_063_PROBLEMS['partition-minimize-difference-063'].problemHtml,
  analysisHtml: GRAPH_063_PROBLEMS['partition-minimize-difference-063'].complexityHtml,
  codeLanguages: PARTITION_MIN_DIFF_063_CODES,
  inputs: [
    {
      id: 'preset',
      label: '用例选择',
      type: 'select',
      defaultValue: 'leetcode_example_1',
      options: [
        { label: '经典用例 ([3, 9, 7, 3], 最小差 2)', value: 'leetcode_example_1' },
        { label: '对偶负数 ([-36, 36], 最小差 72)', value: 'leetcode_example_2' },
        { label: '6元素用例 ([2, -1, 0, 4, -2, -9])', value: 'medium_6_elements' },
      ],
    },
  ],
  presets: [
    { label: '经典用例 ([3, 9, 7, 3], 最小差 2)', values: { preset: 'leetcode_example_1' } },
    { label: '对偶负数 ([-36, 36], 最小差 72)', values: { preset: 'leetcode_example_2' } },
    { label: '6元素用例 ([2, -1, 0, 4, -2, -9])', values: { preset: 'medium_6_elements' } },
  ],
  generateSteps: (inputs: Record<string, any>) => buildPartitionMinDiff063Steps(inputs?.preset),
  renderCanvas: (container: HTMLElement, step: PartitionMinDiffStep) => {
    container.innerHTML = renderPartitionMinDiffView({
      lsumCounts: step.lsumCounts,
      rsumCounts: step.rsumCounts,
      n: step.n,
      totalSum: step.totalSum,
      activeK: step.activeK,
      curLeftVal: step.curLeftVal,
      curTarget: step.curTarget,
      matchedRightVal: step.matchedRightVal,
      currentDiff: step.currentDiff,
      bestDiff: step.bestDiff,
    });
  },
});
