import { describe, it, expect } from 'vitest';
import { PruferSequenceVisualizer, PRUFER_TEMPLATE } from './prufer-sequence-renderer';

describe('PruferSequence (Prufer Sequence & Cayley Formula)', () => {
  it('should instantiate PruferSequenceVisualizer properly', () => {
    const viz = new PruferSequenceVisualizer();
    expect(viz).toBeDefined();
    expect(PRUFER_TEMPLATE).toContain('algo-prufer-sequence-view');
    expect(PRUFER_TEMPLATE).toContain('prufer-canvas');
    expect(PRUFER_TEMPLATE).toContain('prufer-tape-badge');
  });

  it('should initialize and destroy cleanly with mock root container', async () => {
    const mockElements = new Map<string, any>();
    const mockRoot = {
      querySelector: (sel: string) => mockElements.get(sel) || null,
      querySelectorAll: (_sel: string) => [],
      isConnected: true,
    } as unknown as HTMLElement;

    const viz = new PruferSequenceVisualizer();
    await viz.init({
      root: mockRoot,
      algorithmId: 'prufer-sequence',
      viewId: 'algo-prufer-sequence-view',
    });

    expect(viz).toBeDefined();
    viz.destroy();
  });
});
