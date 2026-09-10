/**
 * 左神算法通关课【入门篇】(Class 004, 005, 017, 020, 027, 029)
 * 与【大厂高频刷题班】压轴真题体系综合测试套件
 */

import { describe, it, expect } from 'vitest';
import { buildSort004Steps } from './sort/sort-basics-004-renderer';
import { buildBinarySearch005Steps } from './search/binary-search-005-renderer';
import { buildTrie017Steps } from './tree/trie-tree-017-renderer';
import { buildTraversal020Steps } from './tree/tree-traversal-iterative-020-renderer';
import { buildMst027Steps } from './graph/mst-kruskal-prim-027-renderer';
import { buildHanoi029Steps } from './backtracking/hanoi-recursion-029-renderer';

import { buildRainWater3DSteps } from './advanced-topics/hard-interview/trapping-rain-water-ii-renderer';
import { generateLFUSteps } from './advanced-topics/hard-interview/lfu-cache-renderer';
import { generateCalculatorSteps } from './advanced-topics/hard-interview/basic-calculator-full-renderer';
import { generateMedianSteps } from './advanced-topics/hard-interview/sliding-window-median-renderer';

describe('左神《入门篇》与《大厂压轴真题》全量综合测试套件', () => {
  // 1. Class 004: 基础排序三剑客
  describe('Class 004: 经典基础排序', () => {
    const raw = [5, 2, 9, 1, 5, 6];
    it('选择排序、冒泡排序、插入排序最终状态均应非降序排列', () => {
      for (const mode of ['selection', 'bubble', 'insertion'] as const) {
        const steps = buildSort004Steps(raw, mode);
        expect(steps.length).toBeGreaterThan(1);
        const finalStep = steps[steps.length - 1];
        for (let i = 0; i < finalStep.nums.length - 1; i++) {
          expect(finalStep.nums[i]).toBeLessThanOrEqual(finalStep.nums[i + 1]);
        }
      }
    });
  });

  // 2. Class 005: 二分搜索三板斧
  describe('Class 005: 二分搜索三板斧', () => {
    it('精确查找应定位正确索引', () => {
      const arr = [1, 3, 5, 7, 9, 11, 13, 15];
      const steps = buildBinarySearch005Steps(arr, 'find', 7);
      const finalStep = steps[steps.length - 1];
      expect(finalStep.foundIndex).toBe(3);
    });

    it('查找 >= target 的最左位置', () => {
      const arr = [2, 3, 5, 5, 5, 6, 8, 9];
      const steps = buildBinarySearch005Steps(arr, 'findLeft', 5);
      const finalStep = steps[steps.length - 1];
      expect(finalStep.foundIndex).toBe(2);
    });

    it('局部最小值二分查找应满足峰谷条件', () => {
      const arr = [9, 7, 5, 6, 8, 4, 3, 10];
      const steps = buildBinarySearch005Steps(arr, 'localMin', 0);
      const finalStep = steps[steps.length - 1];
      const idx = finalStep.foundIndex;
      expect(idx).toBeGreaterThanOrEqual(0);
      const isLeftOk = idx === 0 || arr[idx] < arr[idx - 1];
      const isRightOk = idx === arr.length - 1 || arr[idx] < arr[idx + 1];
      expect(isLeftOk && isRightOk).toBe(true);
    });
  });

  // 3. Class 017: 前缀树
  describe('Class 017: 前缀树结构与计数', () => {
    it('插入与查询应准确统计 pass 与 end 频次', () => {
      const words = ['apple', 'app', 'apply'];
      const stepsWord = buildTrie017Steps(words, 'app', false);
      const finalWordStep = stepsWord[stepsWord.length - 1];
      expect(finalWordStep.resultCount).toBe(1);

      const stepsPrefix = buildTrie017Steps(words, 'app', true);
      const finalPrefixStep = stepsPrefix[stepsPrefix.length - 1];
      expect(finalPrefixStep.resultCount).toBe(3);
    });
  });

  // 4. Class 020: 二叉树非递归遍历
  describe('Class 020: 二叉树非递归遍历', () => {
    it('先序、中序、后序非递归遍历应与标准结果吻合', () => {
      const preSteps = buildTraversal020Steps('preorder');
      const inSteps = buildTraversal020Steps('inorder');
      const postSteps = buildTraversal020Steps('postorder');

      expect(preSteps[preSteps.length - 1].visitedResult).toEqual([1, 2, 4, 5, 3, 6]);
      expect(inSteps[inSteps.length - 1].visitedResult).toEqual([4, 2, 5, 1, 6, 3]);
      expect(postSteps[postSteps.length - 1].visitedResult).toEqual([4, 5, 2, 6, 3, 1]);
    });
  });

  // 5. Class 027: 最小生成树 Kruskal
  describe('Class 027: 最小生成树 Kruskal 算法', () => {
    it('在给定连通图中生成 V-1 条边且不包含自环', () => {
      const edges = [
        { u: 1, v: 2, w: 1 },
        { u: 2, v: 3, w: 2 },
        { u: 1, v: 3, w: 5 },
        { u: 3, v: 4, w: 1 },
        { u: 2, v: 4, w: 4 },
      ];
      const steps = buildMst027Steps(4, edges);
      const finalStep = steps[steps.length - 1];
      expect(finalStep.selectedEdges.length).toBe(3);
      expect(finalStep.totalWeight).toBe(4); // 1 + 2 + 1 = 4
    });
  });

  // 6. Class 029: 汉诺塔宏观递归三部曲
  describe('Class 029: 汉诺塔宏观递归三部曲', () => {
    it('3 盘汉诺塔恰好产生 7 次盘子移动', () => {
      const steps = buildHanoi029Steps(3);
      const finalStep = steps[steps.length - 1];
      expect(finalStep.moveCount).toBe(7);
      expect(finalStep.disksC).toEqual([3, 2, 1]);
    });
  });

  // 7. Hard 01: 3D 接雨水 (LeetCode 407)
  describe('大厂真题 01: 3D 接雨水 (Trapping Rain Water II)', () => {
    it('能够正确计算凹槽封闭区域接水体积', () => {
      const grid = [
        [1, 4, 3, 1, 3, 2],
        [3, 2, 1, 3, 2, 4],
        [2, 3, 3, 2, 3, 1],
      ];
      const steps = buildRainWater3DSteps(grid);
      const finalStep = steps[steps.length - 1];
      expect(finalStep.totalWater).toBe(4);
    });
  });

  // 8. Hard 02: LFU 缓存机制 (LeetCode 460)
  describe('大厂真题 02: LFU 缓存机制 (LFU Cache)', () => {
    it('容量达到上限时淘汰最少频次且最旧键', () => {
      const commands = [
        { type: 'put' as const, k: 1, v: 10 },
        { type: 'put' as const, k: 2, v: 20 },
        { type: 'get' as const, k: 1 }, // 1 频次升至 2
        { type: 'put' as const, k: 3, v: 30 }, // 淘汰 2
        { type: 'get' as const, k: 2 }, // 2 已被淘汰，返回 -1
        { type: 'get' as const, k: 3 }, // 3 命中
      ];
      const steps = generateLFUSteps(2, commands);
      const get2Step = steps.find(s => s.operation === 'GET(2)');
      expect(get2Step?.returnedVal).toBe(-1);
      const get3Step = steps.find(s => s.operation === 'GET(3)');
      expect(get3Step?.returnedVal).toBe(30);
    });
  });

  // 9. Hard 03: 全功能表达式计算器 (LeetCode 772)
  describe('大厂真题 03: 全功能表达式计算器 (Basic Calculator)', () => {
    it('支持加减乘除与括号复合运算', () => {
      const expr = '(2 + 6 * 3) / (4 - 2) + 5';
      const steps = generateCalculatorSteps(expr);
      const finalStep = steps[steps.length - 1];
      // (2 + 18) / 2 + 5 = 20 / 2 + 5 = 10 + 5 = 15
      expect(finalStep.numStack[finalStep.numStack.length - 1]).toBe(15);
    });
  });

  // 10. Hard 04: 滑动窗口中位数 (LeetCode 480)
  describe('大厂真题 04: 滑动窗口中位数 (Sliding Window Median)', () => {
    it('窗口滑动时实时维持中位数准确性', () => {
      const nums = [1, 3, -1, -3, 5, 3, 6, 7];
      const steps = generateMedianSteps(nums, 3);
      const finalStep = steps[steps.length - 1];
      expect(finalStep.mediansResult).toEqual([1, -1, -1, 3, 5, 6]);
    });
  });
});
