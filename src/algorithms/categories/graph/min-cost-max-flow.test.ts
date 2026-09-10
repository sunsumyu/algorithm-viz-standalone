import { describe, it, expect } from 'vitest';
import {
  MinCostMaxFlowVisualizer,
  buildMCMFSteps,
} from './min-cost-max-flow-renderer';
import { MCMF_CODE_LANGUAGES } from './min-cost-max-flow-problem-content';

describe('MinCostMaxFlow (P3381)', () => {
  it('should instantiate MinCostMaxFlowVisualizer properly', () => {
    const viz = new MinCostMaxFlowVisualizer();
    expect(viz).toBeDefined();
  });

  it('should generate at least 20 granular steps for standard preset', () => {
    const steps = buildMCMFSteps('standard');
    expect(steps.length).toBeGreaterThanOrEqual(20);

    const javaLinesCount = MCMF_CODE_LANGUAGES.java.length;
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
      expect(step.metrics?.['metric-mcmf-flow']).toBeDefined();
      expect(step.metrics?.['metric-mcmf-cost']).toBeDefined();
      expect(step.metrics?.['metric-mcmf-path']).toBeDefined();
      expect(step.metrics?.['metric-mcmf-phase']).toBeDefined();
    }

    const lastStep = steps[steps.length - 1];
    expect(lastStep.status).toBe('done');
    expect(lastStep.totalFlow).toBe(5);
    expect(lastStep.totalCost).toBe(17);
  });

  it('should generate at least 20 granular steps for simple preset', () => {
    const steps = buildMCMFSteps('simple');
    expect(steps.length).toBeGreaterThanOrEqual(20);

    const javaLinesCount = MCMF_CODE_LANGUAGES.java.length;
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
    expect(lastStep.totalFlow).toBe(2);
    expect(lastStep.totalCost).toBe(6);
  });

  it('should have complete code across all languages without empty stubs', () => {
    for (const lang of ['cpp', 'java', 'python', 'javascript']) {
      const code = MCMF_CODE_LANGUAGES[lang];
      expect(code).toBeDefined();
      expect(code.length).toBeGreaterThanOrEqual(40);
      const joined = code.join('\n');
      expect(joined).toMatch(/spfa/i);
      expect(joined).toMatch(/cost/i);
      expect(joined).toMatch(/getmincostmaxflow|get_min_cost_max_flow/i);
    }
  });

  it('should initialize and destroy cleanly with mock root container', async () => {
    const mockElements = new Map<string, any>();
    const mockRoot = {
      querySelector: (sel: string) => mockElements.get(sel) || null,
      querySelectorAll: (_sel: string) => [],
      isConnected: true,
    } as unknown as HTMLElement;

    const viz = new MinCostMaxFlowVisualizer();
    await viz.init({
      root: mockRoot,
      algorithmId: 'min-cost-max-flow',
      viewId: 'algo-min-cost-max-flow-view',
    });

    expect(viz).toBeDefined();
    viz.destroy();
  });
});
