import { describe, it, expect } from 'vitest';
import { CookieFeederVisualizer, COOKIE_FEEDER_TEMPLATE } from './cookie-feeder-renderer';

describe('CookieFeeder (Cookie Pets Feeder Game)', () => {
  it('should instantiate CookieFeederVisualizer properly', () => {
    const viz = new CookieFeederVisualizer();
    expect(viz).toBeDefined();
    expect(COOKIE_FEEDER_TEMPLATE).toContain('algo-cookie-feeder-view');
    expect(COOKIE_FEEDER_TEMPLATE).toContain('cookie-canvas');
    expect(COOKIE_FEEDER_TEMPLATE).toContain('cookie-preset-btn');
  });

  it('should initialize and destroy cleanly with mock root container', async () => {
    const mockElements = new Map<string, any>();
    const mockRoot = {
      querySelector: (sel: string) => mockElements.get(sel) || null,
      querySelectorAll: (_sel: string) => [],
    } as unknown as HTMLElement;

    const viz = new CookieFeederVisualizer();
    await viz.init({
      root: mockRoot,
      algorithmId: 'cookie-feeder',
      viewId: 'algo-cookie-feeder-view',
    });

    expect(viz).toBeDefined();
    viz.destroy();
  });
});
