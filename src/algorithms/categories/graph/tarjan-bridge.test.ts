import { describe, it, expect } from 'vitest';
import { TarjanBridgeVisualizer } from './tarjan-bridge-renderer';

describe('TarjanBridge (P3388)', () => {
  it('should instantiate TarjanBridgeVisualizer properly', () => {
    const viz = new TarjanBridgeVisualizer();
    expect(viz).toBeDefined();
  });

  it('should initialize and destroy cleanly with mock root container', async () => {
    const mockElements = new Map<string, any>();
    const mockRoot = {
      querySelector: (sel: string) => mockElements.get(sel) || null,
      querySelectorAll: (_sel: string) => [],
      isConnected: true,
    } as unknown as HTMLElement;

    const viz = new TarjanBridgeVisualizer();
    await viz.init({
      root: mockRoot,
      algorithmId: 'tarjan-bridge',
      viewId: 'algo-tarjan-bridge-view',
    });

    expect(viz).toBeDefined();
    viz.destroy();
  });
});
