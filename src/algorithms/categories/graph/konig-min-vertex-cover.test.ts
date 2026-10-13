import { describe, it, expect } from 'vitest';
import {
  KonigMinVertexCoverVisualizer,
  buildKonigSteps,
} from './konig-min-vertex-cover-renderer';
import { KONIG_CODE_LANGUAGES } from './konig-min-vertex-cover-problem-content';
import {
  assertVisualizerLifecycleContract,
  assertMultiLanguageCodeContract,
  assertStepStreamContract,
} from '../../../core/testing/contract-assertions';

describe('KonigMinVertexCover (König Theorem)', () => {
  it('should instantiate KonigMinVertexCoverVisualizer properly', () => {
    const viz = new KonigMinVertexCoverVisualizer();
    expect(viz).toBeDefined();
  });

  it('should generate at least 20 granular steps for classic preset', () => {
    const steps = buildKonigSteps('classic');
    expect(steps.length).toBeGreaterThanOrEqual(20);

    assertStepStreamContract(steps, {
      codes: KONIG_CODE_LANGUAGES,
      requiredMetricKeys: ['metric-match-size', 'metric-cover-size', 'metric-indep-size', 'metric-konig-phase'],
    });

    const lastStep = steps[steps.length - 1];
    expect(lastStep.status).toBe('done');
    expect(lastStep.matchedEdges.length).toBe(3);
    expect(lastStep.coverSet.length).toBe(3);
    expect(lastStep.independentSet?.length).toBe(4);
    expect(lastStep.coverSet.sort()).toEqual(['L4', 'R1', 'R2']);
  });

  it('should generate at least 20 granular steps for simple preset', () => {
    const steps = buildKonigSteps('simple');
    expect(steps.length).toBeGreaterThanOrEqual(20);

    assertStepStreamContract(steps, {
      codes: KONIG_CODE_LANGUAGES
    });

    const lastStep = steps[steps.length - 1];
    expect(lastStep.status).toBe('done');
    expect(lastStep.matchedEdges.length).toBe(2);
    expect(lastStep.coverSet.length).toBe(2);
    expect(lastStep.independentSet?.length).toBe(3);
  });

  it('should have complete code across all languages without empty stubs', () => {
    assertMultiLanguageCodeContract(KONIG_CODE_LANGUAGES, {
      minLines: 35,
      requiredPatterns: [/dfs/i, /maxmatching|max_matching/i, /alternatingdfs|alternating_dfs/i],
    });
  });

  it('should initialize and destroy cleanly with mock root container', async () => {
    await assertVisualizerLifecycleContract(KonigMinVertexCoverVisualizer, {
      algorithmId: 'konig-min-vertex-cover',
      viewId: 'algo-konig-min-vertex-cover-view',
    });
  });
});
