import { describe, it, expect } from 'vitest';
import { SecondMstVisualizer } from './second-mst-renderer';

describe('SecondMst (P4180)', () => {
  it('should instantiate SecondMstVisualizer properly', () => {
    const viz = new SecondMstVisualizer();
    expect(viz).toBeDefined();
  });

  it('should initialize and destroy cleanly with mock root container', async () => {
    const mockElements = new Map<string, any>();
    const mockRoot = {
      querySelector: (sel: string) => mockElements.get(sel) || null,
      querySelectorAll: (_sel: string) => [],
      isConnected: true,
    } as unknown as HTMLElement;

    const viz = new SecondMstVisualizer();
    await viz.init({
      root: mockRoot,
      algorithmId: 'second-mst',
      viewId: 'algo-second-mst-view',
    });

    expect(viz).toBeDefined();
    viz.destroy();
  });
});
