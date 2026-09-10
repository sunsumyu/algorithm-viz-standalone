/**
 * 左神算法通关课 Class 039 ~ 042 比较器、堆结构与加强堆专题 自动化测试套件
 */

import { describe, it, expect } from 'vitest';
import { buildComparator039Steps } from './comparator-priority-queue-039-renderer';
import { buildHeapSort040Steps } from './heap-sort-040-renderer';
import { buildHeapGreater041Steps } from './heap-greater-041-renderer';
import { buildMedianStream042Steps } from './heap-median-stream-042-renderer';
import {
  COMPARATOR_PRIORITY_QUEUE_039_CODES,
  HEAP_SORT_040_CODES,
  HEAP_GREATER_041_CODES,
  HEAP_MEDIAN_STREAM_042_CODES,
} from './heap-039-042-stage-codes';

function verify1BasedCodeLines(steps: any[], codes: Record<string, string[]>) {
  expect(steps.length).toBeGreaterThan(0);
  for (const step of steps) {
    if (step.codeLine) {
      for (const lang of ['java', 'cpp', 'python', 'javascript']) {
        const line = step.codeLine[lang];
        expect(line, `Missing line mapping for ${lang}`).toBeDefined();
        expect(line, `Line must be >= 1 for ${lang}`).toBeGreaterThanOrEqual(1);
        expect(
          line,
          `Line ${line} exceeds code length ${codes[lang].length} for ${lang}`
        ).toBeLessThanOrEqual(codes[lang].length);
      }
    }
  }
}

describe('左神比较器、堆结构与加强堆专题 (Class 039 ~ 042) 综合测试套件', () => {
  // 1. Class 039: 比较器与优先级队列
  describe('Class 039: 比较器与优先级队列 (Comparator & PriorityQueue)', () => {
    it('比较器按优先级降序与ID升序正确排列任务', () => {
      const steps = buildComparator039Steps();
      const last = steps[steps.length - 1];
      expect(last.tasks[0].id).toBe(102);
      expect(last.tasks[1].id).toBe(103);
      expect(last.tasks[2].id).toBe(101);
      verify1BasedCodeLines(steps, COMPARATOR_PRIORITY_QUEUE_039_CODES);
    });
  });

  // 2. Class 040: 堆结构与堆排序
  describe('Class 040: 堆结构与堆排序 (Heap Sort)', () => {
    it('堆排序建立大根堆并就地沉淀为完整升序序列', () => {
      const steps = buildHeapSort040Steps();
      const last = steps[steps.length - 1];
      expect(last.sortedArray).toEqual([1, 3, 4, 5, 10]);
      expect(last.heapSize).toBe(0);
      verify1BasedCodeLines(steps, HEAP_SORT_040_CODES);
    });
  });

  // 3. Class 041: 手动实现加强堆
  describe('Class 041: 手动实现加强堆 (Heap Greater)', () => {
    it('反向索引表支持 O(log N) 动态 resign 与 remove', () => {
      const steps = buildHeapGreater041Steps();
      const last = steps[steps.length - 1];
      expect(last.heapArray.length).toBe(2);
      expect(last.indexMap['User_C']).toBe(0);
      expect(last.indexMap['User_B']).toBeUndefined();
      verify1BasedCodeLines(steps, HEAP_GREATER_041_CODES);
    });
  });

  // 4. Class 042: 对顶堆与数据流中位数
  describe('Class 042: 对顶堆与数据流中位数 (Median Stream)', () => {
    it('双堆对顶动态平衡，奇偶数量下均正确求得中位数', () => {
      const steps = buildMedianStream042Steps();
      const last = steps[steps.length - 1];
      expect(last.median).toBe(4);
      expect(last.maxHeap.length).toBe(2);
      expect(last.minHeap.length).toBe(2);
      verify1BasedCodeLines(steps, HEAP_MEDIAN_STREAM_042_CODES);
    });
  });
});
