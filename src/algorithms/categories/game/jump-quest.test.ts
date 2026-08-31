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
    const mockElements = new Map<string, any>();
    const mockRoot = {
      querySelector: (sel: string) => mockElements.get(sel) || null,
      querySelectorAll: (_sel: string) => [],
    } as unknown as HTMLElement;

    const viz = new JumpQuestVisualizer();
    await viz.init({
      root: mockRoot,
      algorithmId: 'jump-quest',
      viewId: 'algo-jump-quest-view',
    });

    expect(viz).toBeDefined();
    viz.destroy();
  });
});
