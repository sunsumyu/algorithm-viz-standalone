import { describe, it, expect } from 'vitest';
import {
  KMAlgorithmVisualizer,
  buildKMSteps,
} from './km-algorithm-renderer';
import { KM_ALGORITHM_CODE_LANGUAGES } from './km-algorithm-problem-content';
import {
  assertVisualizerLifecycleContract,
  assertMultiLanguageCodeContract,
  assertStepStreamContract,
} from '../../../core/testing/contract-assertions';

describe('KMAlgorithm (P6577)', () => {
  it('should instantiate KMAlgorithmVisualizer properly', () => {
    const viz = new KMAlgorithmVisualizer();
    expect(viz).toBeDefined();
  });

  it('should generate at least 20 granular steps for standard preset', () => {
    const steps = buildKMSteps('standard');
    expect(steps.length).toBeGreaterThanOrEqual(20);

    assertStepStreamContract(steps, {
      codes: KM_ALGORITHM_CODE_LANGUAGES,
      requiredMetricKeys: ['metric-km-weight', 'metric-km-matched', 'metric-km-slack', 'metric-km-phase'],
    });

    const lastStep = steps[steps.length - 1];
    expect(lastStep.status).toBe('done');
    expect(lastStep.totalWeight).toBe(12);
    expect(lastStep.matchedEdges.length).toBe(3);
  });

  it('should generate at least 20 granular steps for simple preset', () => {
    const steps = buildKMSteps('simple');
    expect(steps.length).toBeGreaterThanOrEqual(20);

    assertStepStreamContract(steps, {
      codes: KM_ALGORITHM_CODE_LANGUAGES
    });

    const lastStep = steps[steps.length - 1];
    expect(lastStep.status).toBe('done');
    expect(lastStep.totalWeight).toBe(18);
    expect(lastStep.matchedEdges.length).toBe(2);
  });

  it('should have complete code across all languages without empty stubs', () => {
    assertMultiLanguageCodeContract(KM_ALGORITHM_CODE_LANGUAGES, {
      minLines: 35,
      requiredPatterns: [/dfs/i, /slack/i, /solve/i],
    });
  });

  it('should initialize and destroy cleanly with mock root container', async () => {
    await assertVisualizerLifecycleContract(KMAlgorithmVisualizer, {
      algorithmId: 'km-algorithm',
      viewId: 'algo-km-algorithm-view',
    });
  });
});
