import { describe, it, expect } from 'vitest';
import { MixedEulerianCircuitVisualizer, MIXED_EULER_TEMPLATE } from './mixed-eulerian-circuit-renderer';

describe('MixedEulerianCircuit (Mixed Graph Eulerian Circuit - POJ 1637)', () => {
  it('should instantiate MixedEulerianCircuitVisualizer properly', () => {
    const viz = new MixedEulerianCircuitVisualizer();
    expect(viz).toBeDefined();
    expect(MIXED_EULER_TEMPLATE).toContain('algo-mixed-eulerian-circuit-view');
    expect(MIXED_EULER_TEMPLATE).toContain('mixed-euler-canvas');
    expect(MIXED_EULER_TEMPLATE).toContain('mixed-flow-badge');
  });

  it('should initialize and destroy cleanly with mock root container', async () => {
    const mockElements = new Map<string, any>();
    const mockRoot = {
      querySelector: (sel: string) => mockElements.get(sel) || null,
      querySelectorAll: (_sel: string) => [],
      isConnected: true,
    } as unknown as HTMLElement;

    const viz = new MixedEulerianCircuitVisualizer();
    await viz.init({
      root: mockRoot,
      algorithmId: 'mixed-eulerian-circuit',
      viewId: 'algo-mixed-eulerian-circuit-view',
    });

    expect(viz).toBeDefined();
    viz.destroy();
  });
});
