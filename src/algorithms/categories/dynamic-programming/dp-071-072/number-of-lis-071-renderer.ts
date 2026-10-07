/**
 * 左程云 Class 071 Code02: 最长递增子序列的个数 (Number of Longest Increasing Subsequence · LeetCode 673)
 * 架构规范：轻量领域适配器 (Thin Domain Adapter, LOC < 90)
 */

import { registerDeclarativeAlgorithm } from '../../../../core/declarative-algorithm-visualizer';
import {
  NUMBER_OF_LIS_071_CODES,
  NUMBER_OF_LIS_071_HTML,
} from './dp-071-072-problem-content';
import {
  NumberOfLisStep,
  NUMBER_OF_LIS_PRESETS,
  buildNumberOfLis071Steps,
} from '../../../../core/renderers/adapters/number-of-lis-step-compiler';
import { renderNumberOfLisCanvas } from '../../../../core/renderers/adapters/number-of-lis-canvas-adapter';

export type { NumberOfLisStep };
export { buildNumberOfLis071Steps, renderNumberOfLisCanvas };

export const numberOfLis071Visualizer = registerDeclarativeAlgorithm<NumberOfLisStep>({
  id: 'number-of-lis',
  aliases: ['class071-code02', 'number-of-lis-673', 'leetcode-673'],
  name: '最长递增子序列的个数 (Number of LIS)',
  category: 'dynamic-programming',
  icon: '🔢',
  difficulty: 2,
  levelOrder: 673,
  learningGoal: '掌握在 LIS 经典动态规划模型中同步维护方案数 count[i] 的双轨状态转移原理与分支汇聚思想',
  metrics: [
    { id: 'maxLen', label: '全局最长 LIS', color: 'emerald' },
    { id: 'totalWays', label: '总方案数', color: 'purple' },
    { id: 'currentIdx', label: '当前下标 i', color: 'blue' },
  ],
  problemHtml: NUMBER_OF_LIS_071_HTML,
  codeLanguages: NUMBER_OF_LIS_071_CODES,
  presets: [
    { label: '经典分支: [1, 3, 5, 4, 7]', values: { nums: '1, 3, 5, 4, 7' } },
    { label: '全等元素: [2, 2, 2, 2, 2]', values: { nums: '2, 2, 2, 2, 2' } },
    { label: '多路汇聚: [1, 2, 4, 3, 5, 4, 7, 2]', values: { nums: '1, 2, 4, 3, 5, 4, 7, 2' } },
    { label: '单元素: [10]', values: { nums: '10' } },
  ],
  inputs: [
    {
      id: 'nums',
      label: '整数数组 (以逗号分隔)',
      type: 'text',
      defaultValue: '1, 3, 5, 4, 7',
    },
  ],
  generateSteps: (input) => {
    const raw = String(input.nums || '1, 3, 5, 4, 7');
    const parsed = raw
      .split(',')
      .map(s => Number(s.trim()))
      .filter(n => !isNaN(n));
    return buildNumberOfLis071Steps(parsed.length > 0 ? parsed : NUMBER_OF_LIS_PRESETS.standard);
  },
  renderCanvas: (container, step) => {
    renderNumberOfLisCanvas(container, step);
  },
});
