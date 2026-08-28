import { describe, it, expect } from 'vitest';
import { buildDailyTemperaturesSteps } from './daily-temperatures-renderer';
import { buildNextGreaterElementISteps } from './next-greater-element-i-renderer';
import { buildNextGreaterElementIISteps } from './next-greater-element-ii-renderer';
import { buildTrappingRainWaterSteps } from './trapping-rain-water-renderer';
import { buildLargestRectangleHistogramSteps } from './largest-rectangle-histogram-renderer';

describe('Monotonic Stack Algorithms Step Generation (单调栈核心算法全量测试)', () => {
  describe('Daily Temperatures (LC 739 每日温度)', () => {
    it('1. 经典输入 [73, 74, 75, 71, 69, 72, 76, 73] 结果数组为 [1, 1, 4, 2, 1, 1, 0, 0]', () => {
      const temps = [73, 74, 75, 71, 69, 72, 76, 73];
      const steps = buildDailyTemperaturesSteps(temps);
      expect(steps.length).toBeGreaterThan(0);
      const lastStep = steps[steps.length - 1];
      expect(lastStep.action).toBe('done');
      expect(lastStep.result).toEqual([1, 1, 4, 2, 1, 1, 0, 0]);
    });

    it('2. 单调递减序列 [30, 20, 10] 全为 0', () => {
      const steps = buildDailyTemperaturesSteps([30, 20, 10]);
      const lastStep = steps[steps.length - 1];
      expect(lastStep.result).toEqual([0, 0, 0]);
    });
  });

  describe('Next Greater Element I (LC 496 下一个更大元素 I)', () => {
    it('3. nums1 = [4, 1, 2], nums2 = [1, 3, 4, 2] 结果为 [-1, 3, -1]', () => {
      const nums1 = [4, 1, 2];
      const nums2 = [1, 3, 4, 2];
      const steps = buildNextGreaterElementISteps(nums1, nums2);
      expect(steps.length).toBeGreaterThan(0);
      const lastStep = steps[steps.length - 1];
      expect(lastStep.action).toBe('done');
      expect(lastStep.answers).toEqual([-1, 3, -1]);
    });

    it('4. nums1 = [2, 4], nums2 = [1, 2, 3, 4] 结果为 [3, -1]', () => {
      const nums1 = [2, 4];
      const nums2 = [1, 2, 3, 4];
      const steps = buildNextGreaterElementISteps(nums1, nums2);
      const lastStep = steps[steps.length - 1];
      expect(lastStep.answers).toEqual([3, -1]);
    });
  });

  describe('Next Greater Element II (LC 503 下一个更大元素 II)', () => {
    it('5. 循环数组 [1, 2, 1] 结果为 [2, -1, 2]', () => {
      const nums = [1, 2, 1];
      const steps = buildNextGreaterElementIISteps(nums);
      expect(steps.length).toBeGreaterThan(0);
      const lastStep = steps[steps.length - 1];
      expect(lastStep.action).toBe('done');
      expect(lastStep.result).toEqual([2, -1, 2]);
    });

    it('6. 循环数组 [1, 2, 3, 4, 3] 结果为 [2, 3, 4, -1, 4]', () => {
      const nums = [1, 2, 3, 4, 3];
      const steps = buildNextGreaterElementIISteps(nums);
      const lastStep = steps[steps.length - 1];
      expect(lastStep.result).toEqual([2, 3, 4, -1, 4]);
    });
  });

  describe('Trapping Rain Water (LC 42 接雨水)', () => {
    it('7. 经典地形 [0, 1, 0, 2, 1, 0, 1, 3, 2, 1, 2, 1] 累计接水量为 6', () => {
      const heights = [0, 1, 0, 2, 1, 0, 1, 3, 2, 1, 2, 1];
      const steps = buildTrappingRainWaterSteps(heights);
      expect(steps.length).toBeGreaterThan(0);
      const lastStep = steps[steps.length - 1];
      expect(lastStep.action).toBe('done');
      expect(lastStep.totalWater).toBe(6);
    });

    it('8. 示例 2 地形 [4, 2, 0, 3, 2, 5] 累计接水量为 9', () => {
      const heights = [4, 2, 0, 3, 2, 5];
      const steps = buildTrappingRainWaterSteps(heights);
      const lastStep = steps[steps.length - 1];
      expect(lastStep.totalWater).toBe(9);
    });

    it('9. 单调递增 [1, 2, 3, 4, 5] 无法接水 (总和 0)', () => {
      const steps = buildTrappingRainWaterSteps([1, 2, 3, 4, 5]);
      const lastStep = steps[steps.length - 1];
      expect(lastStep.totalWater).toBe(0);
    });
  });

  describe('Largest Rectangle in Histogram (LC 84 柱状图中最大的矩形)', () => {
    it('10. 经典输入 [2, 1, 5, 6, 2, 3] 最大面积为 10', () => {
      const heights = [2, 1, 5, 6, 2, 3];
      const steps = buildLargestRectangleHistogramSteps(heights);
      expect(steps.length).toBeGreaterThan(0);
      const lastStep = steps[steps.length - 1];
      expect(lastStep.action).toBe('done');
      expect(lastStep.maxArea).toBe(10);
    });

    it('11. 递增数组 [2, 4] 最大面积为 4', () => {
      const heights = [2, 4];
      const steps = buildLargestRectangleHistogramSteps(heights);
      const lastStep = steps[steps.length - 1];
      expect(lastStep.maxArea).toBe(4);
    });
  });
});
