import { describe, it, expect } from 'vitest';
import { MinCostMaxFlowVisualizer, MCMF_TEMPLATE } from './min-cost-max-flow-renderer';

describe('MinCostMaxFlow (Minimum Cost Maximum Flow - MCMF)', () => {
  it('should instantiate MinCostMaxFlowVisualizer properly', () => {
    const viz = new MinCostMaxFlowVisualizer();
    expect(viz).toBeDefined();
    expect(MCMF_TEMPLATE).toContain('algo-min-cost-max-flow-view');
    expect(MCMF_TEMPLATE).toContain('mcmf-canvas');
    expect(MCMF_TEMPLATE).toContain('mcmf-flow-val');
    expect(MCMF_TEMPLATE).toContain('mcmf-cost-val');
  });

  it('should initialize and destroy cleanly with mock root container', async () => {
    const mockElements = new Map<string, any>();
    const mockRoot = {
      querySelector: (sel: string) => mockElements.get(sel) || null,
      querySelectorAll: (_sel: string) => [],
      isConnected: true,
    } as unknown as HTMLElement;

    const viz = new MinCostMaxFlowVisualizer();
    await viz.init({
      root: mockRoot,
      algorithmId: 'min-cost-max-flow',
      viewId: 'algo-min-cost-max-flow-view',
    });

    expect(viz).toBeDefined();
    viz.destroy();
  });
});
