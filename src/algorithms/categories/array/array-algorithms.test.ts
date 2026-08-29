import { describe, it, expect } from 'vitest';
import { buildRemoveElementSteps } from './remove-element-renderer';
import { buildSortedSquaresSteps } from './squares-of-sorted-array-renderer';
import { buildMinSubarrayLenSteps } from './min-subarray-len-renderer';
import { buildSpiralSteps } from './spiral-matrix-ii-renderer';
import { buildRangeSumSteps } from './range-sum-renderer';
import { buildBuyLandSteps } from './buy-land-renderer';
import {
  buildAccessSteps,
  buildSearchSteps,
  buildInsertSteps,
  buildDeleteSteps,
} from './array-theory-renderer';
import { buildArraySummarySteps, DEMO_QUESTIONS } from './array-summary-renderer';

describe('Array Category Modernized Algorithms (数组全套核心算法推导测试)', () => {
  describe('1. Remove Element (LeetCode 27 · 移除元素)', () => {
    it('数组 [3, 2, 2, 3], val=3 移除后新长度 slow=2', () => {
      const steps = buildRemoveElementSteps([3, 2, 2, 3], 3);
      expect(steps.length).toBeGreaterThan(0);
      const lastStep = steps[steps.length - 1];
      expect(lastStep.status).toBe('done');
      expect(lastStep.slow).toBe(2);
      expect(lastStep.array.slice(0, 2)).toEqual([2, 2]);
    });

    it('数组 [0, 1, 2, 2, 3, 0, 4, 2], val=2 移除后新长度 slow=5', () => {
      const steps = buildRemoveElementSteps([0, 1, 2, 2, 3, 0, 4, 2], 2);
      const lastStep = steps[steps.length - 1];
      expect(lastStep.slow).toBe(5);
      expect(lastStep.array.slice(0, 5)).toEqual([0, 1, 3, 0, 4]);
    });
  });

  describe('2. Squares of a Sorted Array (LeetCode 977 · 有序数组的平方)', () => {
    it('输入 [-4, -1, 0, 3, 10] 正确生成 [0, 1, 9, 16, 100]', () => {
      const steps = buildSortedSquaresSteps([-4, -1, 0, 3, 10]);
      expect(steps.length).toBeGreaterThan(0);
      const lastStep = steps[steps.length - 1];
      expect(lastStep.status).toBe('done');
      expect(lastStep.result).toEqual([0, 1, 9, 16, 100]);
    });

    it('全负数输入 [-7, -3, -1] 正确生成 [1, 9, 49]', () => {
      const steps = buildSortedSquaresSteps([-7, -3, -1]);
      const lastStep = steps[steps.length - 1];
      expect(lastStep.result).toEqual([1, 9, 49]);
    });
  });

  describe('3. Minimum Size Subarray Sum (LeetCode 209 · 长度最小的子数组)', () => {
    it('目标 target=7, 数组 [2, 3, 1, 2, 4, 3] 返回最小长度 2', () => {
      const steps = buildMinSubarrayLenSteps([2, 3, 1, 2, 4, 3], 7);
      expect(steps.length).toBeGreaterThan(0);
      const lastStep = steps[steps.length - 1];
      expect(lastStep.status).toBe('done');
      expect(lastStep.minLen).toBe(2);
    });

    it('无法满足目标时返回 minLen=Infinity (最终步骤返回 0)', () => {
      const steps = buildMinSubarrayLenSteps([1, 1, 1, 1], 100);
      const lastStep = steps[steps.length - 1];
      expect(lastStep.minLen).toBe(Infinity);
    });
  });

  describe('4. Spiral Matrix II (LeetCode 59 · 螺旋矩阵 II)', () => {
    it('n=3 生成 3x3 顺时针螺旋矩阵 [[1, 2, 3], [8, 9, 4], [7, 6, 5]]', () => {
      const steps = buildSpiralSteps(3);
      expect(steps.length).toBeGreaterThan(0);
      const lastStep = steps[steps.length - 1];
      expect(lastStep.status).toBe('done');
      expect(lastStep.matrix).toEqual([
        [1, 2, 3],
        [8, 9, 4],
        [7, 6, 5],
      ]);
    });

    it('n=1 生成 [[1]]', () => {
      const steps = buildSpiralSteps(1);
      const lastStep = steps[steps.length - 1];
      expect(lastStep.matrix).toEqual([[1]]);
    });
  });

  describe('5. Range Sum (KamaCoder 58 · 一维前缀和)', () => {
    it('数组 [1, 2, 3, 4, 5] 正确响应区间查询 [0,2] => 6, [1,3] => 9, [2,4] => 12', () => {
      const steps = buildRangeSumSteps(
        [1, 2, 3, 4, 5],
        [
          [0, 2],
          [1, 3],
          [2, 4],
        ]
      );
      expect(steps.length).toBeGreaterThan(0);
      const lastStep = steps[steps.length - 1];
      expect(lastStep.status).toBe('done');
      expect(lastStep.results).toEqual([6, 9, 12]);
      expect(lastStep.prefix).toEqual([0, 1, 3, 6, 10, 15]);
    });
  });

  describe('6. Buy Land (KamaCoder 44 · 二维前缀和)', () => {
    it('3x3 网格在 budget=20 情况下求出最大面积为 4', () => {
      const grid = [
        [1, 2, 3],
        [4, 5, 6],
        [7, 8, 9],
      ];
      const steps = buildBuyLandSteps(grid, 20);
      expect(steps.length).toBeGreaterThan(0);
      const lastStep = steps[steps.length - 1];
      expect(lastStep.status).toBe('done');
      expect(lastStep.bestArea).toBe(4);
      expect(lastStep.bestRect).toEqual([0, 0, 1, 1]);
    });
  });

  describe('7. Array Theory (数组理论基础操作)', () => {
    it('下标访问 O(1) 正确生成物理寻址步骤', () => {
      const steps = buildAccessSteps(2);
      expect(steps.length).toBe(3);
      expect(steps[1].value).toBe(7);
    });

    it('线性搜索 O(n) 正确比对并找到目标下标', () => {
      const steps = buildSearchSteps([3, 5, 7, 11, 15], 11);
      const lastStep = steps[steps.length - 1];
      expect(lastStep.status).toBe('search-found');
      expect(lastStep.index).toBe(3);
    });

    it('元素插入 O(n) 正确后移元素并放入新值', () => {
      const steps = buildInsertSteps([3, 5, 7], 1, 99);
      const lastStep = steps[steps.length - 1];
      expect(lastStep.status).toBe('done');
      expect(lastStep.array).toEqual([3, 99, 5, 7]);
      expect(lastStep.shiftCount).toBe(2);
    });

    it('元素删除 O(n) 正确前移元素', () => {
      const steps = buildDeleteSteps([3, 5, 7, 11], 1);
      const lastStep = steps[steps.length - 1];
      expect(lastStep.status).toBe('done');
      expect(lastStep.array).toEqual([3, 7, 11]);
    });
  });

  describe('8. Array Summary (数组专题总结与自测题)', () => {
    it('生成全景回顾 7 个关键步骤', () => {
      const steps = buildArraySummarySteps();
      expect(steps.length).toBe(7);
      expect(steps[0].section).toBe('intro');
      expect(steps[steps.length - 1].section).toBe('done');
    });

    it('包含 5 道自测精选题且均有详细解析', () => {
      expect(DEMO_QUESTIONS.length).toBe(5);
      DEMO_QUESTIONS.forEach((q) => {
        expect(q.options.length).toBe(4);
        expect(q.correct).toBeGreaterThanOrEqual(0);
        expect(q.correct).toBeLessThan(4);
        expect(q.explanation.length).toBeGreaterThan(0);
      });
    });
  });
});
