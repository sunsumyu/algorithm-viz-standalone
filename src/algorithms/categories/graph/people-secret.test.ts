import { describe, it, expect } from 'vitest';
import { PeopleSecretVisualizer, PEOPLE_SECRET_TEMPLATE } from './people-secret-renderer';

describe('PeopleSecret (Find All People With Secret)', () => {
  it('should instantiate PeopleSecretVisualizer properly', () => {
    const viz = new PeopleSecretVisualizer();
    expect(viz).toBeDefined();
    expect(PEOPLE_SECRET_TEMPLATE).toContain('algo-people-secret-view');
    expect(PEOPLE_SECRET_TEMPLATE).toContain('secret-canvas');
    expect(PEOPLE_SECRET_TEMPLATE).toContain('secret-meetings-container');
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
