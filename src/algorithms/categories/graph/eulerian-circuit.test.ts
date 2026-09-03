import { describe, it, expect } from 'vitest';
import {
  EulerianCircuitVisualizer,
  buildEulerianCircuitSteps,
} from './eulerian-circuit-renderer';
import { EULERIAN_CIRCUIT_CODE_LANGUAGES } from './eulerian-circuit-problem-content';

describe('EulerianCircuit (Hierholzer)', () => {
  it('should instantiate EulerianCircuitVisualizer properly', () => {
    const viz = new EulerianCircuitVisualizer();
    expect(viz).toBeDefined();
  });

  it('should generate at least 20 granular steps for classic_4node preset', () => {
    const steps = buildEulerianCircuitSteps('classic_4node');
    expect(steps.length).toBeGreaterThanOrEqual(20);

    const javaLinesCount = EULERIAN_CIRCUIT_CODE_LANGUAGES.java.length;
    for (const step of steps) {
      expect(step.message).toBeTruthy();
      expect(step.log).toBeTruthy();
      expect(step.codeLine).toBeDefined();
      const javaLine = typeof step.codeLine === 'object' && step.codeLine !== null && 'java' in (step.codeLine as any)
        ? (step.codeLine as any).java
        : step.codeLine;
      const lines = Array.isArray(javaLine) ? javaLine : [javaLine];
      for (const line of lines) {
        expect(line).toBeGreaterThan(0);
        expect(line).toBeLessThanOrEqual(javaLinesCount);
      }
      expect(step.metrics).toBeDefined();
      expect(step.metrics?.['metric-euler-status']).toBeDefined();
      expect(step.metrics?.['metric-euler-path']).toBeDefined();
      expect(step.metrics?.['metric-euler-cur']).toBeDefined();
      expect(step.metrics?.['metric-euler-stack']).toBeDefined();
    }

    const lastStep = steps[steps.length - 1];
    expect(lastStep.status).toBe('done');
    expect(lastStep.circuitPath).toEqual([1, 2, 3, 4, 1]);
    expect(lastStep.visitedEdges.length).toBe(4);
  });

  it('should generate at least 20 granular steps for simple_triangle preset', () => {
    const steps = buildEulerianCircuitSteps('simple_triangle');
    expect(steps.length).toBeGreaterThanOrEqual(20);

    const javaLinesCount = EULERIAN_CIRCUIT_CODE_LANGUAGES.java.length;
    for (const step of steps) {
      expect(step.message).toBeTruthy();
      expect(step.log).toBeTruthy();
      expect(step.codeLine).toBeDefined();
      const javaLine = typeof step.codeLine === 'object' && step.codeLine !== null && 'java' in (step.codeLine as any)
        ? (step.codeLine as any).java
        : step.codeLine;
      const lines = Array.isArray(javaLine) ? javaLine : [javaLine];
      for (const line of lines) {
        expect(line).toBeGreaterThan(0);
        expect(line).toBeLessThanOrEqual(javaLinesCount);
      }
      expect(step.metrics).toBeDefined();
    }

    const lastStep = steps[steps.length - 1];
    expect(lastStep.status).toBe('done');
    expect(lastStep.circuitPath).toEqual([1, 2, 3, 1]);
  });

  it('should have complete code across all languages without empty stubs', () => {
    for (const lang of ['cpp', 'java', 'python', 'javascript']) {
      const code = EULERIAN_CIRCUIT_CODE_LANGUAGES[lang];
      expect(code).toBeDefined();
      expect(code.length).toBeGreaterThanOrEqual(35);
      const joined = code.join('\n');
      expect(joined).toMatch(/hierholzer|eulerian/i);
      expect(joined).toMatch(/dfs/i);
      expect(joined).toMatch(/head|path/i);
    }
  });

  it('should initialize and destroy cleanly with mock root container', async () => {
    const mockElements = new Map<string, any>();
    const mockRoot = {
      querySelector: (sel: string) => mockElements.get(sel) || null,
      querySelectorAll: (_sel: string) => [],
      isConnected: true,
    } as unknown as HTMLElement;

    const viz = new EulerianCircuitVisualizer();
    await viz.init({
      root: mockRoot,
      algorithmId: 'eulerian-circuit',
      viewId: 'algo-eulerian-circuit-view',
    });

    expect(viz).toBeDefined();
    viz.destroy();
  });
});
