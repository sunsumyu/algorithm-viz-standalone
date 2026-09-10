import { describe, it, expect } from 'vitest';
import {
  TarjanSCCDAGVisualizer,
  buildTarjanSCCSteps,
} from './tarjan-scc-dag-renderer';
import { TARJAN_SCC_DAG_CODE_LANGUAGES } from './tarjan-scc-dag-problem-content';

describe('TarjanSCCDAG (P3387)', () => {
  it('should instantiate TarjanSCCDAGVisualizer properly', () => {
    const viz = new TarjanSCCDAGVisualizer();
    expect(viz).toBeDefined();
  });

  it('should generate at least 20 granular steps for classic_5node preset', () => {
    const steps = buildTarjanSCCSteps('classic_5node');
    expect(steps.length).toBeGreaterThanOrEqual(20);

    const javaLinesCount = TARJAN_SCC_DAG_CODE_LANGUAGES.java.length;
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
      expect(step.metrics?.['metric-scc-count']).toBeDefined();
      expect(step.metrics?.['metric-stack-len']).toBeDefined();
      expect(step.metrics?.['metric-cur-node']).toBeDefined();
      expect(step.metrics?.['metric-tarjan-phase']).toBeDefined();
    }

    const lastStep = steps[steps.length - 1];
    expect(lastStep.status).toBe('done');
    expect(lastStep.sccList.length).toBe(2);
    expect(lastStep.condensedEdges.length).toBe(1);
  });

  it('should generate at least 20 granular steps for simple_4node preset', () => {
    const steps = buildTarjanSCCSteps('simple_4node');
    expect(steps.length).toBeGreaterThanOrEqual(20);

    const javaLinesCount = TARJAN_SCC_DAG_CODE_LANGUAGES.java.length;
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
    expect(lastStep.sccList.length).toBe(2);
  });

  it('should have complete code across all languages without empty stubs', () => {
    for (const lang of ['cpp', 'java', 'python', 'javascript']) {
      const code = TARJAN_SCC_DAG_CODE_LANGUAGES[lang];
      expect(code).toBeDefined();
      expect(code.length).toBeGreaterThanOrEqual(35);
      const joined = code.join('\n');
      expect(joined).toMatch(/tarjan/i);
      expect(joined).toMatch(/builddag|build_dag/i);
    }
  });

  it('should initialize and destroy cleanly with mock root container', async () => {
    const mockElements = new Map<string, any>();
    const mockRoot = {
      querySelector: (sel: string) => mockElements.get(sel) || null,
      querySelectorAll: (_sel: string) => [],
      isConnected: true,
    } as unknown as HTMLElement;

    const viz = new TarjanSCCDAGVisualizer();
    await viz.init({
      root: mockRoot,
      algorithmId: 'tarjan-scc-dag',
      viewId: 'algo-tarjan-scc-dag-view',
    });

    expect(viz).toBeDefined();
    viz.destroy();
  });
});
