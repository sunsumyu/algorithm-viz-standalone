import { describe, it, expect } from 'vitest';
import {
  MixedEulerianCircuitVisualizer,
  buildMixedEulerSteps,
} from './mixed-eulerian-circuit-renderer';
import { MIXED_EULER_CODE_LANGUAGES } from './mixed-eulerian-circuit-problem-content';
import {
  assertVisualizerLifecycleContract,
  assertStepStreamContract,
} from '../../../core/testing/contract-assertions';

describe('MixedEulerianCircuit (POJ 1637)', () => {
  it('should instantiate MixedEulerianCircuitVisualizer properly', () => {
    const viz = new MixedEulerianCircuitVisualizer();
    expect(viz).toBeDefined();
  });

  it('should generate at least 20 granular steps for solvable case', () => {
    const steps = buildMixedEulerSteps(true);
    expect(steps.length).toBeGreaterThanOrEqual(20);

    assertStepStreamContract(steps, {
      codes: MIXED_EULER_CODE_LANGUAGES,
      requiredMetricKeys: ['metric-flow', 'metric-deg-diff', 'metric-euler-status', 'metric-flipped-count'],
    });

    const lastStep = steps[steps.length - 1];
    expect(lastStep.isEulerian).toBe(true);
    expect(lastStep.flowVal).toBe(1);
    expect(lastStep.maxFlowTarget).toBe(1);
  });

  it('should generate at least 20 granular steps for unsolvable case', () => {
    const steps = buildMixedEulerSteps(false);
    expect(steps.length).toBeGreaterThanOrEqual(20);

    assertStepStreamContract(steps, {
      codes: MIXED_EULER_CODE_LANGUAGES,
      requiredMetricKeys: ['metric-flow', 'metric-deg-diff', 'metric-euler-status'],
    });

    const lastStep = steps[steps.length - 1];
    expect(lastStep.isEulerian).toBe(false);
    expect(lastStep.status).toBe('done');
  });

  it('should have complete implementation across all languages without empty stubs', () => {
    for (const lang of ['cpp', 'java', 'python', 'javascript']) {
      const code = MIXED_EULER_CODE_LANGUAGES[lang];
      expect(code).toBeDefined();
      expect(code.length).toBeGreaterThanOrEqual(30);
      const joined = code.join('\n');
      expect(joined).not.toMatch(/return true;\s*\}\s*$/m);
      expect(joined).toMatch(/dinic|bfs|dfs/i);
    }
  });

  it('should initialize and destroy cleanly with mock root container', async () => {
    await assertVisualizerLifecycleContract(MixedEulerianCircuitVisualizer, {
      algorithmId: 'mixed-eulerian-circuit',
      viewId: 'algo-mixed-eulerian-circuit-view',
    });
  });
});
