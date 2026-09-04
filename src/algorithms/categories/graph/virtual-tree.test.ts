import { describe, it, expect } from 'vitest';
import {
  VirtualTreeVisualizer,
  buildVirtualTreeSteps,
} from './virtual-tree-renderer';
import { VIRTUAL_TREE_CODE_LANGUAGES } from './virtual-tree-problem-content';

describe('VirtualTree (P2495)', () => {
  it('should instantiate VirtualTreeVisualizer properly', () => {
    const viz = new VirtualTreeVisualizer();
    expect(viz).toBeDefined();
  });

  it('should generate at least 20 granular steps for classic_7node preset', () => {
    const steps = buildVirtualTreeSteps('classic_7node');
    expect(steps.length).toBeGreaterThanOrEqual(20);

    const javaLinesCount = VIRTUAL_TREE_CODE_LANGUAGES.java.length;
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
      expect(step.metrics?.['metric-vtree-nodes']).toBeDefined();
      expect(step.metrics?.['metric-stack-top']).toBeDefined();
      expect(step.metrics?.['metric-dp-cost']).toBeDefined();
      expect(step.metrics?.['metric-vtree-phase']).toBeDefined();
    }

    const lastStep = steps[steps.length - 1];
    expect(lastStep.status).toBe('done');
    expect(lastStep.dpVal[1]).toBe(9);
    expect(lastStep.virtualTreeNodes.length).toBe(5);
  });

  it('should generate at least 20 granular steps for simple_chain preset', () => {
    const steps = buildVirtualTreeSteps('simple_chain');
    expect(steps.length).toBeGreaterThanOrEqual(20);

    const javaLinesCount = VIRTUAL_TREE_CODE_LANGUAGES.java.length;
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
    expect(lastStep.dpVal[1]).toBe(7);
  });

  it('should have complete code across all languages without empty stubs', () => {
    for (const lang of ['cpp', 'java', 'python', 'javascript']) {
      const code = VIRTUAL_TREE_CODE_LANGUAGES[lang];
      expect(code).toBeDefined();
      expect(code.length).toBeGreaterThanOrEqual(35);
      const joined = code.join('\n');
      expect(joined).toMatch(/virtualtree|virtual_tree/i);
      expect(joined).toMatch(/dfsinit|dfs_init/i);
      expect(joined).toMatch(/getlca|get_lca/i);
      expect(joined).toMatch(/buildvirtualtree|build_virtual_tree/i);
    }
  });

  it('should initialize and destroy cleanly with mock root container', async () => {
    const mockElements = new Map<string, any>();
    const mockRoot = {
      querySelector: (sel: string) => mockElements.get(sel) || null,
      querySelectorAll: (_sel: string) => [],
      isConnected: true,
    } as unknown as HTMLElement;

    const viz = new VirtualTreeVisualizer();
    await viz.init({
      root: mockRoot,
      algorithmId: 'virtual-tree',
      viewId: 'algo-virtual-tree-view',
    });

    expect(viz).toBeDefined();
    viz.destroy();
  });
});
