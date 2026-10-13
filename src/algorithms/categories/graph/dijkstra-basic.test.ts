import { describe, it, expect } from 'vitest';
import { buildDJBSteps } from './dijkstra-basic-renderer';
import { DIJKSTRA_BASIC_CODE_LANGUAGES } from './dijkstra-basic-problem-content';
import {
  assertMultiLanguageCodeContract,
assertStepStreamContract } from '../../../core/testing/contract-assertions';

describe('DijkstraBasic (LeftChengYun Class 061)', () => {
  it('should generate at least 20 granular steps for standard graph', () => {
    const steps = buildDJBSteps();
    assertStepStreamContract(steps, {
      minSteps: 20,
      codes: DIJKSTRA_BASIC_CODE_LANGUAGES,
      requireStatusText: true,
      requiredMetricKeys: ['metric-cur-node', 'metric-visited-nodes', 'metric-relax-count', 'metric-dist-info'],
    });


    const lastStep = steps[steps.length - 1];
    expect(lastStep.action).toBe('done');
    expect(lastStep.dist).toEqual([0, 3, 1, 4, 7]);
  });

  it('should have complete code across all languages without empty stubs', () => {
    assertMultiLanguageCodeContract(DIJKSTRA_BASIC_CODE_LANGUAGES, {
      minLines: 10,
      requiredPatterns: [/dijkstra/i],
    });
  });
});
