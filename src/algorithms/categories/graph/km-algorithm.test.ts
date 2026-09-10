import { describe, it, expect } from 'vitest';
import {
  KMAlgorithmVisualizer,
  buildKMSteps,
} from './km-algorithm-renderer';
import { KM_ALGORITHM_CODE_LANGUAGES } from './km-algorithm-problem-content';

describe('KMAlgorithm (P6577)', () => {
  it('should instantiate KMAlgorithmVisualizer properly', () => {
    const viz = new KMAlgorithmVisualizer();
    expect(viz).toBeDefined();
  });

  it('should generate at least 20 granular steps for standard preset', () => {
    const steps = buildKMSteps('standard');
    expect(steps.length).toBeGreaterThanOrEqual(20);

    const javaLinesCount = KM_ALGORITHM_CODE_LANGUAGES.java.length;
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
      expect(step.metrics?.['metric-km-weight']).toBeDefined();
      expect(step.metrics?.['metric-km-matched']).toBeDefined();
      expect(step.metrics?.['metric-km-slack']).toBeDefined();
      expect(step.metrics?.['metric-km-phase']).toBeDefined();
    }

    const lastStep = steps[steps.length - 1];
    expect(lastStep.status).toBe('done');
    expect(lastStep.totalWeight).toBe(12);
    expect(lastStep.matchedEdges.length).toBe(3);
  });

  it('should generate at least 20 granular steps for simple preset', () => {
    const steps = buildKMSteps('simple');
    expect(steps.length).toBeGreaterThanOrEqual(20);

    const javaLinesCount = KM_ALGORITHM_CODE_LANGUAGES.java.length;
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
    expect(lastStep.totalWeight).toBe(18);
    expect(lastStep.matchedEdges.length).toBe(2);
  });

  it('should have complete code across all languages without empty stubs', () => {
    for (const lang of ['cpp', 'java', 'python', 'javascript']) {
      const code = KM_ALGORITHM_CODE_LANGUAGES[lang];
      expect(code).toBeDefined();
      expect(code.length).toBeGreaterThanOrEqual(35);
      const joined = code.join('\n');
      expect(joined).toMatch(/dfs/i);
      expect(joined).toMatch(/slack/i);
      expect(joined).toMatch(/solve/i);
    }
  });

  it('should initialize and destroy cleanly with mock root container', async () => {
    const mockElements = new Map<string, any>();
    const mockRoot = {
      querySelector: (sel: string) => mockElements.get(sel) || null,
      querySelectorAll: (_sel: string) => [],
      isConnected: true,
    } as unknown as HTMLElement;

    const viz = new KMAlgorithmVisualizer();
    await viz.init({
      root: mockRoot,
      algorithmId: 'km-algorithm',
      viewId: 'algo-km-algorithm-view',
    });

    expect(viz).toBeDefined();
    viz.destroy();
  });
});
