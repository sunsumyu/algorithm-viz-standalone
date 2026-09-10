import { describe, it, expect } from 'vitest';
import {
  KruskalReconstructionTreeVisualizer,
  buildKruskalTreeSteps,
} from './kruskal-reconstruction-tree-renderer';
import { KRUSKAL_TREE_CODE_LANGUAGES } from './kruskal-reconstruction-tree-problem-content';

describe('KruskalReconstructionTree (P4768)', () => {
  it('should instantiate KruskalReconstructionTreeVisualizer properly', () => {
    const viz = new KruskalReconstructionTreeVisualizer();
    expect(viz).toBeDefined();
  });

  it('should generate at least 20 granular steps for classic_4node preset', () => {
    const steps = buildKruskalTreeSteps('classic_4node');
    expect(steps.length).toBeGreaterThanOrEqual(20);

    const javaLinesCount = KRUSKAL_TREE_CODE_LANGUAGES.java.length;
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
      expect(step.metrics?.['metric-kruskal-root']).toBeDefined();
      expect(step.metrics?.['metric-lca-bottleneck']).toBeDefined();
      expect(step.metrics?.['metric-cur-edge']).toBeDefined();
      expect(step.metrics?.['metric-kruskal-phase']).toBeDefined();
    }

    const lastStep = steps[steps.length - 1];
    expect(lastStep.status).toBe('done');
    expect(lastStep.nodeWeights[5]).toBe(2);
    expect(lastStep.nodeWeights[6]).toBe(3);
    expect(lastStep.nodeWeights[7]).toBe(4);
    expect(lastStep.treeEdges.length).toBe(6);
  });

  it('should generate at least 20 granular steps for star_3node preset', () => {
    const steps = buildKruskalTreeSteps('star_3node');
    expect(steps.length).toBeGreaterThanOrEqual(20);

    const javaLinesCount = KRUSKAL_TREE_CODE_LANGUAGES.java.length;
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
    expect(lastStep.nodeWeights[4]).toBe(3);
    expect(lastStep.nodeWeights[5]).toBe(5);
    expect(lastStep.treeEdges.length).toBe(4);
  });

  it('should have complete code across all languages without empty stubs', () => {
    for (const lang of ['cpp', 'java', 'python', 'javascript']) {
      const code = KRUSKAL_TREE_CODE_LANGUAGES[lang];
      expect(code).toBeDefined();
      expect(code.length).toBeGreaterThanOrEqual(35);
      const joined = code.join('\n');
      expect(joined).toMatch(/build/i);
      expect(joined).toMatch(/querybottleneck|query_bottleneck/i);
    }
  });

  it('should initialize and destroy cleanly with mock root container', async () => {
    const mockElements = new Map<string, any>();
    const mockRoot = {
      querySelector: (sel: string) => mockElements.get(sel) || null,
      querySelectorAll: (_sel: string) => [],
      isConnected: true,
    } as unknown as HTMLElement;

    const viz = new KruskalReconstructionTreeVisualizer();
    await viz.init({
      root: mockRoot,
      algorithmId: 'kruskal-reconstruction-tree',
      viewId: 'algo-kruskal-reconstruction-tree-view',
    });

    expect(viz).toBeDefined();
    viz.destroy();
  });
});
