import { describe, it, expect } from 'vitest';
import {
  SecondMstVisualizer,
  buildSecondMstSteps,
} from './second-mst-renderer';
import { SECOND_MST_CODE_LANGUAGES } from './second-mst-problem-content';
import {
  assertVisualizerLifecycleContract,
  assertMultiLanguageCodeContract,
  assertStepStreamContract,
} from '../../../core/testing/contract-assertions';

describe('SecondMst (P4180)', () => {
  it('should instantiate SecondMstVisualizer properly', () => {
    const viz = new SecondMstVisualizer();
    expect(viz).toBeDefined();
  });

  it('should generate at least 20 granular steps for classic_4node_p4180 preset', () => {
    const steps = buildSecondMstSteps('classic_4node_p4180');
    expect(steps.length).toBeGreaterThanOrEqual(20);

    assertStepStreamContract(steps, {
      codes: SECOND_MST_CODE_LANGUAGES,
      requiredMetricKeys: ['metric-mst-w', 'metric-second-mst-w', 'metric-cur-edge', 'metric-smst-phase'],
    });


    const lastStep = steps[steps.length - 1];
    expect(lastStep.status).toBe('done');
    expect(lastStep.mstWeight).toBe(6);
    expect(lastStep.secondMstWeight).toBe(7);
  });

  it('should generate at least 20 granular steps for equal_weight_5node preset', () => {
    const steps = buildSecondMstSteps('equal_weight_5node');
    assertStepStreamContract(steps, {
      minSteps: 20,
      codes: SECOND_MST_CODE_LANGUAGES,
      requiredMetricKeys: ['metric-mst-w', 'metric-second-mst-w', 'metric-cur-edge', 'metric-smst-phase'],
    });

    const lastStep = steps[steps.length - 1];
    expect(lastStep.status).toBe('done');
    expect(lastStep.mstWeight).toBe(8);
    expect(lastStep.secondMstWeight).toBe(10);
  });

  it('should have complete code across all languages without empty stubs', () => {
    assertMultiLanguageCodeContract(SECOND_MST_CODE_LANGUAGES, {
      minLines: 35,
      requiredPatterns: [/secondmst|second_mst/i, /kruskal/i, /max1/i, /max2/i],
    });
  });

  it('should initialize and destroy cleanly with mock root container', async () => {
    await assertVisualizerLifecycleContract(SecondMstVisualizer, {
      algorithmId: 'second-mst',
      viewId: 'algo-second-mst-view',
    });
  });
});
