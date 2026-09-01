import { describe, it, expect } from 'vitest';
import { TreeDifferenceVisualizer } from './tree-difference-renderer';

describe('TreeDifference (P3128)', () => {
  it('should instantiate TreeDifferenceVisualizer properly', () => {
    const viz = new TreeDifferenceVisualizer();
    expect(viz).toBeDefined();
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
