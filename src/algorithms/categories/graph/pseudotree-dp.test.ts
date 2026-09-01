import { describe, it, expect } from 'vitest';
import { PseudotreeVisualizer, PSEUDOTREE_TEMPLATE } from './pseudotree-dp-renderer';

describe('PseudotreeDP', () => {
  it('should instantiate PseudotreeVisualizer properly', () => {
    const viz = new PseudotreeVisualizer();
    expect(viz).toBeDefined();
    expect(PSEUDOTREE_TEMPLATE).toContain('algo-pseudotree-dp-view');
    expect(PSEUDOTREE_TEMPLATE).toContain('pseudo-canvas');
    expect(PSEUDOTREE_TEMPLATE).toContain('pseudo-best-val');
  });

  it('should initialize and destroy cleanly with mock root container', async () => {
    const mockElements = new Map<string, any>();
    const mockRoot = {
      querySelector: (sel: string) => mockElements.get(sel) || null,
      querySelectorAll: (_sel: string) => [],
      isConnected: true,
    } as unknown as HTMLElement;

    const viz = new PseudotreeVisualizer();
    await viz.init({
      root: mockRoot,
      algorithmId: 'pseudotree-dp',
      viewId: 'algo-pseudotree-dp-view',
    });

    expect(viz).toBeDefined();
    viz.destroy();
  });
});
