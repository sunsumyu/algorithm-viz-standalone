import { describe, it, expect } from 'vitest';
import {
  StateCompressionBfsVisualizer,
  buildStateBFSSteps,
} from './state-compression-bfs-renderer';
import { STATE_COMPRESSION_BFS_CODE_LANGUAGES } from './state-compression-bfs-problem-content';

describe('StateCompressionBFS (LeetCode 864)', () => {
  it('should instantiate StateCompressionBfsVisualizer properly', () => {
    const viz = new StateCompressionBfsVisualizer();
    expect(viz).toBeDefined();
  });

  it('should generate at least 20 granular steps for classic_3x3 preset', () => {
    const steps = buildStateBFSSteps('classic_3x3');
    expect(steps.length).toBeGreaterThanOrEqual(20);

    const javaLinesCount = STATE_COMPRESSION_BFS_CODE_LANGUAGES.java.length;
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
      expect(step.metrics?.['metric-state-keys']).toBeDefined();
      expect(step.metrics?.['metric-state-steps']).toBeDefined();
      expect(step.metrics?.['metric-state-coord']).toBeDefined();
      expect(step.metrics?.['metric-state-phase']).toBeDefined();
    }

    const lastStep = steps[steps.length - 1];
    expect(lastStep.status).toBe('done');
    expect(lastStep.keyMask).toBe(3);
    expect(lastStep.stepCount).toBe(6);
  });

  it('should generate at least 20 granular steps for simple_line preset', () => {
    const steps = buildStateBFSSteps('simple_line');
    expect(steps.length).toBeGreaterThanOrEqual(20);

    const javaLinesCount = STATE_COMPRESSION_BFS_CODE_LANGUAGES.java.length;
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
    expect(lastStep.keyMask).toBe(3);
    expect(lastStep.stepCount).toBe(3);
  });

  it('should have complete code across all languages without empty stubs', () => {
    for (const lang of ['cpp', 'java', 'python', 'javascript']) {
      const code = STATE_COMPRESSION_BFS_CODE_LANGUAGES[lang];
      expect(code).toBeDefined();
      expect(code.length).toBeGreaterThanOrEqual(35);
      const joined = code.join('\n');
      expect(joined).toMatch(/shortestpath|shortest_path/i);
      expect(joined).toMatch(/mask/i);
      expect(joined).toMatch(/visited|queue/i);
    }
  });

  it('should initialize and destroy cleanly with mock root container', async () => {
    const mockElements = new Map<string, any>();
    const mockRoot = {
      querySelector: (sel: string) => mockElements.get(sel) || null,
      querySelectorAll: (_sel: string) => [],
      isConnected: true,
    } as unknown as HTMLElement;

    const viz = new StateCompressionBfsVisualizer();
    await viz.init({
      root: mockRoot,
      algorithmId: 'state-compression-bfs',
      viewId: 'algo-state-compression-bfs-view',
    });

    expect(viz).toBeDefined();
    viz.destroy();
  });
});
