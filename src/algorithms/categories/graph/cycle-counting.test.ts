import { describe, it, expect } from 'vitest';
import {
  CycleCountingVisualizer,
  buildCycleCountingSteps,
} from './cycle-counting-renderer';
import { CYCLE_COUNTING_CODE_LANGUAGES } from './cycle-counting-problem-content';
import {
  assertVisualizerLifecycleContract,
  assertMultiLanguageCodeContract,
  assertStepStreamContract,
} from '../../../core/testing/contract-assertions';

describe('CycleCounting (P1989)', () => {
  it('should instantiate CycleCountingVisualizer properly', () => {
    const viz = new CycleCountingVisualizer();
    expect(viz).toBeDefined();
  });

  it('should generate at least 20 granular steps for classic_diamond_triangles preset', () => {
    const steps = buildCycleCountingSteps('classic_diamond_triangles');
    expect(steps.length).toBeGreaterThanOrEqual(20);

    assertStepStreamContract(steps, {
      codes: CYCLE_COUNTING_CODE_LANGUAGES,
      requiredMetricKeys: ['metric-cur-explore', 'metric-3cycle-count', 'metric-4cycle-count', 'metric-cycle-phase'],
    });

    const lastStep = steps[steps.length - 1];
    expect(lastStep.status).toBe('done');
    expect(lastStep.total3Cycles).toBe(2);
    expect(lastStep.total4Cycles).toBe(1);
    expect(lastStep.trianglesFound.length).toBe(2);
  });

  it('should generate at least 20 granular steps for complete_k4 preset', () => {
    const steps = buildCycleCountingSteps('complete_k4');
    expect(steps.length).toBeGreaterThanOrEqual(20);

    assertStepStreamContract(steps, {
      codes: CYCLE_COUNTING_CODE_LANGUAGES
    });

    const lastStep = steps[steps.length - 1];
    expect(lastStep.status).toBe('done');
    expect(lastStep.total3Cycles).toBe(4);
    expect(lastStep.total4Cycles).toBe(3);
  });

  it('should have complete code across all languages without empty stubs', () => {
    assertMultiLanguageCodeContract(CYCLE_COUNTING_CODE_LANGUAGES, {
      minLines: 35,
      requiredPatterns: [/cyclecounting|cycle_counting|solver/i, /cmp/i, /orient_?dag|count3cycles/i, /count.*3.*cycles?/i],
    });
  });

  it('should initialize and destroy cleanly with mock root container', async () => {
    await assertVisualizerLifecycleContract(CycleCountingVisualizer, {
      algorithmId: 'cycle-counting',
      viewId: 'algo-cycle-counting-view',
    });
  });
});
