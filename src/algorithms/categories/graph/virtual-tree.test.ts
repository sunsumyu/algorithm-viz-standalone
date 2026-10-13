import { describe, it, expect } from 'vitest';
import {
  VirtualTreeVisualizer,
  buildVirtualTreeSteps,
} from './virtual-tree-renderer';
import { VIRTUAL_TREE_CODE_LANGUAGES } from './virtual-tree-problem-content';
import {
  assertVisualizerLifecycleContract,
  assertMultiLanguageCodeContract,
  assertStepStreamContract,
} from '../../../core/testing/contract-assertions';

describe('VirtualTree (P2495)', () => {
  it('should instantiate VirtualTreeVisualizer properly', () => {
    const viz = new VirtualTreeVisualizer();
    expect(viz).toBeDefined();
  });

  it('should generate at least 20 granular steps for classic_7node preset', () => {
    const steps = buildVirtualTreeSteps('classic_7node');
    expect(steps.length).toBeGreaterThanOrEqual(20);

    assertStepStreamContract(steps, {
      codes: VIRTUAL_TREE_CODE_LANGUAGES,
      requiredMetricKeys: ['metric-vtree-nodes', 'metric-stack-top', 'metric-dp-cost', 'metric-vtree-phase'],
    });

    const lastStep = steps[steps.length - 1];
    expect(lastStep.status).toBe('done');
    expect(lastStep.dpVal[1]).toBe(9);
    expect(lastStep.virtualTreeNodes.length).toBe(5);
  });

  it('should generate at least 20 granular steps for simple_chain preset', () => {
    const steps = buildVirtualTreeSteps('simple_chain');
    expect(steps.length).toBeGreaterThanOrEqual(20);

    assertStepStreamContract(steps, {
      codes: VIRTUAL_TREE_CODE_LANGUAGES
    });

    const lastStep = steps[steps.length - 1];
    expect(lastStep.status).toBe('done');
    expect(lastStep.dpVal[1]).toBe(7);
  });

  it('should have complete code across all languages without empty stubs', () => {
    assertMultiLanguageCodeContract(VIRTUAL_TREE_CODE_LANGUAGES, {
      minLines: 35,
      requiredPatterns: [/virtualtree|virtual_tree/i, /dfsinit|dfs_init/i, /getlca|get_lca/i, /buildvirtualtree|build_virtual_tree/i],
    });
  });

  it('should initialize and destroy cleanly with mock root container', async () => {
    await assertVisualizerLifecycleContract(VirtualTreeVisualizer, {
      algorithmId: 'virtual-tree',
      viewId: 'algo-virtual-tree-view',
    });
  });
});
