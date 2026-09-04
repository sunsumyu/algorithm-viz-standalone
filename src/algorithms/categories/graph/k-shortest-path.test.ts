import { describe, it, expect } from 'vitest';
import {
  KShortestPathVisualizer,
  buildKShortestPathSteps,
} from './k-shortest-path-renderer';
import { K_SHORTEST_PATH_CODE_LANGUAGES } from './k-shortest-path-problem-content';

describe('KShortestPath (A* - P2483)', () => {
  it('should instantiate KShortestPathVisualizer properly', () => {
    const viz = new KShortestPathVisualizer();
    expect(viz).toBeDefined();
  });

  it('should generate at least 20 granular steps for K=2 preset', () => {
    const steps = buildKShortestPathSteps('classic_4node_k2');
    expect(steps.length).toBeGreaterThanOrEqual(20);

    const javaLinesCount = K_SHORTEST_PATH_CODE_LANGUAGES.java.length;
    for (const step of steps) {
      expect(step.message).toBeTruthy();
      expect(step.log).toBeTruthy();
      expect(step.codeLine).toBeDefined();
      const lines = Array.isArray(step.codeLine) ? step.codeLine : [step.codeLine];
      for (const line of lines) {
        expect(line).toBeGreaterThan(0);
        expect(line).toBeLessThanOrEqual(javaLinesCount);
      }
      expect(step.metrics).toBeDefined();
      expect(step.metrics?.['metric-cur-node']).toBeDefined();
      expect(step.metrics?.['metric-f-val']).toBeDefined();
      expect(step.metrics?.['metric-hit-count']).toBeDefined();
      expect(step.metrics?.['metric-kpath-phase']).toBeDefined();
    }

    const lastStep = steps[steps.length - 1];
    expect(lastStep.status).toBe('done');
    expect(lastStep.fVal).toBe(5);
    expect(lastStep.popCountAtTarget).toBe(2);
  });

  it('should generate at least 20 granular steps for K=3 preset', () => {
    const steps = buildKShortestPathSteps('classic_4node_k3');
    expect(steps.length).toBeGreaterThanOrEqual(20);

    const javaLinesCount = K_SHORTEST_PATH_CODE_LANGUAGES.java.length;
    for (const step of steps) {
      expect(step.message).toBeTruthy();
      expect(step.log).toBeTruthy();
      expect(step.codeLine).toBeDefined();
      const lines = Array.isArray(step.codeLine) ? step.codeLine : [step.codeLine];
      for (const line of lines) {
        expect(line).toBeGreaterThan(0);
        expect(line).toBeLessThanOrEqual(javaLinesCount);
      }
      expect(step.metrics).toBeDefined();
    }

    const lastStep = steps[steps.length - 1];
    expect(lastStep.status).toBe('done');
    expect(lastStep.fVal).toBe(6);
    expect(lastStep.popCountAtTarget).toBe(3);
  });

  it('should have complete code across all languages without empty stubs', () => {
    for (const lang of ['cpp', 'java', 'python', 'javascript']) {
      const code = K_SHORTEST_PATH_CODE_LANGUAGES[lang];
      expect(code).toBeDefined();
      expect(code.length).toBeGreaterThanOrEqual(35);
      const joined = code.join('\n');
      expect(joined).toMatch(/kthshortestpath|kth_shortest_path/i);
      expect(joined).toMatch(/dijkstra/i);
      expect(joined).toMatch(/astar|a_star/i);
      expect(joined).toMatch(/h/i);
    }
  });

  it('should initialize and destroy cleanly with mock root container', async () => {
    const mockElements = new Map<string, any>();
    const mockRoot = {
      querySelector: (sel: string) => mockElements.get(sel) || null,
      querySelectorAll: (_sel: string) => [],
      isConnected: true,
    } as unknown as HTMLElement;

    const viz = new KShortestPathVisualizer();
    await viz.init({
      root: mockRoot,
      algorithmId: 'k-shortest-path',
      viewId: 'algo-k-shortest-path-view',
    });

    expect(viz).toBeDefined();
    viz.destroy();
  });
});
