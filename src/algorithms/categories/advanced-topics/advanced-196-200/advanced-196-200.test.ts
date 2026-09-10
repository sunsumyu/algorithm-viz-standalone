/**
 * 左神算法通关课 Class 196 ~ 200 线段树优化建图、主席树优化建图、CDQ分治优化建图、基环树与仙人掌图 自动化测试套件
 */

import { describe, it, expect } from 'vitest';
import { buildSegmentTreeGraphSteps } from './segment-tree-graph-renderer';
import { buildPersistentGraphSteps } from './persistent-segment-tree-graph-renderer';
import { buildCDQGraphSteps } from './cdq-graph-optimization-renderer';
import { buildPseudotreeDPSteps } from './pseudotree-dp-renderer';
import { buildCactusGraphDPSteps } from './cactus-graph-dp-renderer';
import {
  SEGMENT_TREE_GRAPH_CODES,
  PERSISTENT_GRAPH_CODES,
  CDQ_GRAPH_CODES,
  PSEUDOTREE_DP_CODES,
  CACTUS_GRAPH_DP_CODES,
} from './advanced-196-200-stage-codes';

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

describe('左神高阶优化建图、基环树与仙人掌图 (Class 196 ~ 200) 终极大课测试套件', () => {
  // 1. Class 196: 线段树优化建图
  describe('Class 196: 线段树优化建图 (Segment Tree Graph)', () => {
    it('双线段树完成区间向点与点向区间连边，最短路求解正确', () => {
      const steps = buildSegmentTreeGraphSteps();
      const last = steps[steps.length - 1];
      expect(last.edgeCountStats.optimized).toBe(10);
      expect(last.leaves[2].dist).toBe(5); // 点 3 最短距离
      expect(last.leaves[3].dist).toBe(2); // 点 4 最短距离
      verify1BasedCodeLines(steps, SEGMENT_TREE_GRAPH_CODES);
    });
  });

  // 2. Class 197: 主席树/可持久化优化建图
  describe('Class 197: 主席树/可持久化优化建图 (Persistent Graph)', () => {
    it('动态开点版本树正确建立历史前缀连边与拓扑验证', () => {
      const steps = buildPersistentGraphSteps();
      const last = steps[steps.length - 1];
      expect(last.versions.length).toBe(3);
      expect(last.linkedTarget?.hitNodes).toContain('N2[1..5]');
      verify1BasedCodeLines(steps, PERSISTENT_GRAPH_CODES);
    });
  });

  // 3. Class 198: CDQ 分治优化建图
  describe('Class 198: CDQ 分治优化建图 (CDQ Graph)', () => {
    it('CDQ 递归跨区间建边并通过前缀虚点链实现边数优化', () => {
      const steps = buildCDQGraphSteps();
      const last = steps[steps.length - 1];
      expect(last.stats.totalEdges).toBe(5);
      expect(last.prefixNodes.length).toBe(2);
      verify1BasedCodeLines(steps, CDQ_GRAPH_CODES);
    });
  });

  // 4. Class 199: 基环树与基环树 DP
  describe('Class 199: 基环树与基环树 DP (Pseudotree DP)', () => {
    it('拓扑剥皮分离基环与外挂子树，断边两次 DP 正确求得最大权独立集', () => {
      const steps = buildPseudotreeDPSteps();
      const last = steps[steps.length - 1];
      expect(last.cycleNodes).toEqual([1, 2, 3]);
      expect(last.schemes?.planA.bestVal).toBe(45);
      expect(last.schemes?.planB.bestVal).toBe(40);
      verify1BasedCodeLines(steps, PSEUDOTREE_DP_CODES);
    });
  });

  // 5. Class 200: 仙人掌图与仙人掌 DP (终极大结局)
  describe('Class 200: 仙人掌图与仙人掌 DP (Cactus Graph DP)', () => {
    it('DFS 树识别返祖环，单调队列计算环上对径点，仙人掌直径为 3', () => {
      const steps = buildCactusGraphDPSteps();
      const last = steps[steps.length - 1];
      expect(last.globalDiameter).toBe(3);
      expect(last.dfsStates.length).toBe(4);
      verify1BasedCodeLines(steps, CACTUS_GRAPH_DP_CODES);
    });
  });
});
