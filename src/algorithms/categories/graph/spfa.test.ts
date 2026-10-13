import { describe, it, expect } from 'vitest';
import { buildSPFASteps } from './spfa-renderer';
import { SPFA_CODE_LANGUAGES } from './spfa-problem-content';
import {
  assertMultiLanguageCodeContract,
assertStepStreamContract } from '../../../core/testing/contract-assertions';

describe('SPFA (LeftChengYun Class 061)', () => {
  it('should generate at least 20 granular steps for standard graph', () => {
    const steps = buildSPFASteps();
    assertStepStreamContract(steps, {
      minSteps: 20,
      codes: SPFA_CODE_LANGUAGES,
      requireStatusText: true,
      requiredMetricKeys: ['metric-spfa-queue', 'metric-spfa-cur', 'metric-spfa-relax', 'metric-spfa-dist'],
    });


    const lastStep = steps[steps.length - 1];
    expect(lastStep.action).toBe('done');
    expect(lastStep.dist).toEqual([0, 4, 2, 5, 3]);
  });

  it('should have complete code across all languages without empty stubs', () => {
    assertMultiLanguageCodeContract(SPFA_CODE_LANGUAGES, {
      minLines: 15,
      requiredPatterns: [/spfa/i],
    });
  });
});
