import { describe, it, expect } from 'vitest';
import {
  SwimInRisingWaterVisualizer,
  buildSwimInRisingWaterSteps,
} from './swim-in-rising-water-renderer';
import { SWIM_IN_RISING_WATER_CODE_LANGUAGES } from './swim-in-rising-water-problem-content';
import {
  assertVisualizerLifecycleContract,
  assertStepStreamContract,
} from '../../../core/testing/contract-assertions';

describe('SwimInRisingWater (LeetCode 778 - Class 064 Code03)', () => {
  it('should instantiate SwimInRisingWaterVisualizer properly', () => {
    const viz = new SwimInRisingWaterVisualizer();
    expect(viz).toBeDefined();
  });

  it('should generate at least 20 granular steps for leetcode5 preset', () => {
    const steps = buildSwimInRisingWaterSteps('leetcode5');
    expect(steps.length).toBeGreaterThanOrEqual(20);

    assertStepStreamContract(steps, {
      codes: SWIM_IN_RISING_WATER_CODE_LANGUAGES,
      requiredMetricKeys: ['metric-cur-time', 'metric-cur-pos', 'metric-pq-size', 'metric-swim-phase'],
    });

    const lastStep = steps[steps.length - 1];
    expect(lastStep.status).toBe('done');
    expect(lastStep.curWaterLevel).toBe(20);
    expect(lastStep.bestPath).toBeDefined();
  });

  it('should generate at least 15 granular steps for simple3 preset', () => {
    const steps = buildSwimInRisingWaterSteps('simple3');
    expect(steps.length).toBeGreaterThanOrEqual(15);

    assertStepStreamContract(steps, {
      codes: SWIM_IN_RISING_WATER_CODE_LANGUAGES
    });

    const lastStep = steps[steps.length - 1];
    expect(lastStep.status).toBe('done');
    expect(lastStep.curWaterLevel).toBe(8);
  });

  it('should have complete code across all languages without empty stubs', () => {
    for (const [lang, codeLines] of Object.entries(SWIM_IN_RISING_WATER_CODE_LANGUAGES)) {
      expect(codeLines.length).toBeGreaterThan(15);
      const nonEmptyLines = codeLines.filter((l) => l.trim().length > 0);
      expect(nonEmptyLines.length).toBeGreaterThan(10);
    }
  });

  it('should initialize and destroy cleanly with mock root container', async () => {
    await assertVisualizerLifecycleContract(SwimInRisingWaterVisualizer, {
      algorithmId: 'swim-in-rising-water',
      viewId: 'algo-swim-in-rising-water-view',
    });
  });
});
