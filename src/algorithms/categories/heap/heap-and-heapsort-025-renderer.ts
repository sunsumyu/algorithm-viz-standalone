/**
 * Class 025: 大根堆、小根堆与堆排序 (Heap & HeapSort)
 * 左程云算法通关课入门篇 Class 025
 * 深入解析完全二叉树的数组映射、heapInsert (上浮)、heapify (下沉) 与原地堆排序
 */

import { registerDeclarativeAlgorithm } from '../../../core/declarative-algorithm-visualizer';
import {
  type HeapSortStep,
  HEAP_AND_HEAPSORT_025_CODES,
  generateHeapSortSteps,
} from './heap-and-heapsort-025-step-compiler';
import { renderHeapSortCanvas } from './heap-and-heapsort-025-canvas-adapter';

export {
  type HeapSortStep,
  HEAP_AND_HEAPSORT_025_CODES,
  generateHeapSortSteps,
  renderHeapSortCanvas,
};

export const heapAndHeapsort025Visualizer = registerDeclarativeAlgorithm<HeapSortStep>({
  id: 'heap-and-heapsort-025',
  name: 'Class 025: 大根堆与原地堆排序 (HeapSort)',
  category: 'heap',
  icon: '⛰️',
  difficulty: 2,
  levelOrder: 25,
  aliases: ['class025-code01', 'heap-and-heapsort-025', 'heap-sort-inplace'],
  learningGoal: '透彻理解完全二叉树的连续数组映射、大根堆性质、heapify 下沉操作与 O(1) 额外空间的原地堆排序算法',
  problemHtml: `
    <div style="line-height: 1.6;">
      <h3>课程核心内容 (Class 025)</h3>
      <p>堆 (Heap) 是一种基于<strong>完全二叉树</strong>的高效数据结构，在连续内存（数组）中具有极致的缓存局部性：</p>
      <ul>
        <li><strong>完全二叉树数组化</strong>：下标 <code>i</code> 的左孩子为 <code>2*i + 1</code>，右孩子为 <code>2*i + 2</code>，父节点为 <code>(i - 1) / 2</code>。</li>
        <li><strong>heapify (下沉)</strong>：左右子节点挑最大者与自身对比，不满足大根堆性质则交换并继续下沉。</li>
        <li><strong>原地堆排序</strong>：先用 $O(N)$ 自底向上建堆，随后每次把堆顶最大值放到末尾并减小 <code>heapSize</code>，全程无需额外辅助数组。</li>
      </ul>
    </div>
  `,
  codeLanguages: HEAP_AND_HEAPSORT_025_CODES,
  inputs: [
    {
      id: 'nums',
      label: '数组序列 (以逗号分隔)',
      type: 'text',
      defaultValue: '4, 10, 3, 5, 1, 8, 2',
    },
  ],
  generateSteps: (input) => {
    const raw = String(input.nums || '4, 10, 3, 5, 1, 8, 2');
    const nums = raw.split(',').map(s => Number(s.trim())).filter(n => !isNaN(n));
    return generateHeapSortSteps(nums.length > 0 ? nums : [4, 10, 3, 5, 1, 8, 2]);
  },
  renderCanvas: (container, step) => {
    renderHeapSortCanvas(container, step);
  },
});
