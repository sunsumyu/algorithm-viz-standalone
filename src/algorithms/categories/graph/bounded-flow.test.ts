import { describe, it, expect } from 'vitest';
import {
  BoundedFlowVisualizer,
  buildBoundedFlowSteps,
} from './bounded-flow-renderer';
import { BOUNDED_FLOW_CODE_LANGUAGES } from './bounded-flow-problem-content';
import {
  assertVisualizerLifecycleContract,
  assertMultiLanguageCodeContract,
  assertStepStreamContract,
} from '../../../core/testing/contract-assertions';

describe('BoundedFlow (Feasible Circulation - LOJ 115)', () => {
  it('should instantiate BoundedFlowVisualizer properly', () => {
    const viz = new BoundedFlowVisualizer();
    expect(viz).toBeDefined();
  });

  it('should generate at least 20 granular steps for four-nodes preset', () => {
    const steps = buildBoundedFlowSteps('four-nodes');
    expect(steps.length).toBeGreaterThanOrEqual(20);

    assertStepStreamContract(steps, {
      codes: BOUNDED_FLOW_CODE_LANGUAGES,
      requiredMetricKeys: ['cur-phase', 'super-flow', 'feasible-status'],
    });

    const lastStep = steps[steps.length - 1];
    expect(lastStep.phase).toBe('ALL_DONE');
    expect(lastStep.isFeasible).toBe(true);
    expect(lastStep.totalPushed).toBe(2);
  });

  it('should generate at least 20 granular steps for triangle preset', () => {
    const steps = buildBoundedFlowSteps('triangle');
    expect(steps.length).toBeGreaterThanOrEqual(20);

    assertStepStreamContract(steps, {
      codes: BOUNDED_FLOW_CODE_LANGUAGES
    });

    const lastStep = steps[steps.length - 1];
    expect(lastStep.phase).toBe('ALL_DONE');
    expect(lastStep.isFeasible).toBe(true);
    expect(lastStep.totalPushed).toBe(1);
  });

  it('should have complete code across all languages without empty stubs', () => {
    assertMultiLanguageCodeContract(BOUNDED_FLOW_CODE_LANGUAGES, {
      minLines: 40,
      requiredPatterns: [/addboundededge|add_bounded_edge/i, /buildsupersourcesink|build_super_source_sink/i, /hasfeasibleflow|has_feasible_flow/i],
    });
  });

  it('should initialize and destroy cleanly with mock root container', async () => {
    await assertVisualizerLifecycleContract(BoundedFlowVisualizer, {
      algorithmId: 'bounded-flow',
      viewId: 'algo-bounded-flow-view',
    });
  });
});
