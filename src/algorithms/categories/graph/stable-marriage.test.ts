import { describe, it, expect } from 'vitest';
import { StableMarriageVisualizer, STABLE_MARRIAGE_TEMPLATE } from './stable-marriage-renderer';

describe('StableMarriage (Gale-Shapley Deferred Acceptance)', () => {
  it('should instantiate StableMarriageVisualizer properly', () => {
    const viz = new StableMarriageVisualizer();
    expect(viz).toBeDefined();
    expect(STABLE_MARRIAGE_TEMPLATE).toContain('algo-stable-marriage-view');
    expect(STABLE_MARRIAGE_TEMPLATE).toContain('marriage-canvas');
    expect(STABLE_MARRIAGE_TEMPLATE).toContain('marriage-couples-badge');
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
