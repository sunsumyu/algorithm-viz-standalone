import { describe, it, expect } from 'vitest';
import { buildTrappingWaterIISteps } from './trapping-water-ii-step-compiler';

describe('TrappingWaterIIStepCompiler', () => {
  it('should compile classic_3x6 preset steps correctly', () => {
    const steps = buildTrappingWaterIISteps('classic_3x6');
    expect(steps.length).toBeGreaterThanOrEqual(20);
    const lastStep = steps[steps.length - 1];
    expect(lastStep.status).toBe('done');
    expect(lastStep.totalWater).toBe(4);
  });

  it('should compile simple_3x3 preset steps correctly', () => {
    const steps = buildTrappingWaterIISteps('simple_3x3');
    expect(steps.length).toBeGreaterThanOrEqual(20);
    const lastStep = steps[steps.length - 1];
    expect(lastStep.status).toBe('done');
    expect(lastStep.totalWater).toBe(2);
  });
});
