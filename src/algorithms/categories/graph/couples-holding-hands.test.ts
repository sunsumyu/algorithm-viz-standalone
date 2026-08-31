import { describe, it, expect } from 'vitest';
import { CouplesHoldingHandsVisualizer, COUPLES_TEMPLATE } from './couples-holding-hands-renderer';

describe('CouplesHoldingHands (Union-Find Permutation Cycles)', () => {
  it('should instantiate CouplesHoldingHandsVisualizer properly', () => {
    const viz = new CouplesHoldingHandsVisualizer();
    expect(viz).toBeDefined();
    expect(COUPLES_TEMPLATE).toContain('algo-couples-holding-hands-view');
    expect(COUPLES_TEMPLATE).toContain('couples-canvas');
    expect(COUPLES_TEMPLATE).toContain('couples-seats-container');
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
