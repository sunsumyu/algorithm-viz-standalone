/**
 * 最大子数组和 (Maximum Subarray · LeetCode 53) - 声明式教学级沙盘渲染器 (Thin Domain Adapter)
 */

import { registerAlgorithm } from '../../../core/registry';
import { UniversalStageVisualizer } from '../dynamic-programming/unique-paths-renderer';
import {
  MSPhase,
  MSSStep,
  MAX_SUBARRAY_CODE_LINES,
  buildMaxSubarraySteps,
} from '../../../core/renderers/adapters/max-subarray-step-compiler';
import {
  renderMaxSubarrayCanvas,
} from '../../../core/renderers/adapters/max-subarray-canvas-adapter';

export type { MSPhase, MSSStep };
export {
  MAX_SUBARRAY_CODE_LINES,
  buildMaxSubarraySteps,
  renderMaxSubarrayCanvas,
};

registerAlgorithm({
  id: 'max-subarray',
  name: '最大子数组和',
  viewId: 'max-subarray',
  category: 'greedy',
  icon: '📊',
  difficulty: 2,
  levelOrder: 3,
  learningGoal: '掌握贪心算法在连续子数组求和中的局部最优（负和清零）与全局最优（最大和），理解Kadane算法四阶段演进',
  description: 'Kadane 贪心算法，连续累加和小于 0 时立即清零重新统计',
  aliases: ['max-subarray-greedy', 'kadane-algorithm', 'leetcode-53'],
  template: `<div id="max-subarray" class="view-container active" style="width: 100%; height: 100%; padding: 0;"></div>`,
  Visualizer: UniversalStageVisualizer,
});

export function registerMaxSubarray(): void {
  // 保持向前兼容导出
}
