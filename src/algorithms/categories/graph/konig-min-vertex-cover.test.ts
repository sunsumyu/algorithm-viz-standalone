import { describe, it, expect } from 'vitest';
import { KonigMinVertexCoverVisualizer } from './konig-min-vertex-cover-renderer';

describe('KonigMinVertexCover (König Theorem)', () => {
  it('should instantiate KonigMinVertexCoverVisualizer properly', () => {
    const viz = new KonigMinVertexCoverVisualizer();
    expect(viz).toBeDefined();
  });

  it('should initialize and destroy cleanly with mock root container', async () => {
    const mockElements = new Map<string, any>();
    const mockRoot = {
      querySelector: (sel: string) => mockElements.get(sel) || null,
      querySelectorAll: (_sel: string) => [],
      isConnected: true,
    } as unknown as HTMLElement;

    const viz = new KonigMinVertexCoverVisualizer();
    await viz.init({
      root: mockRoot,
      algorithmId: 'konig-min-vertex-cover',
      viewId: 'algo-konig-min-vertex-cover-view',
    });

    expect(viz).toBeDefined();
    viz.destroy();
  });
});
