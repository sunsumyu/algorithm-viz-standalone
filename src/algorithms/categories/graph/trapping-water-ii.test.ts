import { describe, it, expect } from 'vitest';
import { TrappingWaterIIVisualizer, TRAPPING_WATER_II_TEMPLATE } from './trapping-water-ii-renderer';

describe('TrappingWaterII (Trapping Rain Water II 3D)', () => {
  it('should instantiate TrappingWaterIIVisualizer properly', () => {
    const viz = new TrappingWaterIIVisualizer();
    expect(viz).toBeDefined();
    expect(TRAPPING_WATER_II_TEMPLATE).toContain('algo-trapping-water-ii-view');
    expect(TRAPPING_WATER_II_TEMPLATE).toContain('trapwater-canvas');
    expect(TRAPPING_WATER_II_TEMPLATE).toContain('trapwater-heap-container');
  });

  it('should initialize and destroy cleanly with mock root container', async () => {
    const mockElements = new Map<string, any>();
    const mockRoot = {
      querySelector: (sel: string) => mockElements.get(sel) || null,
      querySelectorAll: (_sel: string) => [],
      isConnected: true,
    } as unknown as HTMLElement;

    const viz = new TrappingWaterIIVisualizer();
    await viz.init({
      root: mockRoot,
      algorithmId: 'trapping-water-ii',
      viewId: 'algo-trapping-water-ii-view',
    });

    expect(viz).toBeDefined();
    viz.destroy();
  });
});
