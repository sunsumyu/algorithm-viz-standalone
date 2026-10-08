import { describe, it, expect } from 'vitest';
import {
  buildAStarSteps,
  withMetrics,
  ASTAR_GRID,
} from './a-star-step-compiler';

describe('a-star-step-compiler', () => {
  it('should compile valid steps for ASTAR_GRID', () => {
    const rawSteps = buildAStarSteps();
    expect(rawSteps.length).toBeGreaterThan(5);

    const first = rawSteps[0];
    expect(first.action).toBe('init');
    expect(first.start).toEqual([0, 0]);

    const last = rawSteps[rawSteps.length - 1];
    expect(last.action).toBe('done');
    expect(last.finalPath.length).toBeGreaterThan(0);
    expect(last.finalPath[0]).toEqual([0, 0]);
    expect(last.finalPath[last.finalPath.length - 1]).toEqual([4, 5]);
  });

  it('should inject metrics via withMetrics', () => {
    const steps = withMetrics(buildAStarSteps());
    const last = steps[steps.length - 1];
    expect(last.metrics).toBeDefined();
    expect(last.metrics?.['metric-as-f']).toBeDefined();
    expect(last.metrics?.['metric-as-gh']).toBeDefined();
    expect(last.metrics?.['metric-as-closed']).toBeDefined();
  });
});
