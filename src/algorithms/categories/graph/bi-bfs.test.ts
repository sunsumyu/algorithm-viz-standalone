import { describe, it, expect } from 'vitest';
import {
  BiBFSVisualizer,
  buildBiBFSSteps,
} from './bi-bfs-renderer';
import { BI_BFS_CODE_LANGUAGES } from './bi-bfs-problem-content';
import {
  assertVisualizerLifecycleContract,
  assertMultiLanguageCodeContract,
  assertStepStreamContract,
} from '../../../core/testing/contract-assertions';

describe('BiBFS (LeetCode 127)', () => {
  it('should instantiate BiBFSVisualizer properly', () => {
    const viz = new BiBFSVisualizer();
    expect(viz).toBeDefined();
  });

  it('should generate at least 20 granular steps for classic_word preset', () => {
    const steps = buildBiBFSSteps('classic_word');
    expect(steps.length).toBeGreaterThanOrEqual(20);

    assertStepStreamContract(steps, {
      codes: BI_BFS_CODE_LANGUAGES,
      requiredMetricKeys: ['metric-bibfs-step', 'metric-bibfs-meet', 'metric-small-size', 'metric-bibfs-phase'],
    });

    const lastStep = steps[steps.length - 1];
    expect(lastStep.status).toBe('done');
    expect(lastStep.meetWord).toBe('dot');
    expect(lastStep.stepCount).toBe(5);
    expect(lastStep.activePath).toEqual(['hit', 'hot', 'dot', 'dog', 'cog']);
  });

  it('should generate at least 20 granular steps for line_4word preset', () => {
    const steps = buildBiBFSSteps('line_4word');
    expect(steps.length).toBeGreaterThanOrEqual(20);

    assertStepStreamContract(steps, {
      codes: BI_BFS_CODE_LANGUAGES
    });

    const lastStep = steps[steps.length - 1];
    expect(lastStep.status).toBe('done');
    expect(lastStep.stepCount).toBe(4);
  });

  it('should have complete code across all languages without empty stubs', () => {
    assertMultiLanguageCodeContract(BI_BFS_CODE_LANGUAGES, {
      minLines: 35,
      requiredPatterns: [/ladderlength|ladder_length/i, /small/i, /big/i],
    });
  });

  it('should initialize and destroy cleanly with mock root container', async () => {
    await assertVisualizerLifecycleContract(BiBFSVisualizer, {
      algorithmId: 'bi-bfs',
      viewId: 'algo-bi-bfs-view',
    });
  });
});
