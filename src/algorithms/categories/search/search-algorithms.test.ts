import { describe, it, expect } from 'vitest';
import { binarySearchSteps } from './binary-search-renderer';

describe('Search Algorithms Step Generation (搜索核心算法推导测试)', () => {
  describe('Binary Search (二分查找 LeetCode 704)', () => {
    it('1. 在 [-1, 0, 3, 5, 9, 12] 中查找 target=9 成功返回下标 4', () => {
      const steps = binarySearchSteps([-1, 0, 3, 5, 9, 12], 9);
      expect(steps.length).toBeGreaterThan(0);
      const lastStep = steps[steps.length - 1];
      expect(lastStep.phase).toBe('found');
      expect(lastStep.foundIndex).toBe(4);
    });

    it('2. 在 [-1, 0, 3, 5, 9, 12] 中查找 target=2 未找到返回 not-found', () => {
      const steps = binarySearchSteps([-1, 0, 3, 5, 9, 12], 2);
      const lastStep = steps[steps.length - 1];
      expect(lastStep.phase).toBe('not-found');
      expect(lastStep.foundIndex).toBe(-1);
    });

    it('3. 空数组查找安全返回 not-found', () => {
      const steps = binarySearchSteps([], 1);
      const lastStep = steps[steps.length - 1];
      expect(lastStep.phase).toBe('not-found');
    });
  });
});
