/**
 * number-of-lis-step-compiler.test.ts
 * 验证 LIS 方案数步进编译器推演逻辑与代码行号绑定契约
 */

import { describe, it, expect } from 'vitest';
import {
  buildNumberOfLis071Steps,
  NUMBER_OF_LIS_PRESETS,
} from './number-of-lis-step-compiler';

describe('NumberOfLisStepCompiler 单元测试契约', () => {
  it('标准分支用例 [1, 3, 5, 4, 7] 正确推导最长长度 4，方案数 2', () => {
    const steps = buildNumberOfLis071Steps(NUMBER_OF_LIS_PRESETS.standard);
    expect(steps.length).toBeGreaterThan(5);

    const lastStep = steps[steps.length - 1];
    expect(lastStep.maxLen).toBe(4);
    expect(lastStep.totalWays).toBe(2);

    // 校验每一步骤均具备合法有效代码行号
    for (const step of steps) {
      expect(typeof step.line).toBe('number');
      expect(step.line).toBeGreaterThanOrEqual(1);
      expect(step.codeLine).toBeDefined();
    }
  });

  it('全等元素用例 [2, 2, 2, 2, 2] 正确推导最长长度 1，方案数 5', () => {
    const steps = buildNumberOfLis071Steps(NUMBER_OF_LIS_PRESETS.allEqual);
    const lastStep = steps[steps.length - 1];
    expect(lastStep.maxLen).toBe(1);
    expect(lastStep.totalWays).toBe(5);
  });

  it('单元素极端边界 [10] 返回 1', () => {
    const steps = buildNumberOfLis071Steps(NUMBER_OF_LIS_PRESETS.single);
    const lastStep = steps[steps.length - 1];
    expect(lastStep.maxLen).toBe(1);
    expect(lastStep.totalWays).toBe(1);
  });
});
