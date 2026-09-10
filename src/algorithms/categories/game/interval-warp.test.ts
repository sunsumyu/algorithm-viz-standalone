import { describe, it, expect } from 'vitest';
import { IntervalWarpVisualizer, INTERVAL_WARP_TEMPLATE } from './interval-warp-renderer';

describe('IntervalWarp (Interval Merge Fleet Game)', () => {
  it('should instantiate IntervalWarpVisualizer properly', () => {
    const viz = new IntervalWarpVisualizer();
    expect(viz).toBeDefined();
    expect(INTERVAL_WARP_TEMPLATE).toContain('algo-interval-warp-view');
    expect(INTERVAL_WARP_TEMPLATE).toContain('warp-canvas');
    expect(INTERVAL_WARP_TEMPLATE).toContain('warp-preset-btn');
  });

  it('should initialize and destroy cleanly with mock root container', async () => {
    const mockElements = new Map<string, any>();
    const mockRoot = {
      querySelector: (sel: string) => mockElements.get(sel) || null,
      querySelectorAll: (_sel: string) => [],
    } as unknown as HTMLElement;

    const viz = new IntervalWarpVisualizer();
    await viz.init({
      root: mockRoot,
      algorithmId: 'interval-warp',
      viewId: 'algo-interval-warp-view',
    });

    expect(viz).toBeDefined();
    viz.destroy();
  });
});
