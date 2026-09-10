import { describe, it, expect } from 'vitest';
import {
  MixedEulerianCircuitVisualizer,
  buildMixedEulerSteps,
} from './mixed-eulerian-circuit-renderer';
import { MIXED_EULER_CODE_LANGUAGES } from './mixed-eulerian-circuit-problem-content';

describe('MixedEulerianCircuit (POJ 1637)', () => {
  it('should instantiate MixedEulerianCircuitVisualizer properly', () => {
    const viz = new MixedEulerianCircuitVisualizer();
    expect(viz).toBeDefined();
  });

  it('should generate at least 20 granular steps for solvable case', () => {
    const steps = buildMixedEulerSteps(true);
    expect(steps.length).toBeGreaterThanOrEqual(20);

    const javaLinesCount = MIXED_EULER_CODE_LANGUAGES.java.length;
    for (const step of steps) {
      expect(step.message).toBeTruthy();
      expect(step.log).toBeTruthy();
      expect(step.codeLine).toBeDefined();
      const javaLine = typeof step.codeLine === 'object' && step.codeLine !== null && 'java' in step.codeLine ? (step.codeLine as any).java : step.codeLine;
      const lines = Array.isArray(javaLine) ? javaLine : [javaLine];
      for (const line of lines) {
        expect(line).toBeGreaterThan(0);
        expect(line).toBeLessThanOrEqual(javaLinesCount);
      }
      expect(step.metrics).toBeDefined();
      expect(step.metrics?.['metric-flow']).toBeDefined();
      expect(step.metrics?.['metric-deg-diff']).toBeDefined();
      expect(step.metrics?.['metric-euler-status']).toBeDefined();
      expect(step.metrics?.['metric-flipped-count']).toBeDefined();
    }

    const lastStep = steps[steps.length - 1];
    expect(lastStep.isEulerian).toBe(true);
    expect(lastStep.flowVal).toBe(1);
    expect(lastStep.maxFlowTarget).toBe(1);
  });

  it('should generate at least 20 granular steps for unsolvable case', () => {
    const steps = buildMixedEulerSteps(false);
    expect(steps.length).toBeGreaterThanOrEqual(20);

    const javaLinesCount = MIXED_EULER_CODE_LANGUAGES.java.length;
    for (const step of steps) {
      expect(step.message).toBeTruthy();
      expect(step.log).toBeTruthy();
      expect(step.codeLine).toBeDefined();
      const javaLine = typeof step.codeLine === 'object' && step.codeLine !== null && 'java' in step.codeLine ? (step.codeLine as any).java : step.codeLine;
      const lines = Array.isArray(javaLine) ? javaLine : [javaLine];
      for (const line of lines) {
        expect(line).toBeGreaterThan(0);
        expect(line).toBeLessThanOrEqual(javaLinesCount);
      }
      expect(step.metrics).toBeDefined();
      expect(step.metrics?.['metric-flow']).toBeDefined();
      expect(step.metrics?.['metric-deg-diff']).toBeDefined();
      expect(step.metrics?.['metric-euler-status']).toBeDefined();
    }

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
    const mockElements = new Map<string, any>();
    const mockRoot = {
      querySelector: (sel: string) => mockElements.get(sel) || null,
      querySelectorAll: (_sel: string) => [],
      isConnected: true,
    } as unknown as HTMLElement;

    const viz = new MixedEulerianCircuitVisualizer();
    await viz.init({
      root: mockRoot,
      algorithmId: 'mixed-eulerian-circuit',
      viewId: 'algo-mixed-eulerian-circuit-view',
    });

    expect(viz).toBeDefined();
    viz.destroy();
  });
});
