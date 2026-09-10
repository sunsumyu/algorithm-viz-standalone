import { describe, it, expect } from 'vitest';
import {
  DSUOnTreeVisualizer,
  buildDSUOnTreeSteps,
} from './dsu-on-tree-renderer';
import { DSU_ON_TREE_CODE_LANGUAGES } from './dsu-on-tree-problem-content';

describe('DSUOnTree (CF600E)', () => {
  it('should instantiate DSUOnTreeVisualizer properly', () => {
    const viz = new DSUOnTreeVisualizer();
    expect(viz).toBeDefined();
  });

  it('should generate at least 20 granular steps for classic_4node preset', () => {
    const steps = buildDSUOnTreeSteps('classic_4node');
    expect(steps.length).toBeGreaterThanOrEqual(20);

    const javaLinesCount = DSU_ON_TREE_CODE_LANGUAGES.java.length;
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
      expect(step.metrics?.['metric-cur-node']).toBeDefined();
      expect(step.metrics?.['metric-keep-status']).toBeDefined();
      expect(step.metrics?.['metric-heavy-son']).toBeDefined();
      expect(step.metrics?.['metric-dsu-phase']).toBeDefined();
    }

    const lastStep = steps[steps.length - 1];
    expect(lastStep.status).toBe('done');
    expect(lastStep.preservedData[1]).toBe(1);
    expect(lastStep.preservedData[4]).toBe(1);
  });

  it('should generate at least 20 granular steps for simple_star preset', () => {
    const steps = buildDSUOnTreeSteps('simple_star');
    expect(steps.length).toBeGreaterThanOrEqual(20);

    const javaLinesCount = DSU_ON_TREE_CODE_LANGUAGES.java.length;
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
  });

  it('should have complete code across all languages without empty stubs', () => {
    for (const lang of ['cpp', 'java', 'python', 'javascript']) {
      const code = DSU_ON_TREE_CODE_LANGUAGES[lang];
      expect(code).toBeDefined();
      expect(code.length).toBeGreaterThanOrEqual(35);
      const joined = code.join('\n');
      expect(joined).toMatch(/dsuontree|dsu_on_tree|solver/i);
      expect(joined).toMatch(/dfsinit|dfs_init/i);
      expect(joined).toMatch(/dfssolve|dfs_solve/i);
      expect(joined).toMatch(/updatesubtree|update/i);
    }
  });

  it('should initialize and destroy cleanly with mock root container', async () => {
    const mockElements = new Map<string, any>();
    const mockRoot = {
      querySelector: (sel: string) => mockElements.get(sel) || null,
      querySelectorAll: (_sel: string) => [],
      isConnected: true,
    } as unknown as HTMLElement;

    const viz = new DSUOnTreeVisualizer();
    await viz.init({
      root: mockRoot,
      algorithmId: 'dsu-on-tree',
      viewId: 'algo-dsu-on-tree-view',
    });

    expect(viz).toBeDefined();
    viz.destroy();
  });
});
