import { describe, it, expect } from 'vitest';
import { MinPathCoverVisualizer, MIN_PATH_COVER_TEMPLATE } from './min-path-cover-renderer';

describe('MinPathCover (Minimum Path Cover on DAG)', () => {
  it('should instantiate MinPathCoverVisualizer properly', () => {
    const viz = new MinPathCoverVisualizer();
    expect(viz).toBeDefined();
    expect(MIN_PATH_COVER_TEMPLATE).toContain('algo-min-path-cover-view');
    expect(MIN_PATH_COVER_TEMPLATE).toContain('path-cover-canvas');
    expect(MIN_PATH_COVER_TEMPLATE).toContain('pathcover-match-badge');
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
