import { describe, it, expect } from 'vitest';
import {
  BiBFSVisualizer,
  buildBiBFSSteps,
} from './bi-bfs-renderer';
import { BI_BFS_CODE_LANGUAGES } from './bi-bfs-problem-content';

describe('BiBFS (LeetCode 127)', () => {
  it('should instantiate BiBFSVisualizer properly', () => {
    const viz = new BiBFSVisualizer();
    expect(viz).toBeDefined();
  });

  it('should generate at least 20 granular steps for classic_word preset', () => {
    const steps = buildBiBFSSteps('classic_word');
    expect(steps.length).toBeGreaterThanOrEqual(20);

    const javaLinesCount = BI_BFS_CODE_LANGUAGES.java.length;
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
      expect(step.metrics?.['metric-bibfs-step']).toBeDefined();
      expect(step.metrics?.['metric-bibfs-meet']).toBeDefined();
      expect(step.metrics?.['metric-small-size']).toBeDefined();
      expect(step.metrics?.['metric-bibfs-phase']).toBeDefined();
    }

    const lastStep = steps[steps.length - 1];
    expect(lastStep.status).toBe('done');
    expect(lastStep.meetWord).toBe('dot');
    expect(lastStep.stepCount).toBe(5);
    expect(lastStep.activePath).toEqual(['hit', 'hot', 'dot', 'dog', 'cog']);
  });

  it('should generate at least 20 granular steps for line_4word preset', () => {
    const steps = buildBiBFSSteps('line_4word');
    expect(steps.length).toBeGreaterThanOrEqual(20);

    const javaLinesCount = BI_BFS_CODE_LANGUAGES.java.length;
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
    expect(lastStep.stepCount).toBe(4);
  });

  it('should have complete code across all languages without empty stubs', () => {
    for (const lang of ['cpp', 'java', 'python', 'javascript']) {
      const code = BI_BFS_CODE_LANGUAGES[lang];
      expect(code).toBeDefined();
      expect(code.length).toBeGreaterThanOrEqual(35);
      const joined = code.join('\n');
      expect(joined).toMatch(/ladderlength|ladder_length/i);
      expect(joined).toMatch(/small/i);
      expect(joined).toMatch(/big/i);
    }
  });

  it('should initialize and destroy cleanly with mock root container', async () => {
    const mockElements = new Map<string, any>();
    const mockRoot = {
      querySelector: (sel: string) => mockElements.get(sel) || null,
      querySelectorAll: (_sel: string) => [],
      isConnected: true,
    } as unknown as HTMLElement;

    const viz = new BiBFSVisualizer();
    await viz.init({
      root: mockRoot,
      algorithmId: 'bi-bfs',
      viewId: 'algo-bi-bfs-view',
    });

    expect(viz).toBeDefined();
    viz.destroy();
  });
});
