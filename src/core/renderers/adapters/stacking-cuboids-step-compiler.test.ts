/**
 * stacking-cuboids-step-compiler.test.ts
 * 堆叠长方体最大高度推演与行号契约单测
 */

import { describe, it, expect } from 'vitest';
import {
  buildStackingCuboids072Steps,
  STACKING_CUBOIDS_PRESETS,
} from './stacking-cuboids-step-compiler';

describe('StackingCuboidsStepCompiler 单元测试契约', () => {
  it('标准用例 [[50,45,20],[95,37,53],[45,23,12]] 得到最大高度 190', () => {
    const steps = buildStackingCuboids072Steps(STACKING_CUBOIDS_PRESETS.standard);
    expect(steps.length).toBeGreaterThan(5);

    const last = steps[steps.length - 1];
    expect(last.maxHeight).toBe(190);

    for (const step of steps) {
      expect(typeof step.line).toBe('number');
      expect(step.line).toBeGreaterThanOrEqual(1);
      expect(step.codeLine).toBeDefined();
    }
  });

  it('互不相容用例 [[38,25,45],[76,35,3]] 得到最大单体高度 76', () => {
    const steps = buildStackingCuboids072Steps(STACKING_CUBOIDS_PRESETS.cubes);
    const last = steps[steps.length - 1];
    expect(last.maxHeight).toBe(76);
  });
});
