import { describe, it, expect } from 'vitest';
import { TrappingWaterIIVisualizer } from './trapping-water-ii-renderer';

describe('TrappingWaterII (LeetCode 407)', () => {
  it('should instantiate TrappingWaterIIVisualizer properly', () => {
    const viz = new TrappingWaterIIVisualizer();
    expect(viz).toBeDefined();
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
