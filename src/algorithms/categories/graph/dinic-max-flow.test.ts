import { describe, it, expect } from 'vitest';
import {
  DinicMaxFlowVisualizer,
  buildDinicSteps,
} from './dinic-max-flow-renderer';
import { DINIC_MAX_FLOW_CODE_LANGUAGES } from './dinic-max-flow-problem-content';
import {
  assertVisualizerLifecycleContract,
  assertMultiLanguageCodeContract,
  assertStepStreamContract,
} from '../../../core/testing/contract-assertions';

describe('DinicMaxFlow (P3376)', () => {
  it('should instantiate DinicMaxFlowVisualizer properly', () => {
    const viz = new DinicMaxFlowVisualizer();
    expect(viz).toBeDefined();
  });

  it('should generate at least 20 granular steps for diamond preset', () => {
    const steps = buildDinicSteps('diamond');
    expect(steps.length).toBeGreaterThanOrEqual(20);

    assertStepStreamContract(steps, {
      codes: DINIC_MAX_FLOW_CODE_LANGUAGES,
      requiredMetricKeys: ['metric-dinic-level', 'metric-dinic-max-flow', 'metric-dinic-path', 'metric-dinic-phase'],
    });

    const lastStep = steps[steps.length - 1];
    expect(lastStep.status).toBe('done');
    expect(lastStep.curMaxFlow).toBe(20);
  });

  it('should generate at least 20 granular steps for cross preset', () => {
    const steps = buildDinicSteps('cross');
    expect(steps.length).toBeGreaterThanOrEqual(20);

    assertStepStreamContract(steps, {
      codes: DINIC_MAX_FLOW_CODE_LANGUAGES
    });

    const lastStep = steps[steps.length - 1];
    expect(lastStep.status).toBe('done');
    expect(lastStep.curMaxFlow).toBe(18);
  });

  it('should have complete code across all languages without empty stubs', () => {
    assertMultiLanguageCodeContract(DINIC_MAX_FLOW_CODE_LANGUAGES, {
      minLines: 40,
      requiredPatterns: [/bfs/i, /dfs/i, /maxflow|max_flow/i],
    });
  });

  it('should initialize and destroy cleanly with mock root container', async () => {
    await assertVisualizerLifecycleContract(DinicMaxFlowVisualizer, {
      algorithmId: 'dinic-max-flow',
      viewId: 'algo-dinic-max-flow-view',
    });
  });
});
