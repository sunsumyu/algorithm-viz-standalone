import { describe, it, expect } from 'vitest';
import { buildDJHSteps } from './dijkstra-heap-renderer';
import { DIJKSTRA_HEAP_CODE_LANGUAGES } from './dijkstra-heap-problem-content';
import {
  assertMultiLanguageCodeContract,
assertStepStreamContract } from '../../../core/testing/contract-assertions';

describe('DijkstraHeap (LeftChengYun Class 061)', () => {
  it('should generate at least 20 granular steps for standard graph', () => {
    const steps = buildDJHSteps();
    assertStepStreamContract(steps, {
      minSteps: 20,
      codes: DIJKSTRA_HEAP_CODE_LANGUAGES,
      requireStatusText: true,
      requiredMetricKeys: ['metric-cur-extract', 'metric-pq-size', 'metric-relax-count', 'metric-dist-info'],
    });


    const lastStep = steps[steps.length - 1];
    expect(lastStep.action).toBe('done');
    expect(lastStep.dist).toEqual([0, 3, 1, 4, 7]);
  });

  it('should have complete code across all languages without empty stubs', () => {
    assertMultiLanguageCodeContract(DIJKSTRA_HEAP_CODE_LANGUAGES, {
      minLines: 10,
      requiredPatterns: [/dijkstraheap|dijkstra_heap/i],
    });
  });
});
