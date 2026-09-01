import { describe, it, expect } from 'vitest';
import { GoodPathsVisualizer } from './good-paths-renderer';

describe('GoodPaths (LeetCode 2421)', () => {
  it('should instantiate GoodPathsVisualizer properly', () => {
    const viz = new GoodPathsVisualizer();
    expect(viz).toBeDefined();
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
