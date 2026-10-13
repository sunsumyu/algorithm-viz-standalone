import { describe, it, expect } from 'vitest';
import {
  TrappingWaterIIVisualizer,
  buildTrappingWaterIISteps,
} from './trapping-water-ii-renderer';
import { TRAPPING_WATER_II_CODE_LANGUAGES } from './trapping-water-ii-problem-content';
import {
  assertVisualizerLifecycleContract,
  assertMultiLanguageCodeContract,
  assertStepStreamContract,
} from '../../../core/testing/contract-assertions';

describe('TrappingWaterII (LeetCode 407)', () => {
  it('should instantiate TrappingWaterIIVisualizer properly', () => {
    const viz = new TrappingWaterIIVisualizer();
    expect(viz).toBeDefined();
  });

  it('should generate at least 20 granular steps for classic_3x6 preset', () => {
    const steps = buildTrappingWaterIISteps('classic_3x6');
    expect(steps.length).toBeGreaterThanOrEqual(20);

    assertStepStreamContract(steps, {
      codes: TRAPPING_WATER_II_CODE_LANGUAGES,
      requiredMetricKeys: ['metric-trap2-total', 'metric-trap2-board', 'metric-trap2-heap', 'metric-trap2-phase'],
    });

    const lastStep = steps[steps.length - 1];
    expect(lastStep.status).toBe('done');
    expect(lastStep.totalWater).toBe(4);
  });

  it('should generate at least 20 granular steps for simple_3x3 preset', () => {
    const steps = buildTrappingWaterIISteps('simple_3x3');
    expect(steps.length).toBeGreaterThanOrEqual(20);

    assertStepStreamContract(steps, {
      codes: TRAPPING_WATER_II_CODE_LANGUAGES
    });

    const lastStep = steps[steps.length - 1];
    expect(lastStep.status).toBe('done');
    expect(lastStep.totalWater).toBe(2);
  });

  it('should have complete code across all languages without empty stubs', () => {
    assertMultiLanguageCodeContract(TRAPPING_WATER_II_CODE_LANGUAGES, {
      minLines: 35,
      requiredPatterns: [/traprainwater|trap_rain_water/i, /heightmap|height_map/i, /heap|priority_queue/i],
    });
  });

  it('should initialize and destroy cleanly with mock root container', async () => {
    await assertVisualizerLifecycleContract(TrappingWaterIIVisualizer, {
      algorithmId: 'trapping-water-ii',
      viewId: 'algo-trapping-water-ii-view',
    });
  });
});
