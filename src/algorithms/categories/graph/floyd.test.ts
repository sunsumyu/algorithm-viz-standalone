import { describe, it, expect } from 'vitest';
import { buildFloydSteps } from './floyd-renderer';
import { FLOYD_CODE_LANGUAGES } from './floyd-problem-content';
import {
  assertMultiLanguageCodeContract,
assertStepStreamContract } from '../../../core/testing/contract-assertions';

describe('FloydWarshall (LeftChengYun Class 061)', () => {
  it('should generate at least 20 granular steps for standard graph', () => {
    const steps = buildFloydSteps();
    assertStepStreamContract(steps, {
      minSteps: 20,
      codes: FLOYD_CODE_LANGUAGES,
      requireStatusText: true,
      requiredMetricKeys: ['metric-floyd-k', 'metric-floyd-pair', 'metric-floyd-relax', 'metric-floyd-dist'],
    });


    const lastStep = steps[steps.length - 1];
    expect(lastStep.action).toBe('done');
    expect(lastStep.matrix[0][3]).toBe(9);
    expect(lastStep.matrix[0][1]).toBe(5);
    expect(lastStep.matrix[1][3]).toBe(4);
  });

  it('should have complete code across all languages without empty stubs', () => {
    assertMultiLanguageCodeContract(FLOYD_CODE_LANGUAGES, {
      minLines: 10,
      requiredPatterns: [/floydwarshall|floyd_warshall/i],
    });
  });
});
