import { describe, it, expect } from 'vitest';
import {
  BFS01Visualizer,
  buildBFS01Steps,
} from './bfs-01-renderer';
import { BFS_01_CODE_LANGUAGES } from './bfs-01-problem-content';
import {
  assertVisualizerLifecycleContract,
  assertMultiLanguageCodeContract,
  assertStepStreamContract,
} from '../../../core/testing/contract-assertions';

describe('BFS01', () => {
  it('should instantiate BFS01Visualizer properly', () => {
    const viz = new BFS01Visualizer();
    expect(viz).toBeDefined();
  });

  it('should generate at least 20 granular steps for classic_5node preset', () => {
    const steps = buildBFS01Steps('classic_5node');
    expect(steps.length).toBeGreaterThanOrEqual(20);

    assertStepStreamContract(steps, {
      codes: BFS_01_CODE_LANGUAGES,
      requiredMetricKeys: ['metric-bfs01-node', 'metric-bfs01-dist', 'metric-deque-size', 'metric-bfs01-phase'],
    });

    const lastStep = steps[steps.length - 1];
    expect(lastStep.status).toBe('done');
    expect(lastStep.distMap[5]).toBe(1);
    expect(lastStep.shortestPath).toBeDefined();
  });

  it('should generate at least 20 granular steps for simple_4node preset', () => {
    const steps = buildBFS01Steps('simple_4node');
    expect(steps.length).toBeGreaterThanOrEqual(20);

    assertStepStreamContract(steps, {
      codes: BFS_01_CODE_LANGUAGES
    });

    const lastStep = steps[steps.length - 1];
    expect(lastStep.status).toBe('done');
    expect(lastStep.distMap[4]).toBe(1);
  });

  it('should have complete code across all languages without empty stubs', () => {
    assertMultiLanguageCodeContract(BFS_01_CODE_LANGUAGES, {
      minLines: 35,
      requiredPatterns: [/deque|dist/i, /push|add|append/i],
    });
  });

  it('should initialize and destroy cleanly with mock root container', async () => {
    await assertVisualizerLifecycleContract(BFS01Visualizer, {
      algorithmId: 'bfs-01',
      viewId: 'algo-bfs-01-view',
    });
  });
});
