import { describe, it, expect } from 'vitest';
import { buildCountSubmatrices053Steps } from './count-submatrices-all-ones-053-renderer';
import { buildBigFishEatSteps } from './big-fish-eat-small-fish-053-renderer';
import {
  buildRemoveKDigits053Steps,
  parseRemoveKDigitsInput,
} from './remove-k-digits-053-renderer';
import { buildRemoveDuplicateLettersSteps } from './remove-duplicate-letters-053-renderer';
import { buildLongestWPISteps } from './longest-well-performing-interval-053-renderer';
import { buildMaxSubarrayMinProductSteps } from './maximum-subarray-min-product-053-renderer';
import {
  COUNT_SUBMATRICES_CODES,
  BIG_FISH_CODES,
  REMOVE_K_DIGITS_CODES,
  REMOVE_DUP_LETTERS_CODES,
  LONGEST_WPI_CODES,
  MAX_SUBARRAY_MIN_PROD_CODES,
} from './stack-053-stage-codes';

describe('Class 053: Monotonic Stack (Part 2) Test Suite', () => {
  // 1. Code01: 统计全 1 子矩形
  describe('Code01: count-submatrices-all-ones-053 (LeetCode 1504)', () => {
    it('generates valid entry frame and correct total count', () => {
      const mat = [
        [1, 0, 1],
        [1, 1, 0],
        [1, 1, 0],
      ];
      const steps = buildCountSubmatrices053Steps(mat);
      expect(steps.length).toBeGreaterThan(0);
      expect(steps[0].message).toContain('核心策略');

      const lastStep = steps[steps.length - 1];
      expect(lastStep.totalSubmatrices).toBe(13);
    });

    it('verifies codeLine validity against four languages', () => {
      const mat = [
        [1, 1],
        [1, 1],
      ];
      const steps = buildCountSubmatrices053Steps(mat);
      for (const step of steps) {
        if (typeof step.codeLine === 'object' && step.codeLine !== null) {
          const cl = step.codeLine as Record<string, number>;
          expect(cl.java).toBeGreaterThanOrEqual(1);
          expect(cl.java).toBeLessThanOrEqual(COUNT_SUBMATRICES_CODES.java.length);
          expect(cl.cpp).toBeGreaterThanOrEqual(1);
          expect(cl.cpp).toBeLessThanOrEqual(COUNT_SUBMATRICES_CODES.cpp.length);
          expect(cl.python).toBeGreaterThanOrEqual(1);
          expect(cl.python).toBeLessThanOrEqual(COUNT_SUBMATRICES_CODES.python.length);
          expect(cl.javascript).toBeGreaterThanOrEqual(1);
          expect(cl.javascript).toBeLessThanOrEqual(COUNT_SUBMATRICES_CODES.javascript.length);
        }
      }
    });
  });

  // 2. Code02: 大鱼吃小鱼
  describe('Code02: big-fish-eat-small-fish-053 (牛客经典)', () => {
    it('solves classic fish eat turns properly', () => {
      // 6, 2, 3, 5, 1, 4 -> 最终耗费 3 轮
      const steps = buildBigFishEatSteps('6, 2, 3, 5, 1, 4');
      expect(steps.length).toBeGreaterThan(0);
      const lastStep = steps[steps.length - 1];
      expect(lastStep.variables?.最终耗费总轮数).toBe(3);
    });

    it('handles strictly decreasing (adjacent smaller eaten simultaneously in round 1)', () => {
      // 5, 4, 3, 2, 1 -> 第 1 轮 5吃4, 4吃3, 3吃2, 2吃1，同时发生，总耗费 1 轮
      const steps = buildBigFishEatSteps('5, 4, 3, 2, 1');
      const lastStep = steps[steps.length - 1];
      expect(lastStep.variables?.最终耗费总轮数).toBe(1);
    });

    it('handles strictly increasing (no one eaten, 0 turns)', () => {
      // 1, 2, 3, 4, 5 -> 无人被吃，0 轮
      const steps = buildBigFishEatSteps('1, 2, 3, 4, 5');
      const lastStep = steps[steps.length - 1];
      expect(lastStep.variables?.最终耗费总轮数).toBe(0);
    });

    it('handles empty input gracefully', () => {
      const steps = buildBigFishEatSteps('');
      expect(steps.length).toBe(1);
      expect(steps[0].stage).toBe('初始化');
    });

    it('verifies four-language code lines', () => {
      const steps = buildBigFishEatSteps('4, 2, 3');
      for (const step of steps) {
        if (typeof step.codeLine === 'object' && step.codeLine !== null) {
          const cl = step.codeLine as Record<string, number>;
          expect(cl.java).toBeLessThanOrEqual(BIG_FISH_CODES.java.length);
          expect(cl.cpp).toBeLessThanOrEqual(BIG_FISH_CODES.cpp.length);
          expect(cl.python).toBeLessThanOrEqual(BIG_FISH_CODES.python.length);
          expect(cl.javascript).toBeLessThanOrEqual(BIG_FISH_CODES.javascript.length);
        }
      }
    });
  });

  // 3. Code03: 移掉 K 位数字
  describe('Code03: remove-k-digits-053 (LeetCode 402)', () => {
    it('parses input variations properly', () => {
      expect(parseRemoveKDigitsInput('1432219, 3')).toEqual({ num: '1432219', k: 3 });
      expect(parseRemoveKDigitsInput('10200; 1')).toEqual({ num: '10200', k: 1 });
      expect(parseRemoveKDigitsInput('12345')).toEqual({ num: '12345', k: 3 });
    });

    it('computes minimal number removing 3 digits from 1432219 -> 1219', () => {
      const steps = buildRemoveKDigits053Steps('1432219, 3');
      const lastStep = steps[steps.length - 1];
      expect(lastStep.variables?.最终最小数值).toBe('1219');
    });

    it('strips leading zeros: 10200, k=1 -> 200', () => {
      const steps = buildRemoveKDigits053Steps('10200, 1');
      const lastStep = steps[steps.length - 1];
      expect(lastStep.variables?.最终最小数值).toBe('200');
    });

    it('handles n <= k returning 0: 10, k=2 -> 0', () => {
      const steps = buildRemoveKDigits053Steps('10, 2');
      const lastStep = steps[steps.length - 1];
      expect(lastStep.variables?.结果).toBe('0');
    });

    it('verifies code lines', () => {
      const steps = buildRemoveKDigits053Steps('1432219, 3');
      for (const step of steps) {
        if (typeof step.codeLine === 'object' && step.codeLine !== null) {
          const cl = step.codeLine as Record<string, number>;
          expect(cl.java).toBeLessThanOrEqual(REMOVE_K_DIGITS_CODES.java.length);
          expect(cl.cpp).toBeLessThanOrEqual(REMOVE_K_DIGITS_CODES.cpp.length);
          expect(cl.python).toBeLessThanOrEqual(REMOVE_K_DIGITS_CODES.python.length);
          expect(cl.javascript).toBeLessThanOrEqual(REMOVE_K_DIGITS_CODES.javascript.length);
        }
      }
    });
  });

  // 4. Code04: 去除重复字母
  describe('Code04: remove-duplicate-letters-053 (LeetCode 316 / 1081)', () => {
    it('produces minimal lexicographical string for bcabc -> abc', () => {
      const steps = buildRemoveDuplicateLettersSteps('bcabc');
      const lastStep = steps[steps.length - 1];
      expect(lastStep.variables?.最终去重字符串).toBe('abc');
    });

    it('produces minimal lexicographical string for cbacdcbc -> acdb', () => {
      const steps = buildRemoveDuplicateLettersSteps('cbacdcbc');
      const lastStep = steps[steps.length - 1];
      expect(lastStep.variables?.最终去重字符串).toBe('acdb');
    });

    it('verifies four-language code lines', () => {
      const steps = buildRemoveDuplicateLettersSteps('cbacdcbc');
      for (const step of steps) {
        if (typeof step.codeLine === 'object' && step.codeLine !== null) {
          const cl = step.codeLine as Record<string, number>;
          expect(cl.java).toBeLessThanOrEqual(REMOVE_DUP_LETTERS_CODES.java.length);
          expect(cl.cpp).toBeLessThanOrEqual(REMOVE_DUP_LETTERS_CODES.cpp.length);
          expect(cl.python).toBeLessThanOrEqual(REMOVE_DUP_LETTERS_CODES.python.length);
          expect(cl.javascript).toBeLessThanOrEqual(REMOVE_DUP_LETTERS_CODES.javascript.length);
        }
      }
    });
  });

  // 5. Code05: 表现良好的最长时间段
  describe('Code05: longest-well-performing-interval-053 (LeetCode 1124)', () => {
    it('computes longest interval correctly: [9,9,6,0,6,6,9] -> 3', () => {
      const steps = buildLongestWPISteps('9, 9, 6, 0, 6, 6, 9');
      const lastStep = steps[steps.length - 1];
      expect(lastStep.variables?.最终最长天数).toBe(3);
    });

    it('computes all tiering days: [6,6,6] -> 0', () => {
      const steps = buildLongestWPISteps('6, 6, 6');
      const lastStep = steps[steps.length - 1];
      expect(lastStep.variables?.最终最长天数).toBe(0);
    });

    it('verifies four-language code lines', () => {
      const steps = buildLongestWPISteps('9, 9, 6, 0, 6, 6, 9');
      for (const step of steps) {
        if (typeof step.codeLine === 'object' && step.codeLine !== null) {
          const cl = step.codeLine as Record<string, number>;
          expect(cl.java).toBeLessThanOrEqual(LONGEST_WPI_CODES.java.length);
          expect(cl.cpp).toBeLessThanOrEqual(LONGEST_WPI_CODES.cpp.length);
          expect(cl.python).toBeLessThanOrEqual(LONGEST_WPI_CODES.python.length);
          expect(cl.javascript).toBeLessThanOrEqual(LONGEST_WPI_CODES.javascript.length);
        }
      }
    });
  });

  // 6. Code06: 子数组最小乘积的最大值
  describe('Code06: maximum-subarray-min-product-053 (LeetCode 1856)', () => {
    it('computes maximum min-product: [1, 2, 3, 2] -> 14', () => {
      // 子数组 [2, 3, 2], min=2, sum=7, prod=14
      const steps = buildMaxSubarrayMinProductSteps('1, 2, 3, 2');
      const lastStep = steps[steps.length - 1];
      expect(lastStep.variables?.模后返回值).toBe(14);
    });

    it('computes testcase 2: [2, 3, 3, 1, 2] -> 18', () => {
      // 子数组 [3, 3], min=3, sum=6, prod=18
      const steps = buildMaxSubarrayMinProductSteps('2, 3, 3, 1, 2');
      const lastStep = steps[steps.length - 1];
      expect(lastStep.variables?.模后返回值).toBe(18);
    });

    it('computes testcase 3: [3, 1, 5, 6, 4, 2] -> 60', () => {
      // 子数组 [5, 6, 4], min=4, sum=15, prod=60
      const steps = buildMaxSubarrayMinProductSteps('3, 1, 5, 6, 4, 2');
      const lastStep = steps[steps.length - 1];
      expect(lastStep.variables?.模后返回值).toBe(60);
    });

    it('verifies four-language code lines', () => {
      const steps = buildMaxSubarrayMinProductSteps('1, 2, 3, 2');
      for (const step of steps) {
        if (typeof step.codeLine === 'object' && step.codeLine !== null) {
          const cl = step.codeLine as Record<string, number>;
          expect(cl.java).toBeLessThanOrEqual(MAX_SUBARRAY_MIN_PROD_CODES.java.length);
          expect(cl.cpp).toBeLessThanOrEqual(MAX_SUBARRAY_MIN_PROD_CODES.cpp.length);
          expect(cl.python).toBeLessThanOrEqual(MAX_SUBARRAY_MIN_PROD_CODES.python.length);
          expect(cl.javascript).toBeLessThanOrEqual(MAX_SUBARRAY_MIN_PROD_CODES.javascript.length);
        }
      }
    });
  });
});
