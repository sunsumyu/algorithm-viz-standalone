import { describe, it, expect } from 'vitest';
import { MinMeanCycleVisualizer } from './min-mean-cycle-renderer';

describe('MinMeanCycle (Karp / 0-1 Fractional Programming)', () => {
  it('should instantiate MinMeanCycleVisualizer properly', () => {
    const viz = new MinMeanCycleVisualizer();
    expect(viz).toBeDefined();
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
