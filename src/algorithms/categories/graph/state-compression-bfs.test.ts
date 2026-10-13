import { describe, it, expect } from 'vitest';
import {
  StateCompressionBfsVisualizer,
  buildStateBFSSteps,
} from './state-compression-bfs-renderer';
import { STATE_COMPRESSION_BFS_CODE_LANGUAGES } from './state-compression-bfs-problem-content';
import {
  assertVisualizerLifecycleContract,
  assertMultiLanguageCodeContract,
  assertStepStreamContract,
} from '../../../core/testing/contract-assertions';

describe('StateCompressionBFS (LeetCode 864)', () => {
  it('should instantiate StateCompressionBfsVisualizer properly', () => {
    const viz = new StateCompressionBfsVisualizer();
    expect(viz).toBeDefined();
  });

  it('should generate at least 20 granular steps for classic_3x3 preset', () => {
    const steps = buildStateBFSSteps('classic_3x3');
    expect(steps.length).toBeGreaterThanOrEqual(20);

    assertStepStreamContract(steps, {
      codes: STATE_COMPRESSION_BFS_CODE_LANGUAGES,
      requiredMetricKeys: ['metric-state-keys', 'metric-state-steps', 'metric-state-coord', 'metric-state-phase'],
    });

    const lastStep = steps[steps.length - 1];
    expect(lastStep.status).toBe('done');
    expect(lastStep.keyMask).toBe(3);
    expect(lastStep.stepCount).toBe(6);
  });

  it('should generate at least 20 granular steps for simple_line preset', () => {
    const steps = buildStateBFSSteps('simple_line');
    expect(steps.length).toBeGreaterThanOrEqual(20);

    assertStepStreamContract(steps, {
      codes: STATE_COMPRESSION_BFS_CODE_LANGUAGES
    });

    const lastStep = steps[steps.length - 1];
    expect(lastStep.status).toBe('done');
    expect(lastStep.keyMask).toBe(3);
    expect(lastStep.stepCount).toBe(3);
  });

  it('should have complete code across all languages without empty stubs', () => {
    assertMultiLanguageCodeContract(STATE_COMPRESSION_BFS_CODE_LANGUAGES, {
      minLines: 35,
      requiredPatterns: [/shortestpath|shortest_path/i, /mask/i, /visited|queue/i],
    });
  });

  it('should initialize and destroy cleanly with mock root container', async () => {
    await assertVisualizerLifecycleContract(StateCompressionBfsVisualizer, {
      algorithmId: 'state-compression-bfs',
      viewId: 'algo-state-compression-bfs-view',
    });
  });
});
