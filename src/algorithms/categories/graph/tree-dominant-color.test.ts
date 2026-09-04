import { describe, it, expect } from 'vitest';
import {
  TreeDominantColorVisualizer,
  buildTreeDominantColorSteps,
} from './tree-dominant-color-renderer';
import { TREE_DOMINANT_CODE_LANGUAGES } from './tree-dominant-color-problem-content';

describe('TreeDominantColor (CF600E)', () => {
  it('should instantiate TreeDominantColorVisualizer properly', () => {
    const viz = new TreeDominantColorVisualizer();
    expect(viz).toBeDefined();
  });

  it('should generate at least 20 granular steps for cf600e_5node preset', () => {
    const steps = buildTreeDominantColorSteps('cf600e_5node');
    expect(steps.length).toBeGreaterThanOrEqual(20);

    const javaLinesCount = TREE_DOMINANT_CODE_LANGUAGES.java.length;
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
      expect(step.metrics?.['metric-cur-root']).toBeDefined();
      expect(step.metrics?.['metric-max-freq']).toBeDefined();
      expect(step.metrics?.['metric-sum-colors']).toBeDefined();
      expect(step.metrics?.['metric-dominant-phase']).toBeDefined();
    }

    const lastStep = steps[steps.length - 1];
    expect(lastStep.status).toBe('done');
    expect(lastStep.ans[1]).toBe(1);
    expect(lastStep.ans[2]).toBe(6);
    expect(lastStep.ans[3]).toBe(1);
    expect(lastStep.ans[4]).toBe(1);
    expect(lastStep.ans[5]).toBe(3);
  });

  it('should generate at least 20 granular steps for bicolor_5node preset', () => {
    const steps = buildTreeDominantColorSteps('bicolor_5node');
    expect(steps.length).toBeGreaterThanOrEqual(20);

    const javaLinesCount = TREE_DOMINANT_CODE_LANGUAGES.java.length;
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
    expect(lastStep.ans[1]).toBe(2);
  });

  it('should have complete code across all languages without empty stubs', () => {
    for (const lang of ['cpp', 'java', 'python', 'javascript']) {
      const code = TREE_DOMINANT_CODE_LANGUAGES[lang];
      expect(code).toBeDefined();
      expect(code.length).toBeGreaterThanOrEqual(35);
      const joined = code.join('\n');
      expect(joined).toMatch(/treedominantcolor|tree_dominant_color|dominantcolorsolver/i);
      expect(joined).toMatch(/dfsinit|dfs_init/i);
      expect(joined).toMatch(/addnode|add_node/i);
      expect(joined).toMatch(/dfssolve|dfs_solve/i);
    }
  });

  it('should initialize and destroy cleanly with mock root container', async () => {
    const mockElements = new Map<string, any>();
    const mockRoot = {
      querySelector: (sel: string) => mockElements.get(sel) || null,
      querySelectorAll: (_sel: string) => [],
      isConnected: true,
    } as unknown as HTMLElement;

    const viz = new TreeDominantColorVisualizer();
    await viz.init({
      root: mockRoot,
      algorithmId: 'tree-dominant-color',
      viewId: 'algo-tree-dominant-color-view',
    });

    expect(viz).toBeDefined();
    viz.destroy();
  });
});
