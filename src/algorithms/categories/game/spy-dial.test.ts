import { describe, it, expect } from 'vitest';
import { SpyDialVisualizer, SPY_DIAL_TEMPLATE } from './spy-dial-renderer';

describe('SpyDial (Spy Dial Phone Cipher Game)', () => {
  it('should instantiate SpyDialVisualizer properly', () => {
    const viz = new SpyDialVisualizer();
    expect(viz).toBeDefined();
    expect(SPY_DIAL_TEMPLATE).toContain('algo-spy-dial-view');
    expect(SPY_DIAL_TEMPLATE).toContain('spy-canvas');
    expect(SPY_DIAL_TEMPLATE).toContain('spy-dial-key');
  });

  it('should initialize and destroy cleanly with mock root container', async () => {
    const mockElements = new Map<string, any>();
    const mockRoot = {
      querySelector: (sel: string) => mockElements.get(sel) || null,
      querySelectorAll: (_sel: string) => [],
    } as unknown as HTMLElement;

    const viz = new SpyDialVisualizer();
    await viz.init({
      root: mockRoot,
      algorithmId: 'spy-dial',
      viewId: 'algo-spy-dial-view',
    });

    expect(viz).toBeDefined();
    viz.destroy();
  });
});
