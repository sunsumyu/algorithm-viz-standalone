import { describe, it, expect } from 'vitest';
import { MaxWeightClosureVisualizer } from './max-weight-closure-renderer';

describe('MaxWeightClosure (P2762)', () => {
  it('should instantiate MaxWeightClosureVisualizer properly', () => {
    const viz = new MaxWeightClosureVisualizer();
    expect(viz).toBeDefined();
  });

  it('should initialize and destroy cleanly with mock root container', async () => {
    const mockElements = new Map<string, any>();
    const mockRoot = {
      querySelector: (sel: string) => mockElements.get(sel) || null,
      querySelectorAll: (_sel: string) => [],
      isConnected: true,
    } as unknown as HTMLElement;

    const viz = new MaxWeightClosureVisualizer();
    await viz.init({
      root: mockRoot,
      algorithmId: 'max-weight-closure',
      viewId: 'algo-max-weight-closure-view',
    });

    expect(viz).toBeDefined();
    viz.destroy();
  });
});
