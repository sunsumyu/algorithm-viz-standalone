import { describe, it, expect } from 'vitest';
import { buildTwoSumSteps } from './two-sum-renderer';
import { buildThreeSumSteps } from './three-sum-renderer';

describe('Hash Table Algorithms Step Generation (哈希表核心算法推导测试)', () => {
  describe('Two Sum (两数之和 LeetCode 1)', () => {
    it('1. nums=[2, 7, 11, 15], target=9 正确返回下标 [0, 1]', () => {
      const steps = buildTwoSumSteps([2, 7, 11, 15], 9);
      expect(steps.length).toBeGreaterThan(0);
      const lastStep = steps[steps.length - 1];
      expect(lastStep.status).toBe('found');
      expect(lastStep.result).toEqual([0, 1]);
    });

    it('2. nums=[3, 2, 4], target=6 正确返回下标 [1, 2]', () => {
      const steps = buildTwoSumSteps([3, 2, 4], 6);
      const lastStep = steps[steps.length - 1];
      expect(lastStep.status).toBe('found');
      expect(lastStep.result).toEqual([1, 2]);
    });
  });

  describe('Three Sum (三数之和 LeetCode 15)', () => {
    it('3. nums=[-1, 0, 1, 2, -1, -4] 正确去重并返回 2 组解 [[-1, -1, 2], [-1, 0, 1]]', () => {
      const steps = buildThreeSumSteps([-1, 0, 1, 2, -1, -4]);
      expect(steps.length).toBeGreaterThan(0);
      const lastStep = steps[steps.length - 1];
      expect(lastStep.status).toBe('done');
      expect(lastStep.results).toEqual([
        [-1, -1, 2],
        [-1, 0, 1],
      ]);
    });

    it('4. nums=[0, 1, 1] 无合法解返回空数组', () => {
      const steps = buildThreeSumSteps([0, 1, 1]);
      const lastStep = steps[steps.length - 1];
      expect(lastStep.results).toEqual([]);
    });
  });
});
