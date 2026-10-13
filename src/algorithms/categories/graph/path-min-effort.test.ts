import { describe, it, expect } from 'vitest';
import {
  PathMinEffortVisualizer,
  buildPathMinEffortSteps,
} from './path-min-effort-renderer';
import { PATH_MIN_EFFORT_CODE_LANGUAGES } from './path-min-effort-problem-content';
import {
  assertVisualizerLifecycleContract,
  assertMultiLanguageCodeContract,
  assertStepStreamContract,
} from '../../../core/testing/contract-assertions';

describe('PathMinEffort (LeetCode 1631)', () => {
  it('should instantiate PathMinEffortVisualizer properly', () => {
    const viz = new PathMinEffortVisualizer();
    expect(viz).toBeDefined();
  });

  it('should generate at least 20 granular steps for classic_mountain_3x3 preset', () => {
    const steps = buildPathMinEffortSteps('classic_mountain_3x3');
    expect(steps.length).toBeGreaterThanOrEqual(20);

    assertStepStreamContract(steps, {
      codes: PATH_MIN_EFFORT_CODE_LANGUAGES,
      requiredMetricKeys: ['metric-cur-coord', 'metric-min-effort', 'metric-cur-height', 'metric-effort-phase'],
    });

    const lastStep = steps[steps.length - 1];
    expect(lastStep.status).toBe('done');
    expect(lastStep.minEffortSoFar).toBe(2);
    expect(lastStep.curR).toBe(2);
    expect(lastStep.curC).toBe(2);
  });

  it('should generate at least 20 granular steps for valley_3x3 preset', () => {
    const steps = buildPathMinEffortSteps('valley_3x3');
    expect(steps.length).toBeGreaterThanOrEqual(20);

    assertStepStreamContract(steps, {
      codes: PATH_MIN_EFFORT_CODE_LANGUAGES
    });

    const lastStep = steps[steps.length - 1];
    expect(lastStep.status).toBe('done');
    expect(lastStep.minEffortSoFar).toBe(1);
    expect(lastStep.curR).toBe(2);
    expect(lastStep.curC).toBe(2);
  });

  it('should have complete code across all languages without empty stubs', () => {
    assertMultiLanguageCodeContract(PATH_MIN_EFFORT_CODE_LANGUAGES, {
      minLines: 35,
      requiredPatterns: [/minimumeffortpath|minimum_effort_path/i, /dist/i, /visited/i, /pq|priority_queue|heap/i],
    });
  });

  it('should initialize and destroy cleanly with mock root container', async () => {
    await assertVisualizerLifecycleContract(PathMinEffortVisualizer, {
      algorithmId: 'path-min-effort',
      viewId: 'algo-path-min-effort-view',
    });
  });
});
