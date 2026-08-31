import { describe, it, expect } from 'vitest';
import { StateCompressionBfsVisualizer, STATE_COMPRESSION_BFS_TEMPLATE } from './state-compression-bfs-renderer';

describe('StateCompressionBfs (Shortest Path Visiting All Nodes)', () => {
  it('should instantiate StateCompressionBfsVisualizer properly', () => {
    const viz = new StateCompressionBfsVisualizer();
    expect(viz).toBeDefined();
    expect(STATE_COMPRESSION_BFS_TEMPLATE).toContain('algo-state-compression-bfs-view');
    expect(STATE_COMPRESSION_BFS_TEMPLATE).toContain('state-bfs-canvas');
    expect(STATE_COMPRESSION_BFS_TEMPLATE).toContain('state-bitmask-container');
  });

  it('should initialize and destroy cleanly with mock root container', async () => {
    const mockElements = new Map<string, any>();
    const mockRoot = {
      querySelector: (sel: string) => mockElements.get(sel) || null,
      querySelectorAll: (_sel: string) => [],
      isConnected: true,
    } as unknown as HTMLElement;

    const viz = new StateCompressionBfsVisualizer();
    await viz.init({
      root: mockRoot,
      algorithmId: 'state-compression-bfs',
      viewId: 'algo-state-compression-bfs-view',
    });

    expect(viz).toBeDefined();
    viz.destroy();
  });
});
