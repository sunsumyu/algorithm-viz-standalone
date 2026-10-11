/**
 * Class 054: Code01 滑动窗口最大值 (Sliding Window Maximum)
 * 经典单调队列入门模版 / LeetCode 239
 */

import { registerDeclarativeAlgorithm } from '../../../../core/declarative-algorithm-visualizer';
import { QUEUE_054_PROBLEMS } from './queue-054-problem-content';
import { CODE01_SLIDING_WINDOW_CODES } from './queue-054-stage-codes';
import { Step054, renderSlidingWindowBoard } from './queue-054-shared';
import { buildSlidingWindowMaxSteps } from './sliding-window-max-054-step-compiler';

export { buildSlidingWindowMaxSteps };

export const slidingWindowMax054Renderer = registerDeclarativeAlgorithm<Step054>({
  id: 'sliding-window-max-054',
  aliases: [
    'class054-code01',
    'sliding-window-max',
    'sliding-window-maximum',
    'sliding-window-maximum-239',
    'leetcode-239',
    'monotonic-queue-basic-054',
  ],
  name: '滑动窗口最大值 (Class 054)',
  category: 'monotonic-queue',
  difficulty: 'hard',
  badge: { mode: '单调双端队列', complexity: 'O(N)' },
  description: '单调双端队列经典应用：维护队头到队尾单调递减，O(1) 瞬时获取当前滑动窗口内的最大元素 (LeetCode 239)',
  learningGoal: '彻底掌握单调双端队列核心哲学：后入且更大者淘汰老旧劣质元素，队头严格维护当前活动窗口最大值。',
  icon: '🪟',

  inputs: [
    {
      id: 'nums',
      label: '数组元素 (逗号分隔)',
      type: 'text',
      defaultValue: '1, 3, -1, -3, 5, 3, 6, 7',
      placeholder: '例如: 1, 3, -1, -3, 5, 3, 6, 7',
    },
    {
      id: 'k',
      label: '窗口大小 K',
      type: 'number',
      defaultValue: 3,
      min: 1,
      max: 20,
    },
  ],

  presets: [
    {
      label: '经典案例: [1, 3, -1, -3, 5, 3, 6, 7], K=3',
      values: { nums: '1, 3, -1, -3, 5, 3, 6, 7', k: 3 },
    },
    {
      label: '单调递减: [9, 8, 7, 6, 5, 4], K=3',
      values: { nums: '9, 8, 7, 6, 5, 4', k: 3 },
    },
    {
      label: '单调递增: [1, 2, 3, 4, 5, 6], K=3',
      values: { nums: '1, 2, 3, 4, 5, 6', k: 3 },
    },
    {
      label: '重复元素: [4, 4, 4, 2, 4, 1], K=2',
      values: { nums: '4, 4, 4, 2, 4, 1', k: 2 },
    },
  ],

  problemContent: QUEUE_054_PROBLEMS.slidingWindowMax054,
  codeLanguages: CODE01_SLIDING_WINDOW_CODES,

  generateSteps: (params?: Record<string, any>) => {
    let nums = [1, 3, -1, -3, 5, 3, 6, 7];
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

    return buildSlidingWindowMaxSteps(nums, k);
  },

  renderCanvas: (container, step) => {
    container.innerHTML = renderSlidingWindowBoard(step);
  },
});
