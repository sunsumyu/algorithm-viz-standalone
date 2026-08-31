import { describe, it, expect } from 'vitest';
import { GoodPathsVisualizer, GOOD_PATHS_TEMPLATE } from './good-paths-renderer';

describe('GoodPaths (Number of Good Paths)', () => {
  it('should instantiate GoodPathsVisualizer properly', () => {
    const viz = new GoodPathsVisualizer();
    expect(viz).toBeDefined();
    expect(GOOD_PATHS_TEMPLATE).toContain('algo-good-paths-view');
    expect(GOOD_PATHS_TEMPLATE).toContain('good-paths-canvas');
    expect(GOOD_PATHS_TEMPLATE).toContain('good-total-count');
  });

  it('should initialize and destroy cleanly with mock root container', async () => {
    const mockElements = new Map<string, any>();
    const mockRoot = {
      querySelector: (sel: string) => mockElements.get(sel) || null,
      querySelectorAll: (_sel: string) => [],
      isConnected: true,
    } as unknown as HTMLElement;

    const viz = new GoodPathsVisualizer();
    await viz.init({
      root: mockRoot,
      algorithmId: 'good-paths',
      viewId: 'algo-good-paths-view',
    });

    expect(viz).toBeDefined();
    viz.destroy();
  });
});
