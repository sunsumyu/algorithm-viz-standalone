import { describe, it, expect } from 'vitest';
import {
  HungarianMatchingVisualizer,
  buildHungarianSteps,
} from './hungarian-matching-renderer';
import { HUNGARIAN_CODE_LANGUAGES } from './hungarian-matching-problem-content';

describe('HungarianMatching (P3386)', () => {
  it('should instantiate HungarianMatchingVisualizer properly', () => {
    const viz = new HungarianMatchingVisualizer();
    expect(viz).toBeDefined();
  });

  it('should generate at least 20 granular steps for four_nodes preset', () => {
    const steps = buildHungarianSteps('four_nodes');
    expect(steps.length).toBeGreaterThanOrEqual(20);

    const javaLinesCount = HUNGARIAN_CODE_LANGUAGES.java.length;
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
      expect(step.metrics?.['metric-hungarian-left']).toBeDefined();
      expect(step.metrics?.['metric-hungarian-count']).toBeDefined();
      expect(step.metrics?.['metric-hungarian-path']).toBeDefined();
      expect(step.metrics?.['metric-hungarian-phase']).toBeDefined();
    }

    const lastStep = steps[steps.length - 1];
    expect(lastStep.status).toBe('done');
    expect(lastStep.matchCount).toBe(4);
  });

  it('should generate at least 20 granular steps for three_nodes preset', () => {
    const steps = buildHungarianSteps('three_nodes');
    expect(steps.length).toBeGreaterThanOrEqual(20);

    const javaLinesCount = HUNGARIAN_CODE_LANGUAGES.java.length;
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
    expect(lastStep.matchCount).toBe(3);
  });

  it('should have complete code across all languages without empty stubs', () => {
    for (const lang of ['cpp', 'java', 'python', 'javascript']) {
      const code = HUNGARIAN_CODE_LANGUAGES[lang];
      expect(code).toBeDefined();
      expect(code.length).toBeGreaterThanOrEqual(25);
      const joined = code.join('\n');
      expect(joined).toMatch(/dfs/i);
      expect(joined).toMatch(/match/i);
      expect(joined).toMatch(/maxmatching|maxbipartitematching|max_bipartite_matching/i);
    }
  });

  it('should initialize and destroy cleanly with mock root container', async () => {
    const mockElements = new Map<string, any>();
    const mockRoot = {
      querySelector: (sel: string) => mockElements.get(sel) || null,
      querySelectorAll: (_sel: string) => [],
      isConnected: true,
    } as unknown as HTMLElement;

    const viz = new HungarianMatchingVisualizer();
    await viz.init({
      root: mockRoot,
      algorithmId: 'hungarian-matching',
      viewId: 'algo-hungarian-matching-view',
    });

    expect(viz).toBeDefined();
    viz.destroy();
  });
});
