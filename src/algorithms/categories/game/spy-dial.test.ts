import { assertVisualizerLifecycleContract } from '../../../core/testing/contract-assertions';
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
    await assertVisualizerLifecycleContract(SpyDialVisualizer, {
      algorithmId: 'spy-dial',
      viewId: 'algo-spy-dial-view',
    });
  });
});
