import { registerDeclarativeAlgorithm } from '../../../../core/declarative-algorithm-visualizer';
import {
  MAX_SUBARRAY_MIN_PROD_CODES,
} from './stack-053-stage-codes';
import {
  MAX_SUBARRAY_MIN_PROD_PROBLEM_HTML,
  MAX_SUBARRAY_MIN_PROD_EXPLANATION,
} from './stack-053-problem-content';
import { type Step053 } from './stack-053-shared';
import {
  buildMaxSubarrayMinProductSteps,
} from './maximum-subarray-min-product-053-step-compiler';

export {
  buildMaxSubarrayMinProductSteps,
};

export const maximumSubarrayMinProduct053Visualizer = registerDeclarativeAlgorithm<Step053>({
  id: 'maximum-subarray-min-product-053',
  name: '子数组最小乘积的最大值 (Class 053 Code06)',
  category: 'monotonic-stack',
  difficulty: 'medium',
  aliases: ['maximum-subarray-min-product', '1856', '子数组最小乘积的最大值', 'class053-code06'],
  learningGoal:
    '掌握单调递增栈求解每个柱子作为最小值所能延展的最远辐射区间，配合前缀和 O(1) 提取区间和。',
  problemContent: {
    title: '子数组最小乘积的最大值',
    source: 'LeetCode 1856 / 算法通关课 Class 053 Code06',
    description: '寻找非空子数组中最小值乘以子数组和的最大值对 10^9+7 取模。',
    problemHtml: MAX_SUBARRAY_MIN_PROD_PROBLEM_HTML,
    analysisHtml: MAX_SUBARRAY_MIN_PROD_EXPLANATION,
  },
  codeLanguages: MAX_SUBARRAY_MIN_PROD_CODES,
  inputs: [
    {
      id: 'nums',
      label: '正整数数组',
      type: 'text',
      defaultValue: '1, 2, 3, 2',
      placeholder: '逗号分隔的正整数',
    },
  ],
  presets: [
    { label: '示例 1: 官方经典 1 (1, 2, 3, 2 ➔ 14)', values: { nums: '1, 2, 3, 2' } },
    { label: '示例 2: 官方经典 2 (2, 3, 3, 1, 2 ➔ 18)', values: { nums: '2, 3, 3, 1, 2' } },
    { label: '示例 3: 官方经典 3 (3, 1, 5, 6, 4, 2 ➔ 60)', values: { nums: '3, 1, 5, 6, 4, 2' } },
    { label: '示例 4: 严格单调递增 (1, 2, 3, 4, 5)', values: { nums: '1, 2, 3, 4, 5' } },
  ],
  generateSteps: (inputs) => {
    const raw = typeof inputs?.nums === 'string' ? inputs.nums : '1, 2, 3, 2';
    return buildMaxSubarrayMinProductSteps(raw);
  },
  renderCanvas: (container, step) => {
    container.innerHTML = step.sandboxes[0]?.customHtml ?? '';
  },
});
