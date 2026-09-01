import { describe, it, expect } from 'vitest';
import { StableMarriageVisualizer } from './stable-marriage-renderer';

describe('StableMarriage (Gale-Shapley)', () => {
  it('should instantiate StableMarriageVisualizer properly', () => {
    const viz = new StableMarriageVisualizer();
    expect(viz).toBeDefined();
  });

  it('should initialize and destroy cleanly with mock root container', async () => {
    const mockElements = new Map<string, any>();
    const mockRoot = {
      querySelector: (sel: string) => mockElements.get(sel) || null,
      querySelectorAll: (_sel: string) => [],
      isConnected: true,
    } as unknown as HTMLElement;

    const viz = new StableMarriageVisualizer();
    await viz.init({
      root: mockRoot,
      algorithmId: 'stable-marriage',
      viewId: 'algo-stable-marriage-view',
    });

    expect(viz).toBeDefined();
    viz.destroy();
  });
});
