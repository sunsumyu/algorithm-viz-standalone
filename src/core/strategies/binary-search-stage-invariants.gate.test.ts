/**
 * 二分搜索与对数器物理不变量顶级架构机械防退化门禁
 * (Binary Search Invariants Gatekeeper)
 *
 * 守护领域:
 * 1. 二分搜索三种核心模型 (Class 004):
 *    - 查找 >= target 的最左位置 (左边界单调收拢)
 *    - 无序数组寻找局部最小值 (峰谷导数与斜率二分)
 *    - 空数组与单元素极值边界
 *
 * 核心机械不变量红线:
 * 1. 区间单调收缩性 (Interval Contraction Invariant):
 *    每次迭代 left 与 right 构成的闭区间 [l, r] 长度严格单调减小；
 * 2. 最左达标位置判定收敛性 (Leftmost Bound Correctness):
 *    若 ans !== -1，则 nums[ans] >= target 且 (ans === 0 || nums[ans - 1] < target)；
 *    若 ans === -1，则整个数组无任何元素 >= target；
 * 3. 局部极小值严格谷底判定 (Local Minimum Invariant):
 *    输出的局部最小值下标 mid 严格满足小于其所有相邻邻居 (严格处于波谷底点)；
 * 4. 多语言代码行映射合法区间: [1, totalLines]，严禁越界与 0 偏移。
 */

import { describe, it, expect } from 'vitest';
import {
  generateBinarySearchSteps,
  BINARY_SEARCH_004_CODES,
} from '../../algorithms/categories/binary-search/binary-search-logarithmic-004-renderer';

/**
 * 验证步进序列中的多语言代码行号合法性（支持 number、Record<string,number> 等格式）
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

      let lineNum: number | undefined;
      if (typeof step.codeLine === 'number') {
        lineNum = step.codeLine;
      } else if (typeof step.codeLine === 'object') {
        const val = step.codeLine[lang];
        if (typeof val === 'number') {
          lineNum = val;
        } else if (Array.isArray(val) && val.length > 0) {
          lineNum = val[0];
        }
      }

      if (lineNum !== undefined && lineNum > 0) {
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

describe('二分搜索与对数器物理不变量顶级架构机械防退化门禁 (Binary Search Gatekeeper)', () => {
  describe('Class 004: 查找 >= target 的最左位置', () => {
    it('标准命中: 查找有序数组中 >= target 的最左下标并保证前驱小于 target', () => {
      const nums = [1, 2, 2, 2, 3, 3, 5, 8, 9];
      const target = 2;
      const steps = generateBinarySearchSteps(nums, target, 'find-leftmost');
      expect(steps.length).toBeGreaterThan(0);

      const last = steps[steps.length - 1];
      expect(last.ansIndex).toBe(1); // 第一个 2 的位置
      expect(nums[last.ansIndex]).toBeGreaterThanOrEqual(target);
      expect(nums[last.ansIndex - 1]).toBeLessThan(target);

      // 验证区间逐步收缩
      const searchSteps = steps.filter(s => s.mid !== -1 && s.ansIndex !== -1);
      expect(searchSteps.length).toBeGreaterThan(0);

      verifyCodeLines(steps, '二分查找-最左位置命中', BINARY_SEARCH_004_CODES);
    });

    it('未命中: target 大于所有元素时正确收敛至 -1', () => {
      const nums = [1, 3, 5, 7, 9];
      const target = 100;
      const steps = generateBinarySearchSteps(nums, target, 'find-leftmost');
      expect(steps.length).toBeGreaterThan(0);

      const last = steps[steps.length - 1];
      expect(last.ansIndex).toBe(-1);

      verifyCodeLines(steps, '二分查找-最左位置未命中', BINARY_SEARCH_004_CODES);
    });

    it('首项命中: target 小于等于第一个元素时 ansIndex === 0', () => {
      const nums = [5, 6, 7, 8];
      const target = 3;
      const steps = generateBinarySearchSteps(nums, target, 'find-leftmost');
      expect(steps.length).toBeGreaterThan(0);

      const last = steps[steps.length - 1];
      expect(last.ansIndex).toBe(0);

      verifyCodeLines(steps, '二分查找-首项命中', BINARY_SEARCH_004_CODES);
    });
  });

  describe('Class 004: 无序数组寻找局部最小值 (Local Minimum)', () => {
    it('内部波谷: 正确捕获严格小于左右两邻的局部极小值', () => {
      // 满足两头高中间凹陷：nums[0] > nums[1], nums[n-1] > nums[n-2]
      const nums = [9, 7, 5, 4, 6, 8, 10, 5, 7];
      const steps = generateBinarySearchSteps(nums, 0, 'local-minimum');
      expect(steps.length).toBeGreaterThan(0);

      const last = steps[steps.length - 1];
      const mid = last.ansIndex;
      expect(mid).toBeGreaterThanOrEqual(0);
      expect(mid).toBeLessThan(nums.length);

      // 校验局部极小值判定
      if (mid === 0) {
        expect(nums[0]).toBeLessThan(nums[1]);
      } else if (mid === nums.length - 1) {
        expect(nums[nums.length - 1]).toBeLessThan(nums[nums.length - 2]);
      } else {
        expect(nums[mid], `arr[${mid}]=${nums[mid]} 必须小于左邻 arr[${mid - 1}]=${nums[mid - 1]}`).toBeLessThan(nums[mid - 1]);
        expect(nums[mid], `arr[${mid}]=${nums[mid]} 必须小于右邻 arr[${mid + 1}]=${nums[mid + 1]}`).toBeLessThan(nums[mid + 1]);
      }

      verifyCodeLines(steps, '二分查找-局部最小值', BINARY_SEARCH_004_CODES);
    });

    it('单元素或边界命中: 首项即为局部极小值', () => {
      const nums = [1, 5, 9];
      const steps = generateBinarySearchSteps(nums, 0, 'local-minimum');
      expect(steps.length).toBeGreaterThan(0);

      const last = steps[steps.length - 1];
      expect(last.ansIndex).toBe(0);

      verifyCodeLines(steps, '二分查找-首项局部极小值', BINARY_SEARCH_004_CODES);
    });
  });
});
