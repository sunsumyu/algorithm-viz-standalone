import { describe, it, expect } from 'vitest';
import { AStarJourneyVisualizer } from './a-star-journey-renderer';

describe('AStarJourney', () => {
  it('should instantiate AStarJourneyVisualizer properly', () => {
    const viz = new AStarJourneyVisualizer();
    expect(viz).toBeDefined();
  });

  it('should initialize and destroy cleanly with mock root container', async () => {
    const mockElements = new Map<string, any>();
    const mockRoot = {
      querySelector: (sel: string) => mockElements.get(sel) || null,
      querySelectorAll: (_sel: string) => [],
      isConnected: true,
    } as unknown as HTMLElement;

    const viz = new AStarJourneyVisualizer();
    await viz.init({
      root: mockRoot,
      algorithmId: 'a-star-journey',
      viewId: 'algo-a-star-journey-view',
    });

    expect(viz).toBeDefined();
    viz.destroy();
  });
});
