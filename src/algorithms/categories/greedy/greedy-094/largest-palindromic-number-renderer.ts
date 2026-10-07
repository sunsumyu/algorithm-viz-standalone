/**
 * 最大回文数字 (LeetCode 2384) - 声明式教学级沙盘渲染器
 * Thin Domain Adapter (< 45 LOC)
 */

import { registerAlgorithm } from '../../../../core/registry';
import { UniversalStageVisualizer } from '../../dynamic-programming/unique-paths-renderer';
import {
  LargestPalindromicStep,
  buildLargestPalindromicSteps,
} from './largest-palindromic-number-step-compiler';

export type { LargestPalindromicStep };
export { buildLargestPalindromicSteps };

const template = `<div id="algo-largest-palindromic-number-view" class="view-container active" style="width: 100%; height: 100%; padding: 0;"></div>`;

export const largestPalindromicRenderer = UniversalStageVisualizer;
export const largestPalindromicVisualizer = UniversalStageVisualizer;

registerAlgorithm({
  id: 'largest-palindromic-number',
  name: '最大回文数字 (Largest Palindromic Number)',
  viewId: 'algo-largest-palindromic-number-view',
  category: 'greedy',
  description: 'LeetCode 2384：高位贪心成对填充与前导0特判逻辑 (双向前后缀对称填装)',
  icon: '🔢',
  template,
  Visualizer: UniversalStageVisualizer,
  difficulty: 2,
  levelOrder: 942,
  aliases: ['class094-code02', 'largest-palindromic-2384', 'leetcode-2384'],
  learningGoal: '掌握高位贪心成对填充与前导0特判逻辑',
});

export function registerLargestPalindromicNumber(): void {
  // 保持向前兼容导出
}
