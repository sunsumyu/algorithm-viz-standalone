import { describe, it, expect } from 'vitest';
import { AStarJourneyVisualizer, A_STAR_JOURNEY_TEMPLATE } from './a-star-journey-renderer';

describe('AStarJourney (A* Pathfinding)', () => {
  it('should instantiate AStarJourneyVisualizer properly', () => {
    const viz = new AStarJourneyVisualizer();
    expect(viz).toBeDefined();
    expect(A_STAR_JOURNEY_TEMPLATE).toContain('algo-a-star-journey-view');
    expect(A_STAR_JOURNEY_TEMPLATE).toContain('astar-canvas');
    expect(A_STAR_JOURNEY_TEMPLATE).toContain('astar-openset-container');
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
