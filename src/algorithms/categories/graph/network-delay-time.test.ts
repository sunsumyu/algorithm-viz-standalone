import { describe, it, expect } from 'vitest';
import { NetworkDelayTimeVisualizer, NETWORK_DELAY_TEMPLATE } from './network-delay-time-renderer';

describe('NetworkDelayTime (Network Delay Time - LeetCode 743 / Class 064 Code01)', () => {
  it('should instantiate NetworkDelayTimeVisualizer properly', () => {
    const viz = new NetworkDelayTimeVisualizer();
    expect(viz).toBeDefined();
    expect(NETWORK_DELAY_TEMPLATE).toContain('algo-network-delay-time-view');
    expect(NETWORK_DELAY_TEMPLATE).toContain('netdelay-canvas');
    expect(NETWORK_DELAY_TEMPLATE).toContain('netdelay-time-badge');
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
