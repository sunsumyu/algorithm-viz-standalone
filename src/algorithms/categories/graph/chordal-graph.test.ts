import { describe, it, expect } from 'vitest';
import { ChordalGraphVisualizer } from './chordal-graph-renderer';

describe('ChordalGraph (P3199)', () => {
  it('should instantiate ChordalGraphVisualizer properly', () => {
    const viz = new ChordalGraphVisualizer();
    expect(viz).toBeDefined();
  });

  it('should initialize and destroy cleanly with mock root container', async () => {
    const mockElements = new Map<string, any>();
    const mockRoot = {
      querySelector: (sel: string) => mockElements.get(sel) || null,
      querySelectorAll: (_sel: string) => [],
      isConnected: true,
    } as unknown as HTMLElement;

    const viz = new ChordalGraphVisualizer();
    await viz.init({
      root: mockRoot,
      algorithmId: 'chordal-graph',
      viewId: 'algo-chordal-graph-view',
    });

    expect(viz).toBeDefined();
    viz.destroy();
  });
});
