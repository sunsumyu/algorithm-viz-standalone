/**
 * 左神算法通关课 Class 155 ~ 160 动态树、主席树、可持久化 Treap、DSU on Tree、莫队与 FFT 自动化测试套件
 */

import { describe, it, expect } from 'vitest';
import { buildLCTSteps } from './lct-link-cut-tree-renderer';
import { buildPersistentSegSteps } from './persistent-segment-tree-renderer';
import { buildPersistentTreapSteps } from './persistent-treap-renderer';
import { buildDSUSteps } from './dsu-on-tree-renderer';
import { buildMoSteps } from './mo-algorithm-renderer';
import { buildFFTSteps } from './fft-polynomial-renderer';
import {
  LCT_CODES,
  PERSISTENT_SEGMENT_CODES,
  PERSISTENT_TREAP_CODES,
  DSU_ON_TREE_CODES,
  MO_ALGORITHM_CODES,
  FFT_POLYNOMIAL_CODES,
} from './advanced-155-160-stage-codes';

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

describe('左神进阶数据结构与多项式专题 (Class 155 ~ 160) 综合测试套件', () => {
  // 1. Class 155: LCT
  describe('Class 155: 动态树 Link-Cut Tree (LCT)', () => {
    it('执行 access, makeroot, cut, link 后连通图与边状态正确演变', () => {
      const steps = buildLCTSteps(5, [
        { u: 1, v: 2 },
        { u: 1, v: 3 },
        { u: 2, v: 4 },
        { u: 2, v: 5 },
      ]);
      const last = steps[steps.length - 1];
      expect(last.nodes.length).toBe(5);
      // 检查最终边集合包含新连的边 4-5
      const hasLink45 = last.edges.some(
        e => (e.u === 4 && e.v === 5) || (e.u === 5 && e.v === 4)
      );
      expect(hasLink45).toBe(true);
      verify1BasedCodeLines(steps, LCT_CODES);
    });
  });

  // 2. Class 156: 主席树
  describe('Class 156: 可持久化线段树 / 主席树', () => {
    it('在序列 [2, 5, 1, 4, 3] 上查区间 [2..4] 第 2 小应精确返回 4', () => {
      // 区间 [2..4] 对应元素 [5, 1, 4]，排序为 [1, 4, 5]，第 2 小是 4
      const steps = buildPersistentSegSteps([2, 5, 1, 4, 3], 2, 4, 2);
      const last = steps[steps.length - 1];
      expect(last.kthResult?.ans).toBe(4);
      expect(last.versions.length).toBe(5);
      verify1BasedCodeLines(steps, PERSISTENT_SEGMENT_CODES);
    });
  });

  // 3. Class 157: 可持久化平衡树
  describe('Class 157: 可持久化平衡树 (Persistent Treap)', () => {
    it('基于写时复制派生版本并在回溯后旧版本保持完整', () => {
      const steps = buildPersistentTreapSteps();
      const last = steps[steps.length - 1];
      expect(last.versionCount).toBe(3);
      expect(last.curVersion).toBe(0);
      verify1BasedCodeLines(steps, PERSISTENT_TREAP_CODES);
    });
  });

  // 4. Class 158: DSU on Tree
  describe('Class 158: 树上启发式合并 (DSU on Tree)', () => {
    it('轻重儿子调度后应成功求出各子树频次最高颜色', () => {
      const steps = buildDSUSteps();
      const last = steps[steps.length - 1];
      expect(last.ansMap[3]).toBe(1);
      expect(last.ansMap[2]).toBe(2);
      verify1BasedCodeLines(steps, DSU_ON_TREE_CODES);
    });
  });

  // 5. Class 159: 莫队算法
  describe('Class 159: 莫队算法与离线分块', () => {
    it('离线分块双指针移动能准确回答各个区间的相异元素数', () => {
      const arr = [1, 2, 1, 1, 1, 2, 3, 2];
      const queries = [
        { l: 0, r: 2, id: 1 },
        { l: 1, r: 4, id: 2 },
        { l: 2, r: 6, id: 3 },
      ];
      const steps = buildMoSteps(arr, queries);
      const last = steps[steps.length - 1];
      expect(last.curAns).toBeGreaterThan(0);
      verify1BasedCodeLines(steps, MO_ALGORITHM_CODES);
    });
  });

  // 6. Class 160: FFT
  describe('Class 160: 快速傅里叶变换 (FFT)', () => {
    it('多项式 [1, 2, 3] 与 [2, 1] 卷积乘积应严格等于 [2, 5, 8, 3]', () => {
      const steps = buildFFTSteps([1, 2, 3], [2, 1]);
      const last = steps[steps.length - 1];
      expect(last.convResult).toEqual([2, 5, 8, 3]);
      verify1BasedCodeLines(steps, FFT_POLYNOMIAL_CODES);
    });
  });
});
