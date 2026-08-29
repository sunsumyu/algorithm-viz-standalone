import { describe, it, expect } from 'vitest';
import { bubbleSortSteps } from './bubble-sort-renderer';
import { selectionSortSteps } from './selection-sort-renderer';
import { insertionSortSteps } from './insertion-sort-renderer';
import { shellSortSteps } from './shell-sort-renderer';
import { mergeSortSteps } from './merge-sort-renderer';
import { quickSortSteps } from './quick-sort-renderer';
import { heapSortSteps } from './heap-sort-renderer';
import { countingSortSteps } from './counting-sort-renderer';
import { bucketSortSteps } from './bucket-sort-renderer';
import { radixSortSteps } from './radix-sort-renderer';

describe('Sort Category Modernized Algorithms (十大经典排序算法推导测试)', () => {
  describe('1. Bubble Sort (冒泡排序)', () => {
    it('对 [5, 2, 9, 1, 5, 6] 进行冒泡排序，最终有序', () => {
      const steps = bubbleSortSteps([5, 2, 9, 1, 5, 6]);
      expect(steps.length).toBeGreaterThan(0);
      const last = steps[steps.length - 1];
      expect(last.status).toBe('done');
      expect(last.array).toEqual([1, 2, 5, 5, 6, 9]);
    });
  });

  describe('2. Selection Sort (选择排序)', () => {
    it('对 [29, 10, 14, 37, 13] 进行选择排序，最终有序', () => {
      const steps = selectionSortSteps([29, 10, 14, 37, 13]);
      expect(steps.length).toBeGreaterThan(0);
      const last = steps[steps.length - 1];
      expect(last.status).toBe('done');
      expect(last.array).toEqual([10, 13, 14, 29, 37]);
    });
  });

  describe('3. Insertion Sort (插入排序)', () => {
    it('对 [12, 11, 13, 5, 6] 进行插入排序，最终有序', () => {
      const steps = insertionSortSteps([12, 11, 13, 5, 6]);
      expect(steps.length).toBeGreaterThan(0);
      const last = steps[steps.length - 1];
      expect(last.status).toBe('done');
      expect(last.array).toEqual([5, 6, 11, 12, 13]);
    });
  });

  describe('4. Shell Sort (希尔排序)', () => {
    it('对 [9, 8, 3, 7, 5, 6, 4, 1] 进行希尔排序，最终有序', () => {
      const steps = shellSortSteps([9, 8, 3, 7, 5, 6, 4, 1]);
      expect(steps.length).toBeGreaterThan(0);
      const last = steps[steps.length - 1];
      expect(last.status).toBe('done');
      expect(last.array).toEqual([1, 3, 4, 5, 6, 7, 8, 9]);
    });
  });

  describe('5. Merge Sort (归并排序)', () => {
    it('对 [38, 27, 43, 3, 9, 82, 10] 进行归并排序，最终有序', () => {
      const steps = mergeSortSteps([38, 27, 43, 3, 9, 82, 10]);
      expect(steps.length).toBeGreaterThan(0);
      const last = steps[steps.length - 1];
      expect(last.status).toBe('done');
      expect(last.array).toEqual([3, 9, 10, 27, 38, 43, 82]);
    });
  });

  describe('6. Quick Sort (快速排序)', () => {
    it('对 [6, 1, 2, 7, 9, 3, 4, 5, 10, 8] 进行快速排序，最终有序', () => {
      const steps = quickSortSteps([6, 1, 2, 7, 9, 3, 4, 5, 10, 8]);
      expect(steps.length).toBeGreaterThan(0);
      const last = steps[steps.length - 1];
      expect(last.status).toBe('done');
      expect(last.array).toEqual([1, 2, 3, 4, 5, 6, 7, 8, 9, 10]);
    });
  });

  describe('7. Heap Sort (堆排序)', () => {
    it('对 [4, 10, 3, 5, 1] 进行堆排序，最终有序', () => {
      const steps = heapSortSteps([4, 10, 3, 5, 1]);
      expect(steps.length).toBeGreaterThan(0);
      const last = steps[steps.length - 1];
      expect(last.status).toBe('done');
      expect(last.array).toEqual([1, 3, 4, 5, 10]);
    });
  });

  describe('8. Counting Sort (计数排序)', () => {
    it('对 [4, 2, 2, 8, 3, 3, 1] 进行计数排序，最终有序', () => {
      const steps = countingSortSteps([4, 2, 2, 8, 3, 3, 1]);
      expect(steps.length).toBeGreaterThan(0);
      const last = steps[steps.length - 1];
      expect(last.status).toBe('done');
      expect(last.output).toEqual([1, 2, 2, 3, 3, 4, 8]);
    });
  });

  describe('9. Bucket Sort (桶排序)', () => {
    it('对 [29, 25, 3, 49, 9, 37, 21, 43] 进行桶排序，最终有序', () => {
      const steps = bucketSortSteps([29, 25, 3, 49, 9, 37, 21, 43], 5);
      expect(steps.length).toBeGreaterThan(0);
      const last = steps[steps.length - 1];
      expect(last.status).toBe('done');
      expect(last.array).toEqual([3, 9, 21, 25, 29, 37, 43, 49]);
    });
  });

  describe('10. Radix Sort (基数排序)', () => {
    it('对 [170, 45, 75, 90, 802, 24, 2, 66] 进行基数排序，最终有序', () => {
      const steps = radixSortSteps([170, 45, 75, 90, 802, 24, 2, 66]);
      expect(steps.length).toBeGreaterThan(0);
      const last = steps[steps.length - 1];
      expect(last.status).toBe('done');
      expect(last.array).toEqual([2, 24, 45, 66, 75, 90, 170, 802]);
    });
  });
});
