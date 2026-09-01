import { describe, it, expect } from 'vitest';
import { TreeDominantColorVisualizer, TREE_DOMINANT_TEMPLATE } from './tree-dominant-color-renderer';

describe('TreeDominantColor (Tree Dominant Color - CF600E)', () => {
  it('should instantiate TreeDominantColorVisualizer properly', () => {
    const viz = new TreeDominantColorVisualizer();
    expect(viz).toBeDefined();
    expect(TREE_DOMINANT_TEMPLATE).toContain('algo-tree-dominant-color-view');
    expect(TREE_DOMINANT_TEMPLATE).toContain('tree-dominant-canvas');
    expect(TREE_DOMINANT_TEMPLATE).toContain('dominant-max-badge');
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
