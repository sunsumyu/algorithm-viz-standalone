/**
 * Hard 18: 合并 K 个升序链表 (Merge k Sorted Lists)
 * LeetCode 23 (Hard) / 大厂压轴高频高精度数据结构题
 * 核心原语：小根堆 (Min-Heap / PriorityQueue) 维护 K 条链表头部最小值，O(N log K) 极致合并
 * 架构规范：轻量领域适配器 (Thin Domain Adapter, LOC < 70) 委托核心深模块
 */

import { registerDeclarativeAlgorithm } from '../../../../core/declarative-algorithm-visualizer';
import {
  type HeapNode,
  type MergeKListsStep,
  MERGE_K_LISTS_CODES,
  generateMergeKListsSteps,
} from '../../../../core/renderers/adapters/merge-k-lists-step-compiler';
import { renderMergeKListsCanvas } from '../../../../core/renderers/adapters/merge-k-lists-canvas-adapter';

export type { HeapNode, MergeKListsStep };
export { MERGE_K_LISTS_CODES, generateMergeKListsSteps, renderMergeKListsCanvas };

export const mergeKSortedListsVisualizer = registerDeclarativeAlgorithm<MergeKListsStep>({
  id: 'merge-k-sorted-lists',
  name: 'Hard 18: 合并 K 个升序链表 (Merge k Sorted Lists)',
  category: 'heap',
  icon: '🔗',
  difficulty: 3,
  levelOrder: 18,
  aliases: ['class015-code01', 'merge-k-sorted-lists', 'leetcode-23', 'merge-k-lists'],
  learningGoal: '掌握小根堆多路归并算法模型，理解 O(N log K) 复杂度证明与多路数据流并发合并思想',
  metrics: [
    { id: 'heapTop', label: '小根堆堆顶 (Heap Top)', color: 'emerald' },
    { id: 'mergedCount', label: '已合并节点 (Merged)', color: 'blue' },
    { id: 'poppedNode', label: '出堆采纳节点 (Popped)', color: 'amber' },
    { id: 'heapSize', label: '堆当前容量 (Heap Size)', color: 'purple' },
  ],
  problemHtml: `
    <div style="line-height: 1.6;">
      <h3>题目描述 (LeetCode 23 - Hard)</h3>
      <p>给你一个链表数组，每个链表都已经按升序排列。请你将所有链表合并到一个升序链表中，返回合并后的链表。</p>
      <ul>
        <li><strong>最优解法</strong>：构建大小为 $K$ 的优先队列（小根堆），堆顶永远是当前所有未合并节点中的全局最小值。</li>
        <li><strong>复杂度</strong>：时间复杂度严格 $O(N \log K)$，空间复杂度 $O(K)$。</li>
      </ul>
    </div>
  `,
  codeLanguages: MERGE_K_LISTS_CODES,
  inputs: [
    {
      id: 'scenario',
      label: '预设链表组合',
      type: 'select',
      defaultValue: 'standard',
      options: [
        { label: '标准三链表: [1,4,5], [1,3,4], [2,6]', value: 'standard' },
        { label: '四路密集链表: [2,8], [1,9,11], [3,5,7], [4,6]', value: 'four_lists' },
      ],
    },
  ],
  generateSteps: (input) => {
    const sc = input.scenario || 'standard';
    let lists: number[][];
    if (sc === 'four_lists') {
      lists = [[2, 8], [1, 9, 11], [3, 5, 7], [4, 6]];
    } else {
      lists = [[1, 4, 5], [1, 3, 4], [2, 6]];
    }
    return generateMergeKListsSteps(lists);
  },
  renderCanvas: (container, step) => {
    renderMergeKListsCanvas(container, step);
  },
});
