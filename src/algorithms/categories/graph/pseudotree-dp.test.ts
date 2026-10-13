import { describe, it, expect } from 'vitest';
import {
  PseudotreeVisualizer,
  buildPseudotreeSteps,
} from './pseudotree-dp-renderer';
import { PSEUDOTREE_DP_CODE_LANGUAGES } from './pseudotree-dp-problem-content';
import {
  assertVisualizerLifecycleContract,
  assertMultiLanguageCodeContract,
  assertStepStreamContract,
} from '../../../core/testing/contract-assertions';

describe('PseudotreeDP (P1453 / P2607)', () => {
  it('should instantiate PseudotreeVisualizer properly', () => {
    const viz = new PseudotreeVisualizer();
    expect(viz).toBeDefined();
  });

  it('should generate at least 20 granular steps for classic_6node preset', () => {
    const steps = buildPseudotreeSteps('classic_6node');
    expect(steps.length).toBeGreaterThanOrEqual(20);

    assertStepStreamContract(steps, {
      codes: PSEUDOTREE_DP_CODE_LANGUAGES,
      requiredMetricKeys: ['metric-cycle-nodes', 'metric-dp-optimal', 'metric-cur-node', 'metric-pseudotree-phase'],
    });

    const lastStep = steps[steps.length - 1];
    expect(lastStep.status).toBe('done');
    expect(lastStep.dpRes).toBe(35);
    expect(lastStep.selectedNodes).toEqual([4, 3, 5]);
  });

  it('should generate at least 20 granular steps for simple_5node preset', () => {
    const steps = buildPseudotreeSteps('simple_5node');
    expect(steps.length).toBeGreaterThanOrEqual(20);

    assertStepStreamContract(steps, {
      codes: PSEUDOTREE_DP_CODE_LANGUAGES
    });

    const lastStep = steps[steps.length - 1];
    expect(lastStep.status).toBe('done');
    expect(lastStep.dpRes).toBe(24);
  });

  it('should have complete code across all languages without empty stubs', () => {
    assertMultiLanguageCodeContract(PSEUDOTREE_DP_CODE_LANGUAGES, {
      minLines: 35,
      requiredPatterns: [/findcircle|find_circle/i, /treedp|tree_dp/i, /solve/i],
    });
  });

  it('should initialize and destroy cleanly with mock root container', async () => {
    await assertVisualizerLifecycleContract(PseudotreeVisualizer, {
      algorithmId: 'pseudotree-dp',
      viewId: 'algo-pseudotree-dp-view',
    });
  });
});
