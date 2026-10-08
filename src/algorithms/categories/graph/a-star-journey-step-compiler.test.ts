import { describe, it, expect } from 'vitest';
import {
  buildAStarJourneySteps,
  PRESET_JOURNEY_MAPS,
} from './a-star-journey-step-compiler';

describe('a-star-journey-step-compiler', () => {
  it('should compile valid steps for classic_3x4 preset', () => {
    const steps = buildAStarJourneySteps('classic_3x4');
    expect(steps.length).toBeGreaterThanOrEqual(20);

    const first = steps[0];
    expect(first.status).toBe('start');
    expect(first.grid).toEqual(PRESET_JOURNEY_MAPS.classic_3x4.grid);

    const last = steps[steps.length - 1];
    expect(last.status).toBe('done');
    expect(last.curR).toBe(2);
    expect(last.curC).toBe(3);
    expect(last.path.length).toBe(6);
  });

  it('should compile valid steps for line_3x3 preset', () => {
    const steps = buildAStarJourneySteps('line_3x3');
    expect(steps.length).toBeGreaterThanOrEqual(20);
    const last = steps[steps.length - 1];
    expect(last.status).toBe('done');
    expect(last.curR).toBe(2);
    expect(last.curC).toBe(2);
  });
});
