/**
 * Class 052 Code04: 子数组的最小值之和 (Sum of Subarray Minimums / LeetCode 907)
 */

import { registerDeclarativeAlgorithm } from '../../../../core/declarative-algorithm-visualizer';
import { parseNumberList } from '../../../../core/input-primitives';
import { STACK_052_PROBLEMS } from './stack-052-problem-content';
import {
  SUM_SUBARRAY_MINIMUMS_CODES,
} from './stack-052-stage-codes';
import {
  buildSumSubarrayMinimums052Steps,
  type SumSubarrayMinimumsStep,
  type SubarrayMinContribution,
} from './sum-subarray-minimums-052-step-compiler';
import { renderSumSubarrayMinimumsCanvas } from './sum-subarray-minimums-052-canvas-adapter';

export {
  buildSumSubarrayMinimums052Steps,
  type SumSubarrayMinimumsStep,
  type SubarrayMinContribution,
  renderSumSubarrayMinimumsCanvas,
};

export const sumSubarrayMinimums052Visualizer = registerDeclarativeAlgorithm<SumSubarrayMinimumsStep>({
  id: 'sum-subarray-minimums-052',
  name: '子数组的最小值之和 (Class 052 Code04)',
  category: 'monotonic-stack',
  aliases: ['sum-subarray-minimums', 'leetcode-907', '907', 'class052-code04'],
  difficulty: 'hard',
  hasDeductionTree: true,
  learningGoal: '领悟贡献法的逆向思维，掌握单调栈界定辐射范围以及开闭区间规避重复统计的精妙技巧。',
  problemContent: STACK_052_PROBLEMS.sumSubarrayMinimums052,
  codeLanguages: SUM_SUBARRAY_MINIMUMS_CODES,
  inputs: [
    {
      id: 'arr',
      label: '输入数组',
      type: 'text',
      defaultValue: '3, 1, 2, 4',
      placeholder: '逗号分隔的整数',
    },
  ],
  presets: [
    { label: '示例 1: 官方例题 [3,1,2,4]', values: { arr: '3, 1, 2, 4' } },
    { label: '示例 2: 包含重复值 [11,81,94,43,3]', values: { arr: '11, 81, 94, 43, 3' } },
    { label: '示例 3: 相同元素 [2,2,2]', values: { arr: '2, 2, 2' } },
  ],
  generateSteps: (inputs) => {
    const raw = parseNumberList(inputs.arr, '3, 1, 2, 4');
    return buildSumSubarrayMinimums052Steps(raw.length ? raw : [3, 1, 2, 4]);
  },
  renderCanvas: (container, step) => renderSumSubarrayMinimumsCanvas(container, step),
});
