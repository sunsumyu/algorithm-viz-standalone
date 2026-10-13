import { describe, it, expect } from 'vitest';
import {
  CouplesHoldingHandsVisualizer,
  buildCouplesSteps,
} from './couples-holding-hands-renderer';
import { COUPLES_CODE_LANGUAGES } from './couples-holding-hands-problem-content';
import {
  assertVisualizerLifecycleContract,
  assertMultiLanguageCodeContract,
  assertStepStreamContract,
} from '../../../core/testing/contract-assertions';

describe('CouplesHoldingHands (LeetCode 765)', () => {
  it('should instantiate CouplesHoldingHandsVisualizer properly', () => {
    const viz = new CouplesHoldingHandsVisualizer();
    expect(viz).toBeDefined();
  });

  it('should generate at least 20 granular steps for two_cycles preset', () => {
    const steps = buildCouplesSteps('two_cycles');
    expect(steps.length).toBeGreaterThanOrEqual(20);

    assertStepStreamContract(steps, {
      codes: COUPLES_CODE_LANGUAGES,
      requiredMetricKeys: ['metric-disjoint-sets', 'metric-min-swaps', 'metric-current-couch', 'metric-cycle-count'],
    });

    const lastStep = steps[steps.length - 1];
    expect(lastStep.status).toBe('done');
    expect(lastStep.minSwaps).toBe(2);
    expect(lastStep.disjointSetCount).toBe(2);
  });

  it('should generate at least 20 granular steps for big_cycle preset', () => {
    const steps = buildCouplesSteps('big_cycle');
    expect(steps.length).toBeGreaterThanOrEqual(20);

    assertStepStreamContract(steps, {
      codes: COUPLES_CODE_LANGUAGES
    });

    const lastStep = steps[steps.length - 1];
    expect(lastStep.status).toBe('done');
    expect(lastStep.minSwaps).toBe(3);
    expect(lastStep.disjointSetCount).toBe(1);
  });

  it('should generate at least 20 granular steps for perfect preset', () => {
    const steps = buildCouplesSteps('perfect');
    expect(steps.length).toBeGreaterThanOrEqual(20);

    const lastStep = steps[steps.length - 1];
    expect(lastStep.status).toBe('done');
    expect(lastStep.minSwaps).toBe(0);
    expect(lastStep.disjointSetCount).toBe(4);
  });

  it('should have complete code across all languages without empty stubs', () => {
    assertMultiLanguageCodeContract(COUPLES_CODE_LANGUAGES, {
      minLines: 20,
      requiredPatterns: [/union|unite|minswaps/i],
    });
  });

  it('should initialize and destroy cleanly with mock root container', async () => {
    await assertVisualizerLifecycleContract(CouplesHoldingHandsVisualizer, {
      algorithmId: 'couples-holding-hands',
      viewId: 'algo-couples-holding-hands-view',
    });
  });
});
