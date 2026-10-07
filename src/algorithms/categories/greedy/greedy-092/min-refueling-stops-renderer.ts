/**
 * 最低加油次数 (LeetCode 871) - 声明式教学级沙盘渲染器
 * Thin Domain Adapter (< 45 LOC)
 */

import { UniversalStageVisualizer } from '../../dynamic-programming/unique-paths-renderer';
import { registerAlgorithm } from '../../../../core/registry';
import {
  StationDef,
  MinRefuelingStopsStep,
  buildMinRefuelingStopsSteps,
} from './min-refueling-stops-step-compiler';

export type { StationDef, MinRefuelingStopsStep };
export { buildMinRefuelingStopsSteps };

const template = `<div id="algo-minimum-number-of-refueling-stops-view" class="view-container active" style="width: 100%; height: 100%; padding: 0;"></div>`;

export const minRefuelingStopsRenderer = UniversalStageVisualizer;
export const minRefuelingStopsVisualizer = UniversalStageVisualizer;

registerAlgorithm({
  id: 'minimum-number-of-refueling-stops',
  name: '最低加油次数 (Minimum Number of Refueling Stops)',
  viewId: 'algo-minimum-number-of-refueling-stops-view',
  category: 'greedy',
  description: 'LeetCode 871：行进探测 + 大顶堆维护经过加油站油量（后悔贪心策略）',
  icon: '⛽',
  template,
  Visualizer: UniversalStageVisualizer,
  difficulty: 3,
  levelOrder: 926,
  aliases: ['class092-code06', 'min-refueling-stops-871', 'leetcode-871', 'min-refueling-stops'],
  learningGoal: '掌握后悔贪心策略与大顶堆动态补油机制',
});

export function registerMinRefuelingStops(): void {
  // 保持向前兼容导出
}
