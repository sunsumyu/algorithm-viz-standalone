import { describe, it, expect } from 'vitest';
import { TwoSATVisualizer, buildTwoSATSteps } from './two-sat-renderer';
import { TWO_SAT_CODE_LANGUAGES } from './two-sat-problem-content';
import {
  assertVisualizerLifecycleContract,
  assertMultiLanguageCodeContract,
  assertStepStreamContract,
} from '../../../core/testing/contract-assertions';

describe('TwoSAT (P4782)', () => {
  it('should instantiate TwoSATVisualizer properly', () => {
    const viz = new TwoSATVisualizer();
    expect(viz).toBeDefined();
  });

  it('should generate at least 20 granular steps for satisfiable preset', () => {
    const steps = buildTwoSATSteps('satisfiable');
    expect(steps.length).toBeGreaterThanOrEqual(20);

    assertStepStreamContract(steps, {
      codes: TWO_SAT_CODE_LANGUAGES,
      requiredMetricKeys: ['metric-sat-status', 'metric-sat-assign', 'metric-cur-clause', 'metric-scc-count'],
    });

    const lastStep = steps[steps.length - 1];
    expect(lastStep.status).toBe('done');
    expect(lastStep.isSatisfiable).toBe(true);
    expect(lastStep.chosenLiterals).toContain('x1 = False (0)');
    expect(lastStep.chosenLiterals).toContain('x2 = True (1)');
  });

  it('should generate at least 20 granular steps for unsatisfiable preset', () => {
    const steps = buildTwoSATSteps('unsatisfiable');
    expect(steps.length).toBeGreaterThanOrEqual(20);

    assertStepStreamContract(steps, {
      codes: TWO_SAT_CODE_LANGUAGES
    });

    const lastStep = steps[steps.length - 1];
    expect(lastStep.status).toBe('done');
    expect(lastStep.isSatisfiable).toBe(false);
  });

  it('should have complete code across all languages without empty stubs', () => {
    assertMultiLanguageCodeContract(TWO_SAT_CODE_LANGUAGES, {
      minLines: 35,
      requiredPatterns: [/tarjan/i, /scc/i, /solve/i],
    });
  });

  it('should initialize and destroy cleanly with mock root container', async () => {
    await assertVisualizerLifecycleContract(TwoSATVisualizer, {
      algorithmId: 'two-sat-problem',
      viewId: 'algo-two-sat-problem-view',
    });
  });
});
