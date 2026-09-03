import { describe, it, expect } from 'vitest';
import {
  GoodPathsVisualizer,
  buildGoodPathsSteps,
} from './good-paths-renderer';
import { GOOD_PATHS_CODE_LANGUAGES } from './good-paths-problem-content';

describe('GoodPaths (LeetCode 2421)', () => {
  it('should instantiate GoodPathsVisualizer properly', () => {
    const viz = new GoodPathsVisualizer();
    expect(viz).toBeDefined();
  });

  it('should generate at least 20 granular steps for classic_4node preset', () => {
    const steps = buildGoodPathsSteps('classic_4node');
    expect(steps.length).toBeGreaterThanOrEqual(20);

    const javaLinesCount = GOOD_PATHS_CODE_LANGUAGES.java.length;
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
      expect(step.metrics?.['metric-active-val']).toBeDefined();
      expect(step.metrics?.['metric-good-paths']).toBeDefined();
      expect(step.metrics?.['metric-active-edges']).toBeDefined();
      expect(step.metrics?.['metric-paths-phase']).toBeDefined();
    }

    const lastStep = steps[steps.length - 1];
    expect(lastStep.status).toBe('done');
    expect(lastStep.totalGoodPaths).toBe(5);
  });

  it('should generate at least 20 granular steps for star_5node preset', () => {
    const steps = buildGoodPathsSteps('star_5node');
    expect(steps.length).toBeGreaterThanOrEqual(20);

    const javaLinesCount = GOOD_PATHS_CODE_LANGUAGES.java.length;
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
    expect(lastStep.totalGoodPaths).toBe(6);
  });

  it('should have complete code across all languages without empty stubs', () => {
    for (const lang of ['cpp', 'java', 'python', 'javascript']) {
      const code = GOOD_PATHS_CODE_LANGUAGES[lang];
      expect(code).toBeDefined();
      expect(code.length).toBeGreaterThanOrEqual(35);
      const joined = code.join('\n');
      expect(joined).toMatch(/numberofgoodpaths|number_of_good_paths/i);
      expect(joined).toMatch(/unionfind|father|parent/i);
      expect(joined).toMatch(/count/i);
    }
  });

  it('should initialize and destroy cleanly with mock root container', async () => {
    const mockElements = new Map<string, any>();
    const mockRoot = {
      querySelector: (sel: string) => mockElements.get(sel) || null,
      querySelectorAll: (_sel: string) => [],
      isConnected: true,
    } as unknown as HTMLElement;

    const viz = new GoodPathsVisualizer();
    await viz.init({
      root: mockRoot,
      algorithmId: 'good-paths',
      viewId: 'algo-good-paths-view',
    });

    expect(viz).toBeDefined();
    viz.destroy();
  });
});
