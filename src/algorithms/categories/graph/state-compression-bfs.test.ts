import { describe, it, expect } from 'vitest';
import { StateCompressionBfsVisualizer } from './state-compression-bfs-renderer';

describe('StateCompressionBFS (LeetCode 864)', () => {
  it('should instantiate StateCompressionBfsVisualizer properly', () => {
    const viz = new StateCompressionBfsVisualizer();
    expect(viz).toBeDefined();
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
