import { describe, it, expect } from 'vitest';
import {
  MaxWeightClosureVisualizer,
  buildMaxWeightClosureSteps,
} from './max-weight-closure-renderer';
import { MAX_WEIGHT_CLOSURE_CODE_LANGUAGES } from './max-weight-closure-problem-content';
import {
  assertVisualizerLifecycleContract,
  assertMultiLanguageCodeContract,
  assertStepStreamContract,
} from '../../../core/testing/contract-assertions';

describe('MaxWeightClosure (P2762)', () => {
  it('should instantiate MaxWeightClosureVisualizer properly', () => {
    const viz = new MaxWeightClosureVisualizer();
    expect(viz).toBeDefined();
  });

  it('should generate at least 20 granular steps for space preset', () => {
    const steps = buildMaxWeightClosureSteps('space');
    expect(steps.length).toBeGreaterThanOrEqual(20);

    assertStepStreamContract(steps, {
      codes: MAX_WEIGHT_CLOSURE_CODE_LANGUAGES,
      requiredMetricKeys: ['metric-pos-weight', 'metric-min-cut-val', 'metric-max-profit', 'metric-closure-phase'],
    });

    const lastStep = steps[steps.length - 1];
    expect(lastStep.status).toBe('done');
    expect(lastStep.maxProfit).toBe(5);
    expect(lastStep.minCutValue).toBe(20);
    expect(lastStep.chosenNodes).toEqual(['E1', 'E2', 'I1', 'I2', 'I3']);
  });

  it('should generate at least 20 granular steps for simple preset', () => {
    const steps = buildMaxWeightClosureSteps('simple');
    expect(steps.length).toBeGreaterThanOrEqual(20);

    assertStepStreamContract(steps, {
      codes: MAX_WEIGHT_CLOSURE_CODE_LANGUAGES
    });

    const lastStep = steps[steps.length - 1];
    expect(lastStep.status).toBe('done');
    expect(lastStep.maxProfit).toBe(3);
    expect(lastStep.minCutValue).toBe(9);
    expect(lastStep.chosenNodes).toEqual(['E1', 'I1', 'I2']);
  });

  it('should have complete code across all languages without empty stubs', () => {
    assertMultiLanguageCodeContract(MAX_WEIGHT_CLOSURE_CODE_LANGUAGES, {
      minLines: 40,
      requiredPatterns: [/addnode|add_node/i, /adddependency|add_dependency/i, /bfs/i, /dfs/i, /solve/i],
    });
  });

  it('should initialize and destroy cleanly with mock root container', async () => {
    await assertVisualizerLifecycleContract(MaxWeightClosureVisualizer, {
      algorithmId: 'max-weight-closure',
      viewId: 'algo-max-weight-closure-view',
    });
  });
});
