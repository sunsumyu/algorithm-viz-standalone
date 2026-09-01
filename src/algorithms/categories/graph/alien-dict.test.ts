import { describe, it, expect } from 'vitest';
import { AlienDictVisualizer } from './alien-dict-renderer';

describe('AlienDict (LeetCode 269)', () => {
  it('should instantiate AlienDictVisualizer properly', () => {
    const viz = new AlienDictVisualizer();
    expect(viz).toBeDefined();
  });

  it('should initialize and destroy cleanly with mock root container', async () => {
    const mockElements = new Map<string, any>();
    const mockRoot = {
      querySelector: (sel: string) => mockElements.get(sel) || null,
      querySelectorAll: (_sel: string) => [],
      isConnected: true,
    } as unknown as HTMLElement;

    const viz = new AlienDictVisualizer();
    await viz.init({
      root: mockRoot,
      algorithmId: 'alien-dict',
      viewId: 'algo-alien-dict-view',
    });

    expect(viz).toBeDefined();
    viz.destroy();
  });
});
