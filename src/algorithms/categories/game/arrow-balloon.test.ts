import { assertVisualizerLifecycleContract } from '../../../core/testing/contract-assertions';
import { describe, it, expect } from 'vitest';
import { ArrowBalloonVisualizer, ARROW_BALLOON_TEMPLATE } from './arrow-balloon-renderer';

describe('ArrowBalloon (Arrow Balloon Sniper Game)', () => {
  it('should instantiate ArrowBalloonVisualizer properly', () => {
    const viz = new ArrowBalloonVisualizer();
    expect(viz).toBeDefined();
    expect(ARROW_BALLOON_TEMPLATE).toContain('algo-arrow-balloon-view');
    expect(ARROW_BALLOON_TEMPLATE).toContain('arrow-canvas');
    expect(ARROW_BALLOON_TEMPLATE).toContain('arrow-preset-btn');
    expect(ARROW_BALLOON_TEMPLATE).toContain('btn-arrow-shoot');
  });

  it('should initialize and destroy cleanly with mock root container', async () => {
    await assertVisualizerLifecycleContract(ArrowBalloonVisualizer, {
      algorithmId: 'arrow-balloon',
      viewId: 'algo-arrow-balloon-view',
    });
  });
});
