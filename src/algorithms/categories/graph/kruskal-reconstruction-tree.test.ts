import { describe, it, expect } from 'vitest';
import {
  KruskalReconstructionTreeVisualizer,
  buildKruskalTreeSteps,
} from './kruskal-reconstruction-tree-renderer';
import { KRUSKAL_TREE_CODE_LANGUAGES } from './kruskal-reconstruction-tree-problem-content';
import {
  assertVisualizerLifecycleContract,
  assertMultiLanguageCodeContract,
  assertStepStreamContract,
} from '../../../core/testing/contract-assertions';

describe('KruskalReconstructionTree (P4768)', () => {
  it('should instantiate KruskalReconstructionTreeVisualizer properly', () => {
    const viz = new KruskalReconstructionTreeVisualizer();
    expect(viz).toBeDefined();
  });

  it('should generate at least 20 granular steps for classic_4node preset', () => {
    const steps = buildKruskalTreeSteps('classic_4node');
    expect(steps.length).toBeGreaterThanOrEqual(20);

    assertStepStreamContract(steps, {
      codes: KRUSKAL_TREE_CODE_LANGUAGES,
      requiredMetricKeys: ['metric-kruskal-root', 'metric-lca-bottleneck', 'metric-cur-edge', 'metric-kruskal-phase'],
    });

    const lastStep = steps[steps.length - 1];
    expect(lastStep.status).toBe('done');
    expect(lastStep.nodeWeights[5]).toBe(2);
    expect(lastStep.nodeWeights[6]).toBe(3);
    expect(lastStep.nodeWeights[7]).toBe(4);
    expect(lastStep.treeEdges.length).toBe(6);
  });

  it('should generate at least 20 granular steps for star_3node preset', () => {
    const steps = buildKruskalTreeSteps('star_3node');
    expect(steps.length).toBeGreaterThanOrEqual(20);

    assertStepStreamContract(steps, {
      codes: KRUSKAL_TREE_CODE_LANGUAGES
    });

    const lastStep = steps[steps.length - 1];
    expect(lastStep.status).toBe('done');
    expect(lastStep.nodeWeights[4]).toBe(3);
    expect(lastStep.nodeWeights[5]).toBe(5);
    expect(lastStep.treeEdges.length).toBe(4);
  });

  it('should have complete code across all languages without empty stubs', () => {
    assertMultiLanguageCodeContract(KRUSKAL_TREE_CODE_LANGUAGES, {
      minLines: 35,
      requiredPatterns: [/build/i, /querybottleneck|query_bottleneck/i],
    });
  });

  it('should initialize and destroy cleanly with mock root container', async () => {
    await assertVisualizerLifecycleContract(KruskalReconstructionTreeVisualizer, {
      algorithmId: 'kruskal-reconstruction-tree',
      viewId: 'algo-kruskal-reconstruction-tree-view',
    });
  });
});
