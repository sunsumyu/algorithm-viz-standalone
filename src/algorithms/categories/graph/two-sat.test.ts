import { describe, it, expect } from 'vitest';
import { TwoSATVisualizer, TWO_SAT_TEMPLATE } from './two-sat-renderer';

describe('TwoSAT (2-Satisfiability Problem)', () => {
  it('should instantiate TwoSATVisualizer properly', () => {
    const viz = new TwoSATVisualizer();
    expect(viz).toBeDefined();
    expect(TWO_SAT_TEMPLATE).toContain('algo-two-sat-problem-view');
    expect(TWO_SAT_TEMPLATE).toContain('twosat-canvas');
    expect(TWO_SAT_TEMPLATE).toContain('twosat-ans-badge');
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
