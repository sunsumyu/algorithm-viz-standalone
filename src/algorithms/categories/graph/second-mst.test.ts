import { describe, it, expect } from 'vitest';
import {
  SecondMstVisualizer,
  buildSecondMstSteps,
} from './second-mst-renderer';
import { SECOND_MST_CODE_LANGUAGES } from './second-mst-problem-content';

describe('SecondMst (P4180)', () => {
  it('should instantiate SecondMstVisualizer properly', () => {
    const viz = new SecondMstVisualizer();
    expect(viz).toBeDefined();
  });

  it('should generate at least 20 granular steps for classic_4node_p4180 preset', () => {
    const steps = buildSecondMstSteps('classic_4node_p4180');
    expect(steps.length).toBeGreaterThanOrEqual(20);

    const javaLinesCount = SECOND_MST_CODE_LANGUAGES.java.length;
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
      expect(step.metrics?.['metric-mst-w']).toBeDefined();
      expect(step.metrics?.['metric-second-mst-w']).toBeDefined();
      expect(step.metrics?.['metric-cur-edge']).toBeDefined();
      expect(step.metrics?.['metric-smst-phase']).toBeDefined();
    }

    const lastStep = steps[steps.length - 1];
    expect(lastStep.status).toBe('done');
    expect(lastStep.mstWeight).toBe(6);
    expect(lastStep.secondMstWeight).toBe(7);
  });

  it('should generate at least 20 granular steps for equal_weight_5node preset', () => {
    const steps = buildSecondMstSteps('equal_weight_5node');
    expect(steps.length).toBeGreaterThanOrEqual(20);

    const javaLinesCount = SECOND_MST_CODE_LANGUAGES.java.length;
    for (const step of steps) {
      expect(step.message).toBeTruthy();
      expect(step.log).toBeTruthy();
      expect(step.codeLine).toBeDefined();
      const lines = Array.isArray(step.codeLine) ? step.codeLine : [step.codeLine];
      for (const line of lines) {
        expect(line).toBeGreaterThan(0);
        expect(line).toBeLessThanOrEqual(javaLinesCount);
      }
    }

    const lastStep = steps[steps.length - 1];
    expect(lastStep.status).toBe('done');
    expect(lastStep.mstWeight).toBe(8);
    expect(lastStep.secondMstWeight).toBe(10);
  });

  it('should have complete code across all languages without empty stubs', () => {
    for (const lang of ['cpp', 'java', 'python', 'javascript']) {
      const code = SECOND_MST_CODE_LANGUAGES[lang];
      expect(code).toBeDefined();
      expect(code.length).toBeGreaterThanOrEqual(35);
      const joined = code.join('\n');
      expect(joined).toMatch(/secondmst|second_mst/i);
      expect(joined).toMatch(/kruskal/i);
      expect(joined).toMatch(/max1/i);
      expect(joined).toMatch(/max2/i);
    }
  });

  it('should initialize and destroy cleanly with mock root container', async () => {
    const mockElements = new Map<string, any>();
    const mockRoot = {
      querySelector: (sel: string) => mockElements.get(sel) || null,
      querySelectorAll: (_sel: string) => [],
      isConnected: true,
    } as unknown as HTMLElement;

    const viz = new SecondMstVisualizer();
    await viz.init({
      root: mockRoot,
      algorithmId: 'second-mst',
      viewId: 'algo-second-mst-view',
    });

    expect(viz).toBeDefined();
    viz.destroy();
  });
});
