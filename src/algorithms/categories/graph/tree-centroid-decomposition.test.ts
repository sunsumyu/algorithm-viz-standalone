import { describe, it, expect } from 'vitest';
import {
  TreeCentroidDecompositionVisualizer,
  buildStaticCentroidSteps,
} from './tree-centroid-decomposition-renderer';
import { TREE_CENTROID_CODE_LANGUAGES } from './tree-centroid-decomposition-problem-content';
import {
  assertVisualizerLifecycleContract,
  assertMultiLanguageCodeContract,
  assertStepStreamContract,
} from '../../../core/testing/contract-assertions';

describe('TreeCentroidDecomposition (POJ 1741)', () => {
  it('should instantiate TreeCentroidDecompositionVisualizer properly', () => {
    const viz = new TreeCentroidDecompositionVisualizer();
    expect(viz).toBeDefined();
  });

  it('should generate at least 20 granular steps for classic_7node preset', () => {
    const steps = buildStaticCentroidSteps('classic_7node');
    expect(steps.length).toBeGreaterThanOrEqual(20);

    assertStepStreamContract(steps, {
      codes: TREE_CENTROID_CODE_LANGUAGES,
      requiredMetricKeys: ['metric-cur-centroid', 'metric-max-subtree', 'metric-path-count', 'metric-centroid-phase'],
    });

    const lastStep = steps[steps.length - 1];
    expect(lastStep.status).toBe('done');
    expect(lastStep.visitedNodes).toContain(1);
    expect(lastStep.visitedNodes).toContain(2);
    expect(lastStep.visitedNodes).toContain(3);
  });

  it('should generate at least 20 granular steps for line_5node preset', () => {
    const steps = buildStaticCentroidSteps('line_5node');
    expect(steps.length).toBeGreaterThanOrEqual(20);

    assertStepStreamContract(steps, {
      codes: TREE_CENTROID_CODE_LANGUAGES
    });

    const lastStep = steps[steps.length - 1];
    expect(lastStep.status).toBe('done');
    expect(lastStep.visitedNodes).toContain(3);
  });

  it('should have complete code across all languages without empty stubs', () => {
    assertMultiLanguageCodeContract(TREE_CENTROID_CODE_LANGUAGES, {
      minLines: 35,
      requiredPatterns: [/getcentroid|get_centroid/i, /getdists|get_dists/i, /solve/i],
    });
  });

  it('should initialize and destroy cleanly with mock root container', async () => {
    await assertVisualizerLifecycleContract(TreeCentroidDecompositionVisualizer, {
      algorithmId: 'tree-centroid-decomposition',
      viewId: 'algo-tree-centroid-decomposition-view',
    });
  });
});
