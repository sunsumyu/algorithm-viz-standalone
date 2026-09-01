import { describe, it, expect } from 'vitest';
import { CouplesHoldingHandsVisualizer } from './couples-holding-hands-renderer';

describe('CouplesHoldingHands (LeetCode 765)', () => {
  it('should instantiate CouplesHoldingHandsVisualizer properly', () => {
    const viz = new CouplesHoldingHandsVisualizer();
    expect(viz).toBeDefined();
  });

  it('should initialize and destroy cleanly with mock root container', async () => {
    const mockElements = new Map<string, any>();
    const mockRoot = {
      querySelector: (sel: string) => mockElements.get(sel) || null,
      querySelectorAll: (_sel: string) => [],
      isConnected: true,
    } as unknown as HTMLElement;

    const viz = new CouplesHoldingHandsVisualizer();
    await viz.init({
      root: mockRoot,
      algorithmId: 'couples-holding-hands',
      viewId: 'algo-couples-holding-hands-view',
    });

    expect(viz).toBeDefined();
    viz.destroy();
  });
});
