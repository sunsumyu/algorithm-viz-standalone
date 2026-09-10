/**
 * 左神算法通关课 Class 079 ~ 083 进阶动态规划专题 自动化测试套件
 */

import { describe, it, expect } from 'vitest';
import { buildDigitDp079Steps } from './digit-dp-basic-079-renderer';
import { buildRerooting080Steps } from './rerooting-tree-dp-080-renderer';
import { buildExpectedValue081Steps } from './expected-value-dp-081-renderer';
import { buildSlopeOpt082Steps } from './slope-optimization-dp-082-renderer';
import { buildKnuth083Steps } from './knuth-quadrangle-inequality-083-renderer';
import {
  DIGIT_DP_079_CODES,
  REROOTING_TREE_DP_080_CODES,
  EXPECTED_VALUE_DP_081_CODES,
  SLOPE_OPTIMIZATION_DP_082_CODES,
  KNUTH_QUADRANGLE_083_CODES,
} from './dp-079-083-stage-codes';

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

describe('左神进阶动态规划专题 (Class 079 ~ 083) 综合测试套件', () => {
  // 1. Class 079: 数位 DP 基础模型
  describe('Class 079: 数位 DP 基础模型 (Digit DP)', () => {
    it('数位拆分与记忆化递归，求出 1 到 13 中数字 1 出现次数为 6', () => {
      const steps = buildDigitDp079Steps();
      const last = steps[steps.length - 1];
      expect(last.cnt1).toBe(6);
      verify1BasedCodeLines(steps, DIGIT_DP_079_CODES);
    });
  });

  // 2. Class 080: 换根 DP 专题
  describe('Class 080: 换根 DP 专题 (Rerooting Tree DP)', () => {
    it('两遍 DFS 换根转移，求出所有节点到其他节点的距离和', () => {
      const steps = buildRerooting080Steps();
      const last = steps[steps.length - 1];
      expect(last.nodes.map((n) => n.ans)).toEqual([4, 4, 6, 6]);
      verify1BasedCodeLines(steps, REROOTING_TREE_DP_080_CODES);
    });
  });

  // 3. Class 081: 期望 DP 与马尔可夫决策
  describe('Class 081: 期望 DP 与马尔可夫决策 (Expected Value DP)', () => {
    it('棋盘走日等权全概率扩散，求出 2 步后留在棋盘概率为 0.0625', () => {
      const steps = buildExpectedValue081Steps();
      const last = steps[steps.length - 1];
      expect(last.totalProb).toBe(0.0625);
      verify1BasedCodeLines(steps, EXPECTED_VALUE_DP_081_CODES);
    });
  });

  // 4. Class 082: 斜率优化 DP
  describe('Class 082: 斜率优化 DP 与单调队列凸包 (Slope Optimization DP)', () => {
    it('单调队列维护下凸壳切线，以 O(N) 线性时间求出最小费用 89', () => {
      const steps = buildSlopeOpt082Steps();
      const last = steps[steps.length - 1];
      expect(last.curDp).toBe(89);
      verify1BasedCodeLines(steps, SLOPE_OPTIMIZATION_DP_082_CODES);
    });
  });

  // 5. Class 083: 四边形不等式优化
  describe('Class 083: 四边形不等式与决策单调性 (Knuth Quadrangle Inequality)', () => {
    it('决策区间夹逼剪枝，以 O(N^2) 准确求出石子合并最优代价 20', () => {
      const steps = buildKnuth083Steps();
      const last = steps[steps.length - 1];
      expect(last.minCost).toBe(20);
      verify1BasedCodeLines(steps, KNUTH_QUADRANGLE_083_CODES);
    });
  });
});
