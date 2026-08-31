import { describe, it, expect } from 'vitest';
import { BiBFSVisualizer, BI_BFS_TEMPLATE } from './bi-bfs-renderer';

describe('BiBFS (Bidirectional BFS Word Ladder)', () => {
  it('should instantiate BiBFSVisualizer properly', () => {
    const viz = new BiBFSVisualizer();
    expect(viz).toBeDefined();
    expect(BI_BFS_TEMPLATE).toContain('algo-bi-bfs-view');
    expect(BI_BFS_TEMPLATE).toContain('bibfs-canvas');
    expect(BI_BFS_TEMPLATE).toContain('bibfs-small-set');
    expect(BI_BFS_TEMPLATE).toContain('bibfs-big-set');
  });

  it('should initialize and destroy cleanly with mock root container', async () => {
    const mockElements = new Map<string, any>();
    const mockRoot = {
      querySelector: (sel: string) => mockElements.get(sel) || null,
      querySelectorAll: (_sel: string) => [],
      isConnected: true,
    } as unknown as HTMLElement;

    const viz = new BiBFSVisualizer();
    await viz.init({
      root: mockRoot,
      algorithmId: 'bi-bfs',
      viewId: 'algo-bi-bfs-view',
    });

    expect(viz).toBeDefined();
    viz.destroy();
  });
});
