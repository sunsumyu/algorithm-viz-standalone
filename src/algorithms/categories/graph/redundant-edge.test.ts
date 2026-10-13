import { describe, it, expect } from 'vitest';
import { buildRedundantSteps } from './redundant-edge-renderer';
import { REDUNDANT_EDGE_CODE_LANGUAGES } from './redundant-edge-problem-content';
import {
  assertMultiLanguageCodeContract,
assertStepStreamContract } from '../../../core/testing/contract-assertions';

describe('Redundant Connection (LeftChengYun Class 056 / LC 684)', () => {
  it('should generate at least 20 granular steps for standard graph', () => {
    const steps = buildRedundantSteps();
    assertStepStreamContract(steps, {
      minSteps: 15,
      codes: REDUNDANT_EDGE_CODE_LANGUAGES,
      requireStatusText: true,
      requiredMetricKeys: ['metric-re-cur-edge', 'metric-re-redundant', 'metric-re-tree-edges', 'metric-re-parent'],
    });


    const lastStep = steps[steps.length - 1];
    expect(lastStep.action).toBe('done');
    expect(lastStep.redundantEdge).toEqual([1, 4]);
  });

  it('should have complete code across all languages without empty stubs', () => {
    assertMultiLanguageCodeContract(REDUNDANT_EDGE_CODE_LANGUAGES, {
      minLines: 10,
      requiredPatterns: [/findredundantconnection|find_redundant_connection/i],
    });
  });
});
