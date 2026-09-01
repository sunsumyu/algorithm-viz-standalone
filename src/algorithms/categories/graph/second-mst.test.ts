import { describe, it, expect } from 'vitest';
import { SecondMSTVisualizer, SECOND_MST_TEMPLATE } from './second-mst-renderer';

describe('SecondMST (Strict Second Minimum Spanning Tree)', () => {
  it('should instantiate SecondMSTVisualizer properly', () => {
    const viz = new SecondMSTVisualizer();
    expect(viz).toBeDefined();
    expect(SECOND_MST_TEMPLATE).toContain('algo-second-mst-view');
    expect(SECOND_MST_TEMPLATE).toContain('secondmst-canvas');
    expect(SECOND_MST_TEMPLATE).toContain('secondmst-ans-badge');
  });

  it('should initialize and destroy cleanly with mock root container', async () => {
    const mockElements = new Map<string, any>();
    const mockRoot = {
      querySelector: (sel: string) => mockElements.get(sel) || null,
      querySelectorAll: (_sel: string) => [],
      isConnected: true,
    } as unknown as HTMLElement;

    const viz = new SecondMSTVisualizer();
    await viz.init({
      root: mockRoot,
      algorithmId: 'second-mst',
      viewId: 'algo-second-mst-view',
    });

    expect(viz).toBeDefined();
    viz.destroy();
  });
});
