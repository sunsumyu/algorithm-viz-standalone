/**
 * 左神算法通关课 Class 173 ~ 178 网络流最大流、MCMF、二分图匹配、KM、弦图与圆方树 自动化测试套件
 */

import { describe, it, expect } from 'vitest';
import { buildDinicSteps } from './dinic-max-flow-renderer';
import { buildMCMFSteps } from './mcmf-cost-flow-renderer';
import { buildHungarianSteps } from './hungarian-matching-renderer';
import { buildKMSteps } from './km-matching-renderer';
import { buildChordalMCSSteps } from './chordal-graph-mcs-renderer';
import { buildBlockCutSteps } from './block-cut-tree-renderer';
import {
  DINIC_MAX_FLOW_CODES,
  MCMF_COST_FLOW_CODES,
  HUNGARIAN_MATCHING_CODES,
  KM_MATCHING_CODES,
  CHORDAL_GRAPH_MCS_CODES,
  BLOCK_CUT_TREE_CODES,
} from './advanced-173-178-stage-codes';

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

describe('左神网络流、二分图匹配与高阶图论专题 (Class 173 ~ 178) 综合测试套件', () => {
  // 1. Class 173: 网络流最大流 Dinic
  describe('Class 173: 网络流最大流 Dinic', () => {
    it('标准 4 节点网络流经多路增广准确求得最大流 4', () => {
      const steps = buildDinicSteps();
      const last = steps[steps.length - 1];
      expect(last.maxFlow).toBe(4);
      expect(last.nodes.length).toBe(4);
      verify1BasedCodeLines(steps, DINIC_MAX_FLOW_CODES);
    });
  });

  // 2. Class 174: 最小费用最大流 MCMF
  describe('Class 174: 最小费用最大流 MCMF', () => {
    it('SPFA 费用最短路增广准确求得 MaxFlow=3, MinCost=10', () => {
      const steps = buildMCMFSteps();
      const last = steps[steps.length - 1];
      expect(last.totalFlow).toBe(3);
      expect(last.totalCost).toBe(10);
      verify1BasedCodeLines(steps, MCMF_COST_FLOW_CODES);
    });
  });

  // 3. Class 175: 二分图最大匹配 匈牙利算法
  describe('Class 175: 二分图最大匹配 匈牙利算法', () => {
    it('增广链翻转腾挪协商达成 3 组完美匹配', () => {
      const steps = buildHungarianSteps();
      const last = steps[steps.length - 1];
      expect(last.matchRight.filter(u => u !== -1).length).toBe(3);
      verify1BasedCodeLines(steps, HUNGARIAN_MATCHING_CODES);
    });
  });

  // 4. Class 176: 二分图最大权完美匹配 KM 算法
  describe('Class 176: 二分图最大权完美匹配 KM 算法', () => {
    it('顶标维护与相等子图增广准确求得最大权重和 15', () => {
      const steps = buildKMSteps();
      const last = steps[steps.length - 1];
      expect(last.totalWeight).toBe(15);
      verify1BasedCodeLines(steps, KM_MATCHING_CODES);
    });
  });

  // 5. Class 177: 弦图与最大势算法 MCS
  describe('Class 177: 弦图与最大势算法 MCS', () => {
    it('MCS 贪心逆序求出 PEO 序列并确定最大团为 3', () => {
      const steps = buildChordalMCSSteps();
      const last = steps[steps.length - 1];
      expect(last.peo.length).toBe(5);
      expect(last.maxCliqueSize).toBe(3);
      verify1BasedCodeLines(steps, CHORDAL_GRAPH_MCS_CODES);
    });
  });

  // 6. Class 178: 圆方树 Block-Cut Tree
  describe('Class 178: 圆方树 Block-Cut Tree', () => {
    it('双环仙人掌图成功缩出 2 个方点并定位割点 3', () => {
      const steps = buildBlockCutSteps();
      const last = steps[steps.length - 1];
      expect(last.blocks.length).toBe(2);
      expect(last.cutVertices).toContain(3);
      verify1BasedCodeLines(steps, BLOCK_CUT_TREE_CODES);
    });
  });
});
