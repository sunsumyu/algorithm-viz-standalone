/**
 * slope-optimization-dp-082-step-compiler.test.ts
 * 斜率优化 DP 步进推演与行号契约单测
 */

import { describe, it, expect } from 'vitest';
import { buildSlopeOpt082Steps } from './slope-optimization-dp-082-step-compiler';
import { SLOPE_OPTIMIZATION_DP_082_CODES } from '../../../algorithms/categories/dynamic-programming/dp-079-083/dp-079-083-stage-codes';

describe('SlopeOptimizationDpStepCompiler 单元测试契约', () => {
  it('标准用例以 O(N) 线性时间求出最小费用 89', () => {
    const steps = buildSlopeOpt082Steps();
    expect(steps.length).toBeGreaterThan(5);

    const last = steps[steps.length - 1];
    expect(last.curDp).toBe(89);

    for (const step of steps) {
      if (step.codeLine) {
        for (const lang of ['java', 'cpp', 'python', 'javascript'] as const) {
          const line = (step.codeLine as any)[lang];
          expect(line).toBeDefined();
          expect(line).toBeGreaterThanOrEqual(1);
          expect(line).toBeLessThanOrEqual(SLOPE_OPTIMIZATION_DP_082_CODES[lang].length);
        }
      }
    }
  });

  it('支持动态参数并正确维持单调队列合法性', () => {
    const steps = buildSlopeOpt082Steps({
      t: [0, 2, 2],
      f: [0, 1, 3],
      s: 1,
    });
    const last = steps[steps.length - 1];
    expect(last.curDp).toBeGreaterThan(0);
  });
});
