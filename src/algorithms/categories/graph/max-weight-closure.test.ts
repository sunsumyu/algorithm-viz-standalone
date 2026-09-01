import { describe, it, expect } from 'vitest';
import { MaxWeightClosureVisualizer, MAX_WEIGHT_CLOSURE_TEMPLATE } from './max-weight-closure-renderer';

describe('MaxWeightClosure (Max-Weight Closure of Directed Graph)', () => {
  it('should instantiate MaxWeightClosureVisualizer properly', () => {
    const viz = new MaxWeightClosureVisualizer();
    expect(viz).toBeDefined();
    expect(MAX_WEIGHT_CLOSURE_TEMPLATE).toContain('algo-max-weight-closure-view');
    expect(MAX_WEIGHT_CLOSURE_TEMPLATE).toContain('mwc-canvas');
    expect(MAX_WEIGHT_CLOSURE_TEMPLATE).toContain('mwc-profit-badge');
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
