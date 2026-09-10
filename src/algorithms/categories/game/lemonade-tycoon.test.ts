import { describe, it, expect } from 'vitest';
import { LemonadeTycoonVisualizer, LEMONADE_TYCOON_TEMPLATE } from './lemonade-tycoon-renderer';

describe('LemonadeTycoon (Lemonade Tycoon Game)', () => {
  it('should instantiate LemonadeTycoonVisualizer properly', () => {
    const viz = new LemonadeTycoonVisualizer();
    expect(viz).toBeDefined();
    expect(LEMONADE_TYCOON_TEMPLATE).toContain('algo-lemonade-tycoon-view');
    expect(LEMONADE_TYCOON_TEMPLATE).toContain('lemonade-canvas');
    expect(LEMONADE_TYCOON_TEMPLATE).toContain('lemon-preset-btn');
  });

  it('should initialize and destroy cleanly with mock root container', async () => {
    const mockElements = new Map<string, any>();
    const mockRoot = {
      querySelector: (sel: string) => mockElements.get(sel) || null,
      querySelectorAll: (_sel: string) => [],
    } as unknown as HTMLElement;

    const viz = new LemonadeTycoonVisualizer();
    await viz.init({
      root: mockRoot,
      algorithmId: 'lemonade-tycoon',
      viewId: 'algo-lemonade-tycoon-view',
    });

    expect(viz).toBeDefined();
    viz.destroy();
  });
});
