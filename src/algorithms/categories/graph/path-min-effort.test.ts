import { describe, it, expect } from 'vitest';
import { PathMinEffortVisualizer } from './path-min-effort-renderer';

describe('PathMinEffort (LeetCode 1631)', () => {
  it('should instantiate PathMinEffortVisualizer properly', () => {
    const viz = new PathMinEffortVisualizer();
    expect(viz).toBeDefined();
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
