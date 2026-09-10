import { describe, it, expect } from 'vitest';
import {
  BipartiteGameVisualizer,
  buildBipartiteGameSteps,
} from './bipartite-game-renderer';
import { BIPARTITE_GAME_CODE_LANGUAGES } from './bipartite-game-problem-content';

describe('BipartiteGame (P4055)', () => {
  it('should instantiate BipartiteGameVisualizer properly', () => {
    const viz = new BipartiteGameVisualizer();
    expect(viz).toBeDefined();
  });

  it('should generate at least 20 granular steps for five_nodes preset', () => {
    const steps = buildBipartiteGameSteps('five_nodes');
    expect(steps.length).toBeGreaterThanOrEqual(20);

    const javaLinesCount = BIPARTITE_GAME_CODE_LANGUAGES.java.length;
    for (const step of steps) {
      expect(step.message).toBeTruthy();
      expect(step.log).toBeTruthy();
      expect(step.codeLine).toBeDefined();
      const lines = Array.isArray(step.codeLine) ? step.codeLine : [step.codeLine];
      for (const line of lines) {
        expect(line).toBeGreaterThan(0);
        expect(line).toBeLessThanOrEqual(javaLinesCount);
      }
      expect(step.metrics).toBeDefined();
      expect(step.metrics?.['metric-cur-start']).toBeDefined();
      expect(step.metrics?.['metric-win-status']).toBeDefined();
      expect(step.metrics?.['metric-win-set']).toBeDefined();
      expect(step.metrics?.['metric-game-phase']).toBeDefined();
    }

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

    const javaLinesCount = BIPARTITE_GAME_CODE_LANGUAGES.java.length;
    for (const step of steps) {
      expect(step.message).toBeTruthy();
      expect(step.log).toBeTruthy();
      expect(step.codeLine).toBeDefined();
      const lines = Array.isArray(step.codeLine) ? step.codeLine : [step.codeLine];
      for (const line of lines) {
        expect(line).toBeGreaterThan(0);
        expect(line).toBeLessThanOrEqual(javaLinesCount);
      }
      expect(step.metrics).toBeDefined();
    }

    const lastStep = steps[steps.length - 1];
    expect(lastStep.status).toBe('done');
    expect(lastStep.isWinState).toBe(true);
    expect(lastStep.winningStartNodes).toEqual([3]);
  });

  it('should have complete code across all languages without empty stubs', () => {
    for (const lang of ['cpp', 'java', 'python', 'javascript']) {
      const code = BIPARTITE_GAME_CODE_LANGUAGES[lang];
      expect(code).toBeDefined();
      expect(code.length).toBeGreaterThanOrEqual(35);
      const joined = code.join('\n');
      expect(joined).toMatch(/dfshungar|dfs_hungar/i);
      expect(joined).toMatch(/dfsalternate|dfs_alternate/i);
      expect(joined).toMatch(/getwinningstartnodes|get_winning_start_nodes/i);
    }
  });

  it('should initialize and destroy cleanly with mock root container', async () => {
    const mockElements = new Map<string, any>();
    const mockRoot = {
      querySelector: (sel: string) => mockElements.get(sel) || null,
      querySelectorAll: (_sel: string) => [],
      isConnected: true,
    } as unknown as HTMLElement;

    const viz = new BipartiteGameVisualizer();
    await viz.init({
      root: mockRoot,
      algorithmId: 'bipartite-game',
      viewId: 'algo-bipartite-game-view',
    });

    expect(viz).toBeDefined();
    viz.destroy();
  });
});
