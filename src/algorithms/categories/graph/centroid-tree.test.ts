import { describe, it, expect } from 'vitest';
import {
  CentroidTreeVisualizer,
  buildCentroidTreeSteps,
} from './centroid-tree-renderer';
import { CENTROID_TREE_CODE_LANGUAGES } from './centroid-tree-problem-content';
import {
  assertVisualizerLifecycleContract,
  assertMultiLanguageCodeContract,
  assertStepStreamContract,
} from '../../../core/testing/contract-assertions';

describe('CentroidTree (Dynamic Centroid Decomposition)', () => {
  it('should instantiate CentroidTreeVisualizer properly', () => {
    const viz = new CentroidTreeVisualizer();
    expect(viz).toBeDefined();
  });

  it('should generate at least 20 granular steps for classic_5node preset', () => {
    const steps = buildCentroidTreeSteps('classic_5node');
    expect(steps.length).toBeGreaterThanOrEqual(20);

    assertStepStreamContract(steps, {
      codes: CENTROID_TREE_CODE_LANGUAGES,
      requiredMetricKeys: ['metric-active-node', 'metric-tree-height', 'metric-centroid-root', 'metric-centroid-phase'],
    });

    const lastStep = steps[steps.length - 1];
    expect(lastStep.status).toBe('done');
    expect(lastStep.centroidParents[1]).toBeNull();
    expect(lastStep.centroidParents[4]).toBe(1);
    expect(lastStep.centroidParents[5]).toBe(1);
    expect(lastStep.centroidParents[2]).toBe(4);
    expect(lastStep.centroidParents[3]).toBe(5);
  });

  it('should generate at least 20 granular steps for simple_line preset', () => {
    const steps = buildCentroidTreeSteps('simple_line');
    expect(steps.length).toBeGreaterThanOrEqual(20);

    assertStepStreamContract(steps, {
      codes: CENTROID_TREE_CODE_LANGUAGES
    });

    const lastStep = steps[steps.length - 1];
    expect(lastStep.status).toBe('done');
    expect(lastStep.centroidParents[3]).toBeNull();
  });

  it('should have complete code across all languages without empty stubs', () => {
    assertMultiLanguageCodeContract(CENTROID_TREE_CODE_LANGUAGES, {
      minLines: 35,
      requiredPatterns: [/centroidtree|centroid_tree/i, /getsubtreesize|get_subtree_size/i, /build/i, /parentctree|parent_ctree/i],
    });
  });

  it('should initialize and destroy cleanly with mock root container', async () => {
    await assertVisualizerLifecycleContract(CentroidTreeVisualizer, {
      algorithmId: 'centroid-tree',
      viewId: 'algo-centroid-tree-view',
    });
  });
});
