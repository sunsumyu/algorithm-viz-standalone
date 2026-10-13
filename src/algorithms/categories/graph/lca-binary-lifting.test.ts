import { describe, it, expect } from 'vitest';
import {
  LCABinaryLiftingVisualizer,
  buildLCASteps,
} from './lca-binary-lifting-renderer';
import { LCA_BINARY_LIFTING_CODE_LANGUAGES } from './lca-binary-lifting-problem-content';
import {
  assertVisualizerLifecycleContract,
  assertMultiLanguageCodeContract,
  assertStepStreamContract,
} from '../../../core/testing/contract-assertions';

describe('LCABinaryLifting (P3379)', () => {
  it('should instantiate LCABinaryLiftingVisualizer properly', () => {
    const viz = new LCABinaryLiftingVisualizer();
    expect(viz).toBeDefined();
  });

  it('should generate at least 20 granular steps for classic_7node preset', () => {
    const steps = buildLCASteps('classic_7node');
    expect(steps.length).toBeGreaterThanOrEqual(20);

    assertStepStreamContract(steps, {
      codes: LCA_BINARY_LIFTING_CODE_LANGUAGES,
      requiredMetricKeys: ['metric-lca-query', 'metric-lca-res', 'metric-cur-state', 'metric-lca-phase'],
    });

    const lastStep = steps[steps.length - 1];
    expect(lastStep.stage).toBe('done');
    expect(lastStep.lcaResult).toBe(2);
    expect(lastStep.treeDist).toBe(3);
  });

  it('should generate at least 20 granular steps for fork_5node preset', () => {
    const steps = buildLCASteps('fork_5node');
    expect(steps.length).toBeGreaterThanOrEqual(20);

    assertStepStreamContract(steps, {
      codes: LCA_BINARY_LIFTING_CODE_LANGUAGES
    });

    const lastStep = steps[steps.length - 1];
    expect(lastStep.stage).toBe('done');
    expect(lastStep.lcaResult).toBe(1);
    expect(lastStep.treeDist).toBe(4);
  });

  it('should have complete code across all languages without empty stubs', () => {
    assertMultiLanguageCodeContract(LCA_BINARY_LIFTING_CODE_LANGUAGES, {
      minLines: 35,
      requiredPatterns: [/dfs/i, /getlca|get_lca/i, /getdist|get_dist/i],
    });
  });

  it('should initialize and destroy cleanly with mock root container', async () => {
    await assertVisualizerLifecycleContract(LCABinaryLiftingVisualizer, {
      algorithmId: 'lca-binary-lifting',
      viewId: 'algo-lca-binary-lifting-view',
    });
  });
});
