import { describe, it, expect } from 'vitest';
import { HungarianMatchingVisualizer } from './hungarian-matching-renderer';

describe('HungarianMatching (P3386)', () => {
  it('should instantiate HungarianMatchingVisualizer properly', () => {
    const viz = new HungarianMatchingVisualizer();
    expect(viz).toBeDefined();
  });

  it('should initialize and destroy cleanly with mock root container', async () => {
    const mockElements = new Map<string, any>();
    const mockRoot = {
      querySelector: (sel: string) => mockElements.get(sel) || null,
      querySelectorAll: (_sel: string) => [],
      isConnected: true,
    } as unknown as HTMLElement;

    const viz = new HungarianMatchingVisualizer();
    await viz.init({
      root: mockRoot,
      algorithmId: 'hungarian-matching',
      viewId: 'algo-hungarian-matching-view',
    });

    expect(viz).toBeDefined();
    viz.destroy();
  });
});
