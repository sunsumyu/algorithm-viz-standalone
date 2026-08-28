import { describe, it, expect } from 'vitest';
import { buildRemoveElementSteps } from './remove-element-renderer';
import { buildSortedSquaresSteps } from './squares-of-sorted-array-renderer';
import { buildMinSubarrayLenSteps } from './min-subarray-len-renderer';
import { buildSpiralSteps } from './spiral-matrix-ii-renderer';

describe('Array Algorithms Step Generation (数组核心算法推导测试)', () => {
  describe('Remove Element (移除元素)', () => {
    it('1. 数组 [3, 2, 2, 3], val=3 移除后新长度 slow=2', () => {
      const steps = buildRemoveElementSteps([3, 2, 2, 3], 3);
      expect(steps.length).toBeGreaterThan(0);
      const lastStep = steps[steps.length - 1];
      expect(lastStep.status).toBe('done');
      expect(lastStep.slow).toBe(2);
      expect(lastStep.array.slice(0, 2)).toEqual([2, 2]);
    });

    it('2. 数组 [0, 1, 2, 2, 3, 0, 4, 2], val=2 移除后新长度 slow=5', () => {
      const steps = buildRemoveElementSteps([0, 1, 2, 2, 3, 0, 4, 2], 2);
      const lastStep = steps[steps.length - 1];
      expect(lastStep.slow).toBe(5);
      expect(lastStep.array.slice(0, 5)).toEqual([0, 1, 3, 0, 4]);
    });
  });

  describe('Squares of a Sorted Array (有序数组的平方)', () => {
    it('3. 输入 [-4, -1, 0, 3, 10] 正确生成 [0, 1, 9, 16, 100]', () => {
      const steps = buildSortedSquaresSteps([-4, -1, 0, 3, 10]);
      expect(steps.length).toBeGreaterThan(0);
      const lastStep = steps[steps.length - 1];
      expect(lastStep.status).toBe('done');
      expect(lastStep.result).toEqual([0, 1, 9, 16, 100]);
    });

    it('4. 全负数输入 [-7, -3, -1] 正确生成 [1, 9, 49]', () => {
      const steps = buildSortedSquaresSteps([-7, -3, -1]);
      const lastStep = steps[steps.length - 1];
      expect(lastStep.result).toEqual([1, 9, 49]);
    });
  });

  describe('Minimum Size Subarray Sum (长度最小的子数组)', () => {
    it('5. 目标 target=7, 数组 [2, 3, 1, 2, 4, 3] 返回最小长度 2', () => {
      const steps = buildMinSubarrayLenSteps([2, 3, 1, 2, 4, 3], 7);
      expect(steps.length).toBeGreaterThan(0);
      const lastStep = steps[steps.length - 1];
      expect(lastStep.status).toBe('done');
      expect(lastStep.minLen).toBe(2);
    });

    it('6. 无法满足目标时返回 minLen=Infinity (最终步骤返回 0)', () => {
      const steps = buildMinSubarrayLenSteps([1, 1, 1, 1], 100);
      const lastStep = steps[steps.length - 1];
      expect(lastStep.minLen).toBe(Infinity);
    });
  });

  describe('Spiral Matrix II (螺旋矩阵 II)', () => {
    it('7. n=3 生成 3x3 顺时针螺旋矩阵 [[1, 2, 3], [8, 9, 4], [7, 6, 5]]', () => {
      const steps = buildSpiralSteps(3);
      expect(steps.length).toBeGreaterThan(0);
      const lastStep = steps[steps.length - 1];
      expect(lastStep.status).toBe('done');
      expect(lastStep.matrix).toEqual([
        [1, 2, 3],
        [8, 9, 4],
        [7, 6, 5]
      ]);
    });

    it('8. n=1 生成 [[1]]', () => {
      const steps = buildSpiralSteps(1);
      const lastStep = steps[steps.length - 1];
      expect(lastStep.matrix).toEqual([[1]]);
    });
  });
});
