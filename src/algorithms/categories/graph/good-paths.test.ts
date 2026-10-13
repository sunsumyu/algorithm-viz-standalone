import { describe, it, expect } from 'vitest';
import {
  GoodPathsVisualizer,
  buildGoodPathsSteps,
} from './good-paths-renderer';
import { GOOD_PATHS_CODE_LANGUAGES } from './good-paths-problem-content';
import {
  assertVisualizerLifecycleContract,
  assertMultiLanguageCodeContract,
  assertStepStreamContract,
} from '../../../core/testing/contract-assertions';

describe('GoodPaths (LeetCode 2421)', () => {
  it('should instantiate GoodPathsVisualizer properly', () => {
    const viz = new GoodPathsVisualizer();
    expect(viz).toBeDefined();
  });

  it('should generate at least 20 granular steps for classic_4node preset', () => {
    const steps = buildGoodPathsSteps('classic_4node');
    expect(steps.length).toBeGreaterThanOrEqual(20);

    assertStepStreamContract(steps, {
      codes: GOOD_PATHS_CODE_LANGUAGES,
      requiredMetricKeys: ['metric-active-val', 'metric-good-paths', 'metric-active-edges', 'metric-paths-phase'],
    });

    const lastStep = steps[steps.length - 1];
    expect(lastStep.status).toBe('done');
    expect(lastStep.totalGoodPaths).toBe(5);
  });

  it('should generate at least 20 granular steps for star_5node preset', () => {
    const steps = buildGoodPathsSteps('star_5node');
    expect(steps.length).toBeGreaterThanOrEqual(20);

    assertStepStreamContract(steps, {
      codes: GOOD_PATHS_CODE_LANGUAGES
    });

    const lastStep = steps[steps.length - 1];
    expect(lastStep.status).toBe('done');
    expect(lastStep.totalGoodPaths).toBe(6);
  });

  it('should have complete code across all languages without empty stubs', () => {
    assertMultiLanguageCodeContract(GOOD_PATHS_CODE_LANGUAGES, {
      minLines: 35,
      requiredPatterns: [/numberofgoodpaths|number_of_good_paths/i, /unionfind|father|parent/i, /count/i],
    });
  });

  it('should initialize and destroy cleanly with mock root container', async () => {
    await assertVisualizerLifecycleContract(GoodPathsVisualizer, {
      algorithmId: 'good-paths',
      viewId: 'algo-good-paths-view',
    });
  });
});
