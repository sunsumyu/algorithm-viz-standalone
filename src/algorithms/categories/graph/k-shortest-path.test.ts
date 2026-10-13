import { describe, it, expect } from 'vitest';
import {
  KShortestPathVisualizer,
  buildKShortestPathSteps,
} from './k-shortest-path-renderer';
import { K_SHORTEST_PATH_CODE_LANGUAGES } from './k-shortest-path-problem-content';
import {
  assertVisualizerLifecycleContract,
  assertMultiLanguageCodeContract,
  assertStepStreamContract,
} from '../../../core/testing/contract-assertions';

describe('KShortestPath (A* - P2483)', () => {
  it('should instantiate KShortestPathVisualizer properly', () => {
    const viz = new KShortestPathVisualizer();
    expect(viz).toBeDefined();
  });

  it('should generate at least 20 granular steps for K=2 preset', () => {
    const steps = buildKShortestPathSteps('classic_4node_k2');
    expect(steps.length).toBeGreaterThanOrEqual(20);

    assertStepStreamContract(steps, {
      codes: K_SHORTEST_PATH_CODE_LANGUAGES,
      requiredMetricKeys: ['metric-cur-node', 'metric-f-val', 'metric-hit-count', 'metric-kpath-phase'],
    });

    const lastStep = steps[steps.length - 1];
    expect(lastStep.status).toBe('done');
    expect(lastStep.fVal).toBe(5);
    expect(lastStep.popCountAtTarget).toBe(2);
  });

  it('should generate at least 20 granular steps for K=3 preset', () => {
    const steps = buildKShortestPathSteps('classic_4node_k3');
    expect(steps.length).toBeGreaterThanOrEqual(20);

    assertStepStreamContract(steps, {
      codes: K_SHORTEST_PATH_CODE_LANGUAGES
    });

    const lastStep = steps[steps.length - 1];
    expect(lastStep.status).toBe('done');
    expect(lastStep.fVal).toBe(6);
    expect(lastStep.popCountAtTarget).toBe(3);
  });

  it('should have complete code across all languages without empty stubs', () => {
    assertMultiLanguageCodeContract(K_SHORTEST_PATH_CODE_LANGUAGES, {
      minLines: 35,
      requiredPatterns: [/kthshortestpath|kth_shortest_path/i, /dijkstra/i, /astar|a_star/i, /h/i],
    });
  });

  it('should initialize and destroy cleanly with mock root container', async () => {
    await assertVisualizerLifecycleContract(KShortestPathVisualizer, {
      algorithmId: 'k-shortest-path',
      viewId: 'algo-k-shortest-path-view',
    });
  });
});
