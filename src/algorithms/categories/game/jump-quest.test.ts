import { assertVisualizerLifecycleContract } from '../../../core/testing/contract-assertions';
import { describe, it, expect } from 'vitest';
import { JumpQuestVisualizer, JUMP_QUEST_TEMPLATE } from './jump-quest-renderer';

describe('JumpQuest (Spring Jump Quest Game)', () => {
  it('should instantiate JumpQuestVisualizer properly', () => {
    const viz = new JumpQuestVisualizer();
    expect(viz).toBeDefined();
    expect(JUMP_QUEST_TEMPLATE).toContain('algo-jump-quest-view');
    expect(JUMP_QUEST_TEMPLATE).toContain('jump-canvas');
    expect(JUMP_QUEST_TEMPLATE).toContain('jump-preset-btn');
  });

  it('should initialize and destroy cleanly with mock root container', async () => {
    await assertVisualizerLifecycleContract(JumpQuestVisualizer, {
      algorithmId: 'jump-quest',
      viewId: 'algo-jump-quest-view',
    });
  });
});
