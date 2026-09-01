import { describe, it, expect } from 'vitest';
import { BiBFSVisualizer } from './bi-bfs-renderer';

describe('BiBFS (LeetCode 127)', () => {
  it('should instantiate BiBFSVisualizer properly', () => {
    const viz = new BiBFSVisualizer();
    expect(viz).toBeDefined();
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
