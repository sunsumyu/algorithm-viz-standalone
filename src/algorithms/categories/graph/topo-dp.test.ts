import { describe, it, expect } from 'vitest';
import { TopoDPVisualizer, TOPO_DP_TEMPLATE } from './topo-dp-renderer';

describe('TopoDP (DAG Topological DP & Critical Path)', () => {
  it('should instantiate TopoDPVisualizer properly', () => {
    const viz = new TopoDPVisualizer();
    expect(viz).toBeDefined();
    expect(TOPO_DP_TEMPLATE).toContain('algo-topo-dp-view');
    expect(TOPO_DP_TEMPLATE).toContain('topodp-canvas');
    expect(TOPO_DP_TEMPLATE).toContain('topodp-queue-list');
  });

  it('should initialize and destroy cleanly with mock root container', async () => {
    const mockElements = new Map<string, any>();
    const mockRoot = {
      querySelector: (sel: string) => mockElements.get(sel) || null,
      querySelectorAll: (_sel: string) => [],
      isConnected: true,
    } as unknown as HTMLElement;

    const viz = new TopoDPVisualizer();
    await viz.init({
      root: mockRoot,
      algorithmId: 'topo-dp',
      viewId: 'algo-topo-dp-view',
    });

    expect(viz).toBeDefined();
    viz.destroy();
  });
});
