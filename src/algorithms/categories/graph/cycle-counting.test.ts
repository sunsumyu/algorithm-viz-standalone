import { describe, it, expect } from 'vitest';
import { CycleCountingVisualizer } from './cycle-counting-renderer';

describe('CycleCounting (P1989)', () => {
  it('should instantiate CycleCountingVisualizer properly', () => {
    const viz = new CycleCountingVisualizer();
    expect(viz).toBeDefined();
  });

  it('should initialize and destroy cleanly with mock root container', async () => {
    const mockElements = new Map<string, any>();
    const mockRoot = {
      querySelector: (sel: string) => mockElements.get(sel) || null,
      querySelectorAll: (_sel: string) => [],
      isConnected: true,
    } as unknown as HTMLElement;

    const viz = new CycleCountingVisualizer();
    await viz.init({
      root: mockRoot,
      algorithmId: 'cycle-counting',
      viewId: 'algo-cycle-counting-view',
    });

    expect(viz).toBeDefined();
    viz.destroy();
  });
});
