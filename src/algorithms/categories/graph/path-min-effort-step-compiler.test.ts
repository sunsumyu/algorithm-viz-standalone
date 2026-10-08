import { describe, it, expect } from 'vitest';
import {
  buildPathMinEffortSteps,
  PRESET_EFFORT_GRIDS,
} from './path-min-effort-step-compiler';

describe('path-min-effort-step-compiler', () => {
  it('should compile valid steps for classic_mountain_3x3', () => {
    const steps = buildPathMinEffortSteps('classic_mountain_3x3');
    expect(steps.length).toBeGreaterThanOrEqual(20);

    const first = steps[0];
    expect(first.status).toBe('start');
    expect(first.grid).toEqual(PRESET_EFFORT_GRIDS.classic_mountain_3x3.grid);

    const last = steps[steps.length - 1];
    expect(last.status).toBe('done');
    expect(last.minEffortSoFar).toBe(2);
  });

  it('should compile valid steps for valley_3x3', () => {
    const steps = buildPathMinEffortSteps('valley_3x3');
    expect(steps.length).toBeGreaterThanOrEqual(20);
    const last = steps[steps.length - 1];
    expect(last.status).toBe('done');
    expect(last.minEffortSoFar).toBe(1);
  });

  it('should compile valid steps for flat_2x2', () => {
    const steps = buildPathMinEffortSteps('flat_2x2');
    expect(steps.length).toBeGreaterThan(1);
    const last = steps[steps.length - 1];
    expect(last.status).toBe('done');
    expect(last.minEffortSoFar).toBe(0);
  });
});
