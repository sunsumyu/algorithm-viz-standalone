import { describe, it, expect } from 'vitest';
import {
  EulerianCircuitVisualizer,
  buildEulerianCircuitSteps,
} from './eulerian-circuit-renderer';
import { EULERIAN_CIRCUIT_CODE_LANGUAGES } from './eulerian-circuit-problem-content';
import {
  assertVisualizerLifecycleContract,
  assertMultiLanguageCodeContract,
  assertStepStreamContract,
} from '../../../core/testing/contract-assertions';

describe('EulerianCircuit (Hierholzer)', () => {
  it('should instantiate EulerianCircuitVisualizer properly', () => {
    const viz = new EulerianCircuitVisualizer();
    expect(viz).toBeDefined();
  });

  it('should generate at least 20 granular steps for classic_4node preset', () => {
    const steps = buildEulerianCircuitSteps('classic_4node');
    expect(steps.length).toBeGreaterThanOrEqual(20);

    assertStepStreamContract(steps, {
      codes: EULERIAN_CIRCUIT_CODE_LANGUAGES,
      requiredMetricKeys: ['metric-euler-status', 'metric-euler-path', 'metric-euler-cur', 'metric-euler-stack'],
    });

    const lastStep = steps[steps.length - 1];
    expect(lastStep.status).toBe('done');
    expect(lastStep.circuitPath).toEqual([1, 2, 3, 4, 1]);
    expect(lastStep.visitedEdges.length).toBe(4);
  });

  it('should generate at least 20 granular steps for simple_triangle preset', () => {
    const steps = buildEulerianCircuitSteps('simple_triangle');
    expect(steps.length).toBeGreaterThanOrEqual(20);

    assertStepStreamContract(steps, {
      codes: EULERIAN_CIRCUIT_CODE_LANGUAGES
    });

    const lastStep = steps[steps.length - 1];
    expect(lastStep.status).toBe('done');
    expect(lastStep.circuitPath).toEqual([1, 2, 3, 1]);
  });

  it('should have complete code across all languages without empty stubs', () => {
    assertMultiLanguageCodeContract(EULERIAN_CIRCUIT_CODE_LANGUAGES, {
      minLines: 35,
      requiredPatterns: [/hierholzer|eulerian/i, /dfs/i, /head|path/i],
    });
  });

  it('should initialize and destroy cleanly with mock root container', async () => {
    await assertVisualizerLifecycleContract(EulerianCircuitVisualizer, {
      algorithmId: 'eulerian-circuit',
      viewId: 'algo-eulerian-circuit-view',
    });
  });
});
