import { describe, it, expect } from 'vitest';
import {
  DinicMaxFlowVisualizer,
  buildDinicSteps,
} from './dinic-max-flow-renderer';
import { DINIC_MAX_FLOW_CODE_LANGUAGES } from './dinic-max-flow-problem-content';

describe('DinicMaxFlow (P3376)', () => {
  it('should instantiate DinicMaxFlowVisualizer properly', () => {
    const viz = new DinicMaxFlowVisualizer();
    expect(viz).toBeDefined();
  });

  it('should generate at least 20 granular steps for diamond preset', () => {
    const steps = buildDinicSteps('diamond');
    expect(steps.length).toBeGreaterThanOrEqual(20);

    const javaLinesCount = DINIC_MAX_FLOW_CODE_LANGUAGES.java.length;
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
      expect(step.metrics?.['metric-dinic-level']).toBeDefined();
      expect(step.metrics?.['metric-dinic-max-flow']).toBeDefined();
      expect(step.metrics?.['metric-dinic-path']).toBeDefined();
      expect(step.metrics?.['metric-dinic-phase']).toBeDefined();
    }

    const lastStep = steps[steps.length - 1];
    expect(lastStep.status).toBe('done');
    expect(lastStep.curMaxFlow).toBe(20);
  });

  it('should generate at least 20 granular steps for cross preset', () => {
    const steps = buildDinicSteps('cross');
    expect(steps.length).toBeGreaterThanOrEqual(20);

    const javaLinesCount = DINIC_MAX_FLOW_CODE_LANGUAGES.java.length;
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
    expect(lastStep.curMaxFlow).toBe(18);
  });

  it('should have complete code across all languages without empty stubs', () => {
    for (const lang of ['cpp', 'java', 'python', 'javascript']) {
      const code = DINIC_MAX_FLOW_CODE_LANGUAGES[lang];
      expect(code).toBeDefined();
      expect(code.length).toBeGreaterThanOrEqual(40);
      const joined = code.join('\n');
      expect(joined).toMatch(/bfs/i);
      expect(joined).toMatch(/dfs/i);
      expect(joined).toMatch(/maxflow|max_flow/i);
    }
  });

  it('should initialize and destroy cleanly with mock root container', async () => {
    const mockElements = new Map<string, any>();
    const mockRoot = {
      querySelector: (sel: string) => mockElements.get(sel) || null,
      querySelectorAll: (_sel: string) => [],
      isConnected: true,
    } as unknown as HTMLElement;

    const viz = new DinicMaxFlowVisualizer();
    await viz.init({
      root: mockRoot,
      algorithmId: 'dinic-max-flow',
      viewId: 'algo-dinic-max-flow-view',
    });

    expect(viz).toBeDefined();
    viz.destroy();
  });
});
