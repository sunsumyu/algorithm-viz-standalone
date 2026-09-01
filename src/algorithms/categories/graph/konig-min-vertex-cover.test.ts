import { describe, it, expect } from 'vitest';
import { KonigCoverVisualizer, KONIG_TEMPLATE } from './konig-min-vertex-cover-renderer';

describe('KonigMinVertexCover (Konig Theorem)', () => {
  it('should instantiate KonigCoverVisualizer properly', () => {
    const viz = new KonigCoverVisualizer();
    expect(viz).toBeDefined();
    expect(KONIG_TEMPLATE).toContain('algo-konig-min-vertex-cover-view');
    expect(KONIG_TEMPLATE).toContain('konig-canvas');
    expect(KONIG_TEMPLATE).toContain('konig-cover-val');
    expect(KONIG_TEMPLATE).toContain('konig-indep-val');
  });

  it('should initialize and destroy cleanly with mock root container', async () => {
    const mockElements = new Map<string, any>();
    const mockRoot = {
      querySelector: (sel: string) => mockElements.get(sel) || null,
      querySelectorAll: (_sel: string) => [],
      isConnected: true,
    } as unknown as HTMLElement;

    const viz = new KonigCoverVisualizer();
    await viz.init({
      root: mockRoot,
      algorithmId: 'konig-min-vertex-cover',
      viewId: 'algo-konig-min-vertex-cover-view',
    });

    expect(viz).toBeDefined();
    viz.destroy();
  });
});
