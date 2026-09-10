/**
 * 第四阶段算法测试套件：4 门经典必修基础课 + 4 门大厂压轴高频题
 * 1. Class 007: 循环双端队列设计 (circular-deque-007)
 * 2. Class 022: 归并排序与小和问题 (merge-sort-small-sum-022)
 * 3. Class 026: 手写加强堆结构 (heap-greater-026)
 * 4. Class 028: 基数排序与按位分桶 (radix-sort-028)
 * 5. Hard 13: 城市天际线问题 (the-skyline-problem)
 * 6. Hard 14: 自由之路环形 DP (freedom-trail-ring-dp)
 * 7. Hard 15: 串联所有单词的子串 (substring-concatenation-words)
 * 8. Hard 16: 表达式添加运算符 (expression-add-operators)
 */

import { describe, it, expect } from 'vitest';
import { generateCircularDequeSteps } from './queue/circular-deque-007-renderer';
import { generateSmallSumSteps } from './sort/merge-sort-small-sum-022-renderer';
import { generateHeapGreaterSteps } from './heap/heap-greater-026-renderer';
import { generateRadixSortSteps } from './sort/radix-sort-028-renderer';
import { generateSkylineSteps } from './advanced-topics/hard-interview/the-skyline-problem-renderer';
import { generateFreedomTrailSteps } from './advanced-topics/hard-interview/freedom-trail-renderer';
import { generateSubstringSteps } from './advanced-topics/hard-interview/substring-concatenation-renderer';
import { generateExpressionSteps } from './advanced-topics/hard-interview/expression-add-operators-renderer';

describe('第四阶段入门必修与大厂压轴算法测试 (562 total)', () => {
  // 1. Class 007: 循环双端队列
  describe('Class 007: 循环双端队列设计', () => {
    it('验证循环双端队列的增删与满/空边界控制', () => {
      const ops: Array<{ op: 'insertFront' | 'insertLast' | 'deleteFront' | 'deleteLast'; val?: number }> = [
        { op: 'insertLast', val: 1 },
        { op: 'insertLast', val: 2 },
        { op: 'insertFront', val: 3 },
        { op: 'deleteLast' }
      ];
      const steps = generateCircularDequeSteps(3, ops);
      expect(steps.length).toBeGreaterThan(0);
      const lastStep = steps[steps.length - 1];
      expect(lastStep.size).toBe(2);
      expect(lastStep.resultStatus).toBe(true);
    });
  });

  // 2. Class 022: 归并小和
  describe('Class 022: 归并排序与小和问题', () => {
    it('计算 [1, 3, 4, 2, 5] 的全局小和 (应为 16)', () => {
      const arr = [1, 3, 4, 2, 5];
      const steps = generateSmallSumSteps(arr);
      const lastStep = steps[steps.length - 1];
      expect(lastStep.totalSmallSum).toBe(16);
      expect(lastStep.arr).toEqual([1, 2, 3, 4, 5]);
    });
  });

  // 3. Class 026: 手写加强堆
  describe('Class 026: 手写加强堆结构', () => {
    it('验证加强堆反向索引与 resign 动态调整', () => {
      const actions: Array<{ type: 'push' | 'resign' | 'remove'; id: string; val?: number }> = [
        { type: 'push', id: 'A', val: 10 },
        { type: 'push', id: 'B', val: 20 },
        { type: 'resign', id: 'A', val: 50 } // A 变大，上浮为堆顶
      ];
      const steps = generateHeapGreaterSteps(actions);
      const lastStep = steps[steps.length - 1];
      expect(lastStep.heap[0].id).toBe('A');
      expect(lastStep.heap[0].val).toBe(50);
      expect(lastStep.indexMap['A']).toBe(0);
    });
  });

  // 4. Class 028: 基数排序
  describe('Class 028: 基数排序与按位分桶', () => {
    it('按位非比较线性排序 [17, 13, 25, 100, 72, 36, 54]', () => {
      const nums = [17, 13, 25, 100, 72, 36, 54];
      const steps = generateRadixSortSteps(nums);
      const lastStep = steps[steps.length - 1];
      expect(lastStep.arr).toEqual([13, 17, 25, 36, 54, 72, 100]);
    });
  });

  // 5. Hard 13: 城市天际线
  describe('Hard 13: 城市天际线问题', () => {
    it('扫描线轮廓转折点计算', () => {
      const buildings: [number, number, number][] = [
        [2, 9, 10], [3, 7, 15], [5, 12, 12], [15, 20, 10], [19, 24, 8]
      ];
      const steps = generateSkylineSteps(buildings);
      const lastStep = steps[steps.length - 1];
      expect(lastStep.skylinePoints.length).toBeGreaterThan(0);
      expect(lastStep.skylinePoints[0]).toEqual([2, 10]);
    });
  });

  // 6. Hard 14: 自由之路
  describe('Hard 14: 自由之路环形 DP', () => {
    it('计算转盘拼写最少旋转与按键步数', () => {
      const steps = generateFreedomTrailSteps('godding', 'gd');
      const lastStep = steps[steps.length - 1];
      expect(lastStep.accumulatedSteps).toBe(4); // 初始对准g(1步按)+逆时针转1步到d(1步转+1步按)+... = 4
    });
  });

  // 7. Hard 15: 串联所有单词的子串
  describe('Hard 15: 串联所有单词的子串', () => {
    it('步长分组滑动窗口寻找起始索引', () => {
      const s = 'barfoothefoobarman';
      const words = ['foo', 'bar'];
      const steps = generateSubstringSteps(s, words);
      const lastStep = steps[steps.length - 1];
      expect(lastStep.matchedIndices).toEqual([0, 9]);
    });
  });

  // 8. Hard 16: 表达式添加运算符
  describe('Hard 16: 表达式添加运算符', () => {
    it('123 达成 target 6 (乘法优先级与回溯)', () => {
      const steps = generateExpressionSteps('123', 6);
      const lastStep = steps[steps.length - 1];
      expect(lastStep.solutions).toContain('1+2+3');
      expect(lastStep.solutions).toContain('1*2*3');
    });
  });
});
