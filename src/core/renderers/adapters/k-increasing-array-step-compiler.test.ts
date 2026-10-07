/**
 * k-increasing-array-step-compiler.test.ts
 * 使数组 K 递增最少操作数推演与行号契约单测
 */

import { describe, it, expect } from 'vitest';
import {
  buildKIncreasingArray072Steps,
  K_INCREASING_PRESETS,
} from './k-increasing-array-step-compiler';

describe('KIncreasingArrayStepCompiler 单元测试契约', () => {
  it('逆序数组 k=1 [5, 4, 3, 2, 1] 需修改 4 次', () => {
    const steps = buildKIncreasingArray072Steps(
      K_INCREASING_PRESETS.standard.arr,
      K_INCREASING_PRESETS.standard.k
    );
    expect(steps.length).toBeGreaterThan(5);

    const last = steps[steps.length - 1];
    expect(last.totalOps).toBe(4);

    for (const step of steps) {
      expect(typeof step.line).toBe('number');
      expect(step.line).toBeGreaterThanOrEqual(1);
      expect(step.codeLine).toBeDefined();
    }
  });

  it('偶数奇数各自递增 k=2 [4, 1, 5, 2, 6, 2] 需修改 0 次', () => {
    const steps = buildKIncreasingArray072Steps(
      K_INCREASING_PRESETS.k2.arr,
      K_INCREASING_PRESETS.k2.k
    );
    const last = steps[steps.length - 1];
    expect(last.totalOps).toBe(0);
  });

  it('包含相同元素非递减用例 [2, 2, 2, 2, 3, 3] k=1 需修改 0 次 (upper_bound 特性)', () => {
    const steps = buildKIncreasingArray072Steps(
      K_INCREASING_PRESETS.alreadyIncreasing.arr,
      K_INCREASING_PRESETS.alreadyIncreasing.k
    );
    const last = steps[steps.length - 1];
    expect(last.totalOps).toBe(0);
  });
});
