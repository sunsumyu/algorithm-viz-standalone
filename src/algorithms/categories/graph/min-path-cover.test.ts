import { describe, it, expect } from 'vitest';
import { MinPathCoverVisualizer } from './min-path-cover-renderer';

describe('MinPathCover (P2764)', () => {
  it('should instantiate MinPathCoverVisualizer properly', () => {
    const viz = new MinPathCoverVisualizer();
    expect(viz).toBeDefined();
  });

  it('should initialize and destroy cleanly with mock root container', async () => {
    const mockElements = new Map<string, any>();
    const mockRoot = {
      querySelector: (sel: string) => mockElements.get(sel) || null,
      querySelectorAll: (_sel: string) => [],
      isConnected: true,
    } as unknown as HTMLElement;

    const viz = new MinPathCoverVisualizer();
    await viz.init({
      root: mockRoot,
      algorithmId: 'min-path-cover',
      viewId: 'algo-min-path-cover-view',
    });

    expect(viz).toBeDefined();
    viz.destroy();
  });
});
