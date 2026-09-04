import { describe, it, expect } from 'vitest';
import {
  MaxWeightClosureVisualizer,
  buildMaxWeightClosureSteps,
} from './max-weight-closure-renderer';
import { MAX_WEIGHT_CLOSURE_CODE_LANGUAGES } from './max-weight-closure-problem-content';

describe('MaxWeightClosure (P2762)', () => {
  it('should instantiate MaxWeightClosureVisualizer properly', () => {
    const viz = new MaxWeightClosureVisualizer();
    expect(viz).toBeDefined();
  });

  it('should generate at least 20 granular steps for space preset', () => {
    const steps = buildMaxWeightClosureSteps('space');
    expect(steps.length).toBeGreaterThanOrEqual(20);

    const javaLinesCount = MAX_WEIGHT_CLOSURE_CODE_LANGUAGES.java.length;
    for (const step of steps) {
      expect(step.message).toBeTruthy();
      expect(step.log).toBeTruthy();
      expect(step.codeLine).toBeDefined();
      const lines = Array.isArray(step.codeLine) ? step.codeLine : [step.codeLine];
      for (const line of lines) {
        expect(line).toBeGreaterThan(0);
        expect(line).toBeLessThanOrEqual(javaLinesCount);
      }
      expect(step.metrics).toBeDefined();
      expect(step.metrics?.['metric-pos-weight']).toBeDefined();
      expect(step.metrics?.['metric-min-cut-val']).toBeDefined();
      expect(step.metrics?.['metric-max-profit']).toBeDefined();
      expect(step.metrics?.['metric-closure-phase']).toBeDefined();
    }

    const lastStep = steps[steps.length - 1];
    expect(lastStep.status).toBe('done');
    expect(lastStep.maxProfit).toBe(5);
    expect(lastStep.minCutValue).toBe(20);
    expect(lastStep.chosenNodes).toEqual(['E1', 'E2', 'I1', 'I2', 'I3']);
  });

  it('should generate at least 20 granular steps for simple preset', () => {
    const steps = buildMaxWeightClosureSteps('simple');
    expect(steps.length).toBeGreaterThanOrEqual(20);

    const javaLinesCount = MAX_WEIGHT_CLOSURE_CODE_LANGUAGES.java.length;
    for (const step of steps) {
      expect(step.message).toBeTruthy();
      expect(step.log).toBeTruthy();
      expect(step.codeLine).toBeDefined();
      const lines = Array.isArray(step.codeLine) ? step.codeLine : [step.codeLine];
      for (const line of lines) {
        expect(line).toBeGreaterThan(0);
        expect(line).toBeLessThanOrEqual(javaLinesCount);
      }
      expect(step.metrics).toBeDefined();
    }

    const lastStep = steps[steps.length - 1];
    expect(lastStep.status).toBe('done');
    expect(lastStep.maxProfit).toBe(3);
    expect(lastStep.minCutValue).toBe(9);
    expect(lastStep.chosenNodes).toEqual(['E1', 'I1', 'I2']);
  });

  it('should have complete code across all languages without empty stubs', () => {
    for (const lang of ['cpp', 'java', 'python', 'javascript']) {
      const code = MAX_WEIGHT_CLOSURE_CODE_LANGUAGES[lang];
      expect(code).toBeDefined();
      expect(code.length).toBeGreaterThanOrEqual(40);
      const joined = code.join('\n');
      expect(joined).toMatch(/addnode|add_node/i);
      expect(joined).toMatch(/adddependency|add_dependency/i);
      expect(joined).toMatch(/bfs/i);
      expect(joined).toMatch(/dfs/i);
      expect(joined).toMatch(/solve/i);
    }
  });

  it('should initialize and destroy cleanly with mock root container', async () => {
    const mockElements = new Map<string, any>();
    const mockRoot = {
      querySelector: (sel: string) => mockElements.get(sel) || null,
      querySelectorAll: (_sel: string) => [],
      isConnected: true,
    } as unknown as HTMLElement;

    const viz = new MaxWeightClosureVisualizer();
    await viz.init({
      root: mockRoot,
      algorithmId: 'max-weight-closure',
      viewId: 'algo-max-weight-closure-view',
    });

    expect(viz).toBeDefined();
    viz.destroy();
  });
});
