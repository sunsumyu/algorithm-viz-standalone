import { assertVisualizerLifecycleContract } from '../../../core/testing/contract-assertions';
import { describe, it, expect } from 'vitest';
import { LemonadeTycoonVisualizer, LEMONADE_TYCOON_TEMPLATE } from './lemonade-tycoon-renderer';

describe('LemonadeTycoon (Lemonade Tycoon Game)', () => {
  it('should instantiate LemonadeTycoonVisualizer properly', () => {
    const viz = new LemonadeTycoonVisualizer();
    expect(viz).toBeDefined();
    expect(LEMONADE_TYCOON_TEMPLATE).toContain('algo-lemonade-tycoon-view');
    expect(LEMONADE_TYCOON_TEMPLATE).toContain('lemonade-canvas');
    expect(LEMONADE_TYCOON_TEMPLATE).toContain('lemon-preset-btn');
  });

  it('should initialize and destroy cleanly with mock root container', async () => {
    await assertVisualizerLifecycleContract(LemonadeTycoonVisualizer, {
      algorithmId: 'lemonade-tycoon',
      viewId: 'algo-lemonade-tycoon-view',
    });
  });
});
