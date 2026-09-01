import { describe, it, expect } from 'vitest';
import { PathMinEffortVisualizer, PATH_MIN_EFFORT_TEMPLATE } from './path-min-effort-renderer';

describe('PathMinEffort (Path With Minimum Effort - 2D Grid Dijkstra)', () => {
  it('should instantiate PathMinEffortVisualizer properly', () => {
    const viz = new PathMinEffortVisualizer();
    expect(viz).toBeDefined();
    expect(PATH_MIN_EFFORT_TEMPLATE).toContain('algo-path-min-effort-view');
    expect(PATH_MIN_EFFORT_TEMPLATE).toContain('mineffort-canvas');
    expect(PATH_MIN_EFFORT_TEMPLATE).toContain('mineffort-effort-badge');
  });

  it('should initialize and destroy cleanly with mock root container', async () => {
    const mockElements = new Map<string, any>();
    const mockRoot = {
      querySelector: (sel: string) => mockElements.get(sel) || null,
      querySelectorAll: (_sel: string) => [],
      isConnected: true,
    } as unknown as HTMLElement;

    const viz = new PathMinEffortVisualizer();
    await viz.init({
      root: mockRoot,
      algorithmId: 'path-min-effort',
      viewId: 'algo-path-min-effort-view',
    });

    expect(viz).toBeDefined();
    viz.destroy();
  });
});
