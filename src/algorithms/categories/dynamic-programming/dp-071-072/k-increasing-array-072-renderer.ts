/**
 * 左程云 Class 072 Code02: 使数组 K 递增的最少操作次数 (Minimum Operations to Make the Array K-Increasing · LeetCode 2111)
 * 架构规范：轻量领域适配器 (Thin Domain Adapter, LOC < 90)
 */

import { registerDeclarativeAlgorithm } from '../../../../core/declarative-algorithm-visualizer';
import {
  K_INCREASING_ARRAY_072_CODES,
  K_INCREASING_ARRAY_072_HTML,
} from './dp-071-072-problem-content';
import {
  KIncreasingStep,
  K_INCREASING_PRESETS,
  buildKIncreasingArray072Steps,
} from '../../../../core/renderers/adapters/k-increasing-array-step-compiler';
import { renderKIncreasingCanvas } from '../../../../core/renderers/adapters/k-increasing-array-canvas-adapter';

export type { KIncreasingStep };
export { buildKIncreasingArray072Steps, renderKIncreasingCanvas };

export const kIncreasingArray072Visualizer = registerDeclarativeAlgorithm<KIncreasingStep>({
  id: 'k-increasing-array',
  aliases: ['class072-code02', 'k-increasing-array-2111', 'leetcode-2111'],
  name: '使数组 K 递增的最少操作次数 (K-Increasing Array)',
  category: 'dynamic-programming',
  icon: '🪜',
  difficulty: 3,
  levelOrder: 2111,
  learningGoal: '掌握模 k 分组解耦思想，以及在非严格递增约束下使用 upper_bound 维护 ends 数组的贪心二分技巧',
  metrics: [
    { id: 'totalOps', label: '总最少操作次数', color: 'rose' },
    { id: 'currentGroup', label: '当前组号', color: 'blue' },
  ],
  problemHtml: K_INCREASING_ARRAY_072_HTML,
  codeLanguages: K_INCREASING_ARRAY_072_CODES,
  presets: [
    { label: '步长 k=2: [4, 1, 5, 2, 6, 2]', values: { arr: '4, 1, 5, 2, 6, 2', k: 2 } },
    { label: '全逆序 k=1: [5, 4, 3, 2, 1]', values: { arr: '5, 4, 3, 2, 1', k: 1 } },
    { label: '步长 k=3: [4, 1, 5, 2, 6, 2]', values: { arr: '4, 1, 5, 2, 6, 2', k: 3 } },
    { label: '已有非递减: [2, 2, 2, 2, 3, 3]', values: { arr: '2, 2, 2, 2, 3, 3', k: 1 } },
  ],
  inputs: [
    {
      id: 'arr',
      label: '整数数组 (逗号分隔)',
      type: 'text',
      defaultValue: '4, 1, 5, 2, 6, 2',
    },
    {
      id: 'k',
      label: '递增步长 k',
      type: 'number',
      defaultValue: 2,
    },
  ],
  generateSteps: (input) => {
    const rawArr = String(input.arr || '4, 1, 5, 2, 6, 2');
    const parsedArr = rawArr
      .split(',')
      .map(s => Number(s.trim()))
      .filter(n => !isNaN(n));
    const k = Number(input.k) || 2;
    return buildKIncreasingArray072Steps(
      parsedArr.length > 0 ? parsedArr : K_INCREASING_PRESETS.k2.arr,
      k > 0 ? k : K_INCREASING_PRESETS.k2.k
    );
  },
  renderCanvas: (container, step) => {
    renderKIncreasingCanvas(container, step);
  },
});
