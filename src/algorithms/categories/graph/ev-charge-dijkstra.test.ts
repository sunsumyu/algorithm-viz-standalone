import { describe, it, expect } from 'vitest';
import { EVChargeDijkstraVisualizer, EV_CHARGE_TEMPLATE } from './ev-charge-dijkstra-renderer';

describe('EVChargeDijkstra (EV Charge Layered Dijkstra)', () => {
  it('should instantiate EVChargeDijkstraVisualizer properly', () => {
    const viz = new EVChargeDijkstraVisualizer();
    expect(viz).toBeDefined();
    expect(EV_CHARGE_TEMPLATE).toContain('algo-ev-charge-dijkstra-view');
    expect(EV_CHARGE_TEMPLATE).toContain('evcharge-canvas');
    expect(EV_CHARGE_TEMPLATE).toContain('evcharge-battery-badge');
  });

  it('should initialize and destroy cleanly with mock root container', async () => {
    const mockElements = new Map<string, any>();
    const mockRoot = {
      querySelector: (sel: string) => mockElements.get(sel) || null,
      querySelectorAll: (_sel: string) => [],
      isConnected: true,
    } as unknown as HTMLElement;

    const viz = new EVChargeDijkstraVisualizer();
    await viz.init({
      root: mockRoot,
      algorithmId: 'ev-charge-dijkstra',
      viewId: 'algo-ev-charge-dijkstra-view',
    });

    expect(viz).toBeDefined();
    viz.destroy();
  });
});
