import { assertVisualizerLifecycleContract } from '../../../core/testing/contract-assertions';
import { describe, it, expect } from 'vitest';
import { LavaParkourVisualizer, LAVA_PARKOUR_TEMPLATE } from './lava-parkour-renderer';

describe('LavaParkour (Monotonic Stack Lava Parkour Game)', () => {
  it('should instantiate LavaParkourVisualizer properly', () => {
    const viz = new LavaParkourVisualizer();
    expect(viz).toBeDefined();
    expect(LAVA_PARKOUR_TEMPLATE).toContain('algo-lava-parkour-view');
    expect(LAVA_PARKOUR_TEMPLATE).toContain('lava-parkour-canvas');
    expect(LAVA_PARKOUR_TEMPLATE).toContain('lava-stack-visual');
  });

  it('should initialize and destroy cleanly with mock root container', async () => {
    await assertVisualizerLifecycleContract(LavaParkourVisualizer, {
      algorithmId: 'lava-parkour',
      viewId: 'algo-lava-parkour-view',
    });
  });
});
