/**
 * 左神算法通关课 Class 191 ~ 195 边双缩点添边、虚点优化建图、前缀优化建图、2-SAT基础与2-SAT进阶 自动化测试套件
 */

import { describe, it, expect } from 'vitest';
import { buildEBCCConstructionSteps } from './ebcc-construction-renderer';
import { buildVirtualNodesSteps } from './virtual-nodes-construction-renderer';
import { buildPrefixSuffixSteps } from './prefix-suffix-graph-renderer';
import { buildTwoSatSteps } from './two-sat-algorithm-renderer';
import { buildTwoSatAdvancedSteps } from './two-sat-advanced-renderer';
import {
  EBCC_CONSTRUCTION_CODES,
  VIRTUAL_NODES_CODES,
  PREFIX_SUFFIX_GRAPH_CODES,
  TWO_SAT_ALGORITHM_CODES,
  TWO_SAT_ADVANCED_CODES,
} from './advanced-191-195-stage-codes';

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

describe('左神优化建图全家桶与 2-SAT 专题 (Class 191 ~ 195) 综合测试套件', () => {
  // 1. Class 191: 边双缩点与加边构造
  describe('Class 191: 边双缩点与加边构造 (e-BCC Construction)', () => {
    it('缩点树 3 个叶子节点准确算出最少需添 2 条边', () => {
      const steps = buildEBCCConstructionSteps();
      const last = steps[steps.length - 1];
      expect(last.minAdded).toBe(2);
      expect(last.leafBCCs.length).toBe(3);
      expect(last.addedEdges.length).toBe(2);
      verify1BasedCodeLines(steps, EBCC_CONSTRUCTION_CODES);
    });
  });

  // 2. Class 192: 虚点优化建图与虚拟源汇
  describe('Class 192: 虚点优化建图与虚拟源汇 (Virtual Nodes)', () => {
    it('中转虚点将 3x4=12 条边成功压缩降维为 3+4=7 条边', () => {
      const steps = buildVirtualNodesSteps();
      const last = steps[steps.length - 1];
      expect(last.edgeCountOld).toBe(12);
      expect(last.edgeCountNew).toBe(7);
      expect(last.vMid).toBe(8);
      verify1BasedCodeLines(steps, VIRTUAL_NODES_CODES);
    });
  });

  // 3. Class 193: 前缀与后缀优化建图
  describe('Class 193: 前缀与后缀优化建图 (Prefix/Suffix Graph)', () => {
    it('前缀虚点链成功将排他约束线性化为 O(N) 传递边', () => {
      const steps = buildPrefixSuffixSteps();
      const last = steps[steps.length - 1];
      expect(last.originNodes.length).toBe(4);
      expect(last.prefixNodes.length).toBe(4);
      verify1BasedCodeLines(steps, PREFIX_SUFFIX_GRAPH_CODES);
    });
  });

  // 4. Class 194: 2-SAT 算法基础
  describe('Class 194: 2-SAT 算法基础 (2-SAT Fundamentals)', () => {
    it('对称蕴含图与 SCC 判定准确构造相容解 [0, 1, 0]', () => {
      const steps = buildTwoSatSteps();
      const last = steps[steps.length - 1];
      expect(last.isSatisfiable).toBe(true);
      expect(last.assignment[0]).toBe(false);
      expect(last.assignment[1]).toBe(true);
      expect(last.assignment[2]).toBe(false);
      verify1BasedCodeLines(steps, TWO_SAT_ALGORITHM_CODES);
    });
  });

  // 5. Class 195: 2-SAT 进阶应用与方案构造
  describe('Class 195: 2-SAT 进阶应用与方案构造 (2-SAT Advanced)', () => {
    it('前缀优化排他组 {X1, X2, X3} 严密满足至多选一个', () => {
      const steps = buildTwoSatAdvancedSteps();
      const last = steps[steps.length - 1];
      expect(last.assignment[2]).toBe(true);
      expect(last.assignment[1]).toBe(false);
      expect(last.assignment[3]).toBe(false);
      expect(last.assignment[4]).toBe(false);
      verify1BasedCodeLines(steps, TWO_SAT_ADVANCED_CODES);
    });
  });
});
