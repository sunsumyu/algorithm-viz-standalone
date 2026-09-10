import { describe, it, expect } from 'vitest';
import {
  PathMinEffortVisualizer,
  buildPathMinEffortSteps,
} from './path-min-effort-renderer';
import { PATH_MIN_EFFORT_CODE_LANGUAGES } from './path-min-effort-problem-content';

describe('PathMinEffort (LeetCode 1631)', () => {
  it('should instantiate PathMinEffortVisualizer properly', () => {
    const viz = new PathMinEffortVisualizer();
    expect(viz).toBeDefined();
  });

  it('should generate at least 20 granular steps for classic_mountain_3x3 preset', () => {
    const steps = buildPathMinEffortSteps('classic_mountain_3x3');
    expect(steps.length).toBeGreaterThanOrEqual(20);

    const javaLinesCount = PATH_MIN_EFFORT_CODE_LANGUAGES.java.length;
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
      expect(step.metrics?.['metric-cur-coord']).toBeDefined();
      expect(step.metrics?.['metric-min-effort']).toBeDefined();
      expect(step.metrics?.['metric-cur-height']).toBeDefined();
      expect(step.metrics?.['metric-effort-phase']).toBeDefined();
    }

    const lastStep = steps[steps.length - 1];
    expect(lastStep.status).toBe('done');
    expect(lastStep.minEffortSoFar).toBe(2);
    expect(lastStep.curR).toBe(2);
    expect(lastStep.curC).toBe(2);
  });

  it('should generate at least 20 granular steps for valley_3x3 preset', () => {
    const steps = buildPathMinEffortSteps('valley_3x3');
    expect(steps.length).toBeGreaterThanOrEqual(20);

    const javaLinesCount = PATH_MIN_EFFORT_CODE_LANGUAGES.java.length;
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
    expect(lastStep.minEffortSoFar).toBe(1);
    expect(lastStep.curR).toBe(2);
    expect(lastStep.curC).toBe(2);
  });

  it('should have complete code across all languages without empty stubs', () => {
    for (const lang of ['cpp', 'java', 'python', 'javascript']) {
      const code = PATH_MIN_EFFORT_CODE_LANGUAGES[lang];
      expect(code).toBeDefined();
      expect(code.length).toBeGreaterThanOrEqual(35);
      const joined = code.join('\n');
      expect(joined).toMatch(/minimumeffortpath|minimum_effort_path/i);
      expect(joined).toMatch(/dist/i);
      expect(joined).toMatch(/visited/i);
      expect(joined).toMatch(/pq|priority_queue|heap/i);
    }
  });

  it('should initialize and destroy cleanly with mock root container', async () => {
    const mockElements = new Map<string, any>();
    const mockRoot = {
      querySelector: (sel: string) => mockElements.get(sel) || null,
      querySelectorAll: (_sel: string) => [],
      isConnected: true,
    } as unknown as HTMLElement;

    const viz = new PathMinEffortVisualizer();
    await viz.init({
      root: mockRoot,
      algorithmId: 'path-min-effort',
      viewId: 'algo-path-min-effort-view',
    });

    expect(viz).toBeDefined();
    viz.destroy();
  });
});
