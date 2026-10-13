import { describe, it, expect } from 'vitest';
import {
  PrefixOptGraphVisualizer,
  buildPrefixOptSteps,
} from './prefix-opt-graph-renderer';
import { PREFIX_OPT_CODE_LANGUAGES } from './prefix-opt-graph-problem-content';
import {
  assertVisualizerLifecycleContract,
  assertMultiLanguageCodeContract,
  assertStepStreamContract,
} from '../../../core/testing/contract-assertions';

describe('PrefixOptGraph', () => {
  it('should instantiate PrefixOptGraphVisualizer properly', () => {
    const viz = new PrefixOptGraphVisualizer();
    expect(viz).toBeDefined();
  });

  it('should generate at least 20 granular steps for prefix optimized mode', () => {
    const steps = buildPrefixOptSteps('prefix');
    expect(steps.length).toBeGreaterThanOrEqual(20);

    assertStepStreamContract(steps, {
      codes: PREFIX_OPT_CODE_LANGUAGES,
      requiredMetricKeys: ['metric-opt-mode', 'metric-edge-count', 'metric-cur-op', 'metric-compression-ratio'],
    });

    const lastStep = steps[steps.length - 1];
    expect(lastStep.status).toBe('done');
    expect(lastStep.numEdges).toBe(11);
  });

  it('should generate at least 20 granular steps for naive mode', () => {
    const steps = buildPrefixOptSteps('naive');
    expect(steps.length).toBeGreaterThanOrEqual(20);

    assertStepStreamContract(steps, {
      codes: PREFIX_OPT_CODE_LANGUAGES
    });

    const lastStep = steps[steps.length - 1];
    expect(lastStep.status).toBe('done');
    expect(lastStep.numEdges).toBe(16);
  });

  it('should have complete code across all languages without empty stubs', () => {
    assertMultiLanguageCodeContract(PREFIX_OPT_CODE_LANGUAGES, {
      minLines: 30,
      requiredPatterns: [/prefix/i, /chain|edge/i],
    });
  });

  it('should initialize and destroy cleanly with mock root container', async () => {
    await assertVisualizerLifecycleContract(PrefixOptGraphVisualizer, {
      algorithmId: 'prefix-opt-graph',
      viewId: 'algo-prefix-opt-graph-view',
    });
  });
});
