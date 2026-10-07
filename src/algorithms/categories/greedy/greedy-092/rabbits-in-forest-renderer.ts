/**
 * 森林中的兔子 (LeetCode 781) - 声明式教学级沙盘渲染器
 * Thin Domain Adapter (< 45 LOC)
 */

import { UniversalStageVisualizer } from '../../dynamic-programming/unique-paths-renderer';
import { registerAlgorithm } from '../../../../core/registry';
import {
  RabbitGroupItem,
  RabbitsInForestStep,
  buildRabbitsInForestSteps,
} from './rabbits-in-forest-step-compiler';

export type { RabbitGroupItem, RabbitsInForestStep };
export { buildRabbitsInForestSteps };

const template = `<div id="algo-rabbits-in-forest-view" class="view-container active" style="width: 100%; height: 100%; padding: 0;"></div>`;

export const rabbitsInForestRenderer = UniversalStageVisualizer;
export const rabbitsInForestVisualizer = UniversalStageVisualizer;

registerAlgorithm({
  id: 'rabbits-in-forest',
  name: '森林中的兔子 (Rabbits in Forest)',
  viewId: 'algo-rabbits-in-forest-view',
  category: 'greedy',
  description: 'LeetCode 781：同色合并与向上取整分组 ceil(cnt / (x + 1)) * (x + 1)',
  icon: '🐇',
  template,
  Visualizer: UniversalStageVisualizer,
  difficulty: 2,
  levelOrder: 922,
  aliases: ['class092-code02', 'rabbits-in-forest-781', 'leetcode-781'],
  learningGoal: '掌握同回答兔子尽力归入同组的向上取整分组贪心推导',
});
