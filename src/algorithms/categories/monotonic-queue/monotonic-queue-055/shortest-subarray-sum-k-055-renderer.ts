/**
 * Class 055: Code01 和至少为 K 的最短子数组 (Shortest Subarray with Sum at Least K)
 * 前缀和 + 单调递增队列头尾双向弹出 / LeetCode 862
 */

import { registerDeclarativeAlgorithm } from '../../../../core/declarative-algorithm-visualizer';
import { QUEUE_055_PROBLEMS } from './queue-055-problem-content';
import { CODE01_SHORTEST_SUBARRAY_CODES } from './queue-055-stage-codes';
import { Step055, renderShortestSubarrayBoard } from './queue-055-shared';
import { buildShortestSubarraySteps } from './shortest-subarray-sum-k-055-step-compiler';

export { buildShortestSubarraySteps };

export const shortestSubarraySumK055Renderer = registerDeclarativeAlgorithm<Step055>({
  id: 'shortest-subarray-sum-k-055',
  aliases: [
    'class055-code01',
    'shortest-subarray-sum-k',
    'shortest-subarray-862',
    'leetcode-862',
    '862',
  ],
  name: '和至少为 K 的最短子数组 (Class 055)',
  category: 'monotonic-queue',
  difficulty: 'hard',
  hasDeductionTree: true,
  badge: { mode: '前缀和+双向队列', complexity: 'O(N)' },
  description: '克服负数累加和非单调困境：前缀和转换 + 单调递增队列头尾双向弹出，求和 ≥ K 的最短连续子数组 (LeetCode 862)',
  learningGoal: '深刻理解负数破坏滑窗单调性时前缀和转换的妙用，掌握队头达标永久结算与队尾小值降维打击的单调队列精髓。',
  icon: '⚡',

  inputs: [
    {
      id: 'nums',
      label: '数组元素 (逗号隔开, 可含负数)',
      type: 'text',
      defaultValue: '2, -1, 2, 1',
      placeholder: '例如: 2, -1, 2, 1',
    },
    {
      id: 'k',
      label: '目标累加和 K',
      type: 'number',
      defaultValue: 3,
      min: 1,
      max: 100,
    },
  ],

  presets: [
    {
      label: '经典案例: [2, -1, 2, 1], K=3 (答案: 2, 即 [2, 1])',
      values: { nums: '2, -1, 2, 1', k: 3 },
    },
    {
      label: '单元素达标: [1], K=1 (答案: 1)',
      values: { nums: '1', k: 1 },
    },
    {
      label: '包含大负数: [84, -37, 32, 40, 95], K=167 (答案: 3)',
      values: { nums: '84, -37, 32, 40, 95', k: 167 },
    },
  ],

  problemContent: QUEUE_055_PROBLEMS.shortestSubarraySumK055,
  codeLanguages: CODE01_SHORTEST_SUBARRAY_CODES,

  generateSteps: (params?: Record<string, any>) => {
    let nums = [2, -1, 2, 1];
    let k = 3;

    if (params && params.nums) {
      const parsed = String(params.nums)
        .split(/[,，\s]+/)
        .map(s => parseInt(s.trim(), 10))
        .filter(n => !isNaN(n));
      if (parsed.length > 0) nums = parsed;
    }

    if (params && params.k !== undefined) {
      const parsedK = parseInt(params.k, 10);
      if (!isNaN(parsedK) && parsedK > 0) k = parsedK;
    }

    return buildShortestSubarraySteps(nums, k);
  },

  renderCanvas: (container, step) => {
    container.innerHTML = renderShortestSubarrayBoard(step);
  },
});
