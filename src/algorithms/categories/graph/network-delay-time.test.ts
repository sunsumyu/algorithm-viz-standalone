import { describe, it, expect } from 'vitest';
import { NetworkDelayTimeVisualizer } from './network-delay-time-renderer';

describe('NetworkDelayTime (LeetCode 743)', () => {
  it('should instantiate NetworkDelayTimeVisualizer properly', () => {
    const viz = new NetworkDelayTimeVisualizer();
    expect(viz).toBeDefined();
  });

  it('should initialize and destroy cleanly with mock root container', async () => {
    const mockElements = new Map<string, any>();
    const mockRoot = {
      querySelector: (sel: string) => mockElements.get(sel) || null,
      querySelectorAll: (_sel: string) => [],
      isConnected: true,
    } as unknown as HTMLElement;

    const viz = new NetworkDelayTimeVisualizer();
    await viz.init({
      root: mockRoot,
      algorithmId: 'network-delay-time',
      viewId: 'algo-network-delay-time-view',
    });

    expect(viz).toBeDefined();
    viz.destroy();
  });
});
