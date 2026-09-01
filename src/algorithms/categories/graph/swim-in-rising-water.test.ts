import { describe, it, expect } from 'vitest';
import { SwimInRisingWaterVisualizer, SWIM_IN_RISING_WATER_TEMPLATE } from './swim-in-rising-water-renderer';

describe('SwimInRisingWater (LeetCode 778 - Class 064 Code03)', () => {
  it('should instantiate SwimInRisingWaterVisualizer properly', () => {
    const viz = new SwimInRisingWaterVisualizer();
    expect(viz).toBeDefined();
    expect(SWIM_IN_RISING_WATER_TEMPLATE).toContain('algo-swim-in-rising-water-view');
    expect(SWIM_IN_RISING_WATER_TEMPLATE).toContain('swim-rising-water-canvas');
    expect(SWIM_IN_RISING_WATER_TEMPLATE).toContain('swim-water-badge');
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
