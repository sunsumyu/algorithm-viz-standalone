import { describe, it, expect } from 'vitest';
import { TreeKnapsackDPVisualizer, TREE_KNAPSACK_TEMPLATE } from './tree-knapsack-dp-renderer';

describe('TreeKnapsackDP (Tree Dependent Knapsack DP - P2014)', () => {
  it('should instantiate TreeKnapsackDPVisualizer properly', () => {
    const viz = new TreeKnapsackDPVisualizer();
    expect(viz).toBeDefined();
    expect(TREE_KNAPSACK_TEMPLATE).toContain('algo-tree-knapsack-dp-view');
    expect(TREE_KNAPSACK_TEMPLATE).toContain('tree-knapsack-canvas');
    expect(TREE_KNAPSACK_TEMPLATE).toContain('treeknap-dp-badge');
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
});
