import { assertVisualizerLifecycleContract } from '../../../core/testing/contract-assertions';
import { describe, it, expect } from 'vitest';
import { CandyKingdomVisualizer, CANDY_KINGDOM_TEMPLATE } from './candy-kingdom-renderer';

describe('CandyKingdom (Candy Kingdom Game)', () => {
  it('should instantiate CandyKingdomVisualizer properly', () => {
    const viz = new CandyKingdomVisualizer();
    expect(viz).toBeDefined();
    expect(CANDY_KINGDOM_TEMPLATE).toContain('algo-candy-kingdom-view');
    expect(CANDY_KINGDOM_TEMPLATE).toContain('candy-canvas');
    expect(CANDY_KINGDOM_TEMPLATE).toContain('candy-preset-btn');
  });

  it('should initialize and destroy cleanly with mock root container', async () => {
    await assertVisualizerLifecycleContract(CandyKingdomVisualizer, {
      algorithmId: 'candy-kingdom',
      viewId: 'algo-candy-kingdom-view',
    });
  });
});
