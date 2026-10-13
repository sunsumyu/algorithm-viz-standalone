import { describe, it, expect } from 'vitest';
import {
  BlockCutTreeVisualizer,
  buildBlockCutTreeSteps,
} from './block-cut-tree-renderer';
import { BLOCK_CUT_TREE_CODE_LANGUAGES } from './block-cut-tree-problem-content';
import {
  assertVisualizerLifecycleContract,
  assertMultiLanguageCodeContract,
  assertStepStreamContract,
} from '../../../core/testing/contract-assertions';

describe('BlockCutTree (P4320)', () => {
  it('should instantiate BlockCutTreeVisualizer properly', () => {
    const viz = new BlockCutTreeVisualizer();
    expect(viz).toBeDefined();
  });

  it('should generate at least 20 granular steps for classic_6node preset', () => {
    const steps = buildBlockCutTreeSteps('classic_6node');
    expect(steps.length).toBeGreaterThanOrEqual(20);

    assertStepStreamContract(steps, {
      codes: BLOCK_CUT_TREE_CODE_LANGUAGES,
      requiredMetricKeys: ['metric-round-count', 'metric-square-count', 'metric-cut-vertices', 'metric-bct-phase'],
    });

    const lastStep = steps[steps.length - 1];
    expect(lastStep.status).toBe('done');
    expect(lastStep.squareNodes.length).toBe(3);
    expect(lastStep.cutVertices).toContain(3);
    expect(lastStep.cutVertices).toContain(4);
    expect(lastStep.mustPassCutNodes).toContain(3);
    expect(lastStep.mustPassCutNodes).toContain(4);
  });

  it('should generate at least 20 granular steps for simple_4node preset', () => {
    const steps = buildBlockCutTreeSteps('simple_4node');
    expect(steps.length).toBeGreaterThanOrEqual(20);

    assertStepStreamContract(steps, {
      codes: BLOCK_CUT_TREE_CODE_LANGUAGES
    });

    const lastStep = steps[steps.length - 1];
    expect(lastStep.status).toBe('done');
    expect(lastStep.squareNodes.length).toBe(2);
  });

  it('should have complete code across all languages without empty stubs', () => {
    assertMultiLanguageCodeContract(BLOCK_CUT_TREE_CODE_LANGUAGES, {
      minLines: 35,
      requiredPatterns: [/tarjan/i, /buildtree|build_tree/i],
    });
  });

  it('should initialize and destroy cleanly with mock root container', async () => {
    await assertVisualizerLifecycleContract(BlockCutTreeVisualizer, {
      algorithmId: 'block-cut-tree',
      viewId: 'algo-block-cut-tree-view',
    });
  });
});
