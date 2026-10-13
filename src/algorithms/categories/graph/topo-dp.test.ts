import { describe, it, expect } from 'vitest';
import {
  TopoDPVisualizer,
  buildTopoDPSteps,
} from './topo-dp-renderer';
import { TOPO_DP_CODE_LANGUAGES } from './topo-dp-problem-content';
import {
  assertVisualizerLifecycleContract,
  assertMultiLanguageCodeContract,
  assertStepStreamContract,
} from '../../../core/testing/contract-assertions';

describe('TopoDP', () => {
  it('should instantiate TopoDPVisualizer properly', () => {
    const viz = new TopoDPVisualizer();
    expect(viz).toBeDefined();
  });

  it('should generate at least 20 granular steps for classic_5node preset', () => {
    const steps = buildTopoDPSteps('classic_5node');
    expect(steps.length).toBeGreaterThanOrEqual(20);

    assertStepStreamContract(steps, {
      codes: TOPO_DP_CODE_LANGUAGES,
      requiredMetricKeys: ['metric-topodp-cur', 'metric-topodp-max', 'metric-topo-queue', 'metric-topodp-phase'],
    });

    const lastStep = steps[steps.length - 1];
    expect(lastStep.status).toBe('done');
    expect(lastStep.dpDist[5]).toBe(9);
    expect(lastStep.criticalPath).toEqual([1, 2, 4, 5]);
  });

  it('should generate at least 20 granular steps for simple_4node preset', () => {
    const steps = buildTopoDPSteps('simple_4node');
    expect(steps.length).toBeGreaterThanOrEqual(20);

    assertStepStreamContract(steps, {
      codes: TOPO_DP_CODE_LANGUAGES
    });

    const lastStep = steps[steps.length - 1];
    expect(lastStep.status).toBe('done');
    expect(lastStep.dpDist[4]).toBe(7);
  });

  it('should have complete code across all languages without empty stubs', () => {
    assertMultiLanguageCodeContract(TOPO_DP_CODE_LANGUAGES, {
      minLines: 35,
      requiredPatterns: [/indegree|in_degree|indeg|deg/i, /cost|dp|ans|time/i],
    });
  });

  it('should initialize and destroy cleanly with mock root container', async () => {
    await assertVisualizerLifecycleContract(TopoDPVisualizer, {
      algorithmId: 'topo-dp',
      viewId: 'algo-topo-dp-view',
    });
  });
});
