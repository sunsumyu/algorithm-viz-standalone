/**
 * 用最少数量的箭引爆气球 (Minimum Number of Arrows to Burst Balloons · LeetCode 452) - 声明式教学级沙盘渲染器 (Thin Domain Adapter)
 */

import { registerAlgorithm } from '../../../core/registry';
import { UniversalStageVisualizer } from '../dynamic-programming/unique-paths-renderer';
import {
  MAStep,
  MIN_ARROWS_CODE_LINES,
  parseBalloons,
  buildMinArrowsSteps,
} from '../../../core/renderers/adapters/min-arrows-step-compiler';
import {
  renderMinArrowsCanvas,
} from '../../../core/renderers/adapters/min-arrows-canvas-adapter';

export type { MAStep };
export {
  MIN_ARROWS_CODE_LINES,
  parseBalloons,
  buildMinArrowsSteps,
  renderMinArrowsCanvas,
};

registerAlgorithm({
  id: 'min-arrows',
  name: '用最少数量的箭引爆气球',
  viewId: 'min-arrows',
  category: 'greedy',
  icon: '🏹',
  difficulty: 2,
  levelOrder: 8,
  learningGoal: '掌握区间重叠问题的贪心收缩右边界模型，奠定区间调度类问题的求解范式',
  description: '按左端点升序排序，贪心收紧重叠区间最小右边界，计算最少所需弓箭数',
  template: `<div id="min-arrows" class="view-container active" style="width: 100%; height: 100%; padding: 0;"></div>`,
  Visualizer: UniversalStageVisualizer,
});

export function registerMinArrows(): void {
  // 保持向前兼容导出
}
