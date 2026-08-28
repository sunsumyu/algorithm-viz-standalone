import { describe, it, expect } from 'vitest';
import { buildDTSteps } from './daily-temperatures-renderer';
import { buildTRWSteps } from './trapping-rain-water-renderer';
import { buildNGE1Steps } from './next-greater-element-i-renderer';

describe('Monotonic Stack Algorithms Step Generation (单调栈核心算法推导测试)', () => {
  describe('Daily Temperatures (每日温度)', () => {
    it('1. 正确推导出经典输入 [73, 74, 75, 71, 69, 72, 76, 73] 结果数组 [1, 1, 4, 2, 1, 1, 0, 0]', () => {
      const temps = [73, 74, 75, 71, 69, 72, 76, 73];
      const steps = buildDTSteps(temps);
      expect(steps.length).toBeGreaterThan(0);
      const lastStep = steps[steps.length - 1];
      expect(lastStep.status).toBe('done');
      expect(lastStep.answer).toEqual([1, 1, 4, 2, 1, 1, 0, 0]);
    });

    it('2. 单调递减序列 [30, 20, 10] 全为 0', () => {
      const steps = buildDTSteps([30, 20, 10]);
      const lastStep = steps[steps.length - 1];
      expect(lastStep.answer).toEqual([0, 0, 0]);
    });
  });

  describe('Trapping Rain Water (接雨水)', () => {
    it('3. 经典地形 [0, 1, 0, 2, 1, 0, 1, 3, 2, 1, 2, 1] 累计接水量为 6', () => {
      const heights = [0, 1, 0, 2, 1, 0, 1, 3, 2, 1, 2, 1];
      const steps = buildTRWSteps(heights);
      expect(steps.length).toBeGreaterThan(0);
      const lastStep = steps[steps.length - 1];
      expect(lastStep.action).toBe('done');
      expect(lastStep.sum).toBe(6);
    });

    it('4. 单调地形 [1, 2, 3, 4, 5] 无法接水 (总和 0)', () => {
      const steps = buildTRWSteps([1, 2, 3, 4, 5]);
      const lastStep = steps[steps.length - 1];
      expect(lastStep.sum).toBe(0);
    });
  });

  describe('Next Greater Element I (下一个更大元素 I)', () => {
    it('5. nums1 = [4, 1, 2], nums2 = [1, 3, 4, 2] 结果为 [-1, 3, -1]', () => {
      const nums1 = [4, 1, 2];
      const nums2 = [1, 3, 4, 2];
      const steps = buildNGE1Steps(nums1, nums2);
      expect(steps.length).toBeGreaterThan(0);
      const lastStep = steps[steps.length - 1];
      expect(lastStep.status).toBe('done');
      expect(lastStep.nextGreaterMap.get(1)).toBe(3);
      expect(lastStep.nextGreaterMap.get(3)).toBe(4);
      expect(lastStep.nextGreaterMap.get(4)).toBe(-1);
      expect(lastStep.nextGreaterMap.get(2)).toBe(-1);
    });
  });
});
