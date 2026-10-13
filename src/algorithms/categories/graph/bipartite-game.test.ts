import { describe, it, expect } from 'vitest';
import {
  BipartiteGameVisualizer,
  buildBipartiteGameSteps,
} from './bipartite-game-renderer';
import { BIPARTITE_GAME_CODE_LANGUAGES } from './bipartite-game-problem-content';
import {
  assertVisualizerLifecycleContract,
  assertMultiLanguageCodeContract,
  assertStepStreamContract,
} from '../../../core/testing/contract-assertions';

describe('BipartiteGame (P4055)', () => {
  it('should instantiate BipartiteGameVisualizer properly', () => {
    const viz = new BipartiteGameVisualizer();
    expect(viz).toBeDefined();
  });

  it('should generate at least 20 granular steps for five_nodes preset', () => {
    const steps = buildBipartiteGameSteps('five_nodes');
    expect(steps.length).toBeGreaterThanOrEqual(20);

    assertStepStreamContract(steps, {
      codes: BIPARTITE_GAME_CODE_LANGUAGES,
      requiredMetricKeys: ['metric-cur-start', 'metric-win-status', 'metric-win-set', 'metric-game-phase'],
    });

    const lastStep = steps[steps.length - 1];
    expect(lastStep.status).toBe('done');
    expect(lastStep.isWinState).toBe(true);
    expect(lastStep.winningStartNodes).toEqual([2]);
    expect(lastStep.canBeUnmatchedNodes).toContain(5);
    expect(lastStep.canBeUnmatchedNodes).toContain(1);
  });

  it('should generate at least 20 granular steps for six_nodes preset', () => {
    const steps = buildBipartiteGameSteps('six_nodes');
    expect(steps.length).toBeGreaterThanOrEqual(20);

    assertStepStreamContract(steps, {
      codes: BIPARTITE_GAME_CODE_LANGUAGES
    });

    const lastStep = steps[steps.length - 1];
    expect(lastStep.status).toBe('done');
    expect(lastStep.isWinState).toBe(true);
    expect(lastStep.winningStartNodes).toEqual([3]);
  });

  it('should have complete code across all languages without empty stubs', () => {
    assertMultiLanguageCodeContract(BIPARTITE_GAME_CODE_LANGUAGES, {
      minLines: 35,
      requiredPatterns: [/dfshungar|dfs_hungar/i, /dfsalternate|dfs_alternate/i, /getwinningstartnodes|get_winning_start_nodes/i],
    });
  });

  it('should initialize and destroy cleanly with mock root container', async () => {
    await assertVisualizerLifecycleContract(BipartiteGameVisualizer, {
      algorithmId: 'bipartite-game',
      viewId: 'algo-bipartite-game-view',
    });
  });
});
