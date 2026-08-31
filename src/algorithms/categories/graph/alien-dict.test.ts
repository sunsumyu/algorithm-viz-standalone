import { describe, it, expect } from 'vitest';
import { AlienDictVisualizer, ALIEN_DICT_TEMPLATE } from './alien-dict-renderer';

describe('AlienDict (Alien Dictionary Topo Sort)', () => {
  it('should instantiate AlienDictVisualizer properly', () => {
    const viz = new AlienDictVisualizer();
    expect(viz).toBeDefined();
    expect(ALIEN_DICT_TEMPLATE).toContain('algo-alien-dict-view');
    expect(ALIEN_DICT_TEMPLATE).toContain('alien-canvas');
    expect(ALIEN_DICT_TEMPLATE).toContain('alien-words-list');
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
