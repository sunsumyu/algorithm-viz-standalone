/**
 * 左神算法通关课【入门篇】与【大厂高频真题】第二弹综合测试套件
 * 涵盖：
 * 1. Class 006: 经典单双链表基本功与队列栈 (linked-list-basics-006)
 * 2. Class 021: 二叉树序列化与反序列化 (tree-serialization-021)
 * 3. Class 024: 荷兰国旗问题与三向切分 (netherlands-flag-024)
 * 4. Class 030: 递归子序列与去重全排列 (permutations-subsequences-030)
 * 5. Hard 05: 戳气球 (burst-balloons, LC 312)
 * 6. Hard 06: 正则表达式匹配 (regex-matching, LC 10)
 * 7. Hard 07: 柱状图与矩阵最大矩形 (maximal-rectangle, LC 84 & 85)
 * 8. Hard 08: 最小覆盖子串 (min-window-substring, LC 76)
 */

import { describe, it, expect } from 'vitest';
import { buildLinkedList006Steps } from './linked-list/linked-list-basics-006-renderer';
import { buildSerialization021Steps } from './tree/tree-serialization-021-renderer';
import { buildNetherlands024Steps } from './sort/netherlands-flag-024-renderer';
import { buildPermutation030Steps } from './backtracking/permutations-subsequences-030-renderer';

import { generateBurstBalloonsSteps } from './advanced-topics/hard-interview/burst-balloons-renderer';
import { generateRegexSteps } from './advanced-topics/hard-interview/regex-matching-renderer';
import { generateMaximalRectangleSteps } from './advanced-topics/hard-interview/maximal-rectangle-renderer';
import { generateMinWindowSteps } from './advanced-topics/hard-interview/min-window-substring-renderer';

describe('左神《入门篇》与《大厂压轴真题》第二弹综合测试套件', () => {
  // 1. Class 006: 链表基本功
  describe('Class 006: 链表基本功与栈队列实现', () => {
    it('单链表反转应成功调转所有 next 指针', () => {
      const steps = buildLinkedList006Steps([1, 2, 3], 'reverse');
      const finalStep = steps[steps.length - 1];
      expect(finalStep.headId).toBe(3);
    });

    it('删除指定值节点应准确剥离所有命中元素', () => {
      const steps = buildLinkedList006Steps([2, 1, 2, 3, 2], 'deleteVal', 2);
      const finalStep = steps[steps.length - 1];
      const remainingVals = finalStep.nodes.filter(n => !n.isDeleted).map(n => n.val);
      expect(remainingVals).toEqual([1, 3]);
    });
  });

  // 2. Class 021: 二叉树序列化与反序列化
  describe('Class 021: 二叉树序列化与反序列化', () => {
    it('先序序列化应完整保留 # 标记且反序列化重建一致', () => {
      const steps = buildSerialization021Steps('preorder');
      const finalStep = steps[steps.length - 1];
      expect(finalStep.tokensStream).toEqual(['1', '2', '4', '#', '#', '#', '3', '#', '5', '#', '#']);
      expect(finalStep.reconstructedTree.length).toBe(5);
    });
  });

  // 3. Class 024: 荷兰国旗三向切分
  describe('Class 024: 荷兰国旗问题与三向切分', () => {
    it('三向切分后应保证小于区、等于区、大于区严格有序', () => {
      const raw = [3, 5, 2, 6, 3, 1, 7, 3, 4];
      const target = 3;
      const steps = buildNetherlands024Steps(raw, target);
      const finalStep = steps[steps.length - 1];
      const { nums, less, more } = finalStep;

      for (let i = 0; i <= less; i++) {
        expect(nums[i]).toBeLessThan(target);
      }
      for (let i = less + 1; i < more; i++) {
        expect(nums[i]).toBe(target);
      }
      for (let i = more; i < nums.length; i++) {
        expect(nums[i]).toBeGreaterThan(target);
      }
    });
  });

  // 4. Class 030: 递归子序列与全排列
  describe('Class 030: 递归子序列与去重全排列', () => {
    it('3 字符子序列生成恰好 2^3 = 8 个子序列', () => {
      const steps = buildPermutation030Steps('abc', 'subsequence');
      const finalStep = steps[steps.length - 1];
      expect(finalStep.results.length).toBe(8);
    });

    it('3 字符互异字符串生成恰好 3! = 6 个全排列', () => {
      const steps = buildPermutation030Steps('abc', 'permutation');
      const finalStep = steps[steps.length - 1];
      expect(finalStep.results.length).toBe(6);
    });
  });

  // 5. Hard 05: 戳气球 (LeetCode 312)
  describe('大厂真题 05: 戳气球 (Burst Balloons)', () => {
    it('经典 [3, 1, 5, 8] 气球序列最优金币应为 167', () => {
      const steps = generateBurstBalloonsSteps([3, 1, 5, 8]);
      const finalStep = steps[steps.length - 1];
      expect(finalStep.maxScore).toBe(167);
    });
  });

  // 6. Hard 06: 正则表达式匹配 (LeetCode 10)
  describe('大厂真题 06: 正则表达式匹配 (Regex Matching)', () => {
    it('支持 . 和 * 字符的复杂匹配模式', () => {
      const stepsTrue = generateRegexSteps('aab', 'c*a*b');
      expect(stepsTrue[stepsTrue.length - 1].matched).toBe(true);

      const stepsFalse = generateRegexSteps('mississippi', 'mis*is*p*.');
      expect(stepsFalse[stepsFalse.length - 1].matched).toBe(false);
    });
  });

  // 7. Hard 07: 柱状图与矩阵最大矩形 (LeetCode 84 & 85)
  describe('大厂真题 07: 柱状图与矩阵最大矩形 (Maximal Rectangle)', () => {
    it('二维 01 矩阵能求出最大全 1 矩形面积', () => {
      const matrix = [
        ['1', '0', '1', '0', '0'],
        ['1', '0', '1', '1', '1'],
        ['1', '1', '1', '1', '1'],
        ['1', '0', '0', '1', '0'],
      ];
      const steps = generateMaximalRectangleSteps(matrix);
      const finalStep = steps[steps.length - 1];
      expect(finalStep.maxArea).toBe(6);
    });
  });

  // 8. Hard 08: 最小覆盖子串 (LeetCode 76)
  describe('大厂真题 08: 最小覆盖子串 (Minimum Window Substring)', () => {
    it('欠账表模型在 O(N) 线性时间精确求得 BANC', () => {
      const steps = generateMinWindowSteps('ADOBECODEBANC', 'ABC');
      const finalStep = steps[steps.length - 1];
      expect(finalStep.bestSubstr).toBe('BANC');
    });
  });
});
