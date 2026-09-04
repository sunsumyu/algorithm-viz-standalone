import { describe, it, expect } from 'vitest';
import {
  DominatorTreeVisualizer,
  buildDominatorTreeSteps,
} from './dominator-tree-renderer';
import { DOMINATOR_TREE_CODE_LANGUAGES } from './dominator-tree-problem-content';

describe('DominatorTree (P2597)', () => {
  it('should instantiate DominatorTreeVisualizer properly', () => {
    const viz = new DominatorTreeVisualizer();
    expect(viz).toBeDefined();
  });

  it('should generate at least 20 granular steps for classic_diamond preset', () => {
    const steps = buildDominatorTreeSteps('classic_diamond');
    expect(steps.length).toBeGreaterThanOrEqual(20);

    const javaLinesCount = DOMINATOR_TREE_CODE_LANGUAGES.java.length;
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
      expect(step.metrics?.['metric-dom-lca']).toBeDefined();
      expect(step.metrics?.['metric-dom-edges']).toBeDefined();
      expect(step.metrics?.['metric-dom-phase']).toBeDefined();
    }

    const lastStep = steps[steps.length - 1];
    expect(lastStep.status).toBe('done');
    expect(lastStep.idomMap[1]).toBeNull();
    expect(lastStep.idomMap[2]).toBe(1);
    expect(lastStep.idomMap[3]).toBe(1);
    expect(lastStep.idomMap[4]).toBe(1);
  });

  it('should generate at least 20 granular steps for linear_bypass preset', () => {
    const steps = buildDominatorTreeSteps('linear_bypass');
    expect(steps.length).toBeGreaterThanOrEqual(20);

    const javaLinesCount = DOMINATOR_TREE_CODE_LANGUAGES.java.length;
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
    expect(lastStep.idomMap[2]).toBe(1);
    expect(lastStep.idomMap[3]).toBe(2);
    expect(lastStep.idomMap[4]).toBe(1);
  });

  it('should have complete code across all languages without empty stubs', () => {
    for (const lang of ['cpp', 'java', 'python', 'javascript']) {
      const code = DOMINATOR_TREE_CODE_LANGUAGES[lang];
      expect(code).toBeDefined();
      expect(code.length).toBeGreaterThanOrEqual(35);
      const joined = code.join('\n');
      expect(joined).toMatch(/dominatortree|dominator_tree/i);
      expect(joined).toMatch(/getlca|get_lca/i);
      expect(joined).toMatch(/build/i);
      expect(joined).toMatch(/idom/i);
    }
  });

  it('should initialize and destroy cleanly with mock root container', async () => {
    const mockElements = new Map<string, any>();
    const mockRoot = {
      querySelector: (sel: string) => mockElements.get(sel) || null,
      querySelectorAll: (_sel: string) => [],
      isConnected: true,
    } as unknown as HTMLElement;

    const viz = new DominatorTreeVisualizer();
    await viz.init({
      root: mockRoot,
      algorithmId: 'dominator-tree',
      viewId: 'algo-dominator-tree-view',
    });

    expect(viz).toBeDefined();
    viz.destroy();
  });
});
