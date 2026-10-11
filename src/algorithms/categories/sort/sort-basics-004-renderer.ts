/**
 * Class 004: 选择、冒泡、插入三大简单排序对比 (Basic Sorting)
 */

import { registerDeclarativeAlgorithm } from '../../../core/declarative-algorithm-visualizer';
import {
  Sort004Step,
  SORT_004_CODES,
  buildSort004Steps,
} from './sort-basics-004-step-compiler';
import { renderSortBasics004Canvas } from './sort-basics-004-canvas-adapter';

export type { Sort004Step };
export { SORT_004_CODES, buildSort004Steps, renderSortBasics004Canvas };

export const sortBasics004Visualizer = registerDeclarativeAlgorithm<Sort004Step>({
  id: 'sort-basics-004',
  name: '三大简单排序与复杂度对比 (Class 004)',
  category: 'sort',
  icon: '📶',
  difficulty: 1,
  levelOrder: 4,
  aliases: ['class001-code01', 'class003-code01', 'class004-code01', 'sort-basics-004', 'selection-sort-004', 'bubble-sort-004', 'insertion-sort-004'],
  learningGoal: '掌握选择排序、冒泡排序、插入排序的核心指针演化与大 O 复杂度最坏/最好情形分析',
  problemHtml: `
    <div style="font-family: inherit; line-height: 1.6; color: #1e293b;">
      <h3 style="font-size: 16px; font-weight: 700; color: #0f172a; margin-bottom: 8px;">题目与原理概述</h3>
      <p>选择排序、冒泡排序、插入排序是计算机科学中最经典的入门级基于比较的排序算法，时间复杂度均为 <code>O(N²)</code>，额外空间复杂度 <code>O(1)</code>。</p>
      <ul>
        <li><strong>选择排序：</strong>每轮寻找未排序区最小值，与未排序区首位交换。不稳定。</li>
        <li><strong>冒泡排序：</strong>相邻两两比对，大者向后冒泡，每轮固化最右最大值。稳定。</li>
        <li><strong>插入排序：</strong>类似摸扑克牌，新元素在有序区内自右向左滑动插入。稳定且对常数级别有序序列最优 (最好 O(N))。</li>
      </ul>
    </div>
  `,
  inputs: [
    {
      id: 'nums',
      label: '输入序列 (逗号分隔正整数)',
      type: 'text',
      defaultValue: '7, 3, 9, 1, 5, 2',
      placeholder: '例如: 7, 3, 9, 1, 5, 2',
    },
    {
      id: 'algorithm',
      label: '排序算法',
      type: 'select',
      defaultValue: 'selection',
      options: [
        { label: '选择排序 (Selection Sort)', value: 'selection' },
        { label: '冒泡排序 (Bubble Sort)', value: 'bubble' },
        { label: '插入排序 (Insertion Sort)', value: 'insertion' },
      ],
    },
  ],
  codeLanguages: SORT_004_CODES,
  generateSteps: (inputs) => {
    const raw = String(inputs.nums || '7, 3, 9, 1, 5, 2');
    const nums = raw.split(',').map((s) => parseInt(s.trim(), 10)).filter((n) => !isNaN(n));
    const algo = (inputs.algorithm || 'selection') as 'selection' | 'bubble' | 'insertion';
    return buildSort004Steps(nums.length > 0 ? nums : [7, 3, 9, 1, 5, 2], algo);
  },
  renderCanvas: (container, step) => {
    renderSortBasics004Canvas(container, step);
  },
});
