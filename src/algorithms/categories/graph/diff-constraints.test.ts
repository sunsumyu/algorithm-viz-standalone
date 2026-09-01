import { describe, it, expect } from 'vitest';
import { DiffConstraintsVisualizer } from './diff-constraints-renderer';

describe('DiffConstraints (P5960)', () => {
  it('should instantiate DiffConstraintsVisualizer properly', () => {
    const viz = new DiffConstraintsVisualizer();
    expect(viz).toBeDefined();
  });

  it('should initialize and destroy cleanly with mock root container', async () => {
    const mockElements = new Map<string, any>();
    const mockRoot = {
      querySelector: (sel: string) => mockElements.get(sel) || null,
      querySelectorAll: (_sel: string) => [],
      isConnected: true,
    } as unknown as HTMLElement;

    const viz = new DiffConstraintsVisualizer();
    await viz.init({
      root: mockRoot,
      algorithmId: 'diff-constraints',
      viewId: 'algo-diff-constraints-view',
    });

    expect(viz).toBeDefined();
    viz.destroy();
  });
});
