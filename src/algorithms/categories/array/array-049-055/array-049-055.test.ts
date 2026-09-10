/**
 * 左神算法通关课 Class 049 ~ 055 前缀和、差分与单调栈单调队列专题 自动化测试套件
 */

import { describe, it, expect } from 'vitest';
import { buildPrefixSum049Steps } from './prefix-sum-basic-049-renderer';
import { buildPrefixSum2D050Steps } from './prefix-sum-2d-050-renderer';
import { buildArithmeticDiff051Steps } from './arithmetic-sequence-difference-051-renderer';
import { buildMonotonicStack052Steps } from './monotonic-stack-basic-052-renderer';
import { buildLargestRectangle053Steps } from './largest-rectangle-histogram-053-renderer';
import { buildMonotonicQueue054Steps } from './monotonic-queue-basic-054-renderer';
import { buildValidSubarray055Steps } from './valid-subarray-limit-055-renderer';
import {
  PREFIX_SUM_BASIC_049_CODES,
  PREFIX_SUM_2D_050_CODES,
  ARITHMETIC_DIFF_051_CODES,
  MONOTONIC_STACK_052_CODES,
  LARGEST_RECTANGLE_053_CODES,
  MONOTONIC_QUEUE_054_CODES,
  VALID_SUBARRAY_LIMIT_055_CODES,
} from './array-049-055-stage-codes';

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

describe('左神前缀和、差分与单调栈队列专题 (Class 049 ~ 055) 综合测试套件', () => {
  // 1. Class 049: 一维前缀和与哈希表
  describe('Class 049: 一维前缀和与哈希表 (Subarray Sum Equals K)', () => {
    it('哈希表记录频次，准确求出等于目标和 K 的子数组总数 3', () => {
      const steps = buildPrefixSum049Steps();
      const last = steps[steps.length - 1];
      expect(last.count).toBe(3);
      verify1BasedCodeLines(steps, PREFIX_SUM_BASIC_049_CODES);
    });
  });

  // 2. Class 050: 二维前缀和与区域检索
  describe('Class 050: 二维前缀和与区域检索 (Range Sum Query 2D)', () => {
    it('容斥原理瞬时查询区域和，准确返回 20', () => {
      const steps = buildPrefixSum2D050Steps();
      const last = steps[steps.length - 1];
      expect(last.sumVal).toBe(20);
      verify1BasedCodeLines(steps, PREFIX_SUM_2D_050_CODES);
    });
  });

  // 3. Class 051: 等差数列差分
  describe('Class 051: 等差数列差分与两次前缀和 (Arithmetic Difference)', () => {
    it('二阶差分 4 点打标并在两次前缀和后恢复原等差数列', () => {
      const steps = buildArithmeticDiff051Steps();
      const last = steps[steps.length - 1];
      expect(last.diff2).toEqual([0, 0, 2, 4, 6, 8, 0, 0]);
      verify1BasedCodeLines(steps, ARITHMETIC_DIFF_051_CODES);
    });
  });

  // 4. Class 052: 单调栈原理
  describe('Class 052: 单调栈原理与左右较小值 (Monotonic Stack)', () => {
    it('底到顶递增栈，在 O(N) 严格求出所有元素左右最近较小值', () => {
      const steps = buildMonotonicStack052Steps();
      const last = steps[steps.length - 1];
      expect(last.settled.length).toBe(5);
      verify1BasedCodeLines(steps, MONOTONIC_STACK_052_CODES);
    });
  });

  // 5. Class 053: 柱状图最大矩形
  describe('Class 053: 柱状图最大矩形 (Largest Rectangle in Histogram)', () => {
    it('单调栈求解柱体左右扩散极值，得到全局最大面积 10', () => {
      const steps = buildLargestRectangle053Steps();
      const last = steps[steps.length - 1];
      expect(last.maxArea).toBe(10);
      verify1BasedCodeLines(steps, LARGEST_RECTANGLE_053_CODES);
    });
  });

  // 6. Class 054: 单调队列与滑动窗口最大值
  describe('Class 054: 单调队列与滑动窗口最大值 (Sliding Window Maximum)', () => {
    it('单调队列维护窗口最值，产出序列 [3, 3, 5, 5, 6, 7]', () => {
      const steps = buildMonotonicQueue054Steps();
      const last = steps[steps.length - 1];
      expect(last.maxVals).toEqual([3, 3, 5, 5, 6, 7]);
      verify1BasedCodeLines(steps, MONOTONIC_QUEUE_054_CODES);
    });
  });

  // 7. Class 055: 双单调队列与绝对差限制
  describe('Class 055: 双单调队列与绝对差限制的最长子数组 (Valid Subarray Limit)', () => {
    it('双队列协同维护极差，成功求出最长达标长度 2', () => {
      const steps = buildValidSubarray055Steps();
      const last = steps[steps.length - 1];
      expect(last.ansLen).toBe(2);
      verify1BasedCodeLines(steps, VALID_SUBARRAY_LIMIT_055_CODES);
    });
  });
});
