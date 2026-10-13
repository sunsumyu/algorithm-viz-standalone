import { describe, it, expect } from 'vitest';
import {
  buildPrimSteps,
} from './mst-prim-renderer';
import { MST_PRIM_CODE_LANGUAGES } from './mst-prim-problem-content';
import {
  assertMultiLanguageCodeContract,
assertStepStreamContract } from '../../../core/testing/contract-assertions';

describe('MST Prim (LeftChengYun Class 058)', () => {
  it('should generate at least 20 granular steps for standard graph', () => {
    const steps = buildPrimSteps();
    assertStepStreamContract(steps, {
      minSteps: 20,
      codes: MST_PRIM_CODE_LANGUAGES,
      requireStatusText: true,
      requiredMetricKeys: ['metric-prim-nodes', 'metric-prim-weight', 'metric-prim-edge', 'metric-prim-dist'],
    });


    const lastStep = steps[steps.length - 1];
    expect(lastStep.action).toBe('done');
    expect(lastStep.mstEdges.length).toBe(4);
    expect(lastStep.totalWeight).toBe(16);
  });

  it('should have complete code across all languages without empty stubs', () => {
    assertMultiLanguageCodeContract(MST_PRIM_CODE_LANGUAGES, {
      minLines: 10,
      requiredPatterns: [/prim/i],
    });
  });
});
