import { describe, it, expect } from 'vitest';
import { EulerianCircuitVisualizer } from './eulerian-circuit-renderer';

describe('EulerianCircuit (Hierholzer)', () => {
  it('should instantiate EulerianCircuitVisualizer properly', () => {
    const viz = new EulerianCircuitVisualizer();
    expect(viz).toBeDefined();
  });

  it('should initialize and destroy cleanly with mock root container', async () => {
    const mockElements = new Map<string, any>();
    const mockRoot = {
      querySelector: (sel: string) => mockElements.get(sel) || null,
      querySelectorAll: (_sel: string) => [],
      isConnected: true,
    } as unknown as HTMLElement;

    const viz = new EulerianCircuitVisualizer();
    await viz.init({
      root: mockRoot,
      algorithmId: 'eulerian-circuit',
      viewId: 'algo-eulerian-circuit-view',
    });

    expect(viz).toBeDefined();
    viz.destroy();
  });
});
