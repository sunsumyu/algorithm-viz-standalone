import { describe, it, expect } from 'vitest';
import { KShortestPathVisualizer, K_SHORTEST_PATH_TEMPLATE } from './k-shortest-path-renderer';

describe('KShortestPath (K-th Shortest Path A*)', () => {
  it('should instantiate KShortestPathVisualizer properly', () => {
    const viz = new KShortestPathVisualizer();
    expect(viz).toBeDefined();
    expect(K_SHORTEST_PATH_TEMPLATE).toContain('algo-k-shortest-path-view');
    expect(K_SHORTEST_PATH_TEMPLATE).toContain('kpath-canvas');
    expect(K_SHORTEST_PATH_TEMPLATE).toContain('kpath-paths-badge');
  });

  it('should initialize and destroy cleanly with mock root container', async () => {
    const mockElements = new Map<string, any>();
    const mockRoot = {
      querySelector: (sel: string) => mockElements.get(sel) || null,
      querySelectorAll: (_sel: string) => [],
      isConnected: true,
    } as unknown as HTMLElement;

    const viz = new KShortestPathVisualizer();
    await viz.init({
      root: mockRoot,
      algorithmId: 'k-shortest-path',
      viewId: 'algo-k-shortest-path-view',
    });

    expect(viz).toBeDefined();
    viz.destroy();
  });
});
