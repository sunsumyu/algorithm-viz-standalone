import { describe, it, expect } from 'vitest';
import {
  CycleCountingVisualizer,
  buildCycleCountingSteps,
} from './cycle-counting-renderer';
import { CYCLE_COUNTING_CODE_LANGUAGES } from './cycle-counting-problem-content';

describe('CycleCounting (P1989)', () => {
  it('should instantiate CycleCountingVisualizer properly', () => {
    const viz = new CycleCountingVisualizer();
    expect(viz).toBeDefined();
  });

  it('should generate at least 20 granular steps for classic_diamond_triangles preset', () => {
    const steps = buildCycleCountingSteps('classic_diamond_triangles');
    expect(steps.length).toBeGreaterThanOrEqual(20);

    const javaLinesCount = CYCLE_COUNTING_CODE_LANGUAGES.java.length;
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
      expect(step.metrics?.['metric-cur-explore']).toBeDefined();
      expect(step.metrics?.['metric-3cycle-count']).toBeDefined();
      expect(step.metrics?.['metric-4cycle-count']).toBeDefined();
      expect(step.metrics?.['metric-cycle-phase']).toBeDefined();
    }

    const lastStep = steps[steps.length - 1];
    expect(lastStep.status).toBe('done');
    expect(lastStep.total3Cycles).toBe(2);
    expect(lastStep.total4Cycles).toBe(1);
    expect(lastStep.trianglesFound.length).toBe(2);
  });

  it('should generate at least 20 granular steps for complete_k4 preset', () => {
    const steps = buildCycleCountingSteps('complete_k4');
    expect(steps.length).toBeGreaterThanOrEqual(20);

    const javaLinesCount = CYCLE_COUNTING_CODE_LANGUAGES.java.length;
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
    expect(lastStep.total3Cycles).toBe(4);
    expect(lastStep.total4Cycles).toBe(3);
  });

  it('should have complete code across all languages without empty stubs', () => {
    for (const lang of ['cpp', 'java', 'python', 'javascript']) {
      const code = CYCLE_COUNTING_CODE_LANGUAGES[lang];
      expect(code).toBeDefined();
      expect(code.length).toBeGreaterThanOrEqual(35);
      const joined = code.join('\n');
      expect(joined).toMatch(/cyclecounting|cycle_counting|solver/i);
      expect(joined).toMatch(/cmp/i);
      expect(joined).toMatch(/orient_?dag|count3cycles/i);
      expect(joined).toMatch(/count.*3.*cycles?/i);
    }
  });

  it('should initialize and destroy cleanly with mock root container', async () => {
    const mockElements = new Map<string, any>();
    const mockRoot = {
      querySelector: (sel: string) => mockElements.get(sel) || null,
      querySelectorAll: (_sel: string) => [],
      isConnected: true,
    } as unknown as HTMLElement;

    const viz = new CycleCountingVisualizer();
    await viz.init({
      root: mockRoot,
      algorithmId: 'cycle-counting',
      viewId: 'algo-cycle-counting-view',
    });

    expect(viz).toBeDefined();
    viz.destroy();
  });
});
