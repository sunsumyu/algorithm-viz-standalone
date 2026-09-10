import { describe, it, expect } from 'vitest';
import {
  CentroidTreeVisualizer,
  buildCentroidTreeSteps,
} from './centroid-tree-renderer';
import { CENTROID_TREE_CODE_LANGUAGES } from './centroid-tree-problem-content';

describe('CentroidTree (Dynamic Centroid Decomposition)', () => {
  it('should instantiate CentroidTreeVisualizer properly', () => {
    const viz = new CentroidTreeVisualizer();
    expect(viz).toBeDefined();
  });

  it('should generate at least 20 granular steps for classic_5node preset', () => {
    const steps = buildCentroidTreeSteps('classic_5node');
    expect(steps.length).toBeGreaterThanOrEqual(20);

    const javaLinesCount = CENTROID_TREE_CODE_LANGUAGES.java.length;
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
      expect(step.metrics?.['metric-active-node']).toBeDefined();
      expect(step.metrics?.['metric-tree-height']).toBeDefined();
      expect(step.metrics?.['metric-centroid-root']).toBeDefined();
      expect(step.metrics?.['metric-centroid-phase']).toBeDefined();
    }

    const lastStep = steps[steps.length - 1];
    expect(lastStep.status).toBe('done');
    expect(lastStep.centroidParents[1]).toBeNull();
    expect(lastStep.centroidParents[4]).toBe(1);
    expect(lastStep.centroidParents[5]).toBe(1);
    expect(lastStep.centroidParents[2]).toBe(4);
    expect(lastStep.centroidParents[3]).toBe(5);
  });

  it('should generate at least 20 granular steps for simple_line preset', () => {
    const steps = buildCentroidTreeSteps('simple_line');
    expect(steps.length).toBeGreaterThanOrEqual(20);

    const javaLinesCount = CENTROID_TREE_CODE_LANGUAGES.java.length;
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
    expect(lastStep.centroidParents[3]).toBeNull();
  });

  it('should have complete code across all languages without empty stubs', () => {
    for (const lang of ['cpp', 'java', 'python', 'javascript']) {
      const code = CENTROID_TREE_CODE_LANGUAGES[lang];
      expect(code).toBeDefined();
      expect(code.length).toBeGreaterThanOrEqual(35);
      const joined = code.join('\n');
      expect(joined).toMatch(/centroidtree|centroid_tree/i);
      expect(joined).toMatch(/getsubtreesize|get_subtree_size/i);
      expect(joined).toMatch(/build/i);
      expect(joined).toMatch(/parentctree|parent_ctree/i);
    }
  });

  it('should initialize and destroy cleanly with mock root container', async () => {
    const mockElements = new Map<string, any>();
    const mockRoot = {
      querySelector: (sel: string) => mockElements.get(sel) || null,
      querySelectorAll: (_sel: string) => [],
      isConnected: true,
    } as unknown as HTMLElement;

    const viz = new CentroidTreeVisualizer();
    await viz.init({
      root: mockRoot,
      algorithmId: 'centroid-tree',
      viewId: 'algo-centroid-tree-view',
    });

    expect(viz).toBeDefined();
    viz.destroy();
  });
});
