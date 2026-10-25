/**
 * 数组的最小偏移量 (LeetCode 1675) - 声明式教学级沙盘渲染器 (Thin Domain Adapter)
 * 核心贪心：奇数乘2单调归一化 + 大顶堆贪心除2缩小极差
 */

import { UniversalStageVisualizer } from '../../dynamic-programming/unique-paths-renderer';
import { registerAlgorithm } from '../../../../core/registry';
import {
  MinimizeDeviationStep,
  buildMinimizeDeviationSteps,
  parseMinimizeDeviationInputs,
} from './minimize-deviation-step-compiler';
import { renderMinimizeDeviationCanvas } from './minimize-deviation-canvas-adapter';

export type { MinimizeDeviationStep };
export {
  buildMinimizeDeviationSteps,
  parseMinimizeDeviationInputs,
  renderMinimizeDeviationCanvas,
};

const template = `<div id="algo-minimize-deviation-view" class="view-container active" style="width: 100%; height: 100%; padding: 0;"></div>`;

export const minimizeDeviationRenderer = UniversalStageVisualizer;
export const minimizeDeviationVisualizer = UniversalStageVisualizer;

registerAlgorithm({
  id: 'minimize-deviation-in-array',
  name: '数组的最小偏移量 (Minimize Deviation)',
  viewId: 'algo-minimize-deviation-view',
  category: 'greedy',
  description: 'LeetCode 1675：全奇数乘以 2 的数值单调归一化与大顶堆贪心缩小极差的证明',
  icon: '📉',
  template,
  Visualizer: UniversalStageVisualizer,
  difficulty: 3,
  levelOrder: 921,
  learningGoal: '掌握全奇数乘以2的数值单调归一化与大顶堆贪心缩小极差的证明',
  aliases: ['class092-code01', 'minimize-deviation-1675', 'leetcode-1675', 'minimize-deviation'],
});

export function registerMinimizeDeviation(): void {
  // 保持向前兼容导出
}
