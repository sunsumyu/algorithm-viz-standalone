import { describe, it, expect } from 'vitest';
import {
  DiffConstraintsVisualizer,
  buildDiffConstraintsSteps,
} from './diff-constraints-renderer';
import { DIFF_CONSTRAINTS_CODE_LANGUAGES } from './diff-constraints-problem-content';

describe('DiffConstraints (P5960)', () => {
  it('should instantiate DiffConstraintsVisualizer properly', () => {
    const viz = new DiffConstraintsVisualizer();
    expect(viz).toBeDefined();
  });

  it('should generate at least 20 granular steps for feasible preset', () => {
    const steps = buildDiffConstraintsSteps('feasible');
    expect(steps.length).toBeGreaterThanOrEqual(20);

    const javaLinesCount = DIFF_CONSTRAINTS_CODE_LANGUAGES.java.length;
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
      expect(step.metrics?.['metric-diff-cycle']).toBeDefined();
      expect(step.metrics?.['metric-diff-sol']).toBeDefined();
      expect(step.metrics?.['metric-cur-queue']).toBeDefined();
      expect(step.metrics?.['metric-cur-relax']).toBeDefined();
    }

    const lastStep = steps[steps.length - 1];
    expect(lastStep.status).toBe('done');
    expect(lastStep.hasNegativeCycle).toBe(false);
  });

  it('should generate at least 20 granular steps for cycle preset', () => {
    const steps = buildDiffConstraintsSteps('cycle');
    expect(steps.length).toBeGreaterThanOrEqual(20);

    const javaLinesCount = DIFF_CONSTRAINTS_CODE_LANGUAGES.java.length;
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
    expect(lastStep.hasNegativeCycle).toBe(true);
  });

  it('should have complete code across all languages without empty stubs', () => {
    for (const lang of ['cpp', 'java', 'python', 'javascript']) {
      const code = DIFF_CONSTRAINTS_CODE_LANGUAGES[lang];
      expect(code).toBeDefined();
      expect(code.length).toBeGreaterThanOrEqual(30);
      const joined = code.join('\n');
      expect(joined).toMatch(/spfa|dist|diff/i);
    }
  });

  it('should initialize and destroy cleanly with mock root container', async () => {
    const mockElements = new Map<string, any>();
    const mockRoot = {
      querySelector: (sel: string) => mockElements.get(sel) || null,
      querySelectorAll: (_sel: string) => [],
      isConnected: true,
    } as unknown as HTMLElement;

    const viz = new DiffConstraintsVisualizer();
    await viz.init({
      root: mockRoot,
      algorithmId: 'diff-constraints',
      viewId: 'algo-diff-constraints-view',
    });

    expect(viz).toBeDefined();
    viz.destroy();
  });
});
