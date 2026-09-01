import { describe, it, expect } from 'vitest';
import { DinicMaxFlowVisualizer, DINIC_MAX_FLOW_TEMPLATE } from './dinic-max-flow-renderer';

describe('DinicMaxFlow (Dinic Max Flow & Residual Graph)', () => {
  it('should instantiate DinicMaxFlowVisualizer properly', () => {
    const viz = new DinicMaxFlowVisualizer();
    expect(viz).toBeDefined();
    expect(DINIC_MAX_FLOW_TEMPLATE).toContain('algo-dinic-max-flow-view');
    expect(DINIC_MAX_FLOW_TEMPLATE).toContain('dinic-canvas');
    expect(DINIC_MAX_FLOW_TEMPLATE).toContain('dinic-max-flow-val');
  });

  it('should initialize and destroy cleanly with mock root container', async () => {
    const mockElements = new Map<string, any>();
    const mockRoot = {
      querySelector: (sel: string) => mockElements.get(sel) || null,
      querySelectorAll: (_sel: string) => [],
      isConnected: true,
    } as unknown as HTMLElement;

    const viz = new DinicMaxFlowVisualizer();
    await viz.init({
      root: mockRoot,
      algorithmId: 'dinic-max-flow',
      viewId: 'algo-dinic-max-flow-view',
    });

    expect(viz).toBeDefined();
    viz.destroy();
  });
});
