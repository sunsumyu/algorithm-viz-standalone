import { describe, it, expect } from 'vitest';
import {
  DominatorTreeVisualizer,
  buildDominatorTreeSteps,
} from './dominator-tree-renderer';
import { DOMINATOR_TREE_CODE_LANGUAGES } from './dominator-tree-problem-content';
import {
  assertVisualizerLifecycleContract,
  assertMultiLanguageCodeContract,
  assertStepStreamContract,
} from '../../../core/testing/contract-assertions';

describe('DominatorTree (P2597)', () => {
  it('should instantiate DominatorTreeVisualizer properly', () => {
    const viz = new DominatorTreeVisualizer();
    expect(viz).toBeDefined();
  });

  it('should generate at least 20 granular steps for classic_diamond preset', () => {
    const steps = buildDominatorTreeSteps('classic_diamond');
    expect(steps.length).toBeGreaterThanOrEqual(20);

    assertStepStreamContract(steps, {
      codes: DOMINATOR_TREE_CODE_LANGUAGES,
      requiredMetricKeys: ['metric-cur-node', 'metric-dom-lca', 'metric-dom-edges', 'metric-dom-phase'],
    });

    const lastStep = steps[steps.length - 1];
    expect(lastStep.status).toBe('done');
    expect(lastStep.idomMap[1]).toBeNull();
    expect(lastStep.idomMap[2]).toBe(1);
    expect(lastStep.idomMap[3]).toBe(1);
    expect(lastStep.idomMap[4]).toBe(1);
  });

  it('should generate at least 20 granular steps for linear_bypass preset', () => {
    const steps = buildDominatorTreeSteps('linear_bypass');
    expect(steps.length).toBeGreaterThanOrEqual(20);

    assertStepStreamContract(steps, {
      codes: DOMINATOR_TREE_CODE_LANGUAGES
    });

    const lastStep = steps[steps.length - 1];
    expect(lastStep.status).toBe('done');
    expect(lastStep.idomMap[2]).toBe(1);
    expect(lastStep.idomMap[3]).toBe(2);
    expect(lastStep.idomMap[4]).toBe(1);
  });

  it('should have complete code across all languages without empty stubs', () => {
    assertMultiLanguageCodeContract(DOMINATOR_TREE_CODE_LANGUAGES, {
      minLines: 35,
      requiredPatterns: [/dominatortree|dominator_tree/i, /getlca|get_lca/i, /build/i, /idom/i],
    });
  });

  it('should initialize and destroy cleanly with mock root container', async () => {
    await assertVisualizerLifecycleContract(DominatorTreeVisualizer, {
      algorithmId: 'dominator-tree',
      viewId: 'algo-dominator-tree-view',
    });
  });
});
