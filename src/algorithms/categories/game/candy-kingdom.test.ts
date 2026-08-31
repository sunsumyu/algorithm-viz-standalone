import { describe, it, expect } from 'vitest';
import { CandyKingdomVisualizer, CANDY_KINGDOM_TEMPLATE } from './candy-kingdom-renderer';

describe('CandyKingdom (Candy Kingdom Game)', () => {
  it('should instantiate CandyKingdomVisualizer properly', () => {
    const viz = new CandyKingdomVisualizer();
    expect(viz).toBeDefined();
    expect(CANDY_KINGDOM_TEMPLATE).toContain('algo-candy-kingdom-view');
    expect(CANDY_KINGDOM_TEMPLATE).toContain('candy-canvas');
    expect(CANDY_KINGDOM_TEMPLATE).toContain('candy-preset-btn');
  });

  it('should initialize and destroy cleanly with mock root container', async () => {
    const mockElements = new Map<string, any>();
    const mockRoot = {
      querySelector: (sel: string) => mockElements.get(sel) || null,
      querySelectorAll: (_sel: string) => [],
    } as unknown as HTMLElement;

    const viz = new CandyKingdomVisualizer();
    await viz.init({
      root: mockRoot,
      algorithmId: 'candy-kingdom',
      viewId: 'algo-candy-kingdom-view',
    });

    expect(viz).toBeDefined();
    viz.destroy();
  });
});
