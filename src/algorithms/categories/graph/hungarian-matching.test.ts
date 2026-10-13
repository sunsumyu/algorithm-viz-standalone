import { describe, it, expect } from 'vitest';
import {
  HungarianMatchingVisualizer,
  buildHungarianSteps,
} from './hungarian-matching-renderer';
import { HUNGARIAN_CODE_LANGUAGES } from './hungarian-matching-problem-content';
import {
  assertVisualizerLifecycleContract,
  assertMultiLanguageCodeContract,
  assertStepStreamContract,
} from '../../../core/testing/contract-assertions';

describe('HungarianMatching (P3386)', () => {
  it('should instantiate HungarianMatchingVisualizer properly', () => {
    const viz = new HungarianMatchingVisualizer();
    expect(viz).toBeDefined();
  });

  it('should generate at least 20 granular steps for four_nodes preset', () => {
    const steps = buildHungarianSteps('four_nodes');
    expect(steps.length).toBeGreaterThanOrEqual(20);

    assertStepStreamContract(steps, {
      codes: HUNGARIAN_CODE_LANGUAGES,
      requiredMetricKeys: ['metric-hungarian-left', 'metric-hungarian-count', 'metric-hungarian-path', 'metric-hungarian-phase'],
    });

    const lastStep = steps[steps.length - 1];
    expect(lastStep.status).toBe('done');
    expect(lastStep.matchCount).toBe(4);
  });

  it('should generate at least 20 granular steps for three_nodes preset', () => {
    const steps = buildHungarianSteps('three_nodes');
    expect(steps.length).toBeGreaterThanOrEqual(20);

    assertStepStreamContract(steps, {
      codes: HUNGARIAN_CODE_LANGUAGES
    });

    const lastStep = steps[steps.length - 1];
    expect(lastStep.status).toBe('done');
    expect(lastStep.matchCount).toBe(3);
  });

  it('should have complete code across all languages without empty stubs', () => {
    assertMultiLanguageCodeContract(HUNGARIAN_CODE_LANGUAGES, {
      minLines: 25,
      requiredPatterns: [/dfs/i, /match/i, /maxmatching|maxbipartitematching|max_bipartite_matching/i],
    });
  });

  it('should initialize and destroy cleanly with mock root container', async () => {
    await assertVisualizerLifecycleContract(HungarianMatchingVisualizer, {
      algorithmId: 'hungarian-matching',
      viewId: 'algo-hungarian-matching-view',
    });
  });
});
