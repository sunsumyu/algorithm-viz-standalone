import { describe, it, expect } from 'vitest';
import {
  buildKruskalSteps,
} from './mst-kruskal-renderer';
import { MST_KRUSKAL_CODE_LANGUAGES } from './mst-kruskal-problem-content';
import {
  assertMultiLanguageCodeContract,
assertStepStreamContract } from '../../../core/testing/contract-assertions';

describe('MST Kruskal (LeftChengYun Class 058)', () => {
  it('should generate at least 20 granular steps for standard graph', () => {
    const steps = buildKruskalSteps();
    assertStepStreamContract(steps, {
      minSteps: 20,
      codes: MST_KRUSKAL_CODE_LANGUAGES,
      requireStatusText: true,
      requiredMetricKeys: ['metric-kruskal-edges', 'metric-kruskal-weight', 'metric-kruskal-edge', 'metric-kruskal-uf'],
    });


    const lastStep = steps[steps.length - 1];
    expect(lastStep.action).toBe('done');
    expect(lastStep.mstEdges.length).toBe(4);
    expect(lastStep.totalWeight).toBe(16);
  });

  it('should have complete code across all languages without empty stubs', () => {
    assertMultiLanguageCodeContract(MST_KRUSKAL_CODE_LANGUAGES, {
      minLines: 10,
      requiredPatterns: [/kruskal/i],
    });
  });
});
