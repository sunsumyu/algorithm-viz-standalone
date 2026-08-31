import { describe, it, expect } from 'vitest';
import { HeistRobberVisualizer, HEIST_ROBBER_TEMPLATE } from './heist-robber-renderer';

describe('HeistRobber (House Robber Heist DP Game)', () => {
  it('should instantiate HeistRobberVisualizer properly', () => {
    const viz = new HeistRobberVisualizer();
    expect(viz).toBeDefined();
    expect(HEIST_ROBBER_TEMPLATE).toContain('algo-heist-robber-view');
    expect(HEIST_ROBBER_TEMPLATE).toContain('heist-canvas');
    expect(HEIST_ROBBER_TEMPLATE).toContain('heist-preset-btn');
    expect(HEIST_ROBBER_TEMPLATE).toContain('heist-dp-cells');
  });

  it('should initialize and destroy cleanly with mock root container', async () => {
    const mockElements = new Map<string, any>();
    const mockRoot = {
      querySelector: (sel: string) => mockElements.get(sel) || null,
      querySelectorAll: (_sel: string) => [],
      isConnected: true,
    } as unknown as HTMLElement;

    const viz = new HeistRobberVisualizer();
    await viz.init({
      root: mockRoot,
      algorithmId: 'heist-robber',
      viewId: 'algo-heist-robber-view',
    });

    expect(viz).toBeDefined();
    viz.destroy();
  });
});
