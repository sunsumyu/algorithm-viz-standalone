import { describe, it, expect } from 'vitest';
import {
  BFS01Visualizer,
  buildBFS01Steps,
} from './bfs-01-renderer';
import { BFS_01_CODE_LANGUAGES } from './bfs-01-problem-content';

describe('BFS01', () => {
  it('should instantiate BFS01Visualizer properly', () => {
    const viz = new BFS01Visualizer();
    expect(viz).toBeDefined();
  });

  it('should generate at least 20 granular steps for classic_5node preset', () => {
    const steps = buildBFS01Steps('classic_5node');
    expect(steps.length).toBeGreaterThanOrEqual(20);

    const javaLinesCount = BFS_01_CODE_LANGUAGES.java.length;
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
      expect(step.metrics?.['metric-bfs01-node']).toBeDefined();
      expect(step.metrics?.['metric-bfs01-dist']).toBeDefined();
      expect(step.metrics?.['metric-deque-size']).toBeDefined();
      expect(step.metrics?.['metric-bfs01-phase']).toBeDefined();
    }

    const lastStep = steps[steps.length - 1];
    expect(lastStep.status).toBe('done');
    expect(lastStep.distMap[5]).toBe(1);
    expect(lastStep.shortestPath).toBeDefined();
  });

  it('should generate at least 20 granular steps for simple_4node preset', () => {
    const steps = buildBFS01Steps('simple_4node');
    expect(steps.length).toBeGreaterThanOrEqual(20);

    const javaLinesCount = BFS_01_CODE_LANGUAGES.java.length;
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
    expect(lastStep.distMap[4]).toBe(1);
  });

  it('should have complete code across all languages without empty stubs', () => {
    for (const lang of ['cpp', 'java', 'python', 'javascript']) {
      const code = BFS_01_CODE_LANGUAGES[lang];
      expect(code).toBeDefined();
      expect(code.length).toBeGreaterThanOrEqual(35);
      const joined = code.join('\n');
      expect(joined).toMatch(/deque|dist/i);
      expect(joined).toMatch(/push|add|append/i);
    }
  });

  it('should initialize and destroy cleanly with mock root container', async () => {
    const mockElements = new Map<string, any>();
    const mockRoot = {
      querySelector: (sel: string) => mockElements.get(sel) || null,
      querySelectorAll: (_sel: string) => [],
      isConnected: true,
    } as unknown as HTMLElement;

    const viz = new BFS01Visualizer();
    await viz.init({
      root: mockRoot,
      algorithmId: 'bfs-01',
      viewId: 'algo-bfs-01-view',
    });

    expect(viz).toBeDefined();
    viz.destroy();
  });
});
