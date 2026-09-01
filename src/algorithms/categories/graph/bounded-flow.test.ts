import { describe, it, expect } from 'vitest';
import { BoundedFlowVisualizer } from './bounded-flow-renderer';

describe('BoundedFlow (Feasible Circulation - LOJ 115)', () => {
  it('should instantiate BoundedFlowVisualizer properly', () => {
    const viz = new BoundedFlowVisualizer();
    expect(viz).toBeDefined();
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
