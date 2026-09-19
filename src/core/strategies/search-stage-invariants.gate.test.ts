/**
 * 搜索算法与二分全景物理不变量顶级架构机械防退化门禁
 * (Search & Binary Search Invariants Gatekeeper)
 *
 * 守护领域:
 * 1. 二分查找核心母题 (LeetCode 704):
 *    - 区间折半单调收缩 [left, right]
 *    - 边界与命中一致性验证 (found / not-found)
 * 2. 寻找旋转排序数组中的最小值 II (LeetCode 154):
 *    - 重复元素决策 right-- 平缓收缩不丢解
 *    - 最终收敛点必定为全局最小值
 * 3. 寻找峰值 (LeetCode 162):
 *    - 局部斜率导数二分 (向高处走必有峰值)
 *    - 最终命中点必大于左右邻居 (含 -∞ 边界)
 * 4. 爱吃香蕉的珂珂 (LeetCode 875):
 *    - 二分答案法单调可行性判定
 *    - 最终产出严格最小可行速度
 * 5. Class 005: 经典二分、最左达标与无序数组局部极小值检测
 * 6. Class 058: 染色标号与桥接最大人工岛 (LeetCode 827)
 *
 * 核心机械不变量红线:
 * 1. 步进序列非空且初始帧语义完备；
 * 2. 状态指针 left <= mid <= right 合法性；
 * 3. 多语言代码行映射合法区间: [1, totalLines]，严禁越界与 0 偏移。
 */

import { describe, it, expect } from 'vitest';
import {
  binarySearchSteps,
  BINARY_SEARCH_CODE_LINES,
} from '../../algorithms/categories/search/binary-search-renderer';
import { BINARY_SEARCH_CODE_LANGUAGES } from '../../algorithms/categories/search/binary-search-problem-content';
import {
  buildMinRotatedSteps,
  MIN_ROTATED_CODES,
} from '../../algorithms/categories/search/find-min-rotated-sorted-array-ii-renderer';
import {
  buildPeakElementSteps,
  PEAK_ELEMENT_CODES,
} from '../../algorithms/categories/search/find-peak-element-renderer';
import {
  buildKokoSteps,
  KOKO_BANANAS_CODES,
} from '../../algorithms/categories/search/koko-eating-bananas-renderer';
import {
  buildBinarySearch005Steps,
  BINARY_SEARCH_005_CODES,
} from '../../algorithms/categories/search/binary-search-005-renderer';
import {
  buildLargeIsland058Steps,
} from '../../algorithms/categories/search/search-058/making-large-island-058-renderer';
import { MAKING_LARGE_ISLAND_058_CODES } from '../../algorithms/categories/search/search-058/search-058-stage-codes';

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

describe('搜索算法与二分全景物理不变量顶级架构机械防退化门禁 (Search Stage Invariants Gatekeeper)', () => {
  describe('1. Binary Search (LeetCode 704 经典二分查找)', () => {
    it('命中元素: 严格保持 mid 指针在区间内，且命中时下标值等于目标值', () => {
      const arr = [-1, 0, 3, 5, 9, 12];
      const target = 9;
      const steps = binarySearchSteps(arr, target);
      expect(steps.length).toBeGreaterThan(0);

      // 验证初始步
      expect(steps[0].phase).toBe('init');
      expect(steps[0].left).toBe(0);
      expect(steps[0].right).toBe(arr.length - 1);

      // 验证循环过程中的区间收缩与 mid 判定
      for (const step of steps) {
        if (step.phase === 'check-mid') {
          expect(step.mid).toBeGreaterThanOrEqual(step.left);
          expect(step.mid).toBeLessThanOrEqual(step.right);
          expect(step.mid).toBe(step.left + Math.floor((step.right - step.left) / 2));
        }
      }

      // 验证终结步
      const last = steps[steps.length - 1];
      expect(last.phase).toBe('found');
      expect(last.foundIndex).toBe(4);
      expect(arr[last.foundIndex]).toBe(target);

      verifyCodeLines(steps, 'LeetCode 704 经典二分', BINARY_SEARCH_CODE_LANGUAGES);
    });

    it('未命中与空数组: 正确终止并返回 not-found 状态', () => {
      const stepsNotFound = binarySearchSteps([1, 3, 5], 2);
      const lastNotFound = stepsNotFound[stepsNotFound.length - 1];
      expect(lastNotFound.phase).toBe('not-found');
      expect(lastNotFound.foundIndex).toBe(-1);
      verifyCodeLines(stepsNotFound, 'LeetCode 704 未命中', BINARY_SEARCH_CODE_LANGUAGES);

      const stepsEmpty = binarySearchSteps([], 10);
      expect(stepsEmpty[stepsEmpty.length - 1].phase).toBe('not-found');
      verifyCodeLines(stepsEmpty, 'LeetCode 704 空数组', BINARY_SEARCH_CODE_LANGUAGES);
    });
  });

  describe('2. Find Minimum in Rotated Sorted Array II (LeetCode 154 带重复旋转数组最小值)', () => {
    it('经典折断用例 [2, 2, 2, 0, 1, 2]: 收敛至全局最小值 0', () => {
      const nums = [2, 2, 2, 0, 1, 2];
      const steps = buildMinRotatedSteps(nums);
      expect(steps.length).toBeGreaterThan(0);

      // 验证初始步
      expect(steps[0].phase).toBe('init');
      expect(steps[0].left).toBe(0);
      expect(steps[0].right).toBe(nums.length - 1);

      // 验证搜索过程中的指针合法性
      for (const step of steps) {
        expect(step.left).toBeGreaterThanOrEqual(0);
        expect(step.right).toBeLessThan(nums.length);
        expect(step.left).toBeLessThanOrEqual(step.right);
        expect(step.mid).toBeGreaterThanOrEqual(step.left);
        expect(step.mid).toBeLessThanOrEqual(step.right);
      }

      // 验证终结步
      const last = steps[steps.length - 1];
      expect(last.phase).toBe('finish');
      expect(last.left).toBe(last.right);
      expect(last.minVal).toBe(Math.min(...nums));

      verifyCodeLines(steps, 'LeetCode 154 旋转数组最小值 II', MIN_ROTATED_CODES);
    });

    it('两端重复用例 [10, 1, 10, 10, 10]: 正确触发 shrink 排除末端并收敛至 1', () => {
      const nums = [10, 1, 10, 10, 10];
      const steps = buildMinRotatedSteps(nums);
      const hasShrink = steps.some(s => s.phase === 'shrink');
      expect(hasShrink, '必须经历重复元素 right-- 收缩阶段').toBe(true);

      const last = steps[steps.length - 1];
      expect(last.minVal).toBe(1);
      verifyCodeLines(steps, 'LeetCode 154 两端重复', MIN_ROTATED_CODES);
    });
  });

  describe('3. Find Peak Element (LeetCode 162 寻找峰值)', () => {
    it('无序数组中二分寻找峰值: 最终点必定严格大于其相邻邻居', () => {
      const nums = [1, 2, 1, 3, 5, 6, 4];
      const steps = buildPeakElementSteps(nums);
      expect(steps.length).toBeGreaterThan(0);

      for (const step of steps) {
        expect(step.left).toBeGreaterThanOrEqual(0);
        expect(step.right).toBeLessThan(nums.length);
        expect(step.mid).toBeGreaterThanOrEqual(step.left);
        expect(step.mid).toBeLessThanOrEqual(step.right);
      }

      const last = steps[steps.length - 1];
      expect(last.phase).toBe('finish');
      expect(last.left).toBe(last.right);
      expect(last.peakIdx).not.toBeNull();

      const peak = last.peakIdx!;
      const leftVal = peak > 0 ? nums[peak - 1] : -Infinity;
      const rightVal = peak < nums.length - 1 ? nums[peak + 1] : -Infinity;
      expect(nums[peak]).toBeGreaterThan(leftVal);
      expect(nums[peak]).toBeGreaterThan(rightVal);

      verifyCodeLines(steps, 'LeetCode 162 寻找峰值', PEAK_ELEMENT_CODES);
    });
  });

  describe('4. Koko Eating Bananas (LeetCode 875 二分答案法母题)', () => {
    it('计算最小吃速: 产出解 ans 能在 h 小时内吃完，且 ans-1 超时', () => {
      const piles = [3, 6, 7, 11];
      const h = 8;
      const steps = buildKokoSteps(piles, h);
      expect(steps.length).toBeGreaterThan(0);

      const canFinish = (k: number) => {
        return piles.reduce((sum, p) => sum + Math.ceil(p / k), 0) <= h;
      };

      const last = steps[steps.length - 1];
      expect(last.phase).toBe('finish');
      expect(last.bestSpeed).not.toBeNull();
      const ans = last.bestSpeed!;

      expect(canFinish(ans), `速度 ${ans} 必须能在 ${h} 小时内吃完`).toBe(true);
      if (ans > 1) {
        expect(canFinish(ans - 1), `速度 ${ans - 1} 必定超时`).toBe(false);
      }

      verifyCodeLines(steps, 'LeetCode 875 珂珂吃香蕉', KOKO_BANANAS_CODES);
    });
  });

  describe('5. Class 005: 二分搜索与局部最小值检测', () => {
    it('Mode find: 精确二分搜索命中与未命中', () => {
      const arr = [1, 2, 3, 5, 7, 9];
      const stepsHit = buildBinarySearch005Steps(arr, 'find', 5);
      expect(stepsHit[stepsHit.length - 1].foundIndex).toBe(3);
      verifyCodeLines(stepsHit, 'Class 005 find 命中', BINARY_SEARCH_005_CODES);

      const stepsMiss = buildBinarySearch005Steps(arr, 'find', 4);
      expect(stepsMiss[stepsMiss.length - 1].foundIndex).toBe(-1);
      verifyCodeLines(stepsMiss, 'Class 005 find 未命中', BINARY_SEARCH_005_CODES);
    });

    it('Mode findLeft: 寻找 >= target 最左位置', () => {
      const arr = [1, 2, 2, 2, 5, 8];
      const steps = buildBinarySearch005Steps(arr, 'findLeft', 2);
      const last = steps[steps.length - 1];
      expect(last.foundIndex).toBe(1);
      expect(arr[last.foundIndex]).toBeGreaterThanOrEqual(2);
      expect(arr[last.foundIndex - 1]).toBeLessThan(2);
      verifyCodeLines(steps, 'Class 005 findLeft', BINARY_SEARCH_005_CODES);
    });

    it('Mode localMin: 无序相邻不等数组中必定二分捕获局部极小值', () => {
      const arr = [9, 7, 5, 4, 6, 8];
      const steps = buildBinarySearch005Steps(arr, 'localMin');
      const last = steps[steps.length - 1];
      expect(last.foundIndex).toBeGreaterThanOrEqual(0);
      const idx = last.foundIndex;
      if (idx > 0) expect(arr[idx]).toBeLessThan(arr[idx - 1]);
      if (idx < arr.length - 1) expect(arr[idx]).toBeLessThan(arr[idx + 1]);
      verifyCodeLines(steps, 'Class 005 localMin', BINARY_SEARCH_005_CODES);
    });
  });

  describe('6. Class 058: 染色标号与最大人工岛 (LeetCode 827)', () => {
    it('两次遍历染色与桥接: 识别天然岛屿后，翻转关键点达成最大连通面积 5', () => {
      const steps = buildLargeIsland058Steps();
      expect(steps.length).toBeGreaterThan(0);

      const last = steps[steps.length - 1];
      expect(last.maxArea).toBe(5);
      expect(last.flipR).toBe(1);
      expect(last.flipC).toBe(1);

      verifyCodeLines(steps, 'Class 058 最大人工岛', MAKING_LARGE_ISLAND_058_CODES);
    });
  });
});
