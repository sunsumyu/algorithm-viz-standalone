import { describe, it, expect } from 'vitest';
import { buildRedundantIISteps } from './redundant-edge-ii-renderer';
import { REDUNDANT_EDGE_II_CODE_LANGUAGES } from './redundant-edge-ii-problem-content';
import {
  assertMultiLanguageCodeContract,
assertStepStreamContract } from '../../../core/testing/contract-assertions';

describe('Redundant Connection II (LeftChengYun Class 057 / LC 685)', () => {
  it('should generate at least 15 granular steps for standard graph', () => {
    const steps = buildRedundantIISteps();
    assertStepStreamContract(steps, {
      minSteps: 15,
      codes: REDUNDANT_EDGE_II_CODE_LANGUAGES,
      requireStatusText: true,
      requiredMetricKeys: ['metric-re2-conflict', 'metric-re2-cycle', 'metric-re2-indegree', 'metric-re2-uf'],
    });


    const lastStep = steps[steps.length - 1];
    expect(lastStep.action).toBe('done');
    expect(lastStep.resultEdge).toEqual([2, 3]);
  });

  it('should have complete code across all languages without empty stubs', () => {
    assertMultiLanguageCodeContract(REDUNDANT_EDGE_II_CODE_LANGUAGES, {
      minLines: 10,
      requiredPatterns: [/findredundantdirectedconnection|find_redundant_directed_connection/i],
    });
  });
});
