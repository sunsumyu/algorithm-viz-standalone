/**
 * 左神算法通关课 Class 108 ~ 116 高阶区间数据结构专题自动化测试套件
 */

import { describe, it, expect } from 'vitest';
import { buildFenwickTreeSteps, lowbit } from './fenwick-tree-renderer';
import { buildFenwickInversionSteps, discretize } from './fenwick-inversion-renderer';
import { buildSegmentTreeSteps } from './segment-tree-renderer';
import { buildDynamicSegTreeSteps } from './dynamic-segment-tree-renderer';
import { buildIntervalMergeSteps } from './interval-merge-segment-tree-renderer';
import { buildSweepLineSteps } from './sweep-line-renderer';
import {
  FENWICK_TREE_CODES,
  FENWICK_INVERSION_CODES,
  SEGMENT_TREE_CODES,
  DYNAMIC_SEGMENT_TREE_CODES,
  INTERVAL_MERGE_SEGMENT_TREE_CODES,
  SWEEP_LINE_CODES,
} from './tree-108-116-stage-codes';

function verify1BasedCodeLines(steps: any[], codes: Record<string, string[]>) {
  expect(steps.length).toBeGreaterThan(0);
  for (const step of steps) {
    if (step.codeLine) {
      for (const lang of ['java', 'cpp', 'python', 'javascript']) {
        const line = step.codeLine[lang];
        expect(line, `Missing line mapping for ${lang}`).toBeDefined();
        expect(line, `Line must be >= 1 for ${lang}`).toBeGreaterThanOrEqual(1);
        expect(line, `Line ${line} exceeds code length ${codes[lang].length} for ${lang}`).toBeLessThanOrEqual(codes[lang].length);
      }
    }
  }
}

describe('左神高阶区间数据结构专题 (Class 108 ~ 116) 综合测试套件', () => {
  // 1. Class 108: Fenwick Tree
  describe('Class 108: 树状数组核心原理', () => {
    it('lowbit 计算应准确提取最低位 1', () => {
      expect(lowbit(6)).toBe(2);
      expect(lowbit(8)).toBe(8);
      expect(lowbit(7)).toBe(1);
    });

    it('树状数组单点累加与前缀和查询应准确且满足 1-based 行号', () => {
      const nums = [1, 3, 5, 7, 9, 11];
      const querySteps = buildFenwickTreeSteps(nums, 'query', 4);
      const lastQuery = querySteps[querySteps.length - 1];
      expect(lastQuery.currentSum).toBe(1 + 3 + 5 + 7); // 16
      verify1BasedCodeLines(querySteps, FENWICK_TREE_CODES);

      const addSteps = buildFenwickTreeSteps(nums, 'add', 3, 5);
      verify1BasedCodeLines(addSteps, FENWICK_TREE_CODES);
    });
  });

  // 2. Class 109: Fenwick Inversion
  describe('Class 109: 树状数组求逆序对数', () => {
    it('应正确离散化排名并求出序列逆序对总数', () => {
      const nums = [5, 4, 2, 6, 3, 1];
      const ranks = discretize(nums);
      expect(ranks).toEqual([5, 4, 2, 6, 3, 1]);

      const steps = buildFenwickInversionSteps(nums);
      const lastStep = steps[steps.length - 1];
      // 逆序对: (5,4),(5,2),(5,3),(5,1),(4,2),(4,3),(4,1),(2,1),(6,3),(6,1),(3,1) -> 11 pairs
      expect(lastStep.totalInversions).toBe(11);
      verify1BasedCodeLines(steps, FENWICK_INVERSION_CODES);
    });

    it('已升序数组逆序对数应为 0', () => {
      const steps = buildFenwickInversionSteps([1, 2, 3, 4, 5]);
      expect(steps[steps.length - 1].totalInversions).toBe(0);
    });
  });

  // 3. Class 110: Segment Tree Lazy
  describe('Class 110: 经典线段树与懒标记', () => {
    it('区间修改与懒标记下传计算应准确', () => {
      const nums = [1, 2, 3, 4, 5, 6, 7, 8];
      const steps = buildSegmentTreeSteps(nums, 2, 5, 3);
      const lastStep = steps[steps.length - 1];
      // 原区间和 [2..5] 为 2+3+4+5=14，每个加 3 后加 12，全树增加 12
      // 原总和 36 -> 48
      const rootNode = lastStep.nodes.find(n => n.id === 1);
      expect(rootNode?.val).toBe(48);
      verify1BasedCodeLines(steps, SEGMENT_TREE_CODES);
    });
  });

  // 4. Class 111: Dynamic Segment Tree
  describe('Class 111: 动态开点线段树', () => {
    it('在超大值域下应仅按需开辟少数节点', () => {
      const steps = buildDynamicSegTreeSteps(120, 350, 5, 10000);
      const lastStep = steps[steps.length - 1];
      expect(lastStep.totalAllocated).toBeLessThan(100);
      verify1BasedCodeLines(steps, DYNAMIC_SEGMENT_TREE_CODES);
    });
  });

  // 5. Class 113: Interval Merge
  describe('Class 113: 区间合并线段树', () => {
    it('应准确计算最大连续子段和', () => {
      // 经典最大子段: [2, -4, 3, -1, 2, -3, 4, -1] -> [3, -1, 2, -3, 4] = 5
      const nums = [2, -4, 3, -1, 2, -3, 4, -1];
      const steps = buildIntervalMergeSteps(nums);
      const lastStep = steps[steps.length - 1];
      expect(lastStep.bestMaxSum).toBe(5);
      verify1BasedCodeLines(steps, INTERVAL_MERGE_SEGMENT_TREE_CODES);
    });
  });

  // 6. Class 115: Sweep Line
  describe('Class 115: 扫描线求矩形面积并', () => {
    it('单矩形面积计算正确', () => {
      const steps = buildSweepLineSteps([{ x1: 0, y1: 0, x2: 10, y2: 10 }]);
      expect(steps[steps.length - 1].totalArea).toBe(100);
      verify1BasedCodeLines(steps, SWEEP_LINE_CODES);
    });

    it('重叠矩形并集面积计算正确', () => {
      // 两个 10x10 矩形，重叠 5x5: [0,0,10,10] 和 [5,5,15,15] -> 100 + 100 - 25 = 175
      const steps = buildSweepLineSteps([
        { x1: 0, y1: 0, x2: 10, y2: 10 },
        { x1: 5, y1: 5, x2: 15, y2: 15 },
      ]);
      expect(steps[steps.length - 1].totalArea).toBe(175);
    });
  });
});
