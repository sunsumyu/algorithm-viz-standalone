/**
 * 第三阶段算法测试套件：4 门经典必修基础课 + 4 门大厂压轴高频题
 * 1. Class 004: 二分搜索与对数器 (binary-search-logarithmic-004)
 * 2. Class 019: 二叉树高频递归套路 (tree-recursion-patterns-019)
 * 3. Class 025: 大根堆与原地堆排序 (heap-and-heapsort-025)
 * 4. Class 032: 位运算实现加减乘除 (bitwise-arithmetic-032)
 * 5. Hard 09: 股票交易全系列状态机 DP (stock-trading-state-machine)
 * 6. Hard 10: 最长有效括号 (longest-valid-parentheses)
 * 7. Hard 11: 俄罗斯套娃信封问题 (hard-russian-doll-envelopes)
 * 8. Hard 12: 地下城游戏反向 DP (dungeon-game-reverse-dp)
 */

import { describe, it, expect } from 'vitest';
import { generateBinarySearchSteps } from './binary-search/binary-search-logarithmic-004-renderer';
import { generateTreeRecursionSteps } from './tree/tree-recursion-patterns-019-renderer';
import { generateHeapSortSteps } from './heap/heap-and-heapsort-025-renderer';
import { generateBitwiseSteps } from './bit-manipulation/bitwise-arithmetic-032-renderer';
import { generateStockSteps } from './advanced-topics/hard-interview/stock-trading-state-machine-renderer';
import { generateParenthesesSteps } from './advanced-topics/hard-interview/longest-valid-parentheses-renderer';
import { generateRussianDollSteps } from './advanced-topics/hard-interview/russian-doll-envelopes-renderer';
import { generateDungeonSteps } from './advanced-topics/hard-interview/dungeon-game-renderer';

describe('第三阶段入门必修与大厂压轴算法测试 (554 total)', () => {
  // 1. Class 004: 二分搜索
  describe('Class 004: 二分搜索与对数器', () => {
    it('查找 >= target 的最左下标', () => {
      const nums = [1, 2, 2, 4, 4, 4, 7, 8, 9];
      const steps = generateBinarySearchSteps(nums, 4, 'find-leftmost');
      expect(steps.length).toBeGreaterThan(0);
      const lastStep = steps[steps.length - 1];
      expect(lastStep.ansIndex).toBe(3);
    });

    it('无序数组局部最小值二分查找', () => {
      const nums = [9, 7, 6, 8, 5, 4, 3, 6, 7];
      const steps = generateBinarySearchSteps(nums, 0, 'local-minimum');
      const lastStep = steps[steps.length - 1];
      expect(lastStep.ansIndex).toBeGreaterThanOrEqual(0);
      const idx = lastStep.ansIndex;
      if (idx > 0 && idx < nums.length - 1) {
        expect(nums[idx]).toBeLessThan(nums[idx - 1]);
        expect(nums[idx]).toBeLessThan(nums[idx + 1]);
      }
    });
  });

  // 2. Class 019: 二叉树递归套路
  describe('Class 019: 二叉树高频递归套路', () => {
    it('平衡二叉树递归判定', () => {
      const balancedNodes = [
        { id: 1, val: 1, left: 2, right: 3 },
        { id: 2, val: 2 },
        { id: 3, val: 3 }
      ];
      const steps = generateTreeRecursionSteps(balancedNodes);
      const lastStep = steps[steps.length - 1];
      expect(lastStep.collectedInfo.isBalanced).toBe(true);
      expect(lastStep.collectedInfo.height).toBe(2);
    });
  });

  // 3. Class 025: 堆与堆排序
  describe('Class 025: 大根堆与原地堆排序', () => {
    it('验证无序数组的原地堆排序', () => {
      const arr = [4, 10, 3, 5, 1, 8, 2];
      const steps = generateHeapSortSteps(arr);
      const lastStep = steps[steps.length - 1];
      expect(lastStep.arr).toEqual([1, 2, 3, 4, 5, 8, 10]);
    });
  });

  // 4. Class 032: 位运算实现加减乘除
  describe('Class 032: 位运算实现加减乘除', () => {
    it('位运算加法 19 + 13 = 32', () => {
      const steps = generateBitwiseSteps(19, 13, 'add');
      const lastStep = steps[steps.length - 1];
      expect(lastStep.currentResult).toBe(32);
    });

    it('位运算乘法 7 * 6 = 42', () => {
      const steps = generateBitwiseSteps(7, 6, 'multiply');
      const lastStep = steps[steps.length - 1];
      expect(lastStep.currentResult).toBe(42);
    });
  });

  // 5. Hard 09: 股票状态机 DP
  describe('Hard 09: 股票交易全系列状态机 DP', () => {
    it('含冷冻期的最大利润 [1, 2, 3, 0, 2]', () => {
      const prices = [1, 2, 3, 0, 2];
      const steps = generateStockSteps(prices);
      const lastStep = steps[steps.length - 1];
      expect(lastStep.bestProfit).toBe(3);
    });
  });

  // 6. Hard 10: 最长有效括号
  describe('Hard 10: 最长有效括号', () => {
    it('计算 )()()) 的最长有效长度', () => {
      const steps = generateParenthesesSteps(')()())');
      const lastStep = steps[steps.length - 1];
      expect(lastStep.maxLen).toBe(4);
    });

    it('计算 (()()) 的嵌套最长有效长度', () => {
      const steps = generateParenthesesSteps('(()())');
      const lastStep = steps[steps.length - 1];
      expect(lastStep.maxLen).toBe(6);
    });
  });

  // 7. Hard 11: 俄罗斯套娃信封
  describe('Hard 11: 俄罗斯套娃信封问题', () => {
    it('二维套娃嵌套计算 LIS', () => {
      const envs: [number, number][] = [[5, 4], [6, 4], [6, 7], [2, 3]];
      const steps = generateRussianDollSteps(envs);
      const lastStep = steps[steps.length - 1];
      expect(lastStep.maxEnvelopes).toBe(3); // [2,3] -> [5,4] -> [6,7]
    });
  });

  // 8. Hard 12: 地下城游戏
  describe('Hard 12: 地下城游戏反向 DP', () => {
    it('计算骑士救公主所需最低初始生命值', () => {
      const dungeon = [
        [-2, -3, 3],
        [-5, -10, 1],
        [10, 30, -5]
      ];
      const steps = generateDungeonSteps(dungeon);
      const lastStep = steps[steps.length - 1];
      expect(lastStep.dp[0][0]).toBe(7);
    });
  });
});
