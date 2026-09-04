import { describe, it, expect } from 'vitest';
import {
  BlockCutTreeVisualizer,
  buildBlockCutTreeSteps,
} from './block-cut-tree-renderer';
import { BLOCK_CUT_TREE_CODE_LANGUAGES } from './block-cut-tree-problem-content';

describe('BlockCutTree (P4320)', () => {
  it('should instantiate BlockCutTreeVisualizer properly', () => {
    const viz = new BlockCutTreeVisualizer();
    expect(viz).toBeDefined();
  });

  it('should generate at least 20 granular steps for classic_6node preset', () => {
    const steps = buildBlockCutTreeSteps('classic_6node');
    expect(steps.length).toBeGreaterThanOrEqual(20);

    const javaLinesCount = BLOCK_CUT_TREE_CODE_LANGUAGES.java.length;
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
      expect(step.metrics?.['metric-round-count']).toBeDefined();
      expect(step.metrics?.['metric-square-count']).toBeDefined();
      expect(step.metrics?.['metric-cut-vertices']).toBeDefined();
      expect(step.metrics?.['metric-bct-phase']).toBeDefined();
    }

    const lastStep = steps[steps.length - 1];
    expect(lastStep.status).toBe('done');
    expect(lastStep.squareNodes.length).toBe(3);
    expect(lastStep.cutVertices).toContain(3);
    expect(lastStep.cutVertices).toContain(4);
    expect(lastStep.mustPassCutNodes).toContain(3);
    expect(lastStep.mustPassCutNodes).toContain(4);
  });

  it('should generate at least 20 granular steps for simple_4node preset', () => {
    const steps = buildBlockCutTreeSteps('simple_4node');
    expect(steps.length).toBeGreaterThanOrEqual(20);

    const javaLinesCount = BLOCK_CUT_TREE_CODE_LANGUAGES.java.length;
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
    expect(lastStep.squareNodes.length).toBe(2);
  });

  it('should have complete code across all languages without empty stubs', () => {
    for (const lang of ['cpp', 'java', 'python', 'javascript']) {
      const code = BLOCK_CUT_TREE_CODE_LANGUAGES[lang];
      expect(code).toBeDefined();
      expect(code.length).toBeGreaterThanOrEqual(35);
      const joined = code.join('\n');
      expect(joined).toMatch(/tarjan/i);
      expect(joined).toMatch(/buildtree|build_tree/i);
    }
  });

  it('should initialize and destroy cleanly with mock root container', async () => {
    const mockElements = new Map<string, any>();
    const mockRoot = {
      querySelector: (sel: string) => mockElements.get(sel) || null,
      querySelectorAll: (_sel: string) => [],
      isConnected: true,
    } as unknown as HTMLElement;

    const viz = new BlockCutTreeVisualizer();
    await viz.init({
      root: mockRoot,
      algorithmId: 'block-cut-tree',
      viewId: 'algo-block-cut-tree-view',
    });

    expect(viz).toBeDefined();
    viz.destroy();
  });
});
