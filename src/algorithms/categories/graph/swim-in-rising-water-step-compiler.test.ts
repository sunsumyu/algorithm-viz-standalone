import { describe, it, expect } from 'vitest';
import {
  buildSwimInRisingWaterSteps,
  PRESET_GRIDS,
} from './swim-in-rising-water-step-compiler';

describe('swim-in-rising-water-step-compiler', () => {
  it('should compile valid steps for leetcode5 preset', () => {
    const steps = buildSwimInRisingWaterSteps('leetcode5');
    expect(steps.length).toBeGreaterThanOrEqual(20);

    const first = steps[0];
    expect(first.status).toBe('init');
    expect(first.grid).toEqual(PRESET_GRIDS.leetcode5);

    const last = steps[steps.length - 1];
    expect(last.status).toBe('done');
    expect(last.curWaterLevel).toBe(20);
    expect(last.bestPath).toBeDefined();
  });

  it('should compile valid steps for simple3 preset', () => {
    const steps = buildSwimInRisingWaterSteps('simple3');
    expect(steps.length).toBeGreaterThanOrEqual(15);
    const last = steps[steps.length - 1];
    expect(last.status).toBe('done');
    expect(last.curWaterLevel).toBe(8);
  });

  it('should compile valid steps for cliff4 preset', () => {
    const steps = buildSwimInRisingWaterSteps('cliff4');
    expect(steps.length).toBeGreaterThanOrEqual(15);
    const last = steps[steps.length - 1];
    expect(last.status).toBe('done');
    expect(last.curWaterLevel).toBe(6);
  });
});
