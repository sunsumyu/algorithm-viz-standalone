import { describe, it, expect } from 'vitest';
import {
  MinCostMaxFlowVisualizer,
  buildMCMFSteps,
} from './min-cost-max-flow-renderer';
import { MCMF_CODE_LANGUAGES } from './min-cost-max-flow-problem-content';
import {
  assertVisualizerLifecycleContract,
  assertMultiLanguageCodeContract,
  assertStepStreamContract,
} from '../../../core/testing/contract-assertions';

describe('MinCostMaxFlow (P3381)', () => {
  it('should instantiate MinCostMaxFlowVisualizer properly', () => {
    const viz = new MinCostMaxFlowVisualizer();
    expect(viz).toBeDefined();
  });

  it('should generate at least 20 granular steps for standard preset', () => {
    const steps = buildMCMFSteps('standard');
    expect(steps.length).toBeGreaterThanOrEqual(20);

    assertStepStreamContract(steps, {
      codes: MCMF_CODE_LANGUAGES,
      requiredMetricKeys: ['metric-mcmf-flow', 'metric-mcmf-cost', 'metric-mcmf-path', 'metric-mcmf-phase'],
    });

    const lastStep = steps[steps.length - 1];
    expect(lastStep.status).toBe('done');
    expect(lastStep.totalFlow).toBe(5);
    expect(lastStep.totalCost).toBe(17);
  });

  it('should generate at least 20 granular steps for simple preset', () => {
    const steps = buildMCMFSteps('simple');
    expect(steps.length).toBeGreaterThanOrEqual(20);

    assertStepStreamContract(steps, {
      codes: MCMF_CODE_LANGUAGES
    });

    const lastStep = steps[steps.length - 1];
    expect(lastStep.status).toBe('done');
    expect(lastStep.totalFlow).toBe(2);
    expect(lastStep.totalCost).toBe(6);
  });

  it('should have complete code across all languages without empty stubs', () => {
    assertMultiLanguageCodeContract(MCMF_CODE_LANGUAGES, {
      minLines: 40,
      requiredPatterns: [/spfa/i, /cost/i, /getmincostmaxflow|get_min_cost_max_flow/i],
    });
  });

  it('should initialize and destroy cleanly with mock root container', async () => {
    await assertVisualizerLifecycleContract(MinCostMaxFlowVisualizer, {
      algorithmId: 'min-cost-max-flow',
      viewId: 'algo-min-cost-max-flow-view',
    });
  });
});
