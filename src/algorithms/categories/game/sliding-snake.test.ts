import { assertVisualizerLifecycleContract } from '../../../core/testing/contract-assertions';
import { describe, it, expect } from 'vitest';
import { SlidingSnakeVisualizer, SLIDING_SNAKE_TEMPLATE } from './sliding-snake-renderer';

describe('SlidingSnake (Sliding Window Snake Game)', () => {
  it('should instantiate SlidingSnakeVisualizer properly', () => {
    const viz = new SlidingSnakeVisualizer();
    expect(viz).toBeDefined();
    expect(SLIDING_SNAKE_TEMPLATE).toContain('algo-sliding-snake-view');
    expect(SLIDING_SNAKE_TEMPLATE).toContain('snake-canvas');
    expect(SLIDING_SNAKE_TEMPLATE).toContain('snake-preset-btn');
  });

  it('should initialize and destroy cleanly with mock root container', async () => {
    await assertVisualizerLifecycleContract(SlidingSnakeVisualizer, {
      algorithmId: 'sliding-snake',
      viewId: 'algo-sliding-snake-view',
    });
  });
});
