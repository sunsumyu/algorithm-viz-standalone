/**
 * Class 052: 单调栈（上）六大算法综合机械防退化测试
 *
 * 守护领域:
 * 1. Code01: 单调栈无重复值标准模板 (monotonic-stack-no-repeat-052)
 * 2. Code02: 单调栈有重复值进阶模板 (monotonic-stack-with-repeat-052)
 * 3. Code03: 每日温度 (daily-temperatures-052 / LeetCode 739)
 * 4. Code04: 子数组的最小值之和 (sum-subarray-minimums-052 / LeetCode 907)
 * 5. Code05: 柱状图中最大的矩形 (largest-rectangle-histogram-052 / LeetCode 84)
 * 6. Code06: 最大矩形 (maximal-rectangle-052 / LeetCode 85)
 */

import { describe, it, expect } from 'vitest';

// Code01
import { buildMonotonicNoRepeatSteps } from './monotonic-stack-no-repeat-052-renderer';
import { MONOTONIC_NO_REPEAT_CODES } from './stack-052-stage-codes';

// Code02
import { buildMonotonicWithRepeatSteps } from './monotonic-stack-with-repeat-052-renderer';
import { MONOTONIC_WITH_REPEAT_CODES } from './stack-052-stage-codes';

// Code03
import { buildDailyTemperatures052Steps } from './daily-temperatures-052-renderer';
import { DAILY_TEMPERATURES_CODES } from './stack-052-stage-codes';

// Code04
import { buildSumSubarrayMinimums052Steps } from './sum-subarray-minimums-052-renderer';
import { SUM_SUBARRAY_MINIMUMS_CODES } from './stack-052-stage-codes';

// Code05
import { buildLargestRectangle052Steps } from './largest-rectangle-histogram-052-renderer';
import { LARGEST_RECTANGLE_CODES } from './stack-052-stage-codes';

// Code06
import { buildMaximalRectangle052Steps, parseMatrixInput } from './maximal-rectangle-052-renderer';
import { MAXIMAL_RECTANGLE_CODES } from './stack-052-stage-codes';

function verifyCodeLineRanges(steps: any[], codes: Record<string, string[]>, algoName: string) {
  expect(steps.length, `${algoName}: 步进序列不能为空`).toBeGreaterThan(0);
  expect(steps[0].decision).toMatch(/(入口|开始|初始化)/);

  const langs = ['java', 'cpp', 'python', 'javascript'];
  for (const step of steps) {
    const lineMap = step.codeLine as Record<string, number>;
    expect(lineMap, `${algoName}: 每步必须提供 codeLine 映射字典`).toBeDefined();

    for (const lang of langs) {
      const line = lineMap[lang];
      const codeList = codes[lang];
      expect(line, `${algoName} [${lang}]: 行号必须存在且为正整数`).toBeGreaterThanOrEqual(1);
      expect(line, `${algoName} [${lang}]: 行号 ${line} 超出代码总行数 ${codeList.length}`).toBeLessThanOrEqual(codeList.length);
    }
  }
}

describe('Class 052: 单调栈（上）六大经典题体系化测试', () => {
  // 1. Code01: 无重复值单调栈
  describe('Code01: 单调栈无重复值标准模板', () => {
    it('标准用例 [3, 4, 1, 5, 2] 结算正确性与行号闭环', () => {
      const arr = [3, 4, 1, 5, 2];
      const steps = buildMonotonicNoRepeatSteps(arr);
      verifyCodeLineRanges(steps, MONOTONIC_NO_REPEAT_CODES, 'Code01');

      const lastStep = steps[steps.length - 1];
      expect(lastStep.settled.length).toBe(5);

      const findResult = (idx: number) => lastStep.settled.find((s) => s.idx === idx)!;
      // 3(idx 0): left=-1, right=2 (1)
      expect(findResult(0).left).toBe(-1);
      expect(findResult(0).right).toBe(2);

      // 4(idx 1): left=0 (3), right=2 (1)
      expect(findResult(1).left).toBe(0);
      expect(findResult(1).right).toBe(2);

      // 1(idx 2): left=-1, right=-1
      expect(findResult(2).left).toBe(-1);
      expect(findResult(2).right).toBe(-1);

      // 5(idx 3): left=2 (1), right=4 (2)
      expect(findResult(3).left).toBe(2);
      expect(findResult(3).right).toBe(4);

      // 2(idx 4): left=2 (1), right=-1
      expect(findResult(4).left).toBe(2);
      expect(findResult(4).right).toBe(-1);
    });

    it('空数组边界处理', () => {
      const steps = buildMonotonicNoRepeatSteps([]);
      expect(steps.length).toBe(1);
      expect(steps[0].arr.length).toBe(0);
    });
  });

  // 2. Code02: 有重复值单调栈
  describe('Code02: 单调栈有重复值进阶模板', () => {
    it('含重复值用例 [3, 1, 3, 4, 3, 5, 3, 2, 2] 批量结算验证', () => {
      const arr = [3, 1, 3, 4, 3, 5, 3, 2, 2];
      const steps = buildMonotonicWithRepeatSteps(arr);
      verifyCodeLineRanges(steps, MONOTONIC_WITH_REPEAT_CODES, 'Code02');

      const lastStep = steps[steps.length - 1];
      expect(lastStep.settled.length).toBe(9);

      const findResult = (idx: number) => lastStep.settled.find((s) => s.idx === idx)!;
      // 1(idx 1) 是全局最小，left=-1, right=-1
      expect(findResult(1).left).toBe(-1);
      expect(findResult(1).right).toBe(-1);

      // 2(idx 7) 和 2(idx 8): 左侧较小值为 1(idx 1), 右侧无更小
      expect(findResult(7).left).toBe(1);
      expect(findResult(7).right).toBe(-1);
      expect(findResult(8).left).toBe(1);
      expect(findResult(8).right).toBe(-1);
    });
  });

  // 3. Code03: 每日温度
  describe('Code03: 每日温度 (LeetCode 739)', () => {
    it('经典用例 [73, 74, 75, 71, 69, 72, 76, 73] 升温跨度验证', () => {
      const temps = [73, 74, 75, 71, 69, 72, 76, 73];
      const steps = buildDailyTemperatures052Steps(temps);
      verifyCodeLineRanges(steps, DAILY_TEMPERATURES_CODES, 'Code03');

      const lastStep = steps[steps.length - 1];
      expect(lastStep.result).toEqual([1, 1, 4, 2, 1, 1, 0, 0]);
    });

    it('单调递减温度数组（全 0）', () => {
      const temps = [60, 50, 40, 30];
      const steps = buildDailyTemperatures052Steps(temps);
      const lastStep = steps[steps.length - 1];
      expect(lastStep.result).toEqual([0, 0, 0, 0]);
    });
  });

  // 4. Code04: 子数组的最小值之和
  describe('Code04: 子数组的最小值之和 (LeetCode 907)', () => {
    it('官方用例 [3, 1, 2, 4] 贡献累加为 17', () => {
      const arr = [3, 1, 2, 4];
      const steps = buildSumSubarrayMinimums052Steps(arr);
      verifyCodeLineRanges(steps, SUM_SUBARRAY_MINIMUMS_CODES, 'Code04');

      const lastStep = steps[steps.length - 1];
      expect(lastStep.totalSum).toBe(17);
    });

    it('含重复元素 [11, 81, 94, 43, 3] 贡献累加为 444', () => {
      const arr = [11, 81, 94, 43, 3];
      const steps = buildSumSubarrayMinimums052Steps(arr);
      const lastStep = steps[steps.length - 1];
      expect(lastStep.totalSum).toBe(444);
    });
  });

  // 5. Code05: 柱状图中最大的矩形
  describe('Code05: 柱状图中最大的矩形 (LeetCode 84)', () => {
    it('官方例题 [2, 1, 5, 6, 2, 3] 最大面积为 10', () => {
      const heights = [2, 1, 5, 6, 2, 3];
      const steps = buildLargestRectangle052Steps(heights);
      verifyCodeLineRanges(steps, LARGEST_RECTANGLE_CODES, 'Code05');

      const lastStep = steps[steps.length - 1];
      expect(lastStep.maxArea).toBe(10);
    });

    it('阶梯柱状图 [2, 4] 面积为 4', () => {
      const heights = [2, 4];
      const steps = buildLargestRectangle052Steps(heights);
      const lastStep = steps[steps.length - 1];
      expect(lastStep.maxArea).toBe(4);
    });
  });

  // 6. Code06: 最大矩形
  describe('Code06: 最大矩形 (LeetCode 85)', () => {
    it('官方 4×5 矩阵最大矩形面积为 6', () => {
      const matrix = [
        [1, 0, 1, 0, 0],
        [1, 0, 1, 1, 1],
        [1, 1, 1, 1, 1],
        [1, 0, 0, 1, 0],
      ];
      const steps = buildMaximalRectangle052Steps(matrix);
      verifyCodeLineRanges(steps, MAXIMAL_RECTANGLE_CODES, 'Code06');

      const lastStep = steps[steps.length - 1];
      expect(lastStep.maxArea).toBe(6);
    });

    it('全 1 矩阵 3×3 面积为 9', () => {
      const matrix = [
        [1, 1, 1],
        [1, 1, 1],
        [1, 1, 1],
      ];
      const steps = buildMaximalRectangle052Steps(matrix);
      const lastStep = steps[steps.length - 1];
      expect(lastStep.maxArea).toBe(9);
    });

    it('矩阵输入解析器容错测试', () => {
      const text = '1,0,1; 1,1,1';
      const parsed = parseMatrixInput(text, [[0]]);
      expect(parsed).toEqual([
        [1, 0, 1],
        [1, 1, 1],
      ]);
    });
  });
});
