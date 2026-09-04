import { describe, it, expect } from 'vitest';
import {
  TreeCentroidDecompositionVisualizer,
  buildStaticCentroidSteps,
} from './tree-centroid-decomposition-renderer';
import { TREE_CENTROID_CODE_LANGUAGES } from './tree-centroid-decomposition-problem-content';

describe('TreeCentroidDecomposition (POJ 1741)', () => {
  it('should instantiate TreeCentroidDecompositionVisualizer properly', () => {
    const viz = new TreeCentroidDecompositionVisualizer();
    expect(viz).toBeDefined();
  });

  it('should generate at least 20 granular steps for classic_7node preset', () => {
    const steps = buildStaticCentroidSteps('classic_7node');
    expect(steps.length).toBeGreaterThanOrEqual(20);

    const javaLinesCount = TREE_CENTROID_CODE_LANGUAGES.java.length;
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
      expect(step.metrics?.['metric-cur-centroid']).toBeDefined();
      expect(step.metrics?.['metric-max-subtree']).toBeDefined();
      expect(step.metrics?.['metric-path-count']).toBeDefined();
      expect(step.metrics?.['metric-centroid-phase']).toBeDefined();
    }

    const lastStep = steps[steps.length - 1];
    expect(lastStep.status).toBe('done');
    expect(lastStep.visitedNodes).toContain(1);
    expect(lastStep.visitedNodes).toContain(2);
    expect(lastStep.visitedNodes).toContain(3);
  });

  it('should generate at least 20 granular steps for line_5node preset', () => {
    const steps = buildStaticCentroidSteps('line_5node');
    expect(steps.length).toBeGreaterThanOrEqual(20);

    const javaLinesCount = TREE_CENTROID_CODE_LANGUAGES.java.length;
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
    expect(lastStep.visitedNodes).toContain(3);
  });

  it('should have complete code across all languages without empty stubs', () => {
    for (const lang of ['cpp', 'java', 'python', 'javascript']) {
      const code = TREE_CENTROID_CODE_LANGUAGES[lang];
      expect(code).toBeDefined();
      expect(code.length).toBeGreaterThanOrEqual(35);
      const joined = code.join('\n');
      expect(joined).toMatch(/getcentroid|get_centroid/i);
      expect(joined).toMatch(/getdists|get_dists/i);
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

    const viz = new TreeCentroidDecompositionVisualizer();
    await viz.init({
      root: mockRoot,
      algorithmId: 'tree-centroid-decomposition',
      viewId: 'algo-tree-centroid-decomposition-view',
    });

    expect(viz).toBeDefined();
    viz.destroy();
  });
});
