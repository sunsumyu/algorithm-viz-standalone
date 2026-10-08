/**
 * 单调递增的数字 (Monotone Increasing Digits · LeetCode 738) - 声明式教学级沙盘渲染器 (Thin Domain Adapter)
 */

import { registerAlgorithm } from '../../../core/registry';
import { UniversalStageVisualizer } from '../dynamic-programming/unique-paths-renderer';
import {
  MonotoneStep,
  MONOTONE_DIGITS_CODE_LINES,
  parseNumber,
  buildMonotoneDigitsSteps,
} from '../../../core/renderers/adapters/monotone-digits-step-compiler';
import {
  renderMonotoneDigitsCanvas,
} from '../../../core/renderers/adapters/monotone-digits-canvas-adapter';

export type { MonotoneStep };
export {
  MONOTONE_DIGITS_CODE_LINES,
  parseNumber,
  buildMonotoneDigitsSteps,
  renderMonotoneDigitsCanvas,
};

registerAlgorithm({
  id: 'monotone-digits',
  name: '单调递增的数字',
  viewId: 'monotone-digits',
  category: 'greedy',
  icon: '📈',
  difficulty: 2,
  levelOrder: 15,
  learningGoal: '掌握逆序遍历利用前序状态的解题技巧，理解贪心置 9 对数值最大化的精妙运用',
  description: '逆序扫描借位减 1 并标记起点，后续位数统一贪心置 9，求小于等于 N 的最大单调数',
  template: `<div id="monotone-digits" class="view-container active" style="width: 100%; height: 100%; padding: 0;"></div>`,
  Visualizer: UniversalStageVisualizer,
});

export function registerMonotoneDigits(): void {
  // 保持向前兼容导出
}
