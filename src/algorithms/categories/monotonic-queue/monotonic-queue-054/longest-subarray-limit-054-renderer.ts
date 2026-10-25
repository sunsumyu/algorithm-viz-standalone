/**
 * Class 054: Code02 绝对差不超过限制的最长连续子数组 (Longest Subarray with Limit)
 * 双单调队列协同维护滑动窗口极差 / LeetCode 1438
 */

import { registerDeclarativeAlgorithm } from '../../../../core/declarative-algorithm-visualizer';
import { QUEUE_054_PROBLEMS } from './queue-054-problem-content';
import { CODE02_LONGEST_SUBARRAY_CODES } from './queue-054-stage-codes';
import { Step054, renderLongestSubarrayLimitBoard } from './queue-054-shared';
import { buildLongestSubarrayLimitSteps } from './longest-subarray-limit-054-step-compiler';

export { buildLongestSubarrayLimitSteps };

export const longestSubarrayLimit054Renderer = registerDeclarativeAlgorithm<Step054>({
  id: 'longest-subarray-limit-054',
  aliases: [
    'class054-code02',
    'longest-subarray-limit',
    'longest-subarray-limit-1438',
    'leetcode-1438',
    '1438',
    'valid-subarray-limit-055',
  ],
  name: '绝对差限制最长子数组 (Class 054)',
  category: 'monotonic-queue',
  difficulty: 'medium',
  hasDeductionTree: true,
  badge: { mode: '双单调队列极差', complexity: 'O(N)' },
  description: '双单调队列协同：maxDeque 与 minDeque 分别维护滑动窗口极值，双指针贪心寻找极差 ≤ limit 的最长连续子数组 (LeetCode 1438)',
  learningGoal: '理解双单调队列在动态极差维护中的威力，掌握双指针配合单调队列在 O(N) 复杂度解决滑动窗口极值约束问题。',
  icon: '🎯',

  inputs: [
    {
      id: 'nums',
      label: '数组元素 (逗号分隔)',
      type: 'text',
      defaultValue: '8, 2, 4, 7',
      placeholder: '例如: 8, 2, 4, 7',
    },
    {
      id: 'limit',
      label: '最大允许极差 limit',
      type: 'number',
      defaultValue: 4,
      min: 0,
      max: 100,
    },
  ],

  presets: [
    {
      label: '经典案例: [8, 2, 4, 7], limit=4 (答案: 2)',
      values: { nums: '8, 2, 4, 7', limit: 4 },
    },
    {
      label: '全量达标: [10, 1, 2, 4, 7, 2], limit=5 (答案: 4)',
      values: { nums: '10, 1, 2, 4, 7, 2', limit: 5 },
    },
    {
      label: '单调平缓: [4, 2, 2, 2, 4, 4, 2, 2], limit=0 (答案: 3)',
      values: { nums: '4, 2, 2, 2, 4, 4, 2, 2', limit: 0 },
    },
  ],

  problemContent: QUEUE_054_PROBLEMS.longestSubarrayLimit054,
  codeLanguages: CODE02_LONGEST_SUBARRAY_CODES,

  generateSteps: (params?: Record<string, any>) => {
    let nums = [8, 2, 4, 7];
    let limit = 4;

    if (params && params.nums) {
      const parsed = String(params.nums)
        .split(/[,，\s]+/)
        .map(s => parseInt(s.trim(), 10))
        .filter(n => !isNaN(n));
      if (parsed.length > 0) nums = parsed;
    }

    if (params && params.limit !== undefined) {
      const parsedLimit = parseInt(params.limit, 10);
      if (!isNaN(parsedLimit) && parsedLimit >= 0) limit = parsedLimit;
    }

    return buildLongestSubarrayLimitSteps(nums, limit);
  },

  renderCanvas: (container, step) => {
    container.innerHTML = renderLongestSubarrayLimitBoard(step);
  },
});

export const longestSubarrayLimit054Visualizer = longestSubarrayLimit054Renderer;
