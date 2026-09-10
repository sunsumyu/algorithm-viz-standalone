/**
 * 左神算法通关课 Class 117 ~ 123 倍增与树上高阶问题专题综合自动化测试套件
 */

import { describe, it, expect } from 'vitest';
import { buildSparseTableSteps } from './sparse-table-renderer';
import { buildTreeLcaSteps } from './tree-lca-renderer';
import { buildTreeCentroidSteps } from './tree-centroid-renderer';
import { buildHldSteps } from './hld-renderer';
import { buildTreeDiffSteps } from './tree-difference-renderer';
import { buildTreeDiameterSteps } from './tree-diameter-renderer';
import {
  SPARSE_TABLE_CODES,
  TREE_LCA_CODES,
  TREE_CENTROID_CODES,
  HLD_CODES,
  TREE_DIFFERENCE_CODES,
  TREE_DIAMETER_CODES,
} from './tree-117-123-stage-codes';

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

describe('左神倍增与树上高阶问题专题 (Class 117 ~ 123) 综合测试套件', () => {
  // 1. Class 117: Sparse Table
  describe('Class 117: ST 表 (Sparse Table) RMQ', () => {
    it('应正确建立倍增矩阵并在 O(1) 内返回区间最值', () => {
      const nums = [3, 2, 4, 5, 6, 8, 1, 2];
      const steps = buildSparseTableSteps(nums, 2, 6);
      expect(steps.length).toBeGreaterThan(0);
      const lastStep = steps[steps.length - 1];
      // 区间 nums[2..6] 即 [4, 5, 6, 8, 1]，最大值为 8
      expect(lastStep.maxAns).toBe(8);
      verify1BasedCodeLines(steps, SPARSE_TABLE_CODES);
    });

    it('单元素区间查询应直接返回该元素', () => {
      const nums = [10, 20, 30];
      const steps = buildSparseTableSteps(nums, 1, 1);
      const lastStep = steps[steps.length - 1];
      expect(lastStep.maxAns).toBe(20);
    });
  });

  // 2. Class 118: Tree LCA
  describe('Class 118: 树上倍增求 LCA', () => {
    const edges: [number, number][] = [
      [1, 2], [1, 3],
      [2, 4], [2, 5],
      [3, 6], [3, 7],
      [5, 8],
    ];

    it('应准确定位两节点的最近公共祖先', () => {
      // 8 的父是 5，5 的父是 2；4 的父是 2 -> LCA(8, 4) = 2
      const steps = buildTreeLcaSteps(edges, 8, 4);
      const lastStep = steps[steps.length - 1];
      expect(lastStep.lcaResult).toBe(2);
      verify1BasedCodeLines(steps, TREE_LCA_CODES);
    });

    it('祖先后代关系应直接返回祖先节点', () => {
      // LCA(8, 2) = 2
      const steps = buildTreeLcaSteps(edges, 8, 2);
      const lastStep = steps[steps.length - 1];
      expect(lastStep.lcaResult).toBe(2);
    });

    it('跨子树查询应正确逼近根节点', () => {
      // LCA(4, 7) = 1
      const steps = buildTreeLcaSteps(edges, 4, 7);
      const lastStep = steps[steps.length - 1];
      expect(lastStep.lcaResult).toBe(1);
    });
  });

  // 3. Class 120: Tree Centroid
  describe('Class 120: 树的重心', () => {
    it('对称树应准确找到树的重心节点且最大连通块不超过 N/2', () => {
      const edges: [number, number][] = [
        [1, 2], [1, 3],
        [2, 4], [2, 5],
        [3, 6], [3, 7],
      ];
      // 节点 1 删除后，左右子树各 3 个点，最大连通块为 3 <= 7/2
      const steps = buildTreeCentroidSteps(edges);
      const lastStep = steps[steps.length - 1];
      expect(lastStep.currentCentroid).toBe(1);
      expect(lastStep.bestMaxPart).toBeLessThanOrEqual(Math.floor(7 / 2));
      verify1BasedCodeLines(steps, TREE_CENTROID_CODES);
    });

    it('链状树应准确找到链的中点作为重心', () => {
      const lineEdges: [number, number][] = [
        [1, 2], [2, 3], [3, 4], [4, 5],
      ];
      const steps = buildTreeCentroidSteps(lineEdges);
      const lastStep = steps[steps.length - 1];
      expect(lastStep.currentCentroid).toBe(3);
    });
  });

  // 4. Class 121: HLD
  describe('Class 121: 重链剖分 / 树链剖分', () => {
    it('应正确通过 DFS 1 统计子树大小并标识重儿子', () => {
      const edges: [number, number][] = [
        [1, 2], [1, 3],
        [2, 4], [2, 5],
        [5, 8],
      ];
      // 节点 1 的两子节点：2 (包含 2,4,5,8 共 4 点) 和 3 (仅 3 共 1 点)
      // 故 1 的重儿子必定是 2
      const steps = buildHldSteps(edges);
      const lastStep = steps[steps.length - 1];
      expect(lastStep.heavyChildMap[1]).toBe(2);
      expect(lastStep.heavyChildMap[2]).toBe(5);
      verify1BasedCodeLines(steps, HLD_CODES);
    });
  });

  // 5. Class 122: Tree Difference
  describe('Class 122: 树上差分', () => {
    it('应通过点差分四点操作和子树前缀和准确恢复全树路径覆盖频次', () => {
      const edges: [number, number][] = [
        [1, 2], [1, 3],
        [2, 4], [2, 5],
        [3, 6], [3, 7],
      ];
      // 覆盖路径 4-7: 经过 4 -> 2 -> 1 -> 3 -> 7
      // 覆盖路径 4-5: 经过 4 -> 2 -> 5
      // 节点 4 被两条路径覆盖，最终权值应为 2
      // 节点 2 被两条路径覆盖，最终权值应为 2
      // 节点 1 仅被 4-7 覆盖，最终权值应为 1
      const steps = buildTreeDiffSteps(edges, [[4, 7], [4, 5]]);
      const lastStep = steps[steps.length - 1];
      expect(lastStep.ansMap[4]).toBe(2);
      expect(lastStep.ansMap[2]).toBe(2);
      expect(lastStep.ansMap[1]).toBe(1);
      verify1BasedCodeLines(steps, TREE_DIFFERENCE_CODES);
    });
  });

  // 6. Class 123: Tree Diameter
  describe('Class 123: 树的直径', () => {
    it('两遍 BFS 应准确确定树的最长简单路径及两端点', () => {
      const edges: [number, number][] = [
        [1, 2], [1, 3],
        [2, 4], [2, 5],
        [3, 6], [3, 7],
        [5, 8],
      ];
      // 最长简单路径：8 -> 5 -> 2 -> 1 -> 3 -> 6 (或 7)，长度为 5 条边
      const steps = buildTreeDiameterSteps(edges, 1);
      const lastStep = steps[steps.length - 1];
      expect(lastStep.diameter).toBe(5);
      expect(lastStep.farthestX).toBeDefined();
      expect(lastStep.farthestY).toBeDefined();
      verify1BasedCodeLines(steps, TREE_DIAMETER_CODES);
    });
  });
});
