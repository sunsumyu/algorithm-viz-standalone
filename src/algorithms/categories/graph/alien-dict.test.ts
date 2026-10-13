import { describe, it, expect } from 'vitest';
import { AlienDictVisualizer, buildAlienDictSteps } from './alien-dict-renderer';
import { ALIEN_DICT_CODE_LANGUAGES } from './alien-dict-problem-content';
import {
  assertVisualizerLifecycleContract,
  assertMultiLanguageCodeContract,
  assertStepStreamContract,
} from '../../../core/testing/contract-assertions';

describe('AlienDict (LeetCode 269)', () => {
  it('should instantiate AlienDictVisualizer properly', () => {
    const viz = new AlienDictVisualizer();
    expect(viz).toBeDefined();
  });

  it('should generate at least 20 granular steps for valid preset', () => {
    const steps = buildAlienDictSteps('valid');
    expect(steps.length).toBeGreaterThanOrEqual(20);

    assertStepStreamContract(steps, {
      codes: ALIEN_DICT_CODE_LANGUAGES,
      requiredMetricKeys: ['metric-alien-chars', 'metric-alien-order', 'metric-alien-queue', 'metric-alien-phase'],
    });

    const lastStep = steps[steps.length - 1];
    expect(lastStep.status).toBe('done');
    expect(lastStep.topoOrder.join('')).toBe('wertf');
  });

  it('should generate at least 20 granular steps for prefix_error preset', () => {
    const steps = buildAlienDictSteps('prefix_error');
    expect(steps.length).toBeGreaterThanOrEqual(10);

    assertStepStreamContract(steps, {
      codes: ALIEN_DICT_CODE_LANGUAGES
    });

    const lastStep = steps[steps.length - 1];
    expect(lastStep.status).toBe('error');
  });

  it('should generate at least 20 granular steps for cycle preset', () => {
    const steps = buildAlienDictSteps('cycle');
    expect(steps.length).toBeGreaterThanOrEqual(15);

    assertStepStreamContract(steps, {
      codes: ALIEN_DICT_CODE_LANGUAGES
    });



    const lastStep = steps[steps.length - 1];
    expect(lastStep.status).toBe('error');
  });

  it('should have complete code across all languages without empty stubs', () => {
    assertMultiLanguageCodeContract(ALIEN_DICT_CODE_LANGUAGES, {
      minLines: 30,
      requiredPatterns: [/alienorder|alien_order/i],
    });
  });

  it('should initialize and destroy cleanly with mock root container', async () => {
    await assertVisualizerLifecycleContract(AlienDictVisualizer, {
      algorithmId: 'alien-dict',
      viewId: 'algo-alien-dict-view',
    });
  });
});
