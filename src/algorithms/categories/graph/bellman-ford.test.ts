import { describe, it, expect } from 'vitest';
import { buildBFSteps } from './bellman-ford-renderer';
import { BELLMAN_FORD_CODE_LANGUAGES } from './bellman-ford-problem-content';
import {
  assertMultiLanguageCodeContract,
assertStepStreamContract } from '../../../core/testing/contract-assertions';

describe('BellmanFord (LeftChengYun Class 061)', () => {
  it('should generate at least 20 granular steps for standard graph', () => {
    const steps = buildBFSteps();
    assertStepStreamContract(steps, {
      minSteps: 20,
      codes: BELLMAN_FORD_CODE_LANGUAGES,
      requireStatusText: true,
      requiredMetricKeys: ['metric-bf-round', 'metric-bf-relax', 'metric-bf-edge', 'metric-bf-dist'],
    });


    const lastStep = steps[steps.length - 1];
    expect(lastStep.action).toBe('done');
    expect(lastStep.dist).toEqual([0, 4, 2, 5, 3]);
    expect(lastStep.round).toBeLessThanOrEqual(4);
  });

  it('should have complete code across all languages without empty stubs', () => {
    assertMultiLanguageCodeContract(BELLMAN_FORD_CODE_LANGUAGES, {
      minLines: 10,
      requiredPatterns: [/bellmanford|bellman_ford/i],
    });
  });
});
