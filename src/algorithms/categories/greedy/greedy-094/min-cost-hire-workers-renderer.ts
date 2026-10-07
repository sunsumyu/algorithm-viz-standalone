/**
 * 雇佣 K 名工人的最低成本 (LeetCode 857) - 声明式教学级沙盘渲染器
 * Thin Domain Adapter (< 45 LOC)
 */

import { UniversalStageVisualizer } from '../../dynamic-programming/unique-paths-renderer';
import { registerAlgorithm } from '../../../../core/registry';
import {
  WorkerInfo,
  MinCostHireWorkersStep,
  buildMinCostHireWorkersSteps,
} from './min-cost-hire-workers-step-compiler';

export type { WorkerInfo, MinCostHireWorkersStep };
export { buildMinCostHireWorkersSteps };

const template = `<div id="algo-min-cost-hire-workers-view" class="view-container active" style="width: 100%; height: 100%; padding: 0;"></div>`;

export const minCostHireWorkersRenderer = UniversalStageVisualizer;
export const minCostHireWorkersVisualizer = UniversalStageVisualizer;

registerAlgorithm({
  id: 'min-cost-hire-workers',
  name: '雇佣 K 名工人的最低成本 (Minimum Cost to Hire K Workers)',
  viewId: 'algo-min-cost-hire-workers-view',
  category: 'greedy',
  description: 'LeetCode 857：基准单价升序外层贪心与大根堆最小化质量和内层贪心的双重贪心架构',
  icon: '👷',
  template,
  Visualizer: UniversalStageVisualizer,
  difficulty: 3,
  levelOrder: 944,
  aliases: ['class094-code04', 'min-cost-hire-workers-857', 'leetcode-857', 'hire-k-workers'],
  learningGoal: '掌握基准单价升序外层贪心与大根堆最小化质量和内层贪心的双重贪心架构',
});

export function registerMinCostHireWorkers(): void {
  // 保持向前兼容导出
}
