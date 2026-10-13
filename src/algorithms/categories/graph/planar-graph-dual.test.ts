import { describe, it, expect } from 'vitest';
import { PlanarGraphDualVisualizer, buildPlanarDualSteps } from './planar-graph-dual-renderer';
import { PLANAR_DUAL_CODE_LANGUAGES } from './planar-graph-dual-problem-content';
import {
  assertVisualizerLifecycleContract,
  assertStepStreamContract,
} from '../../../core/testing/contract-assertions';

describe('PlanarGraphDual (P4001)', () => {
  it('should instantiate PlanarGraphDualVisualizer properly', () => {
    const viz = new PlanarGraphDualVisualizer();
    expect(viz).toBeDefined();
  });

  it('should initialize and destroy cleanly with mock root container', async () => {
    await assertVisualizerLifecycleContract(PlanarGraphDualVisualizer, {
      algorithmId: 'planar-graph-dual',
      viewId: 'algo-planar-graph-dual-view',
    });
  });

  it('buildPlanarDualSteps 必须生成精细逐语句执行流 (>= 20 步) 且行号在 Java 源码范围内', () => {
    const steps = buildPlanarDualSteps();
    const javaLines = PLANAR_DUAL_CODE_LANGUAGES.java.length;

    expect(steps.length).toBeGreaterThanOrEqual(20);
    expect(javaLines).toBeGreaterThanOrEqual(60);

    for (let i = 0; i < steps.length; i++) {
      const step = steps[i];
      expect(step.message).toBeTruthy();
      expect(step.log).toBeTruthy();
      expect(step.metrics).toBeDefined();
      expect(step.metrics!['metric-cur-face']).toBeDefined();
      expect(step.metrics!['metric-min-cut']).toBeDefined();
      expect(step.metrics!['metric-pq-top']).toBeDefined();
      expect(step.metrics!['metric-visited-count']).toBeDefined();

      const rawLines = Array.isArray(step.codeLine) ? step.codeLine : [step.codeLine];
      for (const line of rawLines) {
        expect(line).toBeGreaterThanOrEqual(1);
        expect(line).toBeLessThanOrEqual(javaLines);
      }
    }

    expect(steps[0].codeLine).toBe(28);
    expect(steps[steps.length - 1].codeLine).toBe(58);
  });
});
