/**
 * 无重叠区间 (Non-overlapping Intervals · LeetCode 435) - 声明式教学级沙盘渲染器 (Thin Domain Adapter)
 */

import { registerAlgorithm } from '../../../core/registry';
import { UniversalStageVisualizer } from '../dynamic-programming/unique-paths-renderer';
import {
  NonOverlappingStep,
  NON_OVERLAPPING_CODE_LINES,
  parseIntervals,
  buildNonOverlappingSteps,
} from '../../../core/renderers/adapters/non-overlapping-step-compiler';
import {
  renderNonOverlappingCanvas,
} from '../../../core/renderers/adapters/non-overlapping-canvas-adapter';

export type { NonOverlappingStep };
export {
  NON_OVERLAPPING_CODE_LINES,
  parseIntervals,
  buildNonOverlappingSteps,
  renderNonOverlappingCanvas,
};

registerAlgorithm({
  id: 'non-overlapping',
  name: '无重叠区间',
  viewId: 'non-overlapping',
  category: 'greedy',
  icon: '✂️',
  difficulty: 2,
  levelOrder: 9,
  learningGoal: '掌握区间调度与重叠淘汰的贪心思想，建立与射气球问题的双向映射',
  description: '求使剩余区间互不重叠所需移除的最小区间数量，重叠时贪心淘汰右端点更大者',
  template: `<div id="non-overlapping" class="view-container active" style="width: 100%; height: 100%; padding: 0;"></div>`,
  Visualizer: UniversalStageVisualizer,
});

export function registerNonOverlapping(): void {
  // 保持向前兼容导出
}
