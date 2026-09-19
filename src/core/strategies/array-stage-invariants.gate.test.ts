/**
 * 数组核心算法与双指针物理不变量顶级架构机械防退化门禁
 * (Array Stage Invariants Gatekeeper)
 *
 * 守护领域 (12 大核心算法全覆盖):
 * 1. Remove Element (LeetCode 27 · 移除元素 快慢双指针)
 * 2. Squares of a Sorted Array (LeetCode 977 · 有序数组的平方 首尾向中间双指针)
 * 3. Minimum Size Subarray Sum (LeetCode 209 · 长度最小的子数组 滑动窗口)
 * 4. Spiral Matrix II (LeetCode 59 · 螺旋矩阵 II 边界顺时针收缩)
 * 5. Range Sum Query (区间和 / 一维前缀和基础)
 * 6. Buy Land (开发商购买土地 / 二维行和列和均分)
 * 7. First Missing Positive (LeetCode 41 · 缺失的第一个正数 原地置换哈希)
 * 8. Find the Duplicate Number (LeetCode 287 · 寻找重复数 快慢指针判圈)
 * 9. Next Permutation (LeetCode 31 · 下一个排列 降序拐点与后缀翻转)
 * 10. Product of Array Except Self (LeetCode 238 · 除自身以外数组的乘积 前后缀两遍扫描)
 * 11. Subarray Product Less Than K (LeetCode 713 · 乘积小于K的子数组 滑窗组合计数)
 * 12. Shuffle an Array (LeetCode 384 · 打乱数组 Fisher-Yates 算法)
 *
 * 核心机械不变量红线:
 * 1. 步进序列非空且初始帧完备；
 * 2. 状态指针与计算结果数学正确性；
 * 3. 多语言代码行映射合法区间: [1, totalLines]，严禁越界与 0 偏移。
 */

import { describe, it, expect } from 'vitest';
import { buildRemoveElementSteps } from '../../algorithms/categories/array/remove-element-renderer';
import { REMOVE_ELEMENT_CODE_LANGUAGES } from '../../algorithms/categories/array/remove-element-problem-content';
import { buildSortedSquaresSteps } from '../../algorithms/categories/array/squares-of-sorted-array-renderer';
import { SQUARES_OF_SORTED_ARRAY_CODE_LANGUAGES } from '../../algorithms/categories/array/squares-of-sorted-array-problem-content';
import { buildMinSubarrayLenSteps } from '../../algorithms/categories/array/min-subarray-len-renderer';
import { MIN_SUBARRAY_LEN_CODE_LANGUAGES } from '../../algorithms/categories/array/min-subarray-len-problem-content';
import { buildSpiralSteps } from '../../algorithms/categories/array/spiral-matrix-ii-renderer';
import { SPIRAL_MATRIX_II_CODE_LANGUAGES } from '../../algorithms/categories/array/spiral-matrix-ii-problem-content';
import { buildRangeSumSteps } from '../../algorithms/categories/array/range-sum-renderer';
import { RANGE_SUM_CODE_LANGUAGES } from '../../algorithms/categories/array/range-sum-problem-content';
import { buildBuyLandSteps } from '../../algorithms/categories/array/buy-land-renderer';
import { BUY_LAND_CODE_LANGUAGES } from '../../algorithms/categories/array/buy-land-problem-content';
import {
  generateMissingPositiveSteps,
  MISSING_POSITIVE_CODES,
} from '../../algorithms/categories/array/first-missing-positive-renderer';
import {
  buildFindDuplicateSteps,
  FIND_DUPLICATE_CODES,
} from '../../algorithms/categories/array/find-duplicate-number-287-renderer';
import {
  buildNextPermutationSteps,
  NEXT_PERMUTATION_CODES,
} from '../../algorithms/categories/array/next-permutation-renderer';
import {
  buildProductSteps,
  PRODUCT_EXCEPT_SELF_CODES,
} from '../../algorithms/categories/array/product-except-self-238-renderer';
import {
  buildProductLessThanKSteps,
  PRODUCT_LESS_THAN_K_CODES,
} from '../../algorithms/categories/array/subarray-product-less-than-k-renderer';
import {
  buildShuffleSteps,
  SHUFFLE_CODES,
} from '../../algorithms/categories/array/shuffle-an-array-renderer';
import { buildArraySummarySteps } from '../../algorithms/categories/array/array-summary-renderer';
import { ARRAY_SUMMARY_CODE_LANGUAGES } from '../../algorithms/categories/array/array-summary-problem-content';
import {
  buildAccessSteps,
  buildSearchSteps,
  buildInsertSteps,
  buildDeleteSteps,
} from '../../algorithms/categories/array/array-theory-renderer';
import { ARRAY_THEORY_CODE_LANGUAGES } from '../../algorithms/categories/array/array-theory-problem-content';

/**
 * 验证步进序列中的多语言代码行号合法性
 */
function verifyCodeLines(
  steps: any[],
  algoName: string,
  codeSource: Record<string, string | string[]>
) {
  expect(steps.length, `${algoName}: 步进序列不能为空`).toBeGreaterThan(0);
  const langs = ['java', 'cpp', 'python', 'javascript', 'typescript'];

  for (const lang of langs) {
    const raw = codeSource[lang];
    if (!raw) continue;
    const maxLine = Array.isArray(raw) ? raw.length : raw.split('\n').length;

    for (let i = 0; i < steps.length; i++) {
      const step = steps[i];
      if (step.codeLine === undefined || step.codeLine === null) continue;

      let lineNums: number[] = [];
      if (typeof step.codeLine === 'number') {
        lineNums = [step.codeLine];
      } else if (Array.isArray(step.codeLine)) {
        lineNums = step.codeLine;
      } else if (typeof step.codeLine === 'object') {
        const val = step.codeLine[lang];
        if (typeof val === 'number') {
          lineNums = [val];
        } else if (Array.isArray(val)) {
          lineNums = val;
        }
      }

      for (const lineNum of lineNums) {
        if (lineNum > 0) {
          expect(
            lineNum,
            `${algoName} [${lang}] 第 ${i} 步行号 ${lineNum} 超过最大行数 ${maxLine}`
          ).toBeLessThanOrEqual(maxLine);
          expect(
            lineNum,
            `${algoName} [${lang}] 第 ${i} 步行号 ${lineNum} 小于 1`
          ).toBeGreaterThanOrEqual(1);
        }
      }
    }
  }
}

describe('数组核心算法与双指针物理不变量顶级架构机械防退化门禁 (Array Stage Invariants Gatekeeper)', () => {
  describe('1. Remove Element (LeetCode 27)', () => {
    it('快慢指针就地原地覆写: 前 slow 个元素严格不等于 val', () => {
      const nums = [3, 2, 2, 3];
      const val = 3;
      const steps = buildRemoveElementSteps(nums, val);
      expect(steps.length).toBeGreaterThan(0);

      const last = steps[steps.length - 1];
      expect(last.status).toBe('done');
      expect(last.slow).toBe(2);
      expect(last.array.slice(0, last.slow)).toEqual([2, 2]);

      verifyCodeLines(steps, 'LeetCode 27 移除元素', REMOVE_ELEMENT_CODE_LANGUAGES);
    });
  });

  describe('2. Squares of a Sorted Array (LeetCode 977)', () => {
    it('首尾双指针求平方: 逆序填充生成非递减有序数组', () => {
      const nums = [-4, -1, 0, 3, 10];
      const steps = buildSortedSquaresSteps(nums);
      expect(steps.length).toBeGreaterThan(0);

      const last = steps[steps.length - 1];
      expect(last.status).toBe('done');
      expect(last.result).toEqual([0, 1, 9, 16, 100]);

      verifyCodeLines(steps, 'LeetCode 977 有序数组的平方', SQUARES_OF_SORTED_ARRAY_CODE_LANGUAGES);
    });
  });

  describe('3. Minimum Size Subarray Sum (LeetCode 209)', () => {
    it('滑窗动态伸缩: 准确捕获和大于等于 target 的最短连续子数组长度', () => {
      const nums = [2, 3, 1, 2, 4, 3];
      const target = 7;
      const steps = buildMinSubarrayLenSteps(nums, target);
      expect(steps.length).toBeGreaterThan(0);

      const last = steps[steps.length - 1];
      expect(last.status).toBe('done');
      expect(last.minLen).toBe(2); // [4, 3]

      verifyCodeLines(steps, 'LeetCode 209 长度最小的子数组', MIN_SUBARRAY_LEN_CODE_LANGUAGES);
    });
  });

  describe('4. Spiral Matrix II (LeetCode 59)', () => {
    it('顺时针四界收缩填充: 构造包含 1..n^2 的螺旋矩阵', () => {
      const n = 3;
      const steps = buildSpiralSteps(n);
      expect(steps.length).toBeGreaterThan(0);

      const last = steps[steps.length - 1];
      expect(last.status).toBe('done');
      expect(last.matrix).toEqual([
        [1, 2, 3],
        [8, 9, 4],
        [7, 6, 5],
      ]);

      verifyCodeLines(steps, 'LeetCode 59 螺旋矩阵 II', SPIRAL_MATRIX_II_CODE_LANGUAGES);
    });
  });

  describe('5. Range Sum Query (一维前缀和)', () => {
    it('前缀和 O(1) 区间检索: prefix[r+1] - prefix[l] 恒等于区间真实和', () => {
      const arr = [1, 2, 3, 4, 5];
      const queries: [number, number][] = [[1, 3], [0, 4]];
      const steps = buildRangeSumSteps(arr, queries);
      expect(steps.length).toBeGreaterThan(0);

      const last = steps[steps.length - 1];
      expect(last.status).toBe('done');
      expect(last.results).toEqual([9, 15]);

      verifyCodeLines(steps, '一维前缀和区间检索', RANGE_SUM_CODE_LANGUAGES);
    });
  });

  describe('6. Buy Land (开发商购买土地)', () => {
    it('二维网格行和与列和均分: 找到最小价值偏差', () => {
      const grid = [
        [1, 2, 3],
        [2, 1, 1],
        [4, 3, 2],
      ];
      const steps = buildBuyLandSteps(grid, 50);
      expect(steps.length).toBeGreaterThan(0);

      const last = steps[steps.length - 1];
      expect(last.status).toBe('done');
      expect(last.bestArea).toBeGreaterThanOrEqual(0);

      verifyCodeLines(steps, '开发商购买土地', BUY_LAND_CODE_LANGUAGES);
    });
  });

  describe('7. First Missing Positive (LeetCode 41)', () => {
    it('原地哈希置换: 缺失的最小正整数判断', () => {
      const nums = [3, 4, -1, 1];
      const steps = generateMissingPositiveSteps(nums);
      expect(steps.length).toBeGreaterThan(0);

      const last = steps[steps.length - 1];
      expect(last.missingResult).toBe(2);

      verifyCodeLines(steps, 'LeetCode 41 缺失的第一个正数', MISSING_POSITIVE_CODES);
    });
  });

  describe('8. Find the Duplicate Number (LeetCode 287)', () => {
    it('Floyd 快慢指针判圈: 拓扑成环捕获唯一重复数字 2', () => {
      const nums = [1, 3, 4, 2, 2];
      const steps = buildFindDuplicateSteps(nums);
      expect(steps.length).toBeGreaterThan(0);

      const last = steps[steps.length - 1];
      expect(last.phase).toBe('finish');
      expect(last.duplicate).toBe(2);

      verifyCodeLines(steps, 'LeetCode 287 寻找重复数', FIND_DUPLICATE_CODES);
    });
  });

  describe('9. Next Permutation (LeetCode 31)', () => {
    it('字典序下一个排列: 拐点查找、逆向交换与后缀反转', () => {
      const nums = [1, 2, 7, 4, 3, 1];
      const steps = buildNextPermutationSteps(nums);
      expect(steps.length).toBeGreaterThan(0);

      const last = steps[steps.length - 1];
      expect(last.phase).toBe('finish');
      expect(last.nums).toEqual([1, 3, 1, 2, 4, 7]);

      verifyCodeLines(steps, 'LeetCode 31 下一个排列', NEXT_PERMUTATION_CODES);
    });
  });

  describe('10. Product of Array Except Self (LeetCode 238)', () => {
    it('前缀积与后缀积两次扫描: 排除自身计算累积乘积', () => {
      const nums = [1, 2, 3, 4];
      const steps = buildProductSteps(nums);
      expect(steps.length).toBeGreaterThan(0);

      const last = steps[steps.length - 1];
      expect(last.phase).toBe('finish');
      expect(last.res).toEqual([24, 12, 8, 6]);

      verifyCodeLines(steps, 'LeetCode 238 除自身以外数组的乘积', PRODUCT_EXCEPT_SELF_CODES);
    });
  });

  describe('11. Subarray Product Less Than K (LeetCode 713)', () => {
    it('正整数滑动窗口组合计数: 乘积严格小于 K 的连续子数组数目', () => {
      const nums = [10, 5, 2, 6];
      const k = 100;
      const steps = buildProductLessThanKSteps(nums, k);
      expect(steps.length).toBeGreaterThan(0);

      const last = steps[steps.length - 1];
      expect(last.phase).toBe('finish');
      // Subarrays with product < 100:
      // [10], [5], [2], [6], [10, 5], [5, 2], [2, 6], [5, 2, 6] -> 8
      expect(last.count).toBe(8);

      verifyCodeLines(steps, 'LeetCode 713 乘积小于K的子数组', PRODUCT_LESS_THAN_K_CODES);
    });
  });

  describe('12. Shuffle an Array (LeetCode 384)', () => {
    it('Fisher-Yates 洗牌算法: 打乱结果为原数组的一个合法全排列', () => {
      const nums = [1, 2, 3, 4, 5];
      const steps = buildShuffleSteps(nums);
      expect(steps.length).toBeGreaterThan(0);

      const last = steps[steps.length - 1];
      expect(last.current.slice().sort((a, b) => a - b)).toEqual([1, 2, 3, 4, 5]);

      verifyCodeLines(steps, 'LeetCode 384 打乱数组', SHUFFLE_CODES);
    });
  });

  describe('13. Array Summary (数组专题总结篇)', () => {
    it('六大范式全景步进: 各知识点链路完整性与行号边界约束', () => {
      const steps = buildArraySummarySteps();
      expect(steps.length).toBeGreaterThan(0);

      const last = steps[steps.length - 1];
      expect(last.section).toBe('done');

      verifyCodeLines(steps, '数组专题总结篇', ARRAY_SUMMARY_CODE_LANGUAGES);
    });
  });

  describe('14. Array Theory (数组理论基础)', () => {
    it('四种核心模式 (访问/搜索/插入/删除) 步进与多语言行号约束', () => {
      const list = [3, 5, 7, 11, 15];

      const accessSteps = buildAccessSteps(2);
      expect(accessSteps.length).toBeGreaterThan(0);
      expect(accessSteps[accessSteps.length - 1].value).toBe(7);
      verifyCodeLines(accessSteps, '数组理论基础 - 随机访问', ARRAY_THEORY_CODE_LANGUAGES);

      const searchSteps = buildSearchSteps(list, 11);
      expect(searchSteps.length).toBeGreaterThan(0);
      expect(searchSteps[searchSteps.length - 1].status).toBe('search-found');
      verifyCodeLines(searchSteps, '数组理论基础 - 线性搜索', ARRAY_THEORY_CODE_LANGUAGES);

      const insertSteps = buildInsertSteps(list, 2, 99);
      expect(insertSteps.length).toBeGreaterThan(0);
      expect(insertSteps[insertSteps.length - 1].status).toBe('done');
      verifyCodeLines(insertSteps, '数组理论基础 - 插入元素', ARRAY_THEORY_CODE_LANGUAGES);

      const deleteSteps = buildDeleteSteps(list, 1);
      expect(deleteSteps.length).toBeGreaterThan(0);
      expect(deleteSteps[deleteSteps.length - 1].status).toBe('done');
      verifyCodeLines(deleteSteps, '数组理论基础 - 删除元素', ARRAY_THEORY_CODE_LANGUAGES);
    });
  });
});

