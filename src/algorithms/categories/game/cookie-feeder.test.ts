import { assertVisualizerLifecycleContract } from '../../../core/testing/contract-assertions';
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
    await assertVisualizerLifecycleContract(CookieFeederVisualizer, {
      algorithmId: 'cookie-feeder',
      viewId: 'algo-cookie-feeder-view',
    });
  });
});
