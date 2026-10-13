import { describe, it, expect } from 'vitest';
import {
  TreeDominantColorVisualizer,
  buildTreeDominantColorSteps,
} from './tree-dominant-color-renderer';
import { TREE_DOMINANT_CODE_LANGUAGES } from './tree-dominant-color-problem-content';
import {
  assertVisualizerLifecycleContract,
  assertMultiLanguageCodeContract,
  assertStepStreamContract,
} from '../../../core/testing/contract-assertions';

describe('TreeDominantColor (CF600E)', () => {
  it('should instantiate TreeDominantColorVisualizer properly', () => {
    const viz = new TreeDominantColorVisualizer();
    expect(viz).toBeDefined();
  });

  it('should generate at least 20 granular steps for cf600e_5node preset', () => {
    const steps = buildTreeDominantColorSteps('cf600e_5node');
    expect(steps.length).toBeGreaterThanOrEqual(20);

    assertStepStreamContract(steps, {
      codes: TREE_DOMINANT_CODE_LANGUAGES,
      requiredMetricKeys: ['metric-cur-root', 'metric-max-freq', 'metric-sum-colors', 'metric-dominant-phase'],
    });

    const lastStep = steps[steps.length - 1];
    expect(lastStep.status).toBe('done');
    expect(lastStep.ans[1]).toBe(1);
    expect(lastStep.ans[2]).toBe(6);
    expect(lastStep.ans[3]).toBe(1);
    expect(lastStep.ans[4]).toBe(1);
    expect(lastStep.ans[5]).toBe(3);
  });

  it('should generate at least 20 granular steps for bicolor_5node preset', () => {
    const steps = buildTreeDominantColorSteps('bicolor_5node');
    expect(steps.length).toBeGreaterThanOrEqual(20);

    assertStepStreamContract(steps, {
      codes: TREE_DOMINANT_CODE_LANGUAGES
    });

    const lastStep = steps[steps.length - 1];
    expect(lastStep.status).toBe('done');
    expect(lastStep.ans[1]).toBe(2);
  });

  it('should have complete code across all languages without empty stubs', () => {
    assertMultiLanguageCodeContract(TREE_DOMINANT_CODE_LANGUAGES, {
      minLines: 35,
      requiredPatterns: [/treedominantcolor|tree_dominant_color|dominantcolorsolver/i, /dfsinit|dfs_init/i, /addnode|add_node/i, /dfssolve|dfs_solve/i],
    });
  });

  it('should initialize and destroy cleanly with mock root container', async () => {
    await assertVisualizerLifecycleContract(TreeDominantColorVisualizer, {
      algorithmId: 'tree-dominant-color',
      viewId: 'algo-tree-dominant-color-view',
    });
  });
});
