/**
 * Class 042: 对顶堆与数据流中位数 (Find Median from Data Stream)
 * 双堆对顶平衡 + O(1) 瞬时查询中位数 / LeetCode 295
 */

import { registerDeclarativeAlgorithm } from '../../../../core/declarative-algorithm-visualizer';
import { HEAP_039_042_PROBLEMS } from './heap-039-042-problem-content';
import { HEAP_MEDIAN_STREAM_042_CODES, HEAP_MEDIAN_STREAM_042_LINES } from './heap-039-042-stage-codes';
import { Heap039Step, renderMedianStreamBoard } from './heap-039-042-shared';
import { renderFormulaCard } from '../../string/string-100-105/string-100-105-shared';

export interface MedianStream042Step extends Heap039Step {
  maxHeap: number[];
  minHeap: number[];
  median: number;
  lastAdded: number | null;
}

export function buildMedianStream042Steps(): MedianStream042Step[] {
  const steps: MedianStream042Step[] = [];
  const lines = HEAP_MEDIAN_STREAM_042_LINES;

  // Step 0: 入口帧
  steps.push({
    maxHeap: [],
    minHeap: [],
    median: 0,
    lastAdded: null,
    decision: `主函数入口：初始化对顶堆数据流中位数查找器`,
    message: `维护大根堆 (存较小半区) 与小根堆 (存较大半区)，保证两堆大小相差 <= 1`,
    log: `enter MedianFinder: initialized maxHeap and minHeap`,
    codeLine: lines.entryAdd,
    metrics: { '结构': '双堆对顶', '查询耗时': 'O(1)' },
  });

  // Step 1: 插入 5
  steps.push({
    maxHeap: [5],
    minHeap: [],
    median: 5,
    lastAdded: 5,
    decision: `流入元素 5：大根堆为空，直接放入大根堆 maxHeap`,
    message: `总元素为 1 (奇数)，中位数即为大根堆堆顶 = 5`,
    log: `addNum(5): maxHeap=[5], median=5`,
    codeLine: lines.insertHeap,
    statusBadge: { text: '加入 5', type: 'info' },
    metrics: { '中位数': 5, '元素总数': 1 },
  });

  // Step 2: 插入 2
  steps.push({
    maxHeap: [2],
    minHeap: [5],
    median: 3.5,
    lastAdded: 2,
    decision: `流入元素 2 <= maxHeap.peek(5)：放入大根堆后大根堆 size=2 触发再平衡，将 5 弹出压入小根堆`,
    message: `大根堆 [2]，小根堆 [5]，两堆各 1 个元素；中位数 = (2 + 5) / 2 = 3.5`,
    log: `addNum(2): balanced, median=3.5`,
    codeLine: lines.balanceHeap,
    statusBadge: { text: '加入 2 并平衡', type: 'warning' },
    metrics: { '中位数': 3.5, '两堆顶': '2 & 5' },
  });

  // Step 3: 插入 8
  steps.push({
    maxHeap: [5, 2],
    minHeap: [8],
    median: 5,
    lastAdded: 8,
    decision: `流入元素 8 > maxHeap.peek(2)：放入小根堆，小根堆 size=2 > 大根堆，弹出 5 压入大根堆保持大根堆偏大`,
    message: `大根堆 [5, 2]，小根堆 [8]；奇数总数中位数直接取大根堆堆顶 = 5`,
    log: `addNum(8): balanced, median=5`,
    codeLine: lines.balanceHeap,
    statusBadge: { text: '加入 8 并平衡', type: 'info' },
    metrics: { '中位数': 5, '元素总数': 3 },
  });

  // Step 4: 插入 3
  steps.push({
    maxHeap: [3, 2],
    minHeap: [5, 8],
    median: 4,
    lastAdded: 3,
    decision: `流入元素 3 <= maxHeap.peek(5)：放入大根堆，触发两堆平衡：大根堆 [3, 2]，小根堆 [5, 8]`,
    message: `总数 4 (偶数)，中位数 = (maxHeap.peek(3) + minHeap.peek(5)) / 2 = 4.0！`,
    log: `addNum(3): balanced, median=4.0`,
    codeLine: lines.returnEven,
    statusBadge: { text: '求得中位数 4.0', type: 'success' },
    metrics: { '中位数': 4.0, '元素总数': 4 },
  });

  return steps;
}

export const heapMedianStream042Visualizer = registerDeclarativeAlgorithm<MedianStream042Step>({
  id: 'heap-median-stream-042',
  name: '对顶堆与数据流中位数 (Class 042)',
  category: 'tree',
  difficulty: 'hard',
  problemContent: HEAP_039_042_PROBLEMS.heapMedianStream042,
  sourceCodes: HEAP_MEDIAN_STREAM_042_CODES,
  generateSteps: buildMedianStream042Steps,
  renderCanvas: (container, step) => {
    container.innerHTML = `
      <div style="padding: 16px; font-family: system-ui, -apple-system, sans-serif;">
        ${renderMedianStreamBoard(
          step.maxHeap,
          step.minHeap,
          step.median,
          step.lastAdded
        )}
        ${renderFormulaCard(
          '双堆对顶平衡中位数定理',
          '\\text{Median} = \\begin{cases} \\text{maxHeap.peek()} & \\text{if } \\text{size} \\% 2 == 1 \\\\ \\dfrac{\\text{maxHeap.peek()} + \\text{minHeap.peek()}}{2.0} & \\text{if } \\text{size} \\% 2 == 0 \\end{cases}',
          '通过在 $O(\\log N)$ 内维护大根堆与小根堆的顶端对顶不变量，使得数据流在任意时刻查询中位数的耗时为严格的 $O(1)$。'
        )}
      </div>
    `;
  },
});
