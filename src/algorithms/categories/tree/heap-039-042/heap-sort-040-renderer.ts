/**
 * Class 040: 堆结构与堆排序 (Heap Structure & Heap Sort)
 * 完全二叉树大根堆 + O(1) 空间原地堆排序 / 洛谷 P1177
 */

import { registerDeclarativeAlgorithm } from '../../../../core/declarative-algorithm-visualizer';
import { HEAP_039_042_PROBLEMS } from './heap-039-042-problem-content';
import { HEAP_SORT_040_CODES, HEAP_SORT_040_LINES } from './heap-039-042-stage-codes';
import { Heap039Step, renderHeapSortBoard } from './heap-039-042-shared';
import { renderFormulaCard } from '../../string/string-100-105/string-100-105-shared';

export interface HeapSort040Step extends Heap039Step {
  heapArray: number[];
  sortedArray: number[];
  heapSize: number;
  highlightIndex: number | null;
  stage: string;
}

export function buildHeapSort040Steps(): HeapSort040Step[] {
  const steps: HeapSort040Step[] = [];
  const lines = HEAP_SORT_040_LINES;

  const rawArray = [4, 10, 3, 5, 1];

  // Step 0: 入口帧
  steps.push({
    heapArray: rawArray,
    sortedArray: [],
    heapSize: 5,
    highlightIndex: null,
    stage: '原始无序数组载入',
    decision: `主函数入口：开始对数组 [4, 10, 3, 5, 1] 执行原地堆排序`,
    message: `首先自底向上调用 heapify，在 O(N) 线性时间内构建大根堆`,
    log: `enter heapSort: arr=[4, 10, 3, 5, 1]`,
    codeLine: lines.entry,
    metrics: { '数组长度': 5, '建堆目标': '大根堆' },
  });

  // Step 1: 建大根堆完成
  const maxHeap = [10, 5, 3, 4, 1];
  steps.push({
    heapArray: maxHeap,
    sortedArray: [],
    heapSize: 5,
    highlightIndex: 0,
    stage: '大根堆建堆完毕',
    decision: `建堆完成：堆顶为全局最大值 10，每个父节点均大于其左右子节点`,
    message: `准备将堆顶最大值 10 与末尾元素 1 交换，并锁定在数组最后一位`,
    log: `max-heap built: root = 10`,
    codeLine: lines.buildHeap,
    statusBadge: { text: '大根堆就绪', type: 'info' },
    metrics: { '堆顶最大值': 10, 'heapSize': 5 },
  });

  // Step 2: 交换堆顶与末尾，沉淀 10
  steps.push({
    heapArray: [1, 5, 3, 4, 10],
    sortedArray: [10],
    heapSize: 4,
    highlightIndex: 0,
    stage: '沉淀最大值 10 并缩减堆规模',
    decision: `swap(arr, 0, 4)：最大值 10 沉淀至最末位，堆规模缩减为 heapSize = 4`,
    message: `此时堆顶为 1，违背大根堆性质，准备从 0 号位置向下执行 heapify`,
    log: `swapped root 10 to end, heapSize reduced to 4`,
    codeLine: lines.swapMax,
    statusBadge: { text: '沉淀最大值 10', type: 'warning' },
    metrics: { '已排序': '[10]', '剩余待排': 4 },
  });

  // Step 3: 下沉 heapify 调整新堆顶
  const heapAfter1 = [5, 4, 3, 1, 10];
  steps.push({
    heapArray: heapAfter1,
    sortedArray: [10],
    heapSize: 4,
    highlightIndex: 0,
    stage: '下沉 heapify 恢复大根堆',
    decision: `heapify(0, 4)：节点 1 与较大孩子 5 交换，堆顶恢复为次大值 5`,
    message: `大根堆性质再次满足，准备沉淀次大值 5`,
    log: `heapify finished: root is now 5`,
    codeLine: lines.heapifyRoot,
    statusBadge: { text: '堆顶恢复为 5', type: 'info' },
    metrics: { '当前堆顶': 5, '剩余堆规模': 4 },
  });

  // Step 4: 循环迭代完成全局排序
  steps.push({
    heapArray: [1, 3, 4, 5, 10],
    sortedArray: [1, 3, 4, 5, 10],
    heapSize: 0,
    highlightIndex: null,
    stage: '全局排序完成',
    decision: `不断重复 swap 与 heapify，堆规模减至 0，全数组升序排列完毕：[1, 3, 4, 5, 10]`,
    message: `堆排序圆满结束，实现严格 O(N log N) 时间与 O(1) 额外空间！`,
    log: `heapSort finished: [1, 3, 4, 5, 10]`,
    codeLine: lines.repeatSwap,
    statusBadge: { text: '堆排序大功告成', type: 'success' },
    metrics: { '最终结果': '[1, 3, 4, 5, 10]', '空间占用': 'O(1)' },
  });

  return steps;
}

export const heapSort040Visualizer = registerDeclarativeAlgorithm<HeapSort040Step>({
  id: 'heap-sort-040',
  name: '堆结构与堆排序 (Class 040)',
  category: 'tree',
  difficulty: 'medium',
  problemContent: HEAP_039_042_PROBLEMS.heapSort040,
  sourceCodes: HEAP_SORT_040_CODES,
  generateSteps: buildHeapSort040Steps,
  renderCanvas: (container, step) => {
    container.innerHTML = `
      <div style="padding: 16px; font-family: system-ui, -apple-system, sans-serif;">
        ${renderHeapSortBoard(
          step.heapArray,
          step.sortedArray,
          step.heapSize,
          step.highlightIndex,
          step.stage
        )}
        ${renderFormulaCard(
          '堆排序时空复杂度定理',
          'T(N) = O(N \\log N), \\quad S(N) = O(1)',
          '自底向上建堆仅需 $O(N)$；随后 $N$ 次堆顶交换与下沉调整，每次耗时 $O(\\log N)$，空间完全在原数组上原地进行。'
        )}
      </div>
    `;
  },
});
