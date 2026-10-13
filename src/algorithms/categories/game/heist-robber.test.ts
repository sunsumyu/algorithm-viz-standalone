import { assertVisualizerLifecycleContract } from '../../../core/testing/contract-assertions';
import { describe, it, expect } from 'vitest';
import { HeistRobberVisualizer, HEIST_ROBBER_TEMPLATE } from './heist-robber-renderer';

describe('HeistRobber (House Robber Heist DP Game)', () => {
  it('should instantiate HeistRobberVisualizer properly', () => {
    const viz = new HeistRobberVisualizer();
    expect(viz).toBeDefined();
    expect(HEIST_ROBBER_TEMPLATE).toContain('algo-heist-robber-view');
    expect(HEIST_ROBBER_TEMPLATE).toContain('heist-canvas');
    expect(HEIST_ROBBER_TEMPLATE).toContain('heist-preset-btn');
    expect(HEIST_ROBBER_TEMPLATE).toContain('heist-dp-cells');
  });

  it('should initialize and destroy cleanly with mock root container', async () => {
    await assertVisualizerLifecycleContract(HeistRobberVisualizer, {
      algorithmId: 'heist-robber',
      viewId: 'algo-heist-robber-view',
    });
  });
});
