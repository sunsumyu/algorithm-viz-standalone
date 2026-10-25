/**
 * Class 028: 基数排序深入与按位分桶 (Radix Sort)
 * 左程云算法通关课入门篇 Class 028
 * 非比较型线性排序：个十百位进位计数前缀表划分，实现真正的 O(N * d) 线性时间排序
 */

import { registerDeclarativeAlgorithm } from '../../../core/declarative-algorithm-visualizer';
import {
  RadixSortStep,
  RADIX_SORT_028_CODES,
  generateRadixSortSteps,
} from './radix-sort-028-step-compiler';
import { renderRadixSortCanvas } from './radix-sort-028-canvas-adapter';

export type { RadixSortStep };
export {
  RADIX_SORT_028_CODES,
  generateRadixSortSteps,
  renderRadixSortCanvas,
};

export const radixSort028Visualizer = registerDeclarativeAlgorithm<RadixSortStep>({
  id: 'radix-sort-028',
  name: 'Class 028: 基数排序深入与按位分桶 (Radix Sort)',
  category: 'sort',
  icon: '🧮',
  difficulty: 2,
  levelOrder: 28,
  aliases: ['class028-code01', 'radix-sort-028', 'radix-sort'],
  hasDeductionTree: true,
  learningGoal: '透彻理解非基于比较的基数排序算法，掌握前缀累加和表划分与从右向左保持稳定性的数学设计',
  problemHtml: `
    <div style="line-height: 1.6;">
      <h3>课程核心内容 (Class 028)</h3>
      <p>基数排序 (Radix Sort) 是一种经典的不基于大小比较的线性时间排序算法：</p>
      <ul>
        <li><strong>排序原理</strong>：由低位（个位）向高位（百位、千位...），依次进行稳定的“出桶入桶”。</li>
        <li><strong>空间优化（无真实桶方案）</strong>：用大小为 10 的 <code>count</code> 数组完成前缀和统计，避免创建 10 个真实链表队列。</li>
        <li><strong>稳定性至关重要</strong>：从右向左将元素放入 <code>help</code> 数组，保证低位排好的先后顺序在高位相同时不被破坏。</li>
      </ul>
    </div>
  `,
  codeLanguages: RADIX_SORT_028_CODES,
  inputs: [
    {
      id: 'nums',
      label: '待排序正整数数组 (以逗号分隔)',
      type: 'text',
      defaultValue: '17, 13, 25, 100, 72, 36, 54',
    },
  ],
  generateSteps: (input) => {
    const raw = String(input.nums || '17, 13, 25, 100, 72, 36, 54');
    const nums = raw.split(',').map(s => Number(s.trim())).filter(n => !isNaN(n) && n >= 0);
    return generateRadixSortSteps(nums.length > 0 ? nums : [17, 13, 25, 100, 72, 36, 54]);
  },
  renderCanvas: (container, step) => {
    renderRadixSortCanvas(container, step);
  },
});
