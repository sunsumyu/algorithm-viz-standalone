import { describe, it, expect } from 'vitest';
import { PeopleSecretVisualizer } from './people-secret-renderer';

describe('PeopleSecret (LeetCode 2327)', () => {
  it('should instantiate PeopleSecretVisualizer properly', () => {
    const viz = new PeopleSecretVisualizer();
    expect(viz).toBeDefined();
  });

  it('should initialize and destroy cleanly with mock root container', async () => {
    const mockElements = new Map<string, any>();
    const mockRoot = {
      querySelector: (sel: string) => mockElements.get(sel) || null,
      querySelectorAll: (_sel: string) => [],
      isConnected: true,
    } as unknown as HTMLElement;

    const viz = new PeopleSecretVisualizer();
    await viz.init({
      root: mockRoot,
      algorithmId: 'people-secret',
      viewId: 'algo-people-secret-view',
    });

    expect(viz).toBeDefined();
    viz.destroy();
  });
});
