import { describe, it, expect } from 'vitest';
import { TwoSATVisualizer } from './two-sat-renderer';

describe('TwoSAT (P4782)', () => {
  it('should instantiate TwoSATVisualizer properly', () => {
    const viz = new TwoSATVisualizer();
    expect(viz).toBeDefined();
  });

  it('should initialize and destroy cleanly with mock root container', async () => {
    const mockElements = new Map<string, any>();
    const mockRoot = {
      querySelector: (sel: string) => mockElements.get(sel) || null,
      querySelectorAll: (_sel: string) => [],
      isConnected: true,
    } as unknown as HTMLElement;

    const viz = new TwoSATVisualizer();
    await viz.init({
      root: mockRoot,
      algorithmId: 'two-sat-problem',
      viewId: 'algo-two-sat-problem-view',
    });

    expect(viz).toBeDefined();
    viz.destroy();
  });
});
