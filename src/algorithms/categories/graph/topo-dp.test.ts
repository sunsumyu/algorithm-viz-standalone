import { describe, it, expect } from 'vitest';
import {
  TopoDPVisualizer,
  buildTopoDPSteps,
} from './topo-dp-renderer';
import { TOPO_DP_CODE_LANGUAGES } from './topo-dp-problem-content';

describe('TopoDP', () => {
  it('should instantiate TopoDPVisualizer properly', () => {
    const viz = new TopoDPVisualizer();
    expect(viz).toBeDefined();
  });

  it('should generate at least 20 granular steps for classic_5node preset', () => {
    const steps = buildTopoDPSteps('classic_5node');
    expect(steps.length).toBeGreaterThanOrEqual(20);

    const javaLinesCount = TOPO_DP_CODE_LANGUAGES.java.length;
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
      expect(step.metrics?.['metric-topodp-cur']).toBeDefined();
      expect(step.metrics?.['metric-topodp-max']).toBeDefined();
      expect(step.metrics?.['metric-topo-queue']).toBeDefined();
      expect(step.metrics?.['metric-topodp-phase']).toBeDefined();
    }

    const lastStep = steps[steps.length - 1];
    expect(lastStep.status).toBe('done');
    expect(lastStep.dpDist[5]).toBe(9);
    expect(lastStep.criticalPath).toEqual([1, 2, 4, 5]);
  });

  it('should generate at least 20 granular steps for simple_4node preset', () => {
    const steps = buildTopoDPSteps('simple_4node');
    expect(steps.length).toBeGreaterThanOrEqual(20);

    const javaLinesCount = TOPO_DP_CODE_LANGUAGES.java.length;
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
    expect(lastStep.dpDist[4]).toBe(7);
  });

  it('should have complete code across all languages without empty stubs', () => {
    for (const lang of ['cpp', 'java', 'python', 'javascript']) {
      const code = TOPO_DP_CODE_LANGUAGES[lang];
      expect(code).toBeDefined();
      expect(code.length).toBeGreaterThanOrEqual(35);
      const joined = code.join('\n');
      expect(joined).toMatch(/indegree|in_degree|indeg|deg/i);
      expect(joined).toMatch(/cost|dp|ans|time/i);
    }
  });

  it('should initialize and destroy cleanly with mock root container', async () => {
    const mockElements = new Map<string, any>();
    const mockRoot = {
      querySelector: (sel: string) => mockElements.get(sel) || null,
      querySelectorAll: (_sel: string) => [],
      isConnected: true,
    } as unknown as HTMLElement;

    const viz = new TopoDPVisualizer();
    await viz.init({
      root: mockRoot,
      algorithmId: 'topo-dp',
      viewId: 'algo-topo-dp-view',
    });

    expect(viz).toBeDefined();
    viz.destroy();
  });
});
