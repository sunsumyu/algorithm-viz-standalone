import { describe, it, expect } from 'vitest';
import {
  CouplesHoldingHandsVisualizer,
  buildCouplesSteps,
} from './couples-holding-hands-renderer';
import { COUPLES_CODE_LANGUAGES } from './couples-holding-hands-problem-content';

describe('CouplesHoldingHands (LeetCode 765)', () => {
  it('should instantiate CouplesHoldingHandsVisualizer properly', () => {
    const viz = new CouplesHoldingHandsVisualizer();
    expect(viz).toBeDefined();
  });

  it('should generate at least 20 granular steps for two_cycles preset', () => {
    const steps = buildCouplesSteps('two_cycles');
    expect(steps.length).toBeGreaterThanOrEqual(20);

    const javaLinesCount = COUPLES_CODE_LANGUAGES.java.length;
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
      expect(step.metrics?.['metric-disjoint-sets']).toBeDefined();
      expect(step.metrics?.['metric-min-swaps']).toBeDefined();
      expect(step.metrics?.['metric-current-couch']).toBeDefined();
      expect(step.metrics?.['metric-cycle-count']).toBeDefined();
    }

    const lastStep = steps[steps.length - 1];
    expect(lastStep.status).toBe('done');
    expect(lastStep.minSwaps).toBe(2);
    expect(lastStep.disjointSetCount).toBe(2);
  });

  it('should generate at least 20 granular steps for big_cycle preset', () => {
    const steps = buildCouplesSteps('big_cycle');
    expect(steps.length).toBeGreaterThanOrEqual(20);

    const javaLinesCount = COUPLES_CODE_LANGUAGES.java.length;
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
    expect(lastStep.minSwaps).toBe(3);
    expect(lastStep.disjointSetCount).toBe(1);
  });

  it('should generate at least 20 granular steps for perfect preset', () => {
    const steps = buildCouplesSteps('perfect');
    expect(steps.length).toBeGreaterThanOrEqual(20);

    const lastStep = steps[steps.length - 1];
    expect(lastStep.status).toBe('done');
    expect(lastStep.minSwaps).toBe(0);
    expect(lastStep.disjointSetCount).toBe(4);
  });

  it('should have complete code across all languages without empty stubs', () => {
    for (const lang of ['cpp', 'java', 'python', 'javascript']) {
      const code = COUPLES_CODE_LANGUAGES[lang];
      expect(code).toBeDefined();
      expect(code.length).toBeGreaterThanOrEqual(20);
      const joined = code.join('\n');
      expect(joined).toMatch(/union|unite|minswaps/i);
    }
  });

  it('should initialize and destroy cleanly with mock root container', async () => {
    const mockElements = new Map<string, any>();
    const mockRoot = {
      querySelector: (sel: string) => mockElements.get(sel) || null,
      querySelectorAll: (_sel: string) => [],
      isConnected: true,
    } as unknown as HTMLElement;

    const viz = new CouplesHoldingHandsVisualizer();
    await viz.init({
      root: mockRoot,
      algorithmId: 'couples-holding-hands',
      viewId: 'algo-couples-holding-hands-view',
    });

    expect(viz).toBeDefined();
    viz.destroy();
  });
});
