import { describe, it, expect } from 'vitest';
import { DinicMaxFlowVisualizer } from './dinic-max-flow-renderer';

describe('DinicMaxFlow (P3376)', () => {
  it('should instantiate DinicMaxFlowVisualizer properly', () => {
    const viz = new DinicMaxFlowVisualizer();
    expect(viz).toBeDefined();
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
