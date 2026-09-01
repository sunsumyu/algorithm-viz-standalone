import { describe, it, expect } from 'vitest';
import { SwimInRisingWaterVisualizer } from './swim-in-rising-water-renderer';

describe('SwimInRisingWater (LeetCode 778 - Class 064 Code03)', () => {
  it('should instantiate SwimInRisingWaterVisualizer properly', () => {
    const viz = new SwimInRisingWaterVisualizer();
    expect(viz).toBeDefined();
  });

  it('should initialize and destroy cleanly with mock root container', async () => {
    const mockElements = new Map<string, any>();
    const mockRoot = {
      querySelector: (sel: string) => mockElements.get(sel) || null,
      querySelectorAll: (_sel: string) => [],
      isConnected: true,
    } as unknown as HTMLElement;

    const viz = new SwimInRisingWaterVisualizer();
    await viz.init({
      root: mockRoot,
      algorithmId: 'swim-in-rising-water',
      viewId: 'algo-swim-in-rising-water-view',
    });

    expect(viz).toBeDefined();
    viz.destroy();
  });
});
