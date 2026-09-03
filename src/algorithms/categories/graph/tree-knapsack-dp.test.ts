import { describe, it, expect } from 'vitest';
import { TreeKnapsackDPVisualizer, buildTreeKnapsackSteps } from './tree-knapsack-dp-renderer';
import { TREE_KNAPSACK_CODE_LANGUAGES } from './tree-knapsack-dp-problem-content';

describe('TreeKnapsackDP (P2014)', () => {
  it('should instantiate TreeKnapsackDPVisualizer properly', () => {
    const viz = new TreeKnapsackDPVisualizer();
    expect(viz).toBeDefined();
  });

  it('should initialize and destroy cleanly with mock root container', async () => {
    const mockElements = new Map<string, any>();
    const mockRoot = {
      querySelector: (sel: string) => mockElements.get(sel) || null,
      querySelectorAll: (_sel: string) => [],
      isConnected: true,
    } as unknown as HTMLElement;

    const viz = new TreeKnapsackDPVisualizer();
    await viz.init({
      root: mockRoot,
      algorithmId: 'tree-knapsack-dp',
      viewId: 'algo-tree-knapsack-dp-view',
    });

    expect(viz).toBeDefined();
    viz.destroy();
  });

  it('buildTreeKnapsackSteps 必须生成精细逐语句执行流 (>= 20 步) 且行号在 Java 源码范围内', () => {
    const steps = buildTreeKnapsackSteps(3);
    const javaLines = TREE_KNAPSACK_CODE_LANGUAGES.java.length;

    expect(steps.length).toBeGreaterThanOrEqual(20);
    expect(javaLines).toBeGreaterThanOrEqual(50);

    for (let i = 0; i < steps.length; i++) {
      const step = steps[i];
      expect(step.message).toBeTruthy();
      expect(step.log).toBeTruthy();
      expect(step.metrics).toBeDefined();
      expect(step.metrics?.['metric-active-node']).toBeDefined();
      expect(step.metrics?.['metric-max-score']).toBeDefined();
      expect(step.metrics?.['metric-subtree-size']).toBeDefined();
      expect(step.metrics?.['metric-cur-dp']).toBeDefined();

      const rawLines = Array.isArray(step.codeLine) ? step.codeLine : [step.codeLine];
      for (const line of rawLines) {
        expect(line).toBeGreaterThanOrEqual(1);
        expect(line).toBeLessThanOrEqual(javaLines);
      }
    }

    expect(steps[0].codeLine).toBe(36);
    expect(steps[steps.length - 1].codeLine).toBe(58);
  });
});
