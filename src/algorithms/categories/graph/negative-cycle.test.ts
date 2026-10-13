import { describe, it, expect } from 'vitest';
import { buildNCSteps } from './negative-cycle-renderer';
import { NEGATIVE_CYCLE_CODE_LANGUAGES } from './negative-cycle-problem-content';
import {
  assertMultiLanguageCodeContract,
assertStepStreamContract } from '../../../core/testing/contract-assertions';

describe('NegativeCycle (LeftChengYun Class 061 / P3385)', () => {
  it('should generate at least 20 granular steps for cycle graph', () => {
    const steps = buildNCSteps();
    assertStepStreamContract(steps, {
      minSteps: 20,
      codes: NEGATIVE_CYCLE_CODE_LANGUAGES,
      requireStatusText: true,
      requiredMetricKeys: ['metric-nc-round', 'metric-nc-edge', 'metric-nc-cycle', 'metric-nc-dist'],
    });


    const lastStep = steps[steps.length - 1];
    expect(lastStep.action).toBe('cycle-detected');
    expect(lastStep.hasCycle).toBe(true);
    expect(lastStep.cycleEdges.length).toBeGreaterThan(0);
  });

  it('should have complete code across all languages without empty stubs', () => {
    assertMultiLanguageCodeContract(NEGATIVE_CYCLE_CODE_LANGUAGES, {
      minLines: 10,
      requiredPatterns: [/hasnegativecycle|has_negative_cycle/i],
    });
  });
});
