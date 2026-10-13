import { describe, it, expect } from 'vitest';
import {
  DiffConstraintsVisualizer,
  buildDiffConstraintsSteps,
} from './diff-constraints-renderer';
import { DIFF_CONSTRAINTS_CODE_LANGUAGES } from './diff-constraints-problem-content';
import {
  assertVisualizerLifecycleContract,
  assertMultiLanguageCodeContract,
  assertStepStreamContract,
} from '../../../core/testing/contract-assertions';

describe('DiffConstraints (P5960)', () => {
  it('should instantiate DiffConstraintsVisualizer properly', () => {
    const viz = new DiffConstraintsVisualizer();
    expect(viz).toBeDefined();
  });

  it('should generate at least 20 granular steps for feasible preset', () => {
    const steps = buildDiffConstraintsSteps('feasible');
    expect(steps.length).toBeGreaterThanOrEqual(20);

    assertStepStreamContract(steps, {
      codes: DIFF_CONSTRAINTS_CODE_LANGUAGES,
      requiredMetricKeys: ['metric-diff-cycle', 'metric-diff-sol', 'metric-cur-queue', 'metric-cur-relax'],
    });

    const lastStep = steps[steps.length - 1];
    expect(lastStep.status).toBe('done');
    expect(lastStep.hasNegativeCycle).toBe(false);
  });

  it('should generate at least 20 granular steps for cycle preset', () => {
    const steps = buildDiffConstraintsSteps('cycle');
    expect(steps.length).toBeGreaterThanOrEqual(20);

    assertStepStreamContract(steps, {
      codes: DIFF_CONSTRAINTS_CODE_LANGUAGES
    });

    const lastStep = steps[steps.length - 1];
    expect(lastStep.status).toBe('done');
    expect(lastStep.hasNegativeCycle).toBe(true);
  });

  it('should have complete code across all languages without empty stubs', () => {
    assertMultiLanguageCodeContract(DIFF_CONSTRAINTS_CODE_LANGUAGES, {
      minLines: 30,
      requiredPatterns: [/spfa|dist|diff/i],
    });
  });

  it('should initialize and destroy cleanly with mock root container', async () => {
    await assertVisualizerLifecycleContract(DiffConstraintsVisualizer, {
      algorithmId: 'diff-constraints',
      viewId: 'algo-diff-constraints-view',
    });
  });
});
