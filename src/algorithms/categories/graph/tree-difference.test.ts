import { describe, it, expect } from 'vitest';
import {
  TreeDifferenceVisualizer,
  buildTreeDifferenceSteps,
} from './tree-difference-renderer';
import { TREE_DIFF_CODE_LANGUAGES } from './tree-difference-problem-content';

describe('TreeDifference (P3128)', () => {
  it('should instantiate TreeDifferenceVisualizer properly', () => {
    const viz = new TreeDifferenceVisualizer();
    expect(viz).toBeDefined();
  });

  it('should generate at least 20 granular steps for node_diff_5node preset', () => {
    const steps = buildTreeDifferenceSteps('node_diff_5node');
    expect(steps.length).toBeGreaterThanOrEqual(20);

    const javaLinesCount = TREE_DIFF_CODE_LANGUAGES.java.length;
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
      expect(step.metrics?.['metric-active-lca']).toBeDefined();
      expect(step.metrics?.['metric-max-cover']).toBeDefined();
      expect(step.metrics?.['metric-diff-formula']).toBeDefined();
      expect(step.metrics?.['metric-diff-phase']).toBeDefined();
    }

    const lastStep = steps[steps.length - 1];
    expect(lastStep.status).toBe('done');
    expect(lastStep.recoveredCounts[2]).toBe(1);
    expect(lastStep.recoveredCounts[4]).toBe(1);
    expect(lastStep.recoveredCounts[5]).toBe(1);
    expect(lastStep.recoveredCounts[1]).toBe(0);
    expect(lastStep.recoveredCounts[3]).toBe(0);
  });

  it('should generate at least 20 granular steps for edge_diff_5node preset', () => {
    const steps = buildTreeDifferenceSteps('edge_diff_5node');
    expect(steps.length).toBeGreaterThanOrEqual(20);

    const javaLinesCount = TREE_DIFF_CODE_LANGUAGES.java.length;
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
    expect(lastStep.recoveredCounts[4]).toBe(1);
    expect(lastStep.recoveredCounts[5]).toBe(1);
    expect(lastStep.recoveredCounts[2]).toBe(0);
  });

  it('should have complete code across all languages without empty stubs', () => {
    for (const lang of ['cpp', 'java', 'python', 'javascript']) {
      const code = TREE_DIFF_CODE_LANGUAGES[lang];
      expect(code).toBeDefined();
      expect(code.length).toBeGreaterThanOrEqual(35);
      const joined = code.join('\n');
      expect(joined).toMatch(/treedifference|tree_difference|solver/i);
      expect(joined).toMatch(/dfslca|dfs_lca/i);
      expect(joined).toMatch(/getlca|get_lca/i);
      expect(joined).toMatch(/addpathnode|add_path_node/i);
      expect(joined).toMatch(/dfssum|dfs_sum/i);
    }
  });

  it('should initialize and destroy cleanly with mock root container', async () => {
    const mockElements = new Map<string, any>();
    const mockRoot = {
      querySelector: (sel: string) => mockElements.get(sel) || null,
      querySelectorAll: (_sel: string) => [],
      isConnected: true,
    } as unknown as HTMLElement;

    const viz = new TreeDifferenceVisualizer();
    await viz.init({
      root: mockRoot,
      algorithmId: 'tree-difference',
      viewId: 'algo-tree-difference-view',
    });

    expect(viz).toBeDefined();
    viz.destroy();
  });
});
