import { describe, it, expect } from 'vitest';
import { LavaParkourVisualizer, LAVA_PARKOUR_TEMPLATE } from './lava-parkour-renderer';

describe('LavaParkour (Monotonic Stack Lava Parkour Game)', () => {
  it('should instantiate LavaParkourVisualizer properly', () => {
    const viz = new LavaParkourVisualizer();
    expect(viz).toBeDefined();
    expect(LAVA_PARKOUR_TEMPLATE).toContain('algo-lava-parkour-view');
    expect(LAVA_PARKOUR_TEMPLATE).toContain('lava-parkour-canvas');
    expect(LAVA_PARKOUR_TEMPLATE).toContain('lava-stack-visual');
  });

  it('should initialize and destroy cleanly with mock root container', async () => {
    const mockElements = new Map<string, any>();
    const mockRoot = {
      querySelector: (sel: string) => mockElements.get(sel) || null,
      querySelectorAll: (_sel: string) => [],
    } as unknown as HTMLElement;

    const viz = new LavaParkourVisualizer();
    await viz.init({
      root: mockRoot,
      algorithmId: 'lava-parkour',
      viewId: 'algo-lava-parkour-view',
    });

    expect(viz).toBeDefined();
    viz.destroy();
  });
});
