import { describe, it, expect } from 'vitest';
import {
  LCABinaryLiftingVisualizer,
  buildLCASteps,
} from './lca-binary-lifting-renderer';
import { LCA_BINARY_LIFTING_CODE_LANGUAGES } from './lca-binary-lifting-problem-content';

describe('LCABinaryLifting (P3379)', () => {
  it('should instantiate LCABinaryLiftingVisualizer properly', () => {
    const viz = new LCABinaryLiftingVisualizer();
    expect(viz).toBeDefined();
  });

  it('should generate at least 20 granular steps for classic_7node preset', () => {
    const steps = buildLCASteps('classic_7node');
    expect(steps.length).toBeGreaterThanOrEqual(20);

    const javaLinesCount = LCA_BINARY_LIFTING_CODE_LANGUAGES.java.length;
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
      expect(step.metrics?.['metric-lca-query']).toBeDefined();
      expect(step.metrics?.['metric-lca-res']).toBeDefined();
      expect(step.metrics?.['metric-cur-state']).toBeDefined();
      expect(step.metrics?.['metric-lca-phase']).toBeDefined();
    }

    const lastStep = steps[steps.length - 1];
    expect(lastStep.stage).toBe('done');
    expect(lastStep.lcaResult).toBe(2);
    expect(lastStep.treeDist).toBe(3);
  });

  it('should generate at least 20 granular steps for fork_5node preset', () => {
    const steps = buildLCASteps('fork_5node');
    expect(steps.length).toBeGreaterThanOrEqual(20);

    const javaLinesCount = LCA_BINARY_LIFTING_CODE_LANGUAGES.java.length;
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
    expect(lastStep.stage).toBe('done');
    expect(lastStep.lcaResult).toBe(1);
    expect(lastStep.treeDist).toBe(4);
  });

  it('should have complete code across all languages without empty stubs', () => {
    for (const lang of ['cpp', 'java', 'python', 'javascript']) {
      const code = LCA_BINARY_LIFTING_CODE_LANGUAGES[lang];
      expect(code).toBeDefined();
      expect(code.length).toBeGreaterThanOrEqual(35);
      const joined = code.join('\n');
      expect(joined).toMatch(/dfs/i);
      expect(joined).toMatch(/getlca|get_lca/i);
      expect(joined).toMatch(/getdist|get_dist/i);
    }
  });

  it('should initialize and destroy cleanly with mock root container', async () => {
    const mockElements = new Map<string, any>();
    const mockRoot = {
      querySelector: (sel: string) => mockElements.get(sel) || null,
      querySelectorAll: (_sel: string) => [],
      isConnected: true,
    } as unknown as HTMLElement;

    const viz = new LCABinaryLiftingVisualizer();
    await viz.init({
      root: mockRoot,
      algorithmId: 'lca-binary-lifting',
      viewId: 'algo-lca-binary-lifting-view',
    });

    expect(viz).toBeDefined();
    viz.destroy();
  });
});
