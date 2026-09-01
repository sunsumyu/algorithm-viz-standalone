import { describe, it, expect } from 'vitest';
import { CycleCountingVisualizer, CYCLE_COUNTING_TEMPLATE } from './cycle-counting-renderer';

describe('CycleCounting (3-Cycle and 4-Cycle Counting in Graph)', () => {
  it('should instantiate CycleCountingVisualizer properly', () => {
    const viz = new CycleCountingVisualizer();
    expect(viz).toBeDefined();
    expect(CYCLE_COUNTING_TEMPLATE).toContain('algo-cycle-counting-view');
    expect(CYCLE_COUNTING_TEMPLATE).toContain('cycle-canvas');
    expect(CYCLE_COUNTING_TEMPLATE).toContain('cycle-count-badge');
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
