import { describe, it, expect } from 'vitest';
import { TopoDPVisualizer } from './topo-dp-renderer';

describe('TopoDP', () => {
  it('should instantiate TopoDPVisualizer properly', () => {
    const viz = new TopoDPVisualizer();
    expect(viz).toBeDefined();
  });

  it('should initialize and destroy cleanly with mock root container', async () => {
    const mockElements = new Map<string, any>();
    const mockRoot = {
      querySelector: (sel: string) => mockElements.get(sel) || null,
      querySelectorAll: (_sel: string) => [],
      isConnected: true,
    } as unknown as HTMLElement;

    const viz = new TopoDPVisualizer();
    await viz.init({
      root: mockRoot,
      algorithmId: 'topo-dp',
      viewId: 'algo-topo-dp-view',
    });

    expect(viz).toBeDefined();
    viz.destroy();
  });
});
