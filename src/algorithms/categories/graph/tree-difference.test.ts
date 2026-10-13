import { describe, it, expect } from 'vitest';
import {
  TreeDifferenceVisualizer,
  buildTreeDifferenceSteps,
} from './tree-difference-renderer';
import { TREE_DIFF_CODE_LANGUAGES } from './tree-difference-problem-content';
import {
  assertVisualizerLifecycleContract,
  assertMultiLanguageCodeContract,
  assertStepStreamContract,
} from '../../../core/testing/contract-assertions';

describe('TreeDifference (P3128)', () => {
  it('should instantiate TreeDifferenceVisualizer properly', () => {
    const viz = new TreeDifferenceVisualizer();
    expect(viz).toBeDefined();
  });

  it('should generate at least 20 granular steps for node_diff_5node preset', () => {
    const steps = buildTreeDifferenceSteps('node_diff_5node');
    expect(steps.length).toBeGreaterThanOrEqual(20);

    assertStepStreamContract(steps, {
      codes: TREE_DIFF_CODE_LANGUAGES,
      requiredMetricKeys: ['metric-active-lca', 'metric-max-cover', 'metric-diff-formula', 'metric-diff-phase'],
    });

    const lastStep = steps[steps.length - 1];
    expect(lastStep.status).toBe('done');
    expect(lastStep.recoveredCounts[2]).toBe(1);
    expect(lastStep.recoveredCounts[4]).toBe(1);
    expect(lastStep.recoveredCounts[5]).toBe(1);
    expect(lastStep.recoveredCounts[1]).toBe(0);
    expect(lastStep.recoveredCounts[3]).toBe(0);
  });

  it('should generate at least 20 granular steps for edge_diff_5node preset', () => {
    const steps = buildTreeDifferenceSteps('edge_diff_5node');
    expect(steps.length).toBeGreaterThanOrEqual(20);

    assertStepStreamContract(steps, {
      codes: TREE_DIFF_CODE_LANGUAGES
    });

    const lastStep = steps[steps.length - 1];
    expect(lastStep.status).toBe('done');
    expect(lastStep.recoveredCounts[4]).toBe(1);
    expect(lastStep.recoveredCounts[5]).toBe(1);
    expect(lastStep.recoveredCounts[2]).toBe(0);
  });

  it('should have complete code across all languages without empty stubs', () => {
    assertMultiLanguageCodeContract(TREE_DIFF_CODE_LANGUAGES, {
      minLines: 35,
      requiredPatterns: [/treedifference|tree_difference|solver/i, /dfslca|dfs_lca/i, /getlca|get_lca/i, /addpathnode|add_path_node/i, /dfssum|dfs_sum/i],
    });
  });

  it('should initialize and destroy cleanly with mock root container', async () => {
    await assertVisualizerLifecycleContract(TreeDifferenceVisualizer, {
      algorithmId: 'tree-difference',
      viewId: 'algo-tree-difference-view',
    });
  });
});
