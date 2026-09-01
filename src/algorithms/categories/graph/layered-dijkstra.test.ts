import { describe, it, expect } from 'vitest';
import { LayeredDijkstraVisualizer } from './layered-dijkstra-renderer';

describe('LayeredDijkstra (P4568)', () => {
  it('should instantiate LayeredDijkstraVisualizer properly', () => {
    const viz = new LayeredDijkstraVisualizer();
    expect(viz).toBeDefined();
  });

  it('should initialize and destroy cleanly with mock root container', async () => {
    const mockElements = new Map<string, any>();
    const mockRoot = {
      querySelector: (sel: string) => mockElements.get(sel) || null,
      querySelectorAll: (_sel: string) => [],
      isConnected: true,
    } as unknown as HTMLElement;

    const viz = new LayeredDijkstraVisualizer();
    await viz.init({
      root: mockRoot,
      algorithmId: 'layered-dijkstra',
      viewId: 'algo-layered-dijkstra-view',
    });

    expect(viz).toBeDefined();
    viz.destroy();
  });
});
