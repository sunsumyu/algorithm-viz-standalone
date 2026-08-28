import { describe, it, expect } from 'vitest';
import { bubbleSortSteps } from './bubble-sort-renderer';
import { quickSortSteps } from './quick-sort-renderer';

describe('Sort Algorithms Step Generation (排序核心算法推导测试)', () => {
  describe('Bubble Sort (冒泡排序)', () => {
    it('1. 输入 [5, 3, 8, 4, 2] 排序得到 [2, 3, 4, 5, 8]', () => {
      const steps = bubbleSortSteps([5, 3, 8, 4, 2]);
      expect(steps.length).toBeGreaterThan(0);
      const lastStep = steps[steps.length - 1];
      expect(lastStep.phase).toBe('done');
      expect(lastStep.array).toEqual([2, 3, 4, 5, 8]);
    });

    it('2. 空数组安全返回', () => {
      const steps = bubbleSortSteps([]);
      const lastStep = steps[steps.length - 1];
      expect(lastStep.phase).toBe('done');
      expect(lastStep.array).toEqual([]);
    });
  });

  describe('Quick Sort (快速排序)', () => {
    it('3. 输入 [38, 27, 43, 3, 9, 82, 10] 排序得到 [3, 9, 10, 27, 38, 43, 82]', () => {
      const steps = quickSortSteps([38, 27, 43, 3, 9, 82, 10]);
      expect(steps.length).toBeGreaterThan(0);
      const lastStep = steps[steps.length - 1];
      expect(lastStep.phase).toBe('done');
      expect(lastStep.array).toEqual([3, 9, 10, 27, 38, 43, 82]);
    });

    it('4. 包含重复元素 [4, 2, 2, 8, 3, 3, 1] 稳定完成排序', () => {
      const steps = quickSortSteps([4, 2, 2, 8, 3, 3, 1]);
      const lastStep = steps[steps.length - 1];
      expect(lastStep.array).toEqual([1, 2, 2, 3, 3, 4, 8]);
    });
  });
});
