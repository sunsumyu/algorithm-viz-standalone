/**
 * 使数组相似的最少操作次数 (LeetCode 2449) - 声明式教学级沙盘渲染器 (Thin Domain Adapter)
 * 核心贪心：奇偶分离独立排序 + 顺位对齐累加正差值之和 / 2
 */

import { UniversalStageVisualizer } from '../../dynamic-programming/unique-paths-renderer';
import { registerAlgorithm } from '../../../../core/registry';
import {
  PairMatch,
  MinOperationsSimilarStep,
  buildMinOperationsSimilarSteps,
  parseMinOperationsSimilarInputs,
} from './min-operations-similar-step-compiler';
import { renderMinOperationsSimilarCanvas } from './min-operations-similar-canvas-adapter';

export type { PairMatch, MinOperationsSimilarStep };
export {
  buildMinOperationsSimilarSteps,
  parseMinOperationsSimilarInputs,
  renderMinOperationsSimilarCanvas,
};

const template = `<div id="algo-min-operations-similar-view" class="view-container active" style="width: 100%; height: 100%; padding: 0;"></div>`;

export const minOperationsSimilarRenderer = UniversalStageVisualizer;
export const minOperationsSimilarVisualizer = UniversalStageVisualizer;

registerAlgorithm({
  id: 'minimum-operations-to-make-similar',
  name: '使数组相似的最少操作次数',
  viewId: 'algo-min-operations-similar-view',
  category: 'greedy',
  description: 'LeetCode 2449：奇偶分类独立排序与排序不等式顺位对齐的正差值累加贪心法',
  icon: '🔄',
  template,
  Visualizer: UniversalStageVisualizer,
  difficulty: 3,
  levelOrder: 923,
  learningGoal: '掌握奇偶分类独立排序与排序不等式顺位对齐的正差值累加贪心法',
  aliases: [
    'class092-code03',
    'min-operations-similar-2449',
    'leetcode-2449',
    'make-array-similar',
    'min-operations-similar',
  ],
});

export function registerMinOperationsSimilar(): void {
  // 保持向前兼容导出
}
