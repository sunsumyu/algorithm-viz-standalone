import { describe, it, expect } from 'vitest';
import { MinMeanCycleVisualizer, MIN_MEAN_CYCLE_TEMPLATE } from './min-mean-cycle-renderer';

describe('MinMeanCycle (Minimum Mean Weight Cycle - Karp / 0-1 Fractional Programming)', () => {
  it('should instantiate MinMeanCycleVisualizer properly', () => {
    const viz = new MinMeanCycleVisualizer();
    expect(viz).toBeDefined();
    expect(MIN_MEAN_CYCLE_TEMPLATE).toContain('algo-min-mean-cycle-view');
    expect(MIN_MEAN_CYCLE_TEMPLATE).toContain('min-mean-cycle-canvas');
    expect(MIN_MEAN_CYCLE_TEMPLATE).toContain('meancycle-bounds-badge');
  });

  it('should initialize and destroy cleanly with mock root container', async () => {
    const mockElements = new Map<string, any>();
    const mockRoot = {
      querySelector: (sel: string) => mockElements.get(sel) || null,
      querySelectorAll: (_sel: string) => [],
      isConnected: true,
    } as unknown as HTMLElement;

    const viz = new MinMeanCycleVisualizer();
    await viz.init({
      root: mockRoot,
      algorithmId: 'min-mean-cycle',
      viewId: 'algo-min-mean-cycle-view',
    });

    expect(viz).toBeDefined();
    viz.destroy();
  });
});
