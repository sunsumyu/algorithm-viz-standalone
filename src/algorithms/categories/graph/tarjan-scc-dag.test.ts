import { describe, it, expect } from 'vitest';
import { TarjanSCCDAGVisualizer } from './tarjan-scc-dag-renderer';

describe('TarjanSCCDAG (P3387)', () => {
  it('should instantiate TarjanSCCDAGVisualizer properly', () => {
    const viz = new TarjanSCCDAGVisualizer();
    expect(viz).toBeDefined();
  });

  it('should initialize and destroy cleanly with mock root container', async () => {
    const mockElements = new Map<string, any>();
    const mockRoot = {
      querySelector: (sel: string) => mockElements.get(sel) || null,
      querySelectorAll: (_sel: string) => [],
      isConnected: true,
    } as unknown as HTMLElement;

    const viz = new TarjanSCCDAGVisualizer();
    await viz.init({
      root: mockRoot,
      algorithmId: 'tarjan-scc-dag',
      viewId: 'algo-tarjan-scc-dag-view',
    });

    expect(viz).toBeDefined();
    viz.destroy();
  });
});
