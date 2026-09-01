import { describe, it, expect } from 'vitest';
import { TreeDifferenceVisualizer, TREE_DIFF_TEMPLATE } from './tree-difference-renderer';

describe('TreeDifference (Node & Edge Tree Difference)', () => {
  it('should instantiate TreeDifferenceVisualizer properly', () => {
    const viz = new TreeDifferenceVisualizer();
    expect(viz).toBeDefined();
    expect(TREE_DIFF_TEMPLATE).toContain('algo-tree-difference-view');
    expect(TREE_DIFF_TEMPLATE).toContain('treediff-canvas');
    expect(TREE_DIFF_TEMPLATE).toContain('treediff-max-badge');
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
