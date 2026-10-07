/**
 * 最短无序连续子数组 (LeetCode 581) - 声明式教学级沙盘渲染器
 * 核心贪心：双向极值扫描判定左右无序边界
 */

import { createDeclarativeVisualizer } from '../../../../core/declarative-algorithm-visualizer';
import { registerAlgorithm } from '../../../../core/registry';
import { UniversalStageVisualizer } from '../../dynamic-programming/unique-paths-renderer';
import { GREEDY_091_PROBLEMS } from './greedy-091-problem-content';
import { SHORTEST_UNSORTED_CODES } from './greedy-091-stage-codes';
import {
  type ShortestUnsortedStep,
  buildShortestUnsortedSteps,
} from './shortest-unsorted-subarray-step-compiler';
import { renderShortestUnsortedCanvas } from './shortest-unsorted-subarray-canvas-adapter';

export type { ShortestUnsortedStep };
export { buildShortestUnsortedSteps, renderShortestUnsortedCanvas };

const { template } = createDeclarativeVisualizer<ShortestUnsortedStep>({
  id: 'shortest-unsorted-continuous-subarray',
  name: '最短无序连续子数组 (Shortest Unsorted Subarray)',
  category: 'greedy',
  icon: '🔍',
  difficulty: 2,
  levelOrder: 911,
  learningGoal: '掌握双向最值扫描锁定无序边界的局部贪心原理',
  problemHtml: GREEDY_091_PROBLEMS.shortestUnsortedSubarray.html,
  analysisHtml: GREEDY_091_PROBLEMS.shortestUnsortedSubarray.html,
  inputs: [
    {
      id: 'input-nums',
      label: '输入数组 nums',
      type: 'text',
      defaultValue: '2, 6, 4, 8, 10, 9, 15',
      placeholder: '用逗号分隔，如 2, 6, 4, 8, 10, 9, 15',
    },
  ],
  codeLanguages: SHORTEST_UNSORTED_CODES,
  buildSteps: (inputs: Record<string, any>) => {
    const raw = String(inputs?.['input-nums'] || '2, 6, 4, 8, 10, 9, 15');
    const nums = raw.split(/[,，\s]+/).map((s) => parseInt(s.trim(), 10)).filter((n) => !isNaN(n));
    return buildShortestUnsortedSteps(nums);
  },
  renderCanvas: renderShortestUnsortedCanvas,
});

export const shortestUnsortedSubarrayVisualizer = UniversalStageVisualizer;
export const shortestUnsortedSubarrayRenderer = UniversalStageVisualizer;

registerAlgorithm({
  id: 'shortest-unsorted-continuous-subarray',
  name: '最短无序连续子数组 (Shortest Unsorted Subarray)',
  viewId: 'algo-shortest-unsorted-continuous-subarray-view',
  category: 'greedy',
  icon: '🔍',
  difficulty: 2,
  levelOrder: 911,
  description: '寻找最短连续子数组，若对其升序排序则全数组有序。通过双向线性极值扫描在 O(N) 锁定无序区间左右边界。',
  learningGoal: '掌握双向最值扫描锁定无序边界的局部贪心原理',
  aliases: ['class091-code01', 'shortest-unsorted-subarray-581', 'leetcode-581', 'shortest-unsorted-subarray'],
  template,
  Visualizer: UniversalStageVisualizer,
});
