import { describe, it, expect } from 'vitest';
import {
  PseudotreeVisualizer,
  buildPseudotreeSteps,
} from './pseudotree-dp-renderer';
import { PSEUDOTREE_DP_CODE_LANGUAGES } from './pseudotree-dp-problem-content';

describe('PseudotreeDP (P1453 / P2607)', () => {
  it('should instantiate PseudotreeVisualizer properly', () => {
    const viz = new PseudotreeVisualizer();
    expect(viz).toBeDefined();
  });

  it('should generate at least 20 granular steps for classic_6node preset', () => {
    const steps = buildPseudotreeSteps('classic_6node');
    expect(steps.length).toBeGreaterThanOrEqual(20);

    const javaLinesCount = PSEUDOTREE_DP_CODE_LANGUAGES.java.length;
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
      expect(step.metrics?.['metric-cycle-nodes']).toBeDefined();
      expect(step.metrics?.['metric-dp-optimal']).toBeDefined();
      expect(step.metrics?.['metric-cur-node']).toBeDefined();
      expect(step.metrics?.['metric-pseudotree-phase']).toBeDefined();
    }

    const lastStep = steps[steps.length - 1];
    expect(lastStep.status).toBe('done');
    expect(lastStep.dpRes).toBe(35);
    expect(lastStep.selectedNodes).toEqual([4, 3, 5]);
  });

  it('should generate at least 20 granular steps for simple_5node preset', () => {
    const steps = buildPseudotreeSteps('simple_5node');
    expect(steps.length).toBeGreaterThanOrEqual(20);

    const javaLinesCount = PSEUDOTREE_DP_CODE_LANGUAGES.java.length;
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
    expect(lastStep.dpRes).toBe(24);
  });

  it('should have complete code across all languages without empty stubs', () => {
    for (const lang of ['cpp', 'java', 'python', 'javascript']) {
      const code = PSEUDOTREE_DP_CODE_LANGUAGES[lang];
      expect(code).toBeDefined();
      expect(code.length).toBeGreaterThanOrEqual(35);
      const joined = code.join('\n');
      expect(joined).toMatch(/findcircle|find_circle/i);
      expect(joined).toMatch(/treedp|tree_dp/i);
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

    const viz = new PseudotreeVisualizer();
    await viz.init({
      root: mockRoot,
      algorithmId: 'pseudotree-dp',
      viewId: 'algo-pseudotree-dp-view',
    });

    expect(viz).toBeDefined();
    viz.destroy();
  });
});
