import { describe, it, expect } from 'vitest';
import {
  DijkstraIndexHeapVisualizer,
  buildIndexHeapSteps,
} from './dijkstra-index-heap-renderer';
import { DIJKSTRA_INDEX_HEAP_CODE_LANGUAGES } from './dijkstra-index-heap-problem-content';
import {
  assertVisualizerLifecycleContract,
  assertMultiLanguageCodeContract,
  assertStepStreamContract,
} from '../../../core/testing/contract-assertions';

describe('DijkstraIndexHeap', () => {
  it('should instantiate DijkstraIndexHeapVisualizer properly', () => {
    const viz = new DijkstraIndexHeapVisualizer();
    expect(viz).toBeDefined();
  });

  it('should generate at least 20 granular steps for classic_4node preset', () => {
    const steps = buildIndexHeapSteps('classic_4node');
    expect(steps.length).toBeGreaterThanOrEqual(20);

    assertStepStreamContract(steps, {
      codes: DIJKSTRA_INDEX_HEAP_CODE_LANGUAGES,
      requiredMetricKeys: ['metric-heap-size', 'metric-settled-count', 'metric-heap-cur', 'metric-heap-phase'],
    });

    const lastStep = steps[steps.length - 1];
    expect(lastStep.status).toBe('done');
    expect(lastStep.settled.length).toBe(4);
    expect(lastStep.heapNodes.length).toBe(0);
  });

  it('should generate at least 20 granular steps for simple_triangle preset', () => {
    const steps = buildIndexHeapSteps('simple_triangle');
    expect(steps.length).toBeGreaterThanOrEqual(20);

    assertStepStreamContract(steps, {
      codes: DIJKSTRA_INDEX_HEAP_CODE_LANGUAGES
    });

    const lastStep = steps[steps.length - 1];
    expect(lastStep.status).toBe('done');
    expect(lastStep.settled.length).toBe(3);
  });

  it('should have complete code across all languages without empty stubs', () => {
    assertMultiLanguageCodeContract(DIJKSTRA_INDEX_HEAP_CODE_LANGUAGES, {
      minLines: 35,
      requiredPatterns: [/heap|dijkstra/i, /where/i, /swap/i],
    });
  });

  it('should initialize and destroy cleanly with mock root container', async () => {
    await assertVisualizerLifecycleContract(DijkstraIndexHeapVisualizer, {
      algorithmId: 'dijkstra-index-heap',
      viewId: 'algo-dijkstra-index-heap-view',
    });
  });
});
