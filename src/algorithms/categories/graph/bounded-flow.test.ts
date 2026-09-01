import { describe, it, expect } from 'vitest';
import { BoundedFlowVisualizer, BOUNDED_FLOW_TEMPLATE } from './bounded-flow-renderer';

describe('BoundedFlow (Bounded Flow & Feasible Circulation)', () => {
  it('should instantiate BoundedFlowVisualizer properly', () => {
    const viz = new BoundedFlowVisualizer();
    expect(viz).toBeDefined();
    expect(BOUNDED_FLOW_TEMPLATE).toContain('algo-bounded-flow-view');
    expect(BOUNDED_FLOW_TEMPLATE).toContain('bdflow-canvas');
    expect(BOUNDED_FLOW_TEMPLATE).toContain('bdflow-feasible-badge');
  });

  it('should initialize and destroy cleanly with mock root container', async () => {
    const mockElements = new Map<string, any>();
    const mockRoot = {
      querySelector: (sel: string) => mockElements.get(sel) || null,
      querySelectorAll: (_sel: string) => [],
      isConnected: true,
    } as unknown as HTMLElement;

    const viz = new BoundedFlowVisualizer();
    await viz.init({
      root: mockRoot,
      algorithmId: 'bounded-flow',
      viewId: 'algo-bounded-flow-view',
    });

    expect(viz).toBeDefined();
    viz.destroy();
  });
});
