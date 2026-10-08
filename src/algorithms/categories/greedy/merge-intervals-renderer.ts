/**
 * 合并区间 (Merge Intervals · LeetCode 56) - 声明式教学级沙盘渲染器 (Thin Domain Adapter)
 */

import { registerAlgorithm } from '../../../core/registry';
import { UniversalStageVisualizer } from '../dynamic-programming/unique-paths-renderer';
import {
  MergeStep,
  MERGE_INTERVALS_CODE_LINES,
  parseIntervals,
  buildMergeIntervalsSteps,
} from '../../../core/renderers/adapters/merge-intervals-step-compiler';
import {
  renderMergeIntervalsCanvas,
} from '../../../core/renderers/adapters/merge-intervals-canvas-adapter';

export type { MergeStep };
export {
  MERGE_INTERVALS_CODE_LINES,
  parseIntervals,
  buildMergeIntervalsSteps,
  renderMergeIntervalsCanvas,
};

registerAlgorithm({
  id: 'merge-intervals',
  name: '合并区间',
  viewId: 'merge-intervals',
  category: 'greedy',
  icon: '🧩',
  difficulty: 2,
  levelOrder: 11,
  learningGoal: '掌握区间合并标准贪心流程，学会维护合并结果集末尾区间的动态扩界技巧',
  description: '按左端点升序排序，遍历合并所有重叠区间，动态扩展当前重叠最大右端点',
  template: `<div id="merge-intervals" class="view-container active" style="width: 100%; height: 100%; padding: 0;"></div>`,
  Visualizer: UniversalStageVisualizer,
});

export function registerMergeIntervals(): void {
  // 保持向前兼容导出
}
