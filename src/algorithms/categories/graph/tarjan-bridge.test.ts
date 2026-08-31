import { describe, it, expect } from 'vitest';
import { TarjanBridgeVisualizer, TARJAN_BRIDGE_TEMPLATE } from './tarjan-bridge-renderer';

describe('TarjanBridge (Cut Vertices & Bridges)', () => {
  it('should instantiate TarjanBridgeVisualizer properly', () => {
    const viz = new TarjanBridgeVisualizer();
    expect(viz).toBeDefined();
    expect(TARJAN_BRIDGE_TEMPLATE).toContain('algo-tarjan-bridge-view');
    expect(TARJAN_BRIDGE_TEMPLATE).toContain('tarjan-canvas');
    expect(TARJAN_BRIDGE_TEMPLATE).toContain('tarjan-cut-list');
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
