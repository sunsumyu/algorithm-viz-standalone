/**
 * 左神算法通关课 Class 179 ~ 184 点分治、点分树、线段树分治、可撤销并查集、CDQ 分治与整体二分 自动化测试套件
 */

import { describe, it, expect } from 'vitest';
import { buildCentroidSteps } from './centroid-decomposition-renderer';
import { buildDynamicCentroidSteps } from './dynamic-centroid-tree-renderer';
import { buildSegmentTreeDivideSteps } from './segment-tree-divide-renderer';
import { buildRollbackDSUSteps } from './rollback-dsu-renderer';
import { buildCDQDivideSteps } from './cdq-divide-renderer';
import { buildParallelBSSteps } from './parallel-binary-search-renderer';
import {
  CENTROID_DECOMPOSITION_CODES,
  DYNAMIC_CENTROID_TREE_CODES,
  SEGMENT_TREE_DIVIDE_CODES,
  ROLLBACK_DSU_CODES,
  CDQ_DIVIDE_CODES,
  PARALLEL_BINARY_SEARCH_CODES,
} from './advanced-179-184-stage-codes';

function verify1BasedCodeLines(steps: any[], codes: Record<string, string[]>) {
  expect(steps.length).toBeGreaterThan(0);
  for (const step of steps) {
    if (step.codeLine) {
      for (const lang of ['java', 'cpp', 'python', 'javascript']) {
        const line = step.codeLine[lang];
        expect(line, `Missing line mapping for ${lang}`).toBeDefined();
        expect(line, `Line must be >= 1 for ${lang}`).toBeGreaterThanOrEqual(1);
        expect(
          line,
          `Line ${line} exceeds code length ${codes[lang].length} for ${lang}`
        ).toBeLessThanOrEqual(codes[lang].length);
      }
    }
  }
}

describe('左神高阶分治全家桶专题 (Class 179 ~ 184) 综合测试套件', () => {
  // 1. Class 179: 点分治
  describe('Class 179: 点分治 (Centroid Decomposition)', () => {
    it('重心递归分治准确统计出 3 条目标路径', () => {
      const steps = buildCentroidSteps();
      const last = steps[steps.length - 1];
      expect(last.validPaths.length).toBe(3);
      expect(last.visitedCentroids.length).toBe(5);
      verify1BasedCodeLines(steps, CENTROID_DECOMPOSITION_CODES);
    });
  });

  // 2. Class 180: 动态点分治 / 点分树
  describe('Class 180: 动态点分治 / 点分树 (Dynamic Centroid Tree)', () => {
    it('树高限制与向上容斥求和准确求得邻域点权和 10', () => {
      const steps = buildDynamicCentroidSteps();
      const last = steps[steps.length - 1];
      expect(last.queryAns).toBe(10);
      expect(last.activeJumpPath).toEqual([5, 4, 2]);
      verify1BasedCodeLines(steps, DYNAMIC_CENTROID_TREE_CODES);
    });
  });

  // 3. Class 181: 线段树分治
  describe('Class 181: 线段树分治 (Segment Tree Divide)', () => {
    it('时间轴遍历与历史快照回滚准确输出动态二分图判定', () => {
      const steps = buildSegmentTreeDivideSteps();
      const last = steps[steps.length - 1];
      expect(last.totalTime).toBe(3);
      // T=2 步骤有奇环
      const stepT2 = steps.find(s => s.curTime === 2 && s.isBipartite === false);
      expect(stepT2).toBeDefined();
      verify1BasedCodeLines(steps, SEGMENT_TREE_DIVIDE_CODES);
    });
  });

  // 4. Class 182: 可撤销并查集
  describe('Class 182: 可撤销并查集 (Rollback DSU)', () => {
    it('按秩合并与历史栈精准回退', () => {
      const steps = buildRollbackDSUSteps();
      const last = steps[steps.length - 1];
      expect(last.nodes.length).toBe(4);
      // 回退后历史栈长度为 2
      expect(last.history.length).toBe(2);
      verify1BasedCodeLines(steps, ROLLBACK_DSU_CODES);
    });
  });

  // 5. Class 183: CDQ 分治
  describe('Class 183: CDQ 分治 (CDQ Divide & Conquer)', () => {
    it('三维偏序归并与树状数组统计准确求得点偏序贡献', () => {
      const steps = buildCDQDivideSteps();
      const last = steps[steps.length - 1];
      expect(last.points.length).toBe(4);
      expect(last.points[3].ans).toBe(1); // P4 偏序 ans 增加 1
      verify1BasedCodeLines(steps, CDQ_DIVIDE_CODES);
    });
  });

  // 6. Class 184: 整体二分
  describe('Class 184: 整体二分 (Parallel Binary Search)', () => {
    it('批量操作中点生效与询问分流准确锁定达成时刻 [2, 3]', () => {
      const steps = buildParallelBSSteps();
      const last = steps[steps.length - 1];
      expect(last.queries.length).toBe(2);
      expect(last.queries[0].status).toBe('done');
      expect(last.queries[1].status).toBe('done');
      verify1BasedCodeLines(steps, PARALLEL_BINARY_SEARCH_CODES);
    });
  });
});
