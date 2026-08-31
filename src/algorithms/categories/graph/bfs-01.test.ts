import { describe, it, expect } from 'vitest';
import { BFS01Visualizer, BFS_01_TEMPLATE } from './bfs-01-renderer';

describe('BFS01 (0-1 BFS Deque Shortest Path)', () => {
  it('should instantiate BFS01Visualizer properly', () => {
    const viz = new BFS01Visualizer();
    expect(viz).toBeDefined();
    expect(BFS_01_TEMPLATE).toContain('algo-bfs-01-view');
    expect(BFS_01_TEMPLATE).toContain('bfs01-canvas');
    expect(BFS_01_TEMPLATE).toContain('bfs01-deque-container');
    expect(BFS_01_TEMPLATE).toContain('bfs01-preset-btn');
  });

  it('should initialize and destroy cleanly with mock root container', async () => {
    const mockElements = new Map<string, any>();
    const mockRoot = {
      querySelector: (sel: string) => mockElements.get(sel) || null,
      querySelectorAll: (_sel: string) => [],
      isConnected: true,
    } as unknown as HTMLElement;

    const viz = new BFS01Visualizer();
    await viz.init({
      root: mockRoot,
      algorithmId: 'bfs-01',
      viewId: 'algo-bfs-01-view',
    });

    expect(viz).toBeDefined();
    viz.destroy();
  });
});
