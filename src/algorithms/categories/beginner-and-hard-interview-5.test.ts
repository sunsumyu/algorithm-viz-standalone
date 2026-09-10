/**
 * 第五阶段算法测试套件：4 门入门基础核心课 + 4 门大厂压轴王者题 (570 门里程碑)
 * 1. Class 031: 经典递归过程与递归序深度解构 (recursion-order-031)
 * 2. Class 033: 位图 BitMap 的实现与海量数据去重 (bitmap-design-033)
 * 3. Class 035: 不均匀随机发生器向等概率转化模型 (random-generator-035)
 * 4. Class 038: 经典递归向记忆化与动态规划初步转换 (recursion-to-dp-038)
 * 5. Hard 17: 柱状图中最大的矩形 (hard-largest-rectangle-histogram)
 * 6. Hard 18: 合并 K 个升序链表 (merge-k-sorted-lists)
 * 7. Hard 19: N 皇后极速位运算解法 (n-queens-bitwise-speed)
 * 8. Hard 20: 寻找两个正序数组的中位数 (median-two-sorted-arrays)
 */

import { describe, it, expect } from 'vitest';
import { generateRecursionOrderSteps } from './backtracking/recursion-order-031-renderer';
import { generateBitMapSteps } from './bit-manipulation/bitmap-design-033-renderer';
import { generateRandomGenSteps } from './math/random-generator-035-renderer';
import { generateRecursionToDpSteps } from './dynamic-programming/recursion-to-dp-038-renderer';
import { generateHistogramSteps } from './advanced-topics/hard-interview/hard-largest-rectangle-histogram-renderer';
import { generateMergeKListsSteps } from './advanced-topics/hard-interview/merge-k-sorted-lists-renderer';
import { generateNQueensSteps } from './advanced-topics/hard-interview/n-queens-bitwise-speed-renderer';
import { generateMedianSteps } from './advanced-topics/hard-interview/median-two-sorted-arrays-renderer';

describe('第五阶段入门基础与大厂压轴算法测试 (570 total)', () => {
  // 1. Class 031: 递归序
  describe('Class 031: 递归序与经典递归过程解构', () => {
    it('验证先序、中序、后序在三次到达时收集的正确性', () => {
      const steps = generateRecursionOrderSteps(3);
      expect(steps.length).toBeGreaterThan(0);
      const lastStep = steps[steps.length - 1];
      // 树结构: 1(L: 2(L:4, R:5), R: 3)
      // 先序: 1, 2, 4, 5, 3
      // 中序: 4, 2, 5, 1, 3
      // 后序: 4, 5, 2, 3, 1
      expect(lastStep.preorder).toEqual([1, 2, 4, 5, 3]);
      expect(lastStep.inorder).toEqual([4, 2, 5, 1, 3]);
      expect(lastStep.postorder).toEqual([4, 5, 2, 3, 1]);
    });
  });

  // 2. Class 033: 位图 BitMap
  describe('Class 033: 位图 BitMap 的实现与海量数据去重', () => {
    it('验证位图的添加、查询与抹除按位操作', () => {
      const ops = [
        { type: 'add' as const, num: 3 },
        { type: 'add' as const, num: 35 }, // 跨入第二个 32 位整型桶
        { type: 'contains' as const, num: 3 },
        { type: 'contains' as const, num: 35 },
        { type: 'contains' as const, num: 10 },
        { type: 'remove' as const, num: 3 },
        { type: 'contains' as const, num: 3 },
      ];
      const steps = generateBitMapSteps(63, ops);
      expect(steps.length).toBe(ops.length + 1);

      // 查询 3 存在
      expect(steps[3].queryResult).toBe(true);
      // 查询 35 存在 (属于 bucket 1)
      expect(steps[4].queryResult).toBe(true);
      expect(steps[4].bucketIndex).toBe(1);
      // 查询 10 不存在
      expect(steps[5].queryResult).toBe(false);
      // 删除 3 之后再查 3
      expect(steps[7].queryResult).toBe(false);
    });
  });

  // 3. Class 035: 不均匀随机发生器向等概率转化
  describe('Class 035: 不均匀随机发生器向等概率转化模型', () => {
    it('验证独立双掷对称消除并拼装出 [1, 7] 目标随机数', () => {
      const steps = generateRandomGenSteps(3);
      expect(steps.length).toBeGreaterThan(0);
      const lastStep = steps[steps.length - 1];
      expect(lastStep.finalResult).toBeGreaterThanOrEqual(1);
      expect(lastStep.finalResult).toBeLessThanOrEqual(7);
    });
  });

  // 4. Class 038: 经典递归向 DP 四段式演进
  describe('Class 038: 经典递归向记忆化搜索与动态规划初步转换', () => {
    it('验证严格表填表阶段计算 f(6) = 8', () => {
      const steps = generateRecursionToDpSteps(6, 'tab');
      const lastStep = steps[steps.length - 1];
      expect(lastStep.dpTable[6]).toBe(8);
    });

    it('验证空间压缩阶段计算 f(6) = 8', () => {
      const steps = generateRecursionToDpSteps(6, 'rolling');
      const lastStep = steps[steps.length - 1];
      expect(lastStep.rollingVars?.cur).toBe(8);
    });
  });

  // 5. Hard 17: 柱状图中最大的矩形
  describe('Hard 17: 柱状图中最大的矩形 (LeetCode 84)', () => {
    it('验证单调递增栈计算 [2, 1, 5, 6, 2, 3] 的最大矩形面积 (应为 10)', () => {
      const heights = [2, 1, 5, 6, 2, 3];
      const steps = generateHistogramSteps(heights);
      const lastStep = steps[steps.length - 1];
      expect(lastStep.maxArea).toBe(10); // 5 和 6 组成的矩形面积为 5 * 2 = 10
    });
  });

  // 6. Hard 18: 合并 K 个升序链表
  describe('Hard 18: 合并 K 个升序链表 (LeetCode 23)', () => {
    it('小根堆多路归并 [[1,4,5], [1,3,4], [2,6]]', () => {
      const lists = [[1, 4, 5], [1, 3, 4], [2, 6]];
      const steps = generateMergeKListsSteps(lists);
      const lastStep = steps[steps.length - 1];
      expect(lastStep.merged).toEqual([1, 1, 2, 3, 4, 4, 5, 6]);
    });
  });

  // 7. Hard 19: N 皇后极速位运算解法
  describe('Hard 19: N 皇后极速位运算解法 (LeetCode 51/52)', () => {
    it('计算 4 皇后的全部合法解 (共 2 组)', () => {
      const steps = generateNQueensSteps(4);
      const lastStep = steps[steps.length - 1];
      expect(lastStep.totalSolutions).toBe(2);
    });

    it('计算 5 皇后的全部合法解 (共 10 组)', () => {
      const steps = generateNQueensSteps(5);
      const lastStep = steps[steps.length - 1];
      expect(lastStep.totalSolutions).toBe(10);
    });
  });

  // 8. Hard 20: 寻找两个正序数组的中位数
  describe('Hard 20: 寻找两个正序数组的中位数 (LeetCode 4)', () => {
    it('奇数总长用例: [1, 3] 与 [2] (中位数应为 2.0)', () => {
      const steps = generateMedianSteps([1, 3], [2]);
      const lastStep = steps[steps.length - 1];
      expect(lastStep.medianResult).toBe(2.0);
    });

    it('偶数总长用例: [1, 2] 与 [3, 4] (中位数应为 2.5)', () => {
      const steps = generateMedianSteps([1, 2], [3, 4]);
      const lastStep = steps[steps.length - 1];
      expect(lastStep.medianResult).toBe(2.5);
    });
  });
});
