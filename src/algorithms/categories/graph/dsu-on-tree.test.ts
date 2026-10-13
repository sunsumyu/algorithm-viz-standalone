import { describe, it, expect } from 'vitest';
import {
  DSUOnTreeVisualizer,
  buildDSUOnTreeSteps,
} from './dsu-on-tree-renderer';
import { DSU_ON_TREE_CODE_LANGUAGES } from './dsu-on-tree-problem-content';
import {
  assertVisualizerLifecycleContract,
  assertMultiLanguageCodeContract,
  assertStepStreamContract,
} from '../../../core/testing/contract-assertions';

describe('DSUOnTree (CF600E)', () => {
  it('should instantiate DSUOnTreeVisualizer properly', () => {
    const viz = new DSUOnTreeVisualizer();
    expect(viz).toBeDefined();
  });

  it('should generate at least 20 granular steps for classic_4node preset', () => {
    const steps = buildDSUOnTreeSteps('classic_4node');
    expect(steps.length).toBeGreaterThanOrEqual(20);

    assertStepStreamContract(steps, {
      codes: DSU_ON_TREE_CODE_LANGUAGES,
      requiredMetricKeys: ['metric-cur-node', 'metric-keep-status', 'metric-heavy-son', 'metric-dsu-phase'],
    });

    const lastStep = steps[steps.length - 1];
    expect(lastStep.status).toBe('done');
    expect(lastStep.preservedData[1]).toBe(1);
    expect(lastStep.preservedData[4]).toBe(1);
  });

  it('should generate at least 20 granular steps for simple_star preset', () => {
    const steps = buildDSUOnTreeSteps('simple_star');
    expect(steps.length).toBeGreaterThanOrEqual(20);

    assertStepStreamContract(steps, {
      codes: DSU_ON_TREE_CODE_LANGUAGES
    });

    const lastStep = steps[steps.length - 1];
    expect(lastStep.status).toBe('done');
  });

  it('should have complete code across all languages without empty stubs', () => {
    assertMultiLanguageCodeContract(DSU_ON_TREE_CODE_LANGUAGES, {
      minLines: 35,
      requiredPatterns: [/dsuontree|dsu_on_tree|solver/i, /dfsinit|dfs_init/i, /dfssolve|dfs_solve/i, /updatesubtree|update/i],
    });
  });

  it('should initialize and destroy cleanly with mock root container', async () => {
    await assertVisualizerLifecycleContract(DSUOnTreeVisualizer, {
      algorithmId: 'dsu-on-tree',
      viewId: 'algo-dsu-on-tree-view',
    });
  });
});
