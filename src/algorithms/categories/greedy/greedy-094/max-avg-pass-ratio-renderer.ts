/**
 * 最大平均通过率 (LeetCode 1792) - 声明式教学级沙盘渲染器
 * Thin Domain Adapter (< 45 LOC)
 */

import { UniversalStageVisualizer } from '../../dynamic-programming/unique-paths-renderer';
import { registerAlgorithm } from '../../../../core/registry';
import {
  ClassItem,
  MaxAvgPassRatioStep,
  calcGain,
  buildMaxAvgPassRatioSteps,
} from './max-avg-pass-ratio-step-compiler';

export type { ClassItem, MaxAvgPassRatioStep };
export { calcGain, buildMaxAvgPassRatioSteps };

const template = `<div id="algo-max-avg-pass-ratio-view" class="view-container active" style="width: 100%; height: 100%; padding: 0;"></div>`;

export const maxAvgPassRatioRenderer = UniversalStageVisualizer;
export const maxAvgPassRatioVisualizer = UniversalStageVisualizer;

registerAlgorithm({
  id: 'max-avg-pass-ratio',
  name: '最大平均通过率 (Maximum Average Pass Ratio)',
  viewId: 'algo-max-avg-pass-ratio-view',
  category: 'greedy',
  description: 'LeetCode 1792：基于边际增益递减原理与大根堆动态调度的贪心算法',
  icon: '🎓',
  template,
  Visualizer: UniversalStageVisualizer,
  difficulty: 2,
  levelOrder: 943,
  aliases: ['class094-code03', 'max-avg-pass-ratio-1792', 'leetcode-1792', 'max-average-pass-ratio'],
  learningGoal: '理解大根堆维护边际增益递减特征的贪心选择策略',
});

export function registerMaxAvgPassRatio(): void {
  // 保持向前兼容导出
}
